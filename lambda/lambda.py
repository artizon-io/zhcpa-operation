from datetime import datetime
from pprint import pprint
from op.attendance import get_attendance_records, upsert_attendance, upsert_new_attendance
from op.leave import get_leave_records, upsert_leave, upsert_new_leave
from op.opuser import get_opuser_records, upsert_opusers, upsert_all_opusers
from op.public_holidays import get_hk_holidays, upsert_holidays, upsert_all_regions_holidays
from op.supabase import supabase
from op.utils import get_unix_time

def handler(event, content):
    # upsert_all_regions_holidays()

    upsert_all_opusers()

    upsert_new_attendance()

    upsert_new_leave()
