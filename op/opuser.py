from typing import List, Optional, Tuple
from .utils import api, generate_depagination_logic
from functools import partial


def get_opuserids(
    offset_and_size: Optional[Tuple[int, int]] = None, status_list: str = "2,3,5,-1"
) -> List[str]:
    """
    Get all operation user (i.e. colleagues) ids
    """

    def fetch_from_server(offset: int, size: int) -> Tuple[List[str], Optional[int]]:
        try:
            data = api(
                "https://oapi.dingtalk.com/topapi/smartwork/hrm/employee/queryonjob",
                {
                    "status_list": status_list,
                    "offset": offset,
                    "size": size,
                },
            )
            return data["data_list"], data.get("next_cursor")

        except Exception as err:
            raise err

    if offset_and_size:
        return fetch_from_server(*offset_and_size)[0]

    return generate_depagination_logic(partial(fetch_from_server, size=50))()
