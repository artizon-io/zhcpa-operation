"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<
  Database["public"]["Views"]["opuser_monthly_attendance_view"]["Row"]
>[] = [
  {
    accessorKey: "opuser_id",
    header: "Employee ID (internal)",
  },
  {
    accessorKey: "name",
    header: "Employee Name",
  },
  {
    accessorKey: "attendance_month",
    header: "Month",
  },
  {
    header: "Attendance Duration",
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
  },
];
