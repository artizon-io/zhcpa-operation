from pprint import pprint
from op.attendance import get_attendance_records_details
from op.overtime import get_overtime_records
from op.utils import get_unix_time
from op.leave import get_leave_records
from op.opuser import get_opusers_details


def main():
    # overtime_records = get_overtime_records(
    #     start_time=get_time(2023, 8, 9),
    #     end_time=get_time(2023, 8, 12),
    # )
    # pprint(overtime_records)

    # leave_records = get_leave_records(
    #     start_time=get_unix_time(2023, 8, 9),
    #     end_time=get_unix_time(2023, 8, 12),
    # )
    # pprint(leave_records)

    # attendance_records = get_attendance_records_details(
    #     start_time="2023-08-10 08:00:00",
    #     end_time="2023-08-11 18:00:00",
    # )
    # pprint(attendance_records)

    opusers_details = get_opusers_details()
    pprint(opusers_details)


if __name__ == "__main__":
    main()
