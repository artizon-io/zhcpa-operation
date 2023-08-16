import json
from typing import Any, List, Literal, Optional, Tuple, TypedDict, Union
from op.utils import iso_date_sanity_check

from op.workflows import (
    get_overtime_workflow_id,
    get_workflow_instance_details,
    get_workflow_instances_ids,
)


def get_overtime_records_ids(
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


class OvertimeExpense(TypedDict):
    """
    All money fields are in HKD
    """

    expense_type: str
    expense_amount: float


class PettyCashOnlyRecord(TypedDict):
    """
    All time fields are in ISO format
    """

    petty_cash_only: bool
    opuserid: str
    record_create_time: int
    status: Literal["TERMINATED", "APPROVED", "REJECTED"]
    job_code: str
    opuser_remark: str
    expenses: List[OvertimeExpense]


class OvertimeRecord(TypedDict):
    """
    All time fields are in ISO format
    All duration fields are in hours
    """

    petty_cash_only: bool
    opuserid: str
    record_create_time: int
    status: Literal["TERMINATED", "APPROVED", "REJECTED"]
    overtime_start_time: int
    overtime_end_time: int
    overtime_duration: float
    job_code: str
    location: str
    opuser_remark: str
    expenses: List[OvertimeExpense]


def extract_overtime_record_details(
    raw_details: Any,
) -> Union[OvertimeRecord, PettyCashOnlyRecord]:
    details = dict()

    details["opuserid"] = raw_details.originator_user_id
    details["record_create_time"] = iso_date_sanity_check(
        raw_details.create_time  # pyright: ignore
    )
    if raw_details.status == "COMPLETED":
        details["status"] = "APPROVED" if raw_details.result == "agree" else "REJECTED"
    else:
        details["status"] = raw_details.status

    def get_custom_field(key: str):
        return next(
            field.value
            for field in raw_details.form_component_values
            if field.name == key
        )

    is_overtime = get_custom_field("是否需要 Claim OT")
    if is_overtime == "否":
        details["petty_cash_only"] = True
    else:
        details["petty_cash_only"] = False
        details["overtime_start_time"] = iso_date_sanity_check(get_custom_field("開始時間"))
        details["overtime_end_time"] = iso_date_sanity_check(get_custom_field("結束時間"))
        details["overtime_duration"] = float(get_custom_field("時長"))
        details["location"] = is_overtime.split("，", 1)[1].strip()

    details["opuser_remark"] = get_custom_field("Remark/備註")
    details["job_code"] = get_custom_field("Job Code/客戶編號")

    def parse_table(table: Any) -> List[OvertimeExpense]:
        expenses = list()

        table = json.loads(table)
        for entry in table:
            entry = entry["rowValue"]
            expense_type = next(
                field["value"] for field in entry if field["label"] == "Exp/報銷項目"
            )
            expense_amount = next(
                field["value"] for field in entry if field["label"] == "Amount/金額 (HKD)"
            )
            expenses.append(
                {
                    "expense_type": expense_type,
                    "expense_amount": expense_amount,
                }
            )

        return expenses

    details["expenses"] = parse_table(get_custom_field("Type of Allowance"))

    return details  # pyright: ignore


def get_overtime_record_details(
    overtime_record_id: str,
) -> Union[OvertimeRecord, PettyCashOnlyRecord]:
    """
    Get a particular overtime record's details
    """
    return extract_overtime_record_details(
        get_workflow_instance_details(overtime_record_id)
    )


def get_overtime_records(
    start_time: int,
    end_time: int,
    opuserids: Optional[List[str]] = None,
    statuses: Optional[List[str]] = None,
) -> List[Union[OvertimeRecord, PettyCashOnlyRecord]]:
    """
    Get all operation user (i.e. colleagues) overtime applications' details (regardless of
    status i.e. approved, rejected, pending)
    """

    records = get_overtime_records_ids(
        start_time=start_time,
        end_time=end_time,
        opuserids=opuserids,
        statuses=statuses,
    )
    return list(map(get_overtime_record_details, records))  # type: ignore
