from datetime import datetime
from op.utils import (
    decompose_into_small_timeframe,
    deduplicate_records_by_id,
    deduplicate_records,
)
from unittest import mock


def test_deduplicate_records_by_id():
    records = [
        {"id": 1, "name": "a"},
        {"id": 2, "name": "b"},
        {"id": 3, "name": "c"},
        {"id": 1, "name": "d"},
        {"id": 2, "name": "e"},
    ]

    unique_records = deduplicate_records_by_id(records)

    assert len(unique_records) == 3
    assert unique_records[0]["name"] == "a"
    assert unique_records[1]["name"] == "b"
    assert unique_records[2]["name"] == "c"


def test_deduplicate_records():
    records = [
        {"id": 1, "name": "a", "age": 1},
        {"id": 2, "name": "b", "age": 2},
        {"id": 3, "name": "a", "age": 3},
        {"id": 4, "name": "b", "age": 4},
        {"id": 5, "name": "a", "age": 1},
    ]

    unique_records = deduplicate_records(records, ["name", "age"])

    assert len(unique_records) == 4
    assert unique_records[0]["id"] == 1
    assert unique_records[1]["id"] == 2
    assert unique_records[2]["id"] == 3
    assert unique_records[3]["id"] == 4


def test_decompose_into_small_timeframe():
    fn = mock.Mock(return_value=[])

    start_date = datetime(2022, 1, 1)
    end_date = datetime(2022, 1, 31)
    timeframe = 7

    decompose_into_small_timeframe(fn, start_date, end_date, timeframe)

    assert fn.call_count == 5

    fn.assert_has_calls(
        [
            mock.call(
                datetime(2022, 1, 1),
                datetime(2022, 1, 8)
            ),
            mock.call(
                datetime(2022, 1, 8),
                datetime(2022, 1, 15),
            ),
            mock.call(
                datetime(2022, 1, 15),
                datetime(2022, 1, 22),
            ),
            mock.call(
                datetime(2022, 1, 22),
                datetime(2022, 1, 29),
            ),
            mock.call(
                datetime(2022, 1, 29),
                datetime(2022, 1, 31),
            ),
        ],
        any_order=False,
    )
