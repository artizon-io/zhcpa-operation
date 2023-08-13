from pprint import pprint

from .utils import get_time
from .leave import (
    get_leave_types,
    get_opusers_leave_records,
    get_opusers_leave_records_v2,
)
from .opuser import get_opuserids
from .workflows import get_workflows, leave_workflow


def main():
    # pprint(get_leave_types())
    # pprint(get_opuserid_list())
    # pprint(get_opusers_leave_records())
    # pass
    # pprint(get_workflows())
    # print(get_time(2020, 4, 10))
    pprint(
        get_opusers_leave_records_v2(
            start_time=get_time(2023, 8, 1),
            process_code=leave_workflow.process_code,
            end_time=get_time(2023, 8, 10),
        )
    )


if __name__ == "__main__":
    main()
