from datetime import datetime
import json
from typing import Any, List, Literal, Optional, Tuple, TypedDict

from op.workflows import get_workflow_instance_details, get_workflow_instances_ids

from op.opuser import get_opusers_ids
from op.utils import (
    api,
    generate_depagination_logic,
)
from op.shared import admin_opuserid, access_token, config, runtime_options
from alibabacloud_dingtalk.attendance_1_0 import models as dingtalk_attendance_models
from alibabacloud_dingtalk.attendance_1_0.client import (
    Client as DingtalkAttendanceClient,
)
from op.workflows import get_leave_workflow_id
from op.supabase import supabase


class LeaveType(TypedDict):
    """
    Example leave type:
    'freedom_leave': True,
    'hours_in_per_day': 800,
    'leave_code': 'f60377e7-9c60-48bb-91e2-5d02f4415361',
    'leave_hour_ceil': 'up',
    'leave_name': '年假(小時)',
    'leave_time_ceil_min_unit': 'halfHour',
    'leave_view_unit': 'hour',
    'natural_day_leave': 'false',
    'paid_leave': False,
    'source': 'inner',
    'when_can_leave': 'entry'
    """

    freedom_leave: bool
    hours_in_per_day: int
    leave_code: str
    leave_hour_ceil: str
    leave_name: str
    leave_time_ceil_min_unit: str
    leave_view_unit: str
    natural_day_leave: str
    paid_leave: bool
    source: str
    when_can_leave: str


def get_leave_types() -> List[LeaveType]:
    """
    Get all leave types
    """
    try:
        data = api(
            "https://oapi.dingtalk.com/topapi/attendance/vacation/type/list",
            {"op_userid": admin_opuserid, "vacation_source": "all"},
        )
        return data

    except Exception as err:
        raise err


def get_leave_records_ids_v1(
    leave_code: Optional[str] = None, opuserids: Optional[List[str]] = None
) -> List[dingtalk_attendance_models.GetLeaveRecordsResponseBodyResultLeaveRecords]:
    """
    Get all operation user (i.e. colleagues) leave applications' IDs (regardless of
    status i.e. approved, rejected, pending)

    Deprecated. Please use the other version instead.
    """
    if not opuserids:
        opuserids = get_opusers_ids(
            (0, 5),
        )

    if leave_code:
        leave_codes = [leave_code]
    else:
        leave_codes = list(
            map(lambda leave_type: leave_type["leave_code"], get_leave_types())
        )[0:5]

    leave_records: List[
        dingtalk_attendance_models.GetLeaveRecordsResponseBodyResultLeaveRecords
    ] = []

    for code in leave_codes:

        def fetch_from_server(
            pageOffset: int,
        ) -> Tuple[
            List[
                dingtalk_attendance_models.GetLeaveRecordsResponseBodyResultLeaveRecords
            ],
            Optional[int],
        ]:
            req = dingtalk_attendance_models.GetLeaveRecordsRequest(
                op_user_id=admin_opuserid,
                user_ids=opuserids,
                leave_code=code,
                page_number=pageOffset,
                page_size=200,
            )
            headers = dingtalk_attendance_models.GetLeaveRecordsHeaders(
                x_acs_dingtalk_access_token=access_token
            )

            try:
                response = DingtalkAttendanceClient(
                    config
                ).get_leave_records_with_options(req, headers, runtime=runtime_options)
                if getattr(response, "status_code") != 200:
                    raise Exception("Request not ok")

                if not getattr(response.body, "success"):
                    raise Exception("Dingtalk request not ok")

                data = response.body.result

                return (
                    data.leave_records,
                    pageOffset + 1 if getattr(data, "has_more") else None,
                )
            except Exception as err:
                raise err

        leave_records += generate_depagination_logic(fetch_from_server)()

    return leave_records


def get_leave_records_ids(
    start_time: int,
    end_time: int,
    opuserids: Optional[List[str]] = None,
    statuses: Optional[List[str]] = None,
    offset_and_size: Optional[Tuple[int, int]] = None,
) -> List[str]:
    """
    Get all operation user (i.e. colleagues) leave applications' IDs (regardless of
    status i.e. approved, rejected, pending)
    """
    return get_workflow_instances_ids(
        process_code=get_leave_workflow_id(),
        start_time=start_time,
        end_time=end_time,
        opuserids=opuserids,
        statuses=statuses,
        offset_and_size=offset_and_size,
    )


class LeaveRecord(TypedDict):
    id: str
    opuserid: str
    record_create_time: datetime
    status: Literal["REVOKED", "APPROVED", "REJECTED"]
    leave_type: str
    leave_start_time: datetime
    leave_end_time: datetime
    opuser_remark: str


def extract_leave_record_details(raw_details: Any, record_id: str) -> LeaveRecord:
    details = dict()

    details["id"] = record_id
    details["opuserid"] = raw_details.originator_user_id
    details["record_create_time"] = datetime.fromisoformat(raw_details.create_time)
    if raw_details.status == "COMPLETED":
        details["status"] = "APPROVED" if raw_details.result == "agree" else "REJECTED"
    elif raw_details.status == "TERMINATED":
        details["status"] = "REVOKED"
    else:
        raise Exception("Unknown status")

    def get_custom_field(key: str):
        return next(
            field.value
            for field in raw_details.form_component_values
            if field.name == key
        )

    time_details = get_custom_field('["开始时间","结束时间"]')
    time_details = json.loads(time_details)
    details["leave_start_time"] = datetime.fromisoformat(time_details[0])
    details["leave_end_time"] = datetime.fromisoformat(time_details[1])
    details["leave_type"] = time_details[4]
    # details["leave_duration"] = time_details[2]
    # details["leave_duration_unit"] = time_details[3]  # "hour" or "day"
    # if details["leave_duration_unit"] not in ["hour", "day"]:
    #     raise Exception("Unknown leave duration unit")
    details["opuser_remark"] = get_custom_field("請假事由")

    return details  # pyright: ignore


def get_leave_record_details(
    leave_record_id: str,
) -> LeaveRecord:
    """
    Get a particular leave record's details
    """
    return extract_leave_record_details(
        get_workflow_instance_details(leave_record_id), leave_record_id
    )


def get_leave_records(
    start_time: datetime,
    end_time: datetime,
    opuserids: Optional[List[str]] = None,
    statuses: Optional[List[str]] = None,
) -> List[LeaveRecord]:
    """
    Get all operation user (i.e. colleagues) leave applications' details (regardless of
    status i.e. approved, rejected, pending)
    """

    start_time_str = int(start_time.timestamp() * 1000)
    end_time_str = int(end_time.timestamp() * 1000)

    records = get_leave_records_ids(
        start_time=start_time_str,
        end_time=end_time_str,
        opuserids=opuserids,
        statuses=statuses,
    )
    return list(map(get_leave_record_details, records))  # type: ignore


def upsert_leave(leave_records: List[LeaveRecord]):
    data = [
        {
            "id": r["id"],
            "opuser_id": r["opuserid"],
            "record_create_time": r["record_create_time"].isoformat(),
            "status": r["status"],
            "leave_type": r["leave_type"],
            "leave_start_time": r["leave_start_time"].isoformat(),
            "leave_end_time": r["leave_end_time"].isoformat(),
            "opuser_remark": r["opuser_remark"],
        }
        for r in leave_records
    ]

    supabase.table("leave").upsert(data).execute()  # pyright: ignore
