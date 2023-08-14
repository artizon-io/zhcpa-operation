from .attendance import get_attendance_records_details
from .utils import get_time
from .overtime import get_opusers_overtime_records_ids, get_overtime_record_details
from pprint import pprint

# from .attendance import get_attendance_records_details

# from .utils import get_time
# from .leave import (
#     get_leave_record_details,
#     get_leave_types,
#     get_opusers_leave_records_ids_v1,
#     get_opusers_leave_records_ids,
# )
# from .overtime import get_opusers_overtime_records_ids, get_overtime_record_details
# from .opuser import get_opuserids
# from .workflows import get_workflows, leave_workflow


def main():
    # records = get_opusers_leave_records_ids(
    # records = get_opusers_overtime_records_ids(
    #     start_time=get_time(2023, 8, 10),
    #     end_time=get_time(2023, 8, 11),
    # )
    # for r in records:
    #     details = get_overtime_record_details(r)
    #     # pprint(details.__dict__)
    #     pprint(details.create_time)  # pyright: ignore
    #     pprint(details.finish_time)  # pyright: ignore

    records = get_attendance_records_details(
        start_time="2023-08-10 08:00:00",
        end_time="2023-08-11 18:00:00",
    )
    pprint(records)


if __name__ == "__main__":
    main()
