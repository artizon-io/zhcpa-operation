import { FooterNavItem, MainNavItem, SidebarNavItem } from "@/types/nav";
import { siteConfig } from "./site-config";

interface NavConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
  footerNav: FooterNavItem[];
}

export const navConfig: NavConfig = {
  mainNav: [
    {
      title: "Attendance report",
      href: "/attendance",
    },
    {
      title: "Job report",
      href: "/job",
      disabled: true,
    },
  ],
  sidebarNav: [
    {
      title: "Account",
      href: "/account",
    },
  ],
  footerNav: [],
};
