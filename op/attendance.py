from functools import partial
from typing import Any, List, Optional, TypedDict, Union
from op.opuser import get_opusers_ids


from op.utils import (
    api,
    generate_depagination_logic,
    parse_unix_time,
)


class CheckMissRecord(TypedDict):
    miss_check: bool
    id: str
    opuserid: str
    check_in: bool


class AttendanceRecord(TypedDict):
    """
    All time fields are in ISO format
    """

    miss_check: bool
    id: str
    opuserid: str
    check_in: bool
    check_time: int
    check_source: str


def extract_attendance_details(
    raw_details: Any,
) -> Union[AttendanceRecord, CheckMissRecord]:
    details = dict()

    details["id"] = raw_details["id"]
    details["opuserid"] = raw_details["userId"]
    details["check_in"] = raw_details["checkType"] == "OnDuty"

    details["miss_check"] = raw_details["timeResult"] == "NotSigned"

    if not details["miss_check"]:
        details["check_time"] = parse_unix_time(raw_details["userCheckTime"])
        details["check_source"] = raw_details["sourceType"]

    return details  # pyright: ignore


def get_attendance_records_details(
    start_time: str,
    end_time: str,
    opuserids: Optional[List[str]] = None,
) -> List[Union[AttendanceRecord, CheckMissRecord]]:
    """
    Get all operation user (i.e. colleagues) attendance records' details

    https://open-dev.dingtalk.com/apiExplorer#/?devType=org&api=dingtalk.oapi.attendance.list
    """
    if not opuserids:
        opuserids = get_opusers_ids()

    offset = 0
    all_records = []
    while offset < len(opuserids):
        partial_opuserids = opuserids[offset : offset + 30]
        offset += 30

        def fetch_from_server(offset: int, size: int):
            try:
                data = api(
                    "https://oapi.dingtalk.com/attendance/list",
                    {
                        "workDateFrom": start_time,
                        "workDateTo": end_time,
                        "userIdList": partial_opuserids,
                        "offset": offset,
                        "limit": size,
                    },
                    json=True,
                    has_result_field_in_response=False,
                    has_success_field_in_response=False,
                    has_errmsg_field_in_response=True,
                )
                return (
                    data["recordresult"],
                    offset + size if data["hasMore"] else None,
                )

            except Exception as err:
                raise err

        all_records += generate_depagination_logic(
            partial(fetch_from_server, size=50)
        )()

    return list(map(extract_attendance_details, all_records))
