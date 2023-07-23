import { getReadableDate } from "@artizon/ui";
import { ChartConfiguration } from "chart.js";
import { DateTime } from "luxon";

export function getDailyAttendanceChartConfiguration({
  month,
  theme,
  groupVisibility,
  attendanceData,
  shiftData,
  holidayData,
  leaveData,
}: {
  month: DateTime;
  theme?: string;
  groupVisibility: DailyAttendanceChartGroupVisibility;
  attendanceData: DailyAttendanceChartData[];
  shiftData: DailyAttendanceChartData[];
  holidayData: DailyAttendanceChartHolidayData[];
  leaveData: DailyAttendanceChartLeaveData[];
}): ChartConfiguration<"bar", DailyAttendanceChartData[], string> {
  return {
    // https://www.chartjs.org/docs/latest/charts/bar.html#bar-chart
    type: "bar",
    data: {
      labels: [...Array(month.daysInMonth).keys()].map((i) =>
        getReadableDate(month, String(i + 1))
      ),
      datasets: [
        {
          label: "Attendance",
          data: attendanceData,
          grouped: false,
          order: 1,
          borderColor: "#4f71eb",
          backgroundColor: "#4f71eb88",
          borderWidth: 1,
          borderSkipped: false,
          hoverBackgroundColor: "#4f71eb",
          hoverBorderColor: "#4f71eb",
          // barPercentage: 0.7,
          hidden: !groupVisibility.attendance,
        },
        {
          label: "Working hours",
          data: shiftData,
          grouped: false,
          order: 4,
          borderColor: "#888888",
          backgroundColor: "#88888888",
          borderWidth: 1,
          borderSkipped: false,
          hoverBackgroundColor: "#888888",
          hoverBorderColor: "#888888",
          hidden: !groupVisibility.workingHours,
        },
        {
          label: "Leave",
          data: leaveData,
          grouped: false,
          order: 2,
          borderColor: "#dd6161",
          backgroundColor: "#dd616188",
          borderWidth: 1,
          borderSkipped: false,
          hoverBackgroundColor: "#dd6161",
          hoverBorderColor: "#dd6161",
          // barPercentage: 0.7,
          hidden: !groupVisibility.leave,
        },
        {
          label: "Holiday",
          data: holidayData,
          grouped: false,
          order: 3,
          borderColor: "#388264",
          backgroundColor: "#38826488",
          borderWidth: 1,
          borderSkipped: false,
          hoverBackgroundColor: "#388264",
          hoverBorderColor: "#388264",
          hidden: !groupVisibility.holiday,
        },
      ],
      yLabels: [...Array(24).keys()].map(
        (i) => `${String(i).padStart(2, "0")}:00`
      ),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      parsing: {
        // https://www.chartjs.org/docs/latest/general/data-structures.html#object-using-custom-properties
        xAxisKey: "date",
        yAxisKey: "times",
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
            displayFormats: {
              // https://moment.github.io/luxon/#/formatting?id=macro-tokens
              day: "ccc", // e.g. Monday
            },
          },
          min: getReadableDate(month, "01"),
          max: getReadableDate(month, String(month.daysInMonth)),
          ticks: {
            font: {
              weight: "bold",
            },
            maxRotation: 0,
            autoSkip: false,
          },
          grid: {
            display: false,
          },
          border: {
            display: true,
            color: theme === "dark" ? "#555" : "#ccc",
          },
        },
        x2: {
          type: "time",
          time: {
            unit: "day",
            displayFormats: {
              // https://moment.github.io/luxon/#/formatting?id=macro-tokens
              day: "dd",
            },
          },
          min: getReadableDate(month, "01"),
          max: getReadableDate(month, String(month.daysInMonth)),
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            maxRotation: 0,
            autoSkip: false,
          },
        },
        y: {
          type: "time",
          time: {
            unit: "minute",
          },
          min: "00:00",
          max: "23:59",
          ticks: {
            source: "labels",
          },
          reverse: true,
          grid: {
            display: true,
            color: theme === "dark" ? "#222" : "#eee",
          },
          border: {
            display: false,
          },
        },
      },
      plugins: {
        tooltip: {
          // https://www.chartjs.org/docs/latest/configuration/tooltip.html#tooltip
          callbacks: {
            // https://www.chartjs.org/docs/latest/configuration/tooltip.html#tooltip-callbacks
            title(items) {
              const item = items[0];
              return item.label.split(",")[0];
            },
            label(item) {
              const label = item.dataset.label || "";

              if (label === "Holiday") {
                return ` ${
                  (item.raw as DailyAttendanceChartHolidayData).holidayName
                }`;
              }

              if (label === "Leave") {
                const leave = item.raw as DailyAttendanceChartLeaveData;
                return leave.remark
                  ? ` ${leave.type} ${leave.remark}`
                  : ` ${leave.type}`;
              }

              const values = (item.raw as DailyAttendanceChartData).times;
              return ` ${values[0]} → ${values[1]}`;
            },
          },
        },
      },
    },
  };
}
