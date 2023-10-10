from typing import Any
from op.logger import logger
from op.attendance import (
    upsert_new_attendance,
)
from op.leave import upsert_new_leave
from op.opuser import upsert_all_opusers
from op.public_holidays import (
    upsert_all_regions_holidays,
)


# Event
# https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-concepts.html#gettingstarted-concepts-event
# Context
# https://docs.aws.amazon.com/lambda/latest/dg/python-context.html
def handler(event: Any, context: Any):
    # upsert_all_regions_holidays()

    upsert_all_opusers()

    upsert_new_attendance()

    upsert_new_leave()
