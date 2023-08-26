from datetime import datetime
from pprint import pprint
from op.attendance import get_attendance_records, upsert_attendance
from op.leave import get_leave_records, upsert_leave
from op.opuser import get_opuser_records, upsert_opusers
from op.public_holidays import get_hk_holidays, upsert_holidays
from op.supabase import supabase
from op.utils import get_unix_time


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

    # opusers_details = get_opusers_details()
    # pprint(opusers_details)
    # upsert_opusers(get_opuser_records())
    # response = supabase.table("opuser").delete().eq("id", 3).execute()
    # pprint(response)
    # upsert_holidays(get_hk_holidays(), "hong kong")
    # upsert_attendance(get_attendance_records(
    #     start_time=datetime(2023, 8, 17),
    #     end_time=datetime(2023, 8, 20),
    # ))
    upsert_attendance(get_attendance_records(
        start_time=datetime(2023, 7, 13),
        end_time=datetime(2023, 7, 14),
    ))
    # upsert_leave(get_leave_records(
    #     start_time=datetime(2023, 7, 20),
    #     end_time=datetime(2023, 7, 21),
    # ))


if __name__ == "__main__":
    main()
