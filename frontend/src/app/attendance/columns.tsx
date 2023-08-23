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
    accessorFn: ({ attendance_month }) => new Date(attendance_month!),
    cell: ({ row }) => {
      const date = new Date(row.original.attendance_month!);
      return `${date.getFullYear()}-${String(date.getMonth()).padStart(
        2,
        "0"
      )}`;
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

      if (!hours || !minutes) return `N/A`;

      return `${hours} hrs ${minutes} mins`;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const opuser_id = row.original.opuser_id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
            {/* <DropdownMenuSeparator /> */}
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(opuser_id!)}
            >
              Copy employee ID
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              View employee{"'"}s monthly attendance report
            </DropdownMenuItem>
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
