"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnHeader } from "./column-header";
import { useDailyAttendanceChartDialogStore } from "./daily-attendance-chart-dialog";
import { DateTime } from "luxon";
import { MdInfo } from "react-icons/md";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PiWarningFill } from "react-icons/pi";

export const columns: ColumnDef<
  Database["public"]["Views"]["opuser_monthly_attendance_view"]["Row"]
>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "opuser_id",
    header: "Employee ID (internal)",
    id: "employee_id",
    // header: ({ column }) => {
    //   return (
    //     <Button
    //       variant="ghost"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     >
    //       Employee ID (internal)
    //       <ArrowUpDown className="ml-2 h-4 w-4" />
    //     </Button>
    //   );
    // },
  },
  {
    accessorKey: "name",
    id: "employee_name",
    header: ({ column }) => {
      return <ColumnHeader column={column} title="Employee Name" />;
    },
  },
  {
    id: "attendance_month",
    accessorFn: ({ attendance_month }) =>
      DateTime.fromISO(attendance_month!, {
        setZone: false,
      }),
    cell: ({ row }) => {
      const date = DateTime.fromISO(row.original.attendance_month!, {
        setZone: false,
      });
      return `${date.year}-${String(date.month).padStart(2, "0")}`;
    },
    header: ({ column }) => {
      return <ColumnHeader column={column} title="Month" />;
    },
  },
  {
    id: "attendance_duration",
    header: ({ column }) => {
      return <ColumnHeader column={column} title="Attendance Duration" />;
    },
    accessorFn: ({ attendance_duration_hours, attendance_duration_minutes }) =>
      attendance_duration_hours! * 60 + attendance_duration_minutes!,
    cell: ({ row }) => {
      const hours = row.original.attendance_duration_hours;
      const minutes = row.original.attendance_duration_minutes;

      if (!hours || !minutes)
        return (
          <span className="flex flex-row gap-2 items-center">
            N/A
            <Tooltip>
              <TooltipTrigger>
                <MdInfo className="text-muted-foreground/60" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[300px]">
                  The employee{"'"}s attendance record is incomplete, most
                  likely because they forgot to swipe their card on the machine.
                  Please contact the system administrator to update the missing
                  records.
                </p>
              </TooltipContent>
            </Tooltip>
          </span>
        );

      return `${hours} hrs ${minutes} mins`;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const opuser_id = row.original.opuser_id;
      const name = row.original.name;
      const month = row.original.attendance_month;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(opuser_id!)}
            >
              Copy employee ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>
              View employee{"'"}s monthly attendance report
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="flex flex-row items-center gap-2"
              onClick={(e) => {
                useDailyAttendanceChartDialogStore.getState().open(
                  opuser_id!,
                  name!,
                  // https://moment.github.io/luxon/#/parsing?id=table-of-tokens
                  DateTime.fromISO(month!)
                );
              }}
            >
              Chart
              <Tooltip>
                <TooltipTrigger>
                  <PiWarningFill className="text-warning" />
                </TooltipTrigger>
                <TooltipContent className="flex flex-col gap-2 max-w-[300px]">
                  <p>
                    This feature is unstable. Expect the following bugs/issues:
                  </p>
                  <ul className="list-disc list-inside flex flex-col gap-2">
                    <li>
                      At most 1 attendance session per day will be displayed on
                      the chart. If the employee checks out at noon and comes
                      back in the afternoon, only either the morning or the
                      afternoon session will be displayed.
                    </li>
                    <li>
                      All employees are assigned a mock shift schedule for now.
                      We will be integrating with the actual data soon.
                    </li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </DropdownMenuItem>
            <DropdownMenuItem disabled onClick={(e) => {}}>
              Table
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              View employee{"'"}s details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
