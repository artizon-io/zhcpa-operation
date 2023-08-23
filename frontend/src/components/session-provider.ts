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

const NO_AUTH_ROUTES = ["/login", "/signup"];

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { session } = useSessionStore();
  const supabase = createClientComponentClient();
  const pathname = usePathname();

  // TODO: add route protection

  // useEffect(() => {
  //   if (NO_AUTH_ROUTES.includes(pathname) && !session) return;
  //   if (NO_AUTH_ROUTES.includes(pathname) && session) redirect("/");

  //   // Inside one of AUTH_ROUTES
  //   if (!session) redirect("/login");
  // }, [pathname, session]);

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
