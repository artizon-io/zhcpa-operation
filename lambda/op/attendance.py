from datetime import datetime
from functools import partial
from typing import Any, List, Optional, TypedDict
from op.logger import logger
from op.opuser import get_opusers_ids
from op.supabase import get_prev_checkpoint_date, supabase, upsert_checkpoint_date
import pandas as pd


from op.utils import (
    api,
    decompose_into_small_timeframe,
    generate_depagination_logic,
    parse_unix_time,
)


class AttendanceRecord(TypedDict):
    miss_check: bool
    id: str
    opuserid: str
    check_in: bool
    check_time: datetime
    check_source: str


def extract_attendance_details(
    raw_details: Any,
) -> AttendanceRecord | None:
    if raw_details["timeResult"] == "NotSigned":
        return None

    details = dict()

    details["id"] = raw_details["id"]
    details["opuserid"] = raw_details["userId"]
    details["check_in"] = raw_details["checkType"] == "OnDuty"

    details["check_time"] = parse_unix_time(raw_details["userCheckTime"])
    details["check_source"] = raw_details["sourceType"]

    return details  # pyright: ignore


def get_attendance_records(
    start_time: datetime,
    end_time: datetime,
    opuserids: Optional[List[str]] = None,
) -> List[AttendanceRecord]:
    """
    Get all operation user (i.e. colleagues) attendance records' details

    https://open-dev.dingtalk.com/apiExplorer#/?devType=org&api=dingtalk.oapi.attendance.list

    Must not span across more than 1 week
    """
    if not opuserids:
        opuserids = get_opusers_ids()

    start_time_str = start_time.strftime("%Y-%m-%d %H:%M:%S")
    end_time_str = end_time.strftime("%Y-%m-%d %H:%M:%S")

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
                        "workDateFrom": start_time_str,
                        "workDateTo": end_time_str,
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

    records = list(
        filter(
            lambda r: r is not None,
            map(extract_attendance_details, all_records),
        )
    )

    duplicate_records = find_duplicate_attendance(records)
    return [r for r in records if r["id"] not in duplicate_records]  # pyright: ignore


def upsert_attendance(attendance_records: List[AttendanceRecord]):
    data = [
        {
            "id": r["id"],
            "opuser_id": r["opuserid"],
            "check_in": r["check_in"],
            "check_time": r["check_time"].isoformat(),
            "check_source": r["check_source"],
        }
        for r in attendance_records
    ]

    supabase.table("attendance").upsert(
        data,
        on_conflict="opuser_id,check_time",
        ignore_duplicates=True,  # pyright: ignore
    ).execute()


def find_duplicate_attendance(records: List[Any]) -> List[str]:
    df = pd.DataFrame(records)
    df = df[df.duplicated(["check_time", "opuserid"], keep=False)]  # pyright: ignore
    if len(df) > 0:
        return df.iloc[:, 0].tolist()
    else:
        return []


def upsert_new_attendance():
    prev_checkpoint_date = get_prev_checkpoint_date("attendance")
    today_date = datetime.now()

    logger.info("Fetching all new attendance records")

    records = decompose_into_small_timeframe(
        get_attendance_records,
        start_date=prev_checkpoint_date,
        end_date=today_date,
        timeframe=7,
    )

    logger.info(f"Upserting {len(records)} new attendance records")

    upsert_attendance(records)

    upsert_checkpoint_date("attendance", today_date)
