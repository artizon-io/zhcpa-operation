import datetime
from requests import request
from typing import Any, Callable, Dict, List, Optional, Tuple
from .shared import access_token


def api(
    endpoint: str,
    data: Dict[str, Any],
    method: str = "POST",
    json: bool = False,
    has_success_field_in_response: bool = True,
    has_errmsg_field_in_response: bool = False,
    has_result_field_in_response: bool = True,
):
    """
    For old Dingtalk API
    """
    try:
        response = request(
            method,
            endpoint,
            params={"access_token": access_token},
            data=data if not json else None,
            json=data if json else None,
        )
        if not response.ok:
            raise Exception("Request not ok")

        if has_success_field_in_response and not response.json().get("success"):
            raise Exception(f"Dingtalk request {endpoint} not ok: {response.json()}")

        if has_errmsg_field_in_response and response.json().get("errmsg") != "ok":
            raise Exception(f"Dingtalk request {endpoint} not ok: {response.json()}")

        if has_result_field_in_response:
            return response.json()["result"]
        else:
            return response.json()

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
