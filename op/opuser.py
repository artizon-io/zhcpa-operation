import json
from typing import List, Optional, Tuple, TypedDict
from op.utils import api, generate_depagination_logic
from functools import partial
from op.cache import cache
from typing import Any


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


class OpuserDetails(TypedDict):
    """
    https://oa.dingtalk.com/new/hrmregister/web/index#/employeeData
    """

    opuserid: str
    name: str
    name_chinese: str
    phone: str
    email: str
    employee_code: str
    department: str
    rank: str


def extract_opuser_details(raw_details: Any) -> OpuserDetails:
    fields = raw_details["field_list"]

    def get_field(key: str):
        return next(
            None if field.get("value") == "" else field.get("value")
            for field in fields
            if field.get("field_name") == key
        )

    details = dict()

    details["opuserid"] = raw_details["userid"]
    details["name"] = get_field("姓名")
    details["name_chinese"] = get_field("中文名")
    details["phone"] = get_field("手机号")
    details["email"] = get_field("邮箱")
    details["employee_code"] = get_field("工号")
    details["department"] = get_field("部门")
    details["rank"] = get_field("主部门")

    return details  # pyright: ignore


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

    return list(map(extract_opuser_details, result))
