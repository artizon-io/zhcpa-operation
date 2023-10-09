from op.attendance import (
    upsert_new_attendance,
)
from op.leave import upsert_new_leave
from op.opuser import upsert_all_opusers
from op.public_holidays import (
    upsert_all_regions_holidays,
)


def handler(event, content):
    # upsert_all_regions_holidays()

    upsert_all_opusers()

    upsert_new_attendance()

    upsert_new_leave()