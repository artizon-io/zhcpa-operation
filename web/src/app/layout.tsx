import "./globals.css";
import { Metadata } from "next";

import { siteConfig } from "@/config/site-config";
import { Analytics } from "@/components/analytics";
import { Toaster, cn } from "@artizon/ui";
import {
  NextLayout,
  generateNextMetadata,
  nextAppContainerStyles,
} from "@artizon/ui/next";
import { ReactNode } from "react";
import {
  NextAvatarMenuWithSupabase,
  NextSiteHeaderWithSupabase,
  NextThemeToggle,
} from "@artizon/ui/next-client-components";
import Link from "next/link";
import { navConfig } from "@/config/nav-config";
import { Providers } from "@/components/providers";

// https://nextjs.org/docs/app/api-reference/functions/generate-metadata
// https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-fields
export const metadata: Metadata = generateNextMetadata(siteConfig);

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <NextLayout>
      <Providers>
        <div className={cn(nextAppContainerStyles)}>
          <NextSiteHeaderWithSupabase
            protectedRouteOnly
            linkComp={Link}
            navConfig={navConfig}
            siteConfig={siteConfig}
            rightSideItems={
              <>
                <NextThemeToggle />
                <span />
                <NextAvatarMenuWithSupabase />
              </>
            }
          />
          <div className={cn("flex-1 flex child:flex-1")}>{children}</div>
        </div>
      </Providers>
      <Analytics />
      <Toaster />
    </NextLayout>
  );
}
