from datetime import datetime, timedelta
from op.leave import get_leave_records

def test_get_leave_records():
    now = datetime.now()
    before = now - timedelta(hours=1)
    get_leave_records(before, now)