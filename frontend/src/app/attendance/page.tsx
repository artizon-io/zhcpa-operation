"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "@tanstack/react-query";

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
      <DataTable columns={columns} query={query} />
    </div>
  );
}
