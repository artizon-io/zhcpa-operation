from datetime import datetime
from typing import Any, List, Literal, Optional, Tuple, TypedDict
from op.supabase import supabase
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


# class OvertimeExpense(TypedDict):
#     """
#     All money fields are in HKD
#     """

#     expense_type: str
#     expense_amount: float


# class PettyCashOnlyRecord(TypedDict):
#     """
#     All time fields are in ISO format
#     """

#     petty_cash_only: bool
#     opuserid: str
#     record_create_time: int
#     status: Literal["TERMINATED", "APPROVED", "REJECTED"]
#     job_code: str
#     opuser_remark: str
#     expenses: List[OvertimeExpense]


class OvertimeRecord(TypedDict):
    id: str
    # petty_cash_only: bool
    opuserid: str
    record_create_time: datetime
    status: Literal["REVOKED", "APPROVED", "REJECTED"]
    overtime_start_time: datetime
    overtime_end_time: datetime
    # overtime_duration: float
    # job_code: str
    location: str
    opuser_remark: str
    # expenses: List[OvertimeExpense]


def extract_overtime_record_details(
    raw_details: Any,
    record_id: str,
) -> OvertimeRecord | None:
    details = dict()

    details["id"] = record_id
    details["opuserid"] = raw_details.originator_user_id
    details["record_create_time"] = iso_date_sanity_check(
        raw_details.create_time  # pyright: ignore
    )
    if raw_details.status == "COMPLETED":
        details["status"] = "APPROVED" if raw_details.result == "agree" else "REJECTED"
    elif raw_details.status == "TERMINATED":
        details["status"] = "REVOKED"
    else:
        raise Exception("Unknown status")

    def get_custom_field(key: str):
        return next(
            field.value
            for field in raw_details.form_component_values
            if field.name == key
        )

    is_overtime = get_custom_field("是否需要 Claim OT")
    if is_overtime == "否":
        # details["petty_cash_only"] = True
        return
    else:
        # details["petty_cash_only"] = False
        details["overtime_start_time"] = datetime.fromisoformat(
            get_custom_field("開始時間")
        )
        details["overtime_end_time"] = datetime.fromisoformat(get_custom_field("結束時間"))
        # details["overtime_duration"] = float(get_custom_field("時長"))
        details["location"] = is_overtime.split("，", 1)[1].strip()

    details["opuser_remark"] = get_custom_field("Remark/備註")
    # details["job_code"] = get_custom_field("Job Code/客戶編號")  # TODO: do something with this job code

    # def parse_table(table: Any) -> List[OvertimeExpense]:
    #     expenses = list()

    #     table = json.loads(table)
    #     for entry in table:
    #         entry = entry["rowValue"]
    #         expense_type = next(
    #             field["value"] for field in entry if field["label"] == "Exp/報銷項目"
    #         )
    #         expense_amount = next(
    #             field["value"] for field in entry if field["label"] == "Amount/金額 (HKD)"
    #         )
    #         expenses.append(
    #             {
    #                 "expense_type": expense_type,
    #                 "expense_amount": expense_amount,
    #             }
    #         )

    #     return expenses

    # details["expenses"] = parse_table(get_custom_field("Type of Allowance"))

    return details  # pyright: ignore


def get_overtime_record_details(
    overtime_record_id: str,
) -> OvertimeRecord | None:
    """
    Get a particular overtime record's details
    """
    return extract_overtime_record_details(
        get_workflow_instance_details(overtime_record_id), overtime_record_id
    )


def get_overtime_records(
    start_time: datetime,
    end_time: datetime,
    opuserids: Optional[List[str]] = None,
    statuses: Optional[List[str]] = None,
) -> List[OvertimeRecord]:
    """
    Get all operation user (i.e. colleagues) overtime applications' details (regardless of
    status i.e. approved, rejected, pending)
    """

    start_time_str = int(start_time.timestamp() * 1000)
    end_time_str = int(end_time.timestamp() * 1000)

    records = get_overtime_records_ids(
        start_time=start_time_str,
        end_time=end_time_str,
        opuserids=opuserids,
        statuses=statuses,
    )
    records = list(map(get_overtime_record_details, records))  # type: ignore
    return list(filter(lambda r: r is not None, records))  # type: ignore


def upsert_overtime(overtime_records: List[OvertimeRecord]):
    data = [
        {
            "id": r["id"],
            "opuser_id": r["opuserid"],
            "record_create_time": r["record_create_time"].isoformat(),
            "status": r["status"],
            "overtime_start_time": r["overtime_start_time"].isoformat(),
            "overtime_end_time": r["overtime_end_time"].isoformat(),
            "location": r["location"],
            "opuser_remark": r["opuser_remark"],
        }
        for r in overtime_records
    ]

    supabase.table("overtime").upsert(data).execute()  # pyright: ignore
