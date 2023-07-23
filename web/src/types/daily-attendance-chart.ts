type DailyAttendanceChartData = {
  date: string;
  times: [string, string];
};

interface DailyAttendanceChartHolidayData extends DailyAttendanceChartData {
  holidayName: string;
}

interface DailyAttendanceChartLeaveData extends DailyAttendanceChartData {
  type: string;
  remark: string | null;
}

type DailyAttendanceChartGroupVisibility = {
  attendance: boolean;
  leave: boolean;
  workingHours: boolean;
  holiday: boolean;
};
