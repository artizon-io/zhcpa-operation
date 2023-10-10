import json
from pprint import pprint
from typing import Any, Dict
import boto3
from botocore.exceptions import ClientError
from op.env import project_name, aws_region


def get_secret() -> Dict[str, str]:
    session = boto3.session.Session()
    client = session.client(
        service_name="secretsmanager",
        region_name=aws_region,
    )

    try:
        res: Any = client.get_secret_value(SecretId=f"{project_name}")
    except ClientError as e:
        error_code = e.response["Error"]["Code"]  # pyright: ignore
        raise Exception(f"Fail to fetch secret {project_name}\n{error_code}")
    else:
        # Secrets Manager decrypts the secret value using the associated KMS CMK
        # Depending on whether the secret was a string or binary, only one of these fields will be populated
        if "SecretString" in res:
            return json.loads(res["SecretString"])
        else:
            raise Exception("SecretBinary is not supported")
            return res["SecretBinary"]


secrets = get_secret()