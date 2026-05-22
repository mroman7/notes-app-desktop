"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { ThemeToggle } from "./theme-toggle";
import { SearchDialog } from "./search-dialog";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

const navItems: { label: string; icon: IconName; href: string }[] = [
  { label: "Notes", icon: "notepad-text", href: "/notes" },
  // { label: "Projects", icon: "list-todo", href: "/projects" },
];

export function Sidebar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <aside className="flex h-screen w-20 flex-col items-center gap-3 border-r border-border bg-sidebar px-2 py-4 text-sidebar-foreground sticky top-0 left-0">
      <TooltipProvider delayDuration={150}>
        <div className="flex flex-col items-center gap-y-8">
          {navItems.map(({ label, icon: Icon, href }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-xl w-full"
                  aria-label={label}
                >
                  <Link
                    href={href}
                    className="flex h-auto w-full items-center justify-center"
                  >
                    <DynamicIcon name={Icon} className="size-6" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {label}
              </TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <DynamicIcon name={"search"} className="size-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Search
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="mt-auto flex w-full justify-center pt-6">
          <ThemeToggle />
        </div>
      </TooltipProvider>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </aside>
  );
}
