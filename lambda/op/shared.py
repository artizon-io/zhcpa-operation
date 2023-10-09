from alibabacloud_dingtalk.oauth2_1_0.client import Client as DingtalkClient
from alibabacloud_tea_openapi import models as open_api_models
from alibabacloud_dingtalk.oauth2_1_0 import models as dingtalk_oauth_models
from alibabacloud_tea_util.models import RuntimeOptions
from op.env import get_env
from op.secret import secrets


admin_opuserid: str = get_env("ADMIN_OPUSERID")

dingtalk_app_key: str = get_env("DINGTALK_APP_KEY")
dingtalk_app_secret: str = secrets["DINGTALK_APP_SECRET"]

config = open_api_models.Config()
"""
For new Dingtalk API
"""
config.protocol = "https"
config.region_id = "central"


def get_access_token() -> str:
    client = DingtalkClient(config)

    request = dingtalk_oauth_models.GetAccessTokenRequest(
        app_key=dingtalk_app_key, app_secret=dingtalk_app_secret
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
