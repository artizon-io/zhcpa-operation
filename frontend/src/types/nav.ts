import { Icons } from "@/components/icons";

export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
}

export interface ParentNavItem
  extends Omit<NavItem, "href" | "disabled" | "external"> {
  items: NavItem[];
}

export interface MainNavItem extends NavItem {}

// export type SidebarNavItem = ParentNavItem | NavItem;
export type SidebarNavItem = NavItem;

export interface FooterNavItem extends ParentNavItem {}
