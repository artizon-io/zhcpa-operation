"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site-config";
import { Icons } from "@/components/icons";
import { navConfig } from "@/config/nav-config";
import { useTranslation } from "react-i18next";
import { RxArrowTopRight } from "react-icons/rx";
import { ThemeToggle } from "@/components/theme-toggle";
import { I18Dropdown } from "@/components/i18-dropdown";
import { SocialLink } from "@/components/social-link";
import { CommandMenu } from "@/components/command-menu";
import { Settings } from "@/components/settings";
import { useSessionStore } from "@/components/session-provider";
import { AvatarMenu } from "@/components/avatar-menu";

export const MainNav: React.FC<{}> = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const session = useSessionStore((state) => state.session);

  return (
    <div className="container hidden lg:flex h-14 items-center gap-6">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Icons.logo className="h-6 w-6 text-foreground" />
        <span className="hidden font-bold sm:inline-block">
          {t(siteConfig.displayName)}
        </span>
      </Link>
      <nav className="flex flex-1 items-center space-x-6 text-sm font-medium justify-end">
        {navConfig.mainNav.map((navItem) => (
          <span className="relative inline-block" key={navItem.href}>
            <Link
              href={navItem.href}
              className={cn(
                "transition-colors hover:text-foreground/80 text-smmd",
                pathname?.startsWith(navItem.href)
                  ? "text-foreground"
                  : "text-foreground/60",
                navItem.disabled ? "pointer-events-none" : ""
              )}
              target={navItem.external ? "_blank" : undefined}
              rel={navItem.external ? "noopener noreferrer" : undefined}
            >
              {t(navItem.title)}
            </Link>
            <RxArrowTopRight
              className={cn(
                "absolute top-[0px] right-[-13px] text-foreground/60 w-[10px] h-[10px]",
                navItem.external ? "opacity-100" : "opacity-0"
              )}
            />
          </span>
        ))}
      </nav>
      <div className="flex items-center justify-between space-x-2 lg:justify-end">
        <div className="w-full flex-1 lg:w-auto lg:flex-none">
          {/* <CommandMenu /> */}
        </div>
        <nav className="flex items-center gap-2">
          {/* <SocialLink href={siteConfig.links.twitter} type="twitter" />
          <SocialLink href={siteConfig.links.linkedIn} type="linkedin" /> */}
          {/* <ThemeToggle /> */}
          {/* <I18Dropdown /> */}
          {/* <Settings /> */}
          <AvatarMenu />
        </nav>
      </div>
    </div>
  );
};
