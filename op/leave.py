from typing import List, Optional, Tuple, TypedDict

from .workflows import get_workflow_instance_details, get_workflow_instances_ids

from .opuser import get_opuserids
from .utils import (
    api,
    generate_depagination_logic,
)
from .shared import admin_opuserid, access_token, config, runtime_options
from alibabacloud_dingtalk.attendance_1_0 import models as dingtalk_attendance_models
from alibabacloud_dingtalk.attendance_1_0.client import (
    Client as DingtalkAttendanceClient,
)
from alibabacloud_dingtalk.workflow_1_0 import models as dingtalk_workflow_models


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


def get_opusers_leave_records_ids_v1(
    leave_code: Optional[str] = None, opuserids: Optional[List[str]] = None
) -> List[dingtalk_attendance_models.GetLeaveRecordsResponseBodyResultLeaveRecords]:
    """
    Get all operation user (i.e. colleagues) leave applications' IDs (regardless of
    status i.e. approved, rejected, pending)

    Deprecated. Please use the other version instead.
    """
    if not opuserids:
        opuserids = get_opuserids(
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


def get_opusers_leave_records_ids(
    process_code: str,
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
        process_code=process_code,
        start_time=start_time,
        end_time=end_time,
        opuserids=opuserids,
        statuses=statuses,
        offset_and_size=offset_and_size,
    )


def get_leave_record_details(
    leave_record_id: str,
) -> dingtalk_workflow_models.GetProcessInstanceResponseBodyResult:
    """
    Get a particular leave record's details
    """
    return get_workflow_instance_details(leave_record_id)
