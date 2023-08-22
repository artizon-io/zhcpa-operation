from alibabacloud_dingtalk.oauth2_1_0.client import Client as DingtalkClient
from alibabacloud_tea_openapi import models as open_api_models
from alibabacloud_dingtalk.oauth2_1_0 import models as dingtalk_oauth_models
import os
from dotenv import load_dotenv
from alibabacloud_tea_util.models import RuntimeOptions

load_dotenv()


def get_env(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise Exception(f"Missing {key}")
    return value


app_key: str = get_env("APP_KEY")
app_secret: str = get_env("APP_SECRET")
admin_opuserid: str = get_env("ADMIN_OPUSERID")

config = open_api_models.Config()
"""
For new Dingtalk API
"""
config.protocol = "https"
config.region_id = "central"


def get_access_token() -> str:
    client = DingtalkClient(config)

    request = dingtalk_oauth_models.GetAccessTokenRequest(
        app_key=app_key, app_secret=app_secret
    )
    try:
        response = client.get_access_token(request)

        if getattr(response, "status_code") != 200:
            raise Exception("Request not ok")

        access_token = getattr(response.body, "access_token")
        if not access_token:
            raise Exception("No access token presented in response body")

        return access_token
    except Exception as err:
        raise err


access_token = get_access_token()
"""
For both new and old Dingtalk API
"""

runtime_options = RuntimeOptions()
"""
For new Dingtalk API
"""
