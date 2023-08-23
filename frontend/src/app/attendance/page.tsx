"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const supabase = createClientComponentClient<Database>();

  const query = useQuery({
    // @ts-ignore
    queryKey: ["attendance"],
    queryFn: () =>
      supabase
        .from("opuser_monthly_attendance_view")
        .select()
        .range(0, 99)
        .throwOnError()
        .then(({ data }) => data),
  });

  return (
    <div className="container mx-auto py-10">
      {query.data ? <DataTable columns={columns} data={query.data} /> : null}
    </div>
  );
}
