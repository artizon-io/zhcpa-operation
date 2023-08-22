from supabase.client import create_client, Client
from op.shared import get_env

url: str = get_env("SUPABASE_URL")
key: str = get_env("SUPABASE_KEY")
supabase: Client = create_client(url, key)
