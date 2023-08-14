from functools import partial
from typing import List, Optional, Tuple
from op.opuser import get_opusers_ids


from op.utils import (
    api,
    generate_depagination_logic,
)


def get_attendance_records_details(
    start_time: str,
    end_time: str,
    opuserids: Optional[List[str]] = None,
    offset_and_size: Optional[Tuple[int, int]] = None,
):
    """
    Get all operation user (i.e. colleagues) attendance records' details

    https://open-dev.dingtalk.com/apiExplorer#/?devType=org&api=dingtalk.oapi.attendance.list
    """
    if not opuserids:
        opuserids = get_opusers_ids()[0:30]

    def fetch_from_server(offset: int, size: int):
        try:
            data = api(
                "https://oapi.dingtalk.com/attendance/list",
                {
                    "workDateFrom": start_time,
                    "workDateTo": end_time,
                    "userIdList": opuserids,
                    "offset": offset,
                    "limit": size,
                },
                json=True,
                has_result_field_in_response=False,
                has_success_field_in_response=False,
                has_errmsg_field_in_response=True,
            )
            return (data["recordresult"], offset + size if data["hasMore"] else None)

        except Exception as err:
            raise err

    if offset_and_size:
        return fetch_from_server(*offset_and_size)[0]

    return generate_depagination_logic(partial(fetch_from_server, size=50))()
