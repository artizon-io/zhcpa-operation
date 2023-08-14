from typing import List, Optional, Tuple

from .workflows import (
    get_overtime_workflow_id,
    get_workflow_instance_details,
    get_workflow_instances_ids,
)

from alibabacloud_dingtalk.workflow_1_0 import models as dingtalk_workflow_models


def get_opusers_overtime_records_ids(
    start_time: int,
    end_time: int,
    opuserids: Optional[List[str]] = None,
    statuses: Optional[List[str]] = None,
    offset_and_size: Optional[Tuple[int, int]] = None,
) -> List[str]:
    """
    Get all operation user (i.e. colleagues) overtime applications' IDs (regardless of
    status i.e. approved, rejected, pending)
    """
    return get_workflow_instances_ids(
        process_code=get_overtime_workflow_id(),
        start_time=start_time,
        end_time=end_time,
        opuserids=opuserids,
        statuses=statuses,
        offset_and_size=offset_and_size,
    )


def get_overtime_record_details(
    overtime_record_id: str,
) -> dingtalk_workflow_models.GetProcessInstanceResponseBodyResult:
    """
    Get a particular overtime record's details
    """
    return get_workflow_instance_details(overtime_record_id)
