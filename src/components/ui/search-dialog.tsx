"use client";

import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileText, LayoutDashboard, Home } from "lucide-react";

const searchItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "notes", label: "Notes", icon: FileText, path: "/notes" },
  // { id: "projects", label: "Projects", icon: LayoutDashboard, path: "/projects" },
];

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();

  const handleSelect = (itemId: string) => {
    const item = searchItems.find((item) => item.id === itemId);
    if (item) {
      router.push(item.path);
    }
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {searchItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem key={item.id} onSelect={() => handleSelect(item.id)}>
                  <Icon className="mr-2 size-4" />
                  <span>{item.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
