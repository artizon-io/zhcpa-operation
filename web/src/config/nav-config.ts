import { NavConfig } from "@artizon/ui";

export const navConfig: NavConfig = {
  main: [
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
  side: [
    {
      title: "Account",
      items: [
        {
          title: "Account management",
          href: "/account",
        },
      ],
    },
  ],
  footer: [],
};
