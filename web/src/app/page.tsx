"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { RxCopy } from "react-icons/rx";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

export default function Page() {
  const { t } = useTranslation();

  return (
    <div className="container relative flex items-center justify-center">
      <p className="text-foreground/60 text-sm">
        Welcome. You might want to check out the{" "}
        <Link
          href="/attendance"
          className="text-primary underline underline-offset-2"
        >
          attendance report
        </Link>
      </p>
    </div>
  );
}
