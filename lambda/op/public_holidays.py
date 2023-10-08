import httpx
from typing import List, Literal, Tuple, TypedDict
from op.utils import get_unix_time, parse_unix_time
from datetime import datetime
from op.supabase import supabase
from op.logger import logger


class Holiday(TypedDict):
    date: datetime
    name: str


def get_hk_holidays() -> List[Holiday]:
    # TODO: cache

    response = httpx.get("https://www.1823.gov.hk/common/ical/en.json")
    data = response.json()

    hk_holidays: List[Holiday] = []

    def parse_date(date: str) -> Tuple[int, int, int]:
        return int(date[0:4]), int(date[4:6]), int(date[6:8])

    for h in data["vcalendar"][0]["vevent"]:
        hk_holidays.append(
            {
                "date": parse_unix_time(get_unix_time(*parse_date(h["dtstart"][0]))),
                "name": h["summary"],
            }
        )

    return hk_holidays


def upsert_holidays(
    holidays: List[Holiday],
    holiday_scheme: Literal["hong kong", "mainland", "malaysia"],
):
    res = (
        supabase.table("holiday_scheme")
        .select("id")
        .eq("name", holiday_scheme)
        .single()
        .execute()
    )
    holiday_scheme_id = res.data["id"]

    data = [
        {
            "date": h["date"].isoformat(),
            "name": h["name"],
            "holiday_scheme_id": holiday_scheme_id,
        }
        for h in holidays
    ]

    supabase.table("holiday").upsert(data).execute()  # pyright: ignore


def upsert_all_regions_holidays():
    logger.info("Upserting HK holidays")
    upsert_holidays(get_hk_holidays(), "hong kong")