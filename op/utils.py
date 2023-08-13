import datetime
import math
from requests import request
from typing import Any, Callable, Dict, List, Optional, Tuple
from .shared import access_token


def api(endpoint: str, data: Dict[str, Any], method: str = "POST"):
    """
    For old Dingtalk API
    """
    try:
        response = request(
            method,
            endpoint,
            params={"access_token": access_token},
            data=data,
        )
        if not response.ok:
            raise Exception("Request not ok")

        if not response.json()["success"]:
            raise Exception(f"Dingtalk request not ok: {response.json()['errmsg']}")

        return response.json()["result"]

    except Exception as err:
        raise err


def generate_depagination_logic(
    fetch_from_server: Callable[[int], Tuple[List[Any], Optional[int]]]
):
    def wrapper():
        all_data: List[Any] = []
        offset: Optional[int] = 0
        while offset is not None:
            partial_data, offset = fetch_from_server(offset)
            all_data.extend(partial_data)

        return all_data

    return wrapper


# Not used
def generate_depagination_logic_by_token(
    fetch_from_server: Callable[[str], Tuple[List[Any], str]]
):
    def wrapper():
        all_data: List[Any] = []
        first_request: bool = True
        offset: str = ""
        while offset != "" or first_request:
            partial_data, offset = fetch_from_server(offset)
            all_data.extend(partial_data)

        return all_data

    return wrapper


def get_time(year: int, month: int, day: int) -> int:
    return int(datetime.datetime(year, month, day).timestamp() * 1000)
