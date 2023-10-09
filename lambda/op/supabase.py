from datetime import datetime
from op.logger import logger
from supabase.client import create_client, Client
from op.env import get_env
from dateutil.parser import parse
from op.secret import secrets

supabase_url: str = get_env("SUPABASE_URL")
supabase_secret_key: str = secrets["SUPABASE_SECRET_KEY"]
supabase: Client = create_client(supabase_url, supabase_secret_key)


def get_prev_checkpoint_date(table: str) -> datetime:
    logger.info(f"Fetching previous checkpoint date for {table}")

    d = (
        supabase.table("checkpoints")
        .select("date")
        .eq("table", table)
        .single()
        .execute()
        .data["date"]
    )
    logger.info(f"Previous checkpoint date for {table} = {d}")
    return parse(d)  # pyright: ignore


def upsert_checkpoint_date(table: str, date: datetime):
    logger.info(
        f"Updating checkpoint date for {table} to {date.year}-{date.month}-{date.day}"
    )

    supabase.table("checkpoints").update({"date": date.isoformat()}).eq(
        "table", table
    ).execute()
