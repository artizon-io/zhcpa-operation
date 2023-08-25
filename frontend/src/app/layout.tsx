import "./globals.css";
import { Metadata } from "next";

import { siteConfig } from "@/config/site-config";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { fontSans } from "@/lib/fonts";
import { Analytics } from "@/components/analytics";
import { Toaster } from "@/components/toaster";
import { ThemeProvider } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

// https://nextjs.org/docs/app/api-reference/functions/generate-metadata
// https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-fields
// https://github.com/gokulkrishh/awesome-meta-and-manifest
// https://nikolasbarwicki.com/articles/seo-in-next-js-13-with-metadata-api
export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: `${siteConfig.name} Team`,
      url: siteConfig.url,
    },
  ],
  creator: `${siteConfig.name} Team`,
  themeColor: [
    // { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: light)", color: "black" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitter.account,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const headersList = headers();
  const pathname = headersList.get("x-pathname");

  const supabase = createServerComponentClient<Database>({
    cookies,
  });
  const userResponse = await supabase.auth.getUser();
  const user = userResponse.data.user;

  const atSigninRoutes =
    pathname?.startsWith("/login") || pathname?.startsWith("/signup");
  const atProtectedRoutes = !atSigninRoutes;

  if (!user && atProtectedRoutes) redirect(`/login?returnTo=${pathname}`);
  else if (user && atSigninRoutes) redirect("/");

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            themes={["light", "dark"]}
            // enableSystem
          >
            <div className="relative flex flex-col min-h-screen">
              <SiteHeader />
              <div className="flex-1 flex child:flex-1">{children}</div>
              {/* <SiteFooter /> */}
            </div>
          </ThemeProvider>
          <Analytics />
          <Toaster />
        </body>
      </html>
    </>
  );
}
