from pprint import pprint
from op.overtime import get_overtime_records
from op.utils import get_time
from op.leave import get_leave_records


def main():
    # overtime_records = get_overtime_records(
    #     start_time=get_time(2023, 8, 9),
    #     end_time=get_time(2023, 8, 12),
    # )
    # pprint(overtime_records)

    leave_records = get_leave_records(
        start_time=get_time(2023, 8, 9),
        end_time=get_time(2023, 8, 12),
    )
    pprint(leave_records)


if __name__ == "__main__":
    main()
