"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  cn,
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  getReadableDate,
  useToast,
} from "@artizon/ui";
import { create } from "zustand";
import { use, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DialogClose } from "@radix-ui/react-dialog";
import { DatasetController } from "chart.js";
import Chart from "chart.js/auto";
import "chartjs-adapter-luxon";
import { DateTime } from "luxon";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useDailyAttendanceChart } from "./store";
import { prepareDailyAttendanceChartData } from "./prepare-data";
import { getDailyAttendanceChartConfiguration } from "./chart-configuration";

export const DailyAttendanceChartDialog = () => {
  const { inputs } = useDailyAttendanceChart();

  const [groupVisibility, setGroupVisibility] =
    useState<DailyAttendanceChartGroupVisibility>({
      attendance: true,
      leave: true,
      workingHours: true,
      holiday: true,
    });

  const { resolvedTheme: theme } = useTheme();

  const [status, setStatus] = useState<"success" | "loading" | "error">(
    "loading"
  );

  const supabase = createClientComponentClient<Database>();

  const attendanceQuery = useQuery({
    // @ts-ignore
    queryKey: ["attendance-daily"],
    queryFn: () => {
      return supabase
        .from("opuser_daily_attendance_view")
        .select()
        .eq("opuser_id", inputs!.opuserId)
        .gte("attendance_date", inputs!.month.startOf("month").toISODate())
        .lte("attendance_date", inputs!.month.endOf("month").toISODate())
        .throwOnError()
        .then(({ data }) => data);
    },
    enabled: false,
  });

  const leaveQuery = useQuery({
    // @ts-ignore
    queryKey: ["leave-monthly"],
    queryFn: () => {
      return supabase
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
                  .then(({ data }) => data!)
              )
            );
          else return [];
        });
    },
    enabled: false,
  });

  // Cycle: (Dialog closed) Loading --[Open dialog]--> (Fetching) -> Success --[Close dialog]--> Loading

  useEffect(() => {
    if (!inputs) {
      setStatus("loading");
      chart.current?.destroy();
    } else {
      setStatus("loading");
      attendanceQuery.refetch();
      leaveQuery.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs]);

  useEffect(() => {
    if (attendanceQuery.isError || leaveQuery.isError) {
      setStatus("error");
    } else if (
      attendanceQuery.fetchStatus === "idle" &&
      leaveQuery.fetchStatus === "idle" &&
      attendanceQuery.data &&
      leaveQuery.data
    ) {
      setStatus("success");
    } else {
      setStatus("loading");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceQuery, leaveQuery]);

  useEffect(() => {
    if (!inputs) return; // Skip rendering if dialog is closed
    if (status !== "success") return;

    const [attendanceData, shiftData, holidayData, leaveData] =
      prepareDailyAttendanceChartData(attendanceQuery.data!, leaveQuery.data!);

    if (!chartContainer.current) throw Error("No chart container");

    chart.current?.destroy();

    chart.current = new Chart(
      chartContainer.current,
      getDailyAttendanceChartConfiguration({
        month: inputs!.month,
        theme,
        groupVisibility,
        attendanceData,
        shiftData,
        holidayData,
        leaveData,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupVisibility, theme, status]);

  const chartContainer = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Chart<"bar", DailyAttendanceChartData[], string> | null>(
    null
  );

  const close = () => useDailyAttendanceChart.setState({ inputs: undefined });

  return (
    <Dialog open={!!inputs}>
      {inputs ? (
        <DialogContent
          variant="maximised"
          onEscapeKeyDown={close}
          onPointerDownOutside={close}
        >
          <div className="flex flex-row justify-between">
            <div className="flex flex-col gap-2">
              <DialogTitle>Monthly attendance report</DialogTitle>
              <DialogDescription className="flex flex-col gap-1 items-start">
                <span>{inputs.name}</span>
                <span>{getReadableDate(inputs.month)}</span>
              </DialogDescription>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("hidden sm:flex")}
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
                  {Object.entries(groupVisibility).map(([group, visible]) => (
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
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("hidden sm:block")}
                  onClick={close}
                >
                  Close
                </Button>
              </DialogClose>
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center">
            {status === "success" ? (
              <canvas ref={chartContainer} />
            ) : status === "error" ? (
              <span className="text-sm text-error">
                Fail to retrieve employee{"'"}s attendance data
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">Loading...</span>
            )}
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
};

export { useDailyAttendanceChart };
