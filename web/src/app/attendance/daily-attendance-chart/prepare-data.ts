import { DateTime } from "luxon";

export function prepareDailyAttendanceChartData(
  attendanceData: Database["public"]["Views"]["opuser_daily_attendance_view"]["Row"][],
  leaveData: Database["public"]["Tables"]["leave"]["Row"][]
): [
  DailyAttendanceChartData[],
  DailyAttendanceChartData[],
  DailyAttendanceChartHolidayData[],
  DailyAttendanceChartLeaveData[]
] {

  return [
    prepareAttendanceData(attendanceData),
    ...prepareShiftHolidayData(attendanceData),
    prepareLeaveData(leaveData),
  ];
}

const MAX_CHECK_DURATION_IN_DAYS = 2;

function prepareAttendanceData(
  rawData: Database["public"]["Views"]["opuser_daily_attendance_view"]["Row"][]
): DailyAttendanceChartData[] {
  if (rawData.length === 0) return [];

  const data = [] as DailyAttendanceChartData[];

  const addRow = (date: string, times: [DateTime, DateTime]) => {
    data.push({
      date,
      times: [times[0].toFormat("HH:mm"), times[1].toFormat("HH:mm")],
    });
  };

  rawData.forEach((attendance) => {
    if (!attendance.is_record_valid) return;

    attendance.check_in_times!.forEach((rawCheckInTime, index) => {
      const checkInTime = DateTime.fromISO(rawCheckInTime);
      const checkOutTime = DateTime.fromISO(attendance.check_out_times![index]);

      if (checkInTime.hasSame(checkOutTime, "day")) {
        addRow(attendance.attendance_date!, [checkInTime, checkOutTime]);
        return;
      }

      // Check in date !== check out date

      let tempCheckOutTime = checkInTime;
      let count = 0;

      while (!checkOutTime.hasSame(tempCheckOutTime, "day")) {
        if (count === MAX_CHECK_DURATION_IN_DAYS) {
          throw Error(
            `Employee check in/out spans across too many days ${checkInTime} ${checkOutTime}`
          );
        }

        if (count === 0) {
          // Add check-in time => end of day
          addRow(attendance.attendance_date!, [
            checkInTime,
            tempCheckOutTime.endOf("day"),
          ]);
        } else {
          // Add whole day
          addRow(tempCheckOutTime.toISODate()!, [
            tempCheckOutTime.startOf("day"),
            tempCheckOutTime.endOf("day"),
          ]);
        }
        tempCheckOutTime = tempCheckOutTime.plus({ day: 1 });
        count++;
      }

      // Add start of day => check-out time

      addRow(checkOutTime.toISODate()!, [
        tempCheckOutTime.startOf("day"),
        checkOutTime,
      ]);
    });
  });

  return data;
}

function prepareShiftHolidayData(
  rawAttendanceData: Database["public"]["Views"]["opuser_daily_attendance_view"]["Row"][]
): [DailyAttendanceChartData[], DailyAttendanceChartHolidayData[]] {
  if (rawAttendanceData.length === 0) return [[], []];

  const shiftData = [] as DailyAttendanceChartData[];
  const holidayData = [] as DailyAttendanceChartHolidayData[];

  const addShift = (date: string, times: [DateTime, DateTime]) => {
    shiftData.push({
      date,
      times: [times[0].toFormat("HH:mm"), times[1].toFormat("HH:mm")],
    });
  };
  const addHoliday = (date: DateTime, holidayName: string) => {
    holidayData.push({
      date: date.toISODate()!,
      holidayName,
      times: [
        date.startOf("day").toFormat("HH:mm"),
        date.endOf("day").toFormat("HH:mm"),
      ],
    });
  };

  for (const record of rawAttendanceData) {
    if (record.is_holiday) {
      addHoliday(
        DateTime.fromISO(record.attendance_date!),
        record.holiday_name!
      );
      continue;
    }

    if (record.is_shift_off_day) continue;

    addShift(record.attendance_date!, [
      DateTime.fromISO(record.shift_start_time!),
      DateTime.fromISO(record.shift_end_time!),
    ]);
  }

  return [shiftData, holidayData];
}

function prepareLeaveData(
  rawData: Database["public"]["Tables"]["leave"]["Row"][]
): DailyAttendanceChartLeaveData[] {
  if (rawData.length === 0) return [];

  const data = [] as DailyAttendanceChartLeaveData[];

  const addLeave = (
    date: string,
    times: [DateTime, DateTime],
    type: string,
    remark: string | null
  ) => {
    data.push({
      date,
      times: [times[0].toFormat("HH:mm"), times[1].toFormat("HH:mm")],
      type,
      remark,
    });
  };

  rawData.forEach((leave) => {
    if (leave!.status !== "APPROVED") return;

    const leaveStartTime = DateTime.fromISO(leave!.leave_start_time);
    const leaveEndTime = DateTime.fromISO(leave!.leave_end_time);

    if (leaveStartTime.hasSame(leaveEndTime, "day")) {
      addLeave(
        leaveStartTime.toISODate()!,
        [leaveStartTime, leaveEndTime],
        leave!.leave_type,
        leave!.opuser_remark
      );
      return;
    }

    let tempLeaveEndTime = leaveStartTime;
    let count = 0;

    while (!leaveEndTime.hasSame(tempLeaveEndTime, "day")) {
      if (count >= 50) {
        throw Error(`Too many days ${leaveStartTime} ${leaveEndTime}`);
      }

      if (count === 0) {
        addLeave(
          leaveStartTime.toISODate()!,
          [leaveStartTime, tempLeaveEndTime.endOf("day")],
          leave!.leave_type,
          leave!.opuser_remark
        );
      } else {
        addLeave(
          tempLeaveEndTime.toISODate()!,
          [tempLeaveEndTime.startOf("day"), tempLeaveEndTime.endOf("day")],
          leave!.leave_type,
          leave!.opuser_remark
        );
      }
      tempLeaveEndTime = tempLeaveEndTime.plus({ day: 1 });
      count++;
    }

    // Now tempCheckOutTime is the same day as leaveEndTime
    addLeave(
      leaveEndTime.toISODate()!,
      [tempLeaveEndTime.startOf("day"), leaveEndTime],
      leave!.leave_type,
      leave!.opuser_remark
    );
  });

  return data;
}
