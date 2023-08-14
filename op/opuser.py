import json
from typing import List, Optional, Tuple, TypedDict
from op.utils import api, generate_depagination_logic
from functools import partial
from op.cache import cache


def get_opusers_ids(
    offset_and_size: Optional[Tuple[int, int]] = None, status_list: str = "2,3,5,-1"
) -> List[str]:
    """
    Get all operation user (i.e. colleagues) ids
    """
    if opusers_cache:
        return json.loads(opusers_cache["all_opuserids"])

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


opusers_cache = None
try:
    opusers_cache = cache["opusers"]
except KeyError:
    pass

if not opusers_cache:
    all_opuserids = get_opusers_ids()

    cache["opusers"] = {
        "all_opuserids": json.dumps(all_opuserids),
    }

    with open("cache.ini", "w") as configfile:
        cache.write(configfile)


class OpuserDetail(TypedDict):
    field_code: str
    field_name: str
    value: str
    label: str
    group_id: str


class OpuserDetails(TypedDict):
    userid: str
    field_list: List[OpuserDetail]
    partner: bool


def get_opusers_details() -> List[OpuserDetails]:
    """
    Get all operation user (i.e. colleagues) details

    https://open-dev.dingtalk.com/apiExplorer#/?devType=org&api=dingtalk.oapi.smartwork.hrm.employee.list
    """
    result: List[OpuserDetails] = []

    offset = 0
    while offset < len(get_opusers_ids()):
        result += api(
            "https://oapi.dingtalk.com/topapi/smartwork/hrm/employee/list",
            {
                "userid_list": ",".join(get_opusers_ids()[offset : offset + 50]),
            },
        )
        offset += 50

    return result
