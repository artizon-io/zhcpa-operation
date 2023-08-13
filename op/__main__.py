from pprint import pprint

from .utils import get_time
from .leave import (
    get_leave_record_details,
    get_leave_types,
    get_opusers_leave_records_ids_v1,
    get_opusers_leave_records_ids,
)
from .opuser import get_opuserids
from .workflows import get_workflows, leave_workflow


def main():
    records = get_opusers_leave_records_ids(
        start_time=get_time(2023, 8, 10),
        process_code=leave_workflow.process_code,  # pyright: ignore
        end_time=get_time(2023, 8, 11),
    )
    for r in records:
        details = get_leave_record_details(r)
        print()
        pprint(details.create_time)  # pyright: ignore
        pprint(details.finish_time)  # pyright: ignore


if __name__ == "__main__":
    main()
