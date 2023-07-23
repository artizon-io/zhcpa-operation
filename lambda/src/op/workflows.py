from functools import partial
from typing import List, Optional, Tuple

from op.utils import generate_depagination_logic
from op.shared import admin_opuserid, access_token, config, runtime_options
from alibabacloud_dingtalk.workflow_1_0 import models as dingtalk_workflow_models
from alibabacloud_dingtalk.workflow_1_0.client import (
    Client as DingtalkWorkflowClient,
)
from op.cache import cache


def get_workflows() -> (
    List[dingtalk_workflow_models.GetManageProcessByStaffIdResponseBodyResult]
):
    """
    Get all workflows' details (i.e. OA forms)
    """
    req = dingtalk_workflow_models.GetManageProcessByStaffIdRequest(
        user_id=admin_opuserid,
    )
    headers = dingtalk_workflow_models.GetManageProcessByStaffIdHeaders(
        x_acs_dingtalk_access_token=access_token
    )

    try:
        response = DingtalkWorkflowClient(
            config
        ).get_manage_process_by_staff_id_with_options(
            req, headers, runtime=runtime_options
        )
        if getattr(response, "status_code") != 200:
            raise Exception("Request not ok")

        if not getattr(response.body, "success"):
            raise Exception("Dingtalk request not ok")

        data = response.body.result

        return data
    except Exception as err:
        raise err


def get_leave_workflow_id() -> str:
    return cache["workflows"]["leave_workflow_id"]


def get_overtime_workflow_id() -> str:
    return cache["workflows"]["overtime_workflow_id"]


workflow_cache = None
try:
    workflow_cache = cache["workflows"]
except KeyError:
    pass

if not workflow_cache:
    workflows = get_workflows()

    leave_workflow = next(w for w in workflows if w.flow_title == "Leave")
    overtime_workflow = next(
        w for w in workflows if w.flow_title == "(HKD) 8月-Petty Cash & OT Claim"
    )

    cache["workflows"] = {
        "leave_workflow_id": f"{leave_workflow.process_code}",
        "overtime_workflow_id": f"{overtime_workflow.process_code}",
    }

    with open("cache.ini", "w") as configfile:
        cache.write(configfile)


def get_workflow_instances_ids(
    process_code: str,
    start_time: int,
    end_time: int,
    opuserids: Optional[List[str]] = None,
    statuses: Optional[List[str]] = None,
    offset_and_size: Optional[Tuple[int, int]] = None,
) -> List[str]:
    """
    https://open-dev.dingtalk.com/apiExplorer#/?devType=org&api=workflow_1.0%23ListProcessInstanceIds
    """

    def fetch_from_server(
        offset: int,
        size: int,
    ) -> Tuple[List[str], int,]:
        req = dingtalk_workflow_models.ListProcessInstanceIdsRequest(
            next_token=offset,
            start_time=start_time,
            end_time=end_time,
            process_code=process_code,
            max_results=size,
        )
        if opuserids:
            req.user_ids = opuserids
        if statuses:
            req.statuses = statuses

        headers = dingtalk_workflow_models.ListProcessInstanceIdsHeaders(
            x_acs_dingtalk_access_token=access_token
        )

        try:
            response = DingtalkWorkflowClient(
                config
            ).list_process_instance_ids_with_options(
                req, headers, runtime=runtime_options
            )
            if getattr(response, "status_code") != 200:
                raise Exception("Request not ok")

            if not getattr(response.body, "success"):
                raise Exception("Dingtalk request not ok")

            data = response.body.result

            return (data.list, data.next_token)  # pyright: ignore
        except Exception as err:
            raise err

    if offset_and_size:
        return fetch_from_server(*offset_and_size)[0]

    return generate_depagination_logic(partial(fetch_from_server, size=20))()


def get_workflow_instance_details(
    instance_id: str,
) -> dingtalk_workflow_models.GetProcessInstanceResponseBodyResult:
    """
    https://open-dev.dingtalk.com/apiExplorer#/?devType=org&api=workflow_1.0%23GetProcessInstance
    """
    req = dingtalk_workflow_models.GetProcessInstanceRequest(
        process_instance_id=instance_id
    )

    headers = dingtalk_workflow_models.GetProcessInstanceHeaders(
        x_acs_dingtalk_access_token=access_token
    )

    try:
        response = DingtalkWorkflowClient(config).get_process_instance_with_options(
            req, headers, runtime=runtime_options
        )
        if getattr(response, "status_code") != 200:
            raise Exception("Request not ok")

        if not getattr(response.body, "success"):
            raise Exception("Dingtalk request not ok")

        data = response.body.result

        return data
    except Exception as err:
        raise err
