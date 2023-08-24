"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { create } from "zustand";
import { cn } from "@/lib/utils";
import { use, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
// import Chart from "chart.js/auto";
import { DatasetController } from "chart.js";
import Chart from "chart.js/auto";
import "chartjs-adapter-luxon";
import { DateTime } from "luxon";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useQuery } from "@tanstack/react-query";

export const useDailyAttendanceChartDialogStore = create<{
  open: (opuserId: string, name: string, month: DateTime) => void;
  inputs?: {
    opuserId: string;
    name: string;
    month: DateTime;
  };
}>((set) => ({
  open: (opuserId, name, month) => {
    set({
      inputs: {
        opuserId,
        name,
        month,
      },
    });
  },
  inputs: undefined,
}));

type Data = {
  date: string;
  times: [string, string];
};

interface HolidayData extends Data {
  holidayName: string;
}

interface LeaveData extends Data {
  type: string;
  remark: string | null;
}

const getFormattedDate = (month: DateTime, dateString?: string) => {
  const date = `${month.year}-${String(month.month).padStart(2, "0")}`;

  if (dateString) {
    return `${date}-${dateString}`;
  } else {
    return date;
  }
};

export const DailyAttendanceChartDialog = ({ ...props }) => {
  const { inputs } = useDailyAttendanceChartDialogStore();
  const [groupVisibility, setGroupVisibility] = useState<{
    attendance: boolean;
    leave: boolean;
    workingHours: boolean;
    holiday: boolean;
  }>({
    attendance: true,
    leave: true,
    workingHours: true,
    holiday: true,
  });

  const supabase = createClientComponentClient<Database>();

  const attendanceQuery = useQuery({
    // @ts-ignore
    queryKey: ["attendance-daily"],
    queryFn: () =>
      supabase
        .from("opuser_daily_attendance_view")
        .select()
        .eq("opuser_id", inputs!.opuserId)
        .gte("attendance_date", inputs!.month.startOf("month").toISODate())
        .lte("attendance_date", inputs!.month.endOf("month").toISODate())
        .throwOnError()
        .then(({ data }) => data),
    enabled: false,
  });

  const leaveQuery = useQuery({
    // @ts-ignore
    queryKey: ["leave-monthly"],
    queryFn: () =>
      supabase
        .from("monthly_leave_view")
        .select("*")
        .eq("opuser_id", inputs!.opuserId)
        .eq("month", inputs!.month.toISODate())
        .single()
        .throwOnError()
        .then(({ data }) => {
          const leaves = data!.leaves;
          if (leaves)
            return Promise.all(
              leaves.map((leave) =>
                supabase
                  .from("leave")
                  .select("*")
                  .eq("id", leave)
                  .single()
                  .throwOnError()
                  .then(({ data }) => data)
              )
            );
          else return [];
        }),
    enabled: false,
  });

  useEffect(() => {
    if (!inputs) return;

    attendanceQuery.refetch();
    leaveQuery.refetch();
  }, [inputs]);

  useEffect(() => {
    if (!inputs) {
      if (chart.current) {
        chart.current.destroy();
      }
      return;
    }

    if (
      !attendanceQuery.data ||
      !leaveQuery.data ||
      attendanceQuery.isFetching ||
      attendanceQuery.isRefetching ||
      leaveQuery.isFetching ||
      leaveQuery.isRefetching
    )
      return;

    // Attendance

    const attendanceData = [] as Data[];

    const addAttendance = (date: string, times: [DateTime, DateTime]) => {
      attendanceData.push({
        date,
        times: [times[0].toFormat("HH:mm"), times[1].toFormat("HH:mm")],
      });
    };

    const rawAttendance = attendanceQuery.data;
    if (rawAttendance) {
      rawAttendance.forEach((attendance) => {
        if (!attendance.is_record_valid) return;

        attendance.check_in_times!.forEach((rawCheckInTime, index) => {
          const checkInTime = DateTime.fromISO(rawCheckInTime);
          const checkOutTime = DateTime.fromISO(
            attendance.check_out_times![index]
          );

          if (checkInTime.hasSame(checkOutTime, "day")) {
            addAttendance(attendance.attendance_date!, [
              checkInTime,
              checkOutTime,
            ]);
            return;
          }

          let tempCheckOutTime = checkInTime;
          let count = 0;

          while (!checkOutTime.hasSame(tempCheckOutTime, "day")) {
            if (count >= 50) {
              throw Error(`Too many days ${checkInTime} ${checkOutTime}`);
            }

            if (count === 0) {
              addAttendance(attendance.attendance_date!, [
                checkInTime,
                tempCheckOutTime.endOf("day"),
              ]);
            } else {
              addAttendance(tempCheckOutTime.toISODate()!, [
                tempCheckOutTime.startOf("day"),
                tempCheckOutTime.endOf("day"),
              ]);
            }
            tempCheckOutTime = tempCheckOutTime.plus({ day: 1 });
            count++;
          }

          // Now tempCheckOutTime is the same day as checkOutTime
          addAttendance(checkOutTime.toISODate()!, [
            tempCheckOutTime.startOf("day"),
            checkOutTime,
          ]);
        });
      });
    }

    // Shift & Holiday

    const shiftData = [] as Data[];
    const holidayData = [] as HolidayData[];

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

    if (rawAttendance) {
      for (const record of rawAttendance) {
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
    }

    // Leave

    const leaveData = [] as LeaveData[];

    const addLeave = (
      date: string,
      times: [DateTime, DateTime],
      type: string,
      remark: string | null
    ) => {
      leaveData.push({
        date,
        times: [times[0].toFormat("HH:mm"), times[1].toFormat("HH:mm")],
        type,
        remark,
      });
    };

    const rawLeave = leaveQuery.data;
    if (rawLeave) {
      rawLeave.forEach((leave) => {
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
    }

    // Chart

    if (!chartContainer.current) throw Error("No chart container");
    if (chart.current) {
      chart.current.destroy();
    }

    chart.current = new Chart(chartContainer.current, {
      // https://www.chartjs.org/docs/latest/charts/bar.html#bar-chart
      type: "bar",
      data: {
        labels: [...Array(inputs.month.daysInMonth).keys()].map((i) =>
          getFormattedDate(inputs.month, String(i + 1))
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
            min: getFormattedDate(inputs.month, "01"),
            max: getFormattedDate(
              inputs.month,
              String(inputs.month.daysInMonth)
            ),
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
              color: "#555",
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
            min: getFormattedDate(inputs.month, "01"),
            max: getFormattedDate(
              inputs.month,
              String(inputs.month.daysInMonth)
            ),
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
              color: "#222",
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
                  return ` ${(item.raw as HolidayData).holidayName}`;
                }

                if (label === "Leave") {
                  const leave = item.raw as LeaveData;
                  return leave.remark
                    ? ` ${leave.type} ${leave.remark}`
                    : ` ${leave.type}`;
                }

                const values = (item.raw as Data).times;
                return ` ${values[0]} → ${values[1]}`;
              },
            },
          },
        },
      },
    });
  }, [
    attendanceQuery.fetchStatus,
    leaveQuery.fetchStatus,
    groupVisibility,
  ]);

  const chartContainer = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Chart<"bar", Data[], string> | null>(null);

  return (
    <Dialog open={!!inputs}>
      {inputs ? (
        <DialogContent
          className="w-[90%] h-[90%] flex flex-col shadow-none bg-transparent focus:ring-0 focus:outline-none ring-0 outline-none"
          onEscapeKeyDown={(e) => {
            useDailyAttendanceChartDialogStore.setState({ inputs: undefined });
          }}
          // onInteractOutside={(e) => {
          //   useDailyAttendanceChartDialogStore.setState({ inputs: undefined });
          // }}
          onPointerDownOutside={(e) => {
            useDailyAttendanceChartDialogStore.setState({ inputs: undefined });
          }}
        >
          <div className="flex flex-row justify-between">
            <DialogHeader className="gap-1">
              <DialogTitle>Monthly attendance report</DialogTitle>
              <DialogDescription className="flex flex-col gap-1">
                <span>{inputs.name}</span>
                <span>{getFormattedDate(inputs.month)}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-row gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "ml-auto hidden h-8 lg:flex",
                      "focus-visible:ring-0 focus-visible:outline-none outline-none ring-0 shadow-none"
                    )}
                  >
                    <MixerHorizontalIcon className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-xs">
                    Toggle groups
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(groupVisibility).map(([group, visible]) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={group}
                        className="capitalize text-xs"
                        checked={visible}
                        onCheckedChange={(value) =>
                          setGroupVisibility((prev) => ({
                            ...prev,
                            [group]: !!value,
                          }))
                        }
                      >
                        {group}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "focus-visible:ring-0 focus-visible:outline-none outline-none ring-0 shadow-none"
                  )}
                  size="sm"
                  onClick={(e) => {
                    useDailyAttendanceChartDialogStore.setState({
                      inputs: undefined,
                    });
                  }}
                >
                  Close
                </Button>
              </DialogClose>
            </div>
          </div>
          <div className="flex-1">
            <canvas ref={chartContainer} />
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
};
