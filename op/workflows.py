from typing import List
from .shared import admin_opuserid, access_token, config, runtime_options
from alibabacloud_dingtalk.workflow_1_0 import models as dingtalk_workflow_models
from alibabacloud_dingtalk.workflow_1_0.client import (
    Client as DingtalkWorkflowClient,
)


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


workflows = get_workflows()
"""
All workflows

Current workflows (13/08/2023):
Leave
差旅預訂
出 Job
WFH(只限確診人事申請)
IT Support
借還 working file
IT Claim
魔点临时开门权限
商旅报销
魔点访客自主登记审批
魔点访客提前预约审批
測試
实习证明
Membership Renewal (31.3.2023)
本日工作计划
差旅报销
付款单
收款单
备用金
备用金核销
备用金还款
应收单
应收坏账
应收回款
应付单
应付实付
应付免付
转账申请
日常报销
員工旅遊個人資料
撤銷假期申請
(HKD) 8月-Petty Cash & OT Claim
(RMB) 8月-Petty Cash & OT Claim
(MYR) 8月-Petty Cash & OT Claim
(2023_HKD)7月-Petty Cash & OT Claim
06.08-12.08 TimeSheet
旅游统计
"""

# pyright: reportUnknownMemberType=warning
leave_workflow = next(
    w for w in workflows if w.flow_title == "Leave"
)
