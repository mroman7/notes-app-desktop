"use client";

import { useEffect, useMemo, useState } from "react";
import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "./button";
import { cn } from "@/lib/utils";

type ThemeOption = "light" | "dark";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = useMemo<ThemeOption>(() => {
    if (!mounted) {
      return "light";
    }

    const effectiveTheme = theme === "system" || !theme ? resolvedTheme : theme;
    return effectiveTheme === "dark" ? "dark" : "light";
  }, [mounted, theme, resolvedTheme]);

  const nextTheme = activeTheme === "dark" ? "light" : "dark";

  const Icon = activeTheme === "dark" ? Moon : SunMedium;

  const label = mounted ? `Theme: ${activeTheme}` : "Theme: loading";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("rounded-full", className)}
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch theme to ${nextTheme}`}
      title={`${label}. Click to switch to ${nextTheme}.`}
    >
      <Icon className="size-5" />
    </Button>
  );
}
