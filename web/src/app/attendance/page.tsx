"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { columns } from "./columns";
import { useQuery } from "@tanstack/react-query";
import { DailyAttendanceChartDialog } from "./daily-attendance-chart";
import { DataTable } from "@artizon/ui";

export default function Page() {
  const supabase = createClientComponentClient<Database>();

  const query = useQuery({
    // @ts-ignore
    queryKey: ["attendance-monthly"],
    queryFn: () =>
      supabase
        .from("opuser_monthly_attendance_view")
        .select()
        .throwOnError()
        .then(({ data }) => data),
  });

  return (
    <div className="container mx-auto">
      <DailyAttendanceChartDialog />
      <DataTable
        columns={columns}
        data={query.data ?? []}
        className="rounded-md border"
        filterColumnId="employee_name"
        filterPlaceholder="Filter by employee name"
      />
    </div>
  );
}
