from typing import Any
from supabase_py import create_client, Client
from op.shared import get_env

url: str = get_env("SUPABASE_URL")
key: str = get_env("SUPABASE_KEY")
supabase: Client = create_client(url, key)


def execute_query(query: Any) -> Any:
    response = query.execute()
    if response["status_code"] == 200:
        return response["data"]
    else:
        raise Exception(f"Request not ok {response}")
