import { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import Cookies from "js-cookie";
import { redirect, usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const useSessionStore = create<{
  session: Session | null;
}>(() => ({
  session: null,
}));

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const supabase = createClientComponentClient();

  const onSessionChange = (session: Session | null) => {
    useSessionStore.setState({ session });
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      onSessionChange(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return children;
};
