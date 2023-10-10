from datetime import datetime, timedelta
from op.attendance import get_attendance_records

def test_get_attendance_records():
    now = datetime.now()
    before = now - timedelta(hours=1)
    get_attendance_records(before, now)