from pprint import pprint
from requests import request
from typing import Any, Callable, Dict, List, Optional, Tuple
from op.logger import logger
from op.shared import access_token
from datetime import datetime, timedelta
import pandas as pd


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
        logger.debug(f"Making API request to endpoint: {endpoint}")
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
            logger.debug(f"Retrieved {len(partial_data)} items")
            all_data.extend(partial_data)

        return all_data

    return wrapper


# def generate_depagination_logic_by_token(
#     fetch_from_server: Callable[[str], Tuple[List[Any], str]]
# ):
#     def wrapper():
#         all_data: List[Any] = []
#         first_request: bool = True
#         offset: str = ""
#         while offset != "" or first_request:
#             partial_data, offset = fetch_from_server(offset)
#             all_data.extend(partial_data)

#         return all_data

#     return wrapper


def get_unix_time(year: int, month: int, day: int) -> int:
    return int(datetime(year, month, day).timestamp() * 1000)


def parse_unix_time(unix_time: int) -> datetime:
    return datetime.fromtimestamp(unix_time / 1000)


def iso_date_sanity_check(date: str) -> str:
    return datetime.fromisoformat(date).isoformat()


def decompose_into_small_timeframe(
    f: Callable[[datetime, datetime], List[Any]],
    start_date: datetime,
    end_date: datetime,
    timeframe: int,
    round_down_end_date: bool = True,
) -> List[Any]:
    records: List[Any] = []
    date_pairs: List[Tuple[datetime, datetime]] = []

    if round_down_end_date:
        end_date = datetime(end_date.year, end_date.month, end_date.day)

    if (end_date - start_date).days >= timeframe:
        week = timedelta(days=timeframe)

        temp_date = start_date

        while (end_date - temp_date).days >= 7:
            date_pairs.append((temp_date, temp_date + week))
            temp_date += week

        date_pairs.append((temp_date, end_date))

    else:
        date_pairs = [(start_date, end_date)]

    for pair in date_pairs:
        logger.debug(f"Fetching records for timeframe {pair[0]} => {pair[1]}")
        records += f(
            pair[0],
            pair[1],
        )

    return records


def deduplicate_records_by_id(records: List[Any]) -> List[Any]:
    df = pd.DataFrame(records)
    df = df.drop_duplicates("id", keep="first")

    count = len(records) - len(df)
    if count > 0:
        logger.warning(f"Ignored {count} records with duplicate ids")

    if len(df) == 0:
        return records

    return df.to_dict(orient="records")


def deduplicate_records(records: List[Any], columns: List[str]) -> List[str]:
    df = pd.DataFrame(records)
    df = df[df.duplicated(columns, keep="first")]  # pyright: ignore

    if len(df) == 0:
        return records

    dup_records_ids = df.iloc[:, 0].tolist()
    for id in dup_records_ids:
        logger.warning(f"Ignored record {id} with duplicate {columns}")

    return [r for r in records if r["id"] not in dup_records_ids]  # pyright: ignore
