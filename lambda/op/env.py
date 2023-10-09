import os
from dotenv import load_dotenv

load_dotenv()


def get_env(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise Exception(f"Missing {key}")
    return value


project_name: str = get_env("PROJECT_NAME")
env: str = get_env("ENV")
aws_region: str = get_env("AWS_REGION")