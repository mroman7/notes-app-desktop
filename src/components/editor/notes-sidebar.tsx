"use client";

import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { DynamicIcon } from "lucide-react/dynamic";
import Link from "next/link";
import { useNoteStore } from "@/store/note.store";
import { cn } from "@/lib/utils";

export function NotesSidebar() {
    // Connect to the Zustand store
    const {
        notes,
        isLoading,
        fetchNotes,
        addNote,
        removeNote,
        setSelectedNoteId,
        selectedNoteId
    } = useNoteStore();

    // Initial load
    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleDeleteNote = async (e: React.MouseEvent, id: number) => {
        e.preventDefault(); // Prevent navigating to the link when deleting
        if (!confirm("Delete this note? This action cannot be undone.")) {
            return;
        }

        try {
            await removeNote(id);
        } catch (error) {
            console.error("Failed to delete note", error);
        }
    };

    const createNewNote = async () => {
        try {
            // Logic to create a new note via the store
            const title = `Untitled Note ${notes.length + 1}`;
            await addNote(title);
        } catch (error) {
            console.error("Failed to create new note", error);
        }
    };

    return (
        <aside className="w-56 bg-white h-screen border-r border-border bg-surface py-2 px-2 sticky top-0 left-0 flex flex-col">
            <div className="flex flex-col px-2 py-3 space-y-2">
                <h3 className="text-lg font-bold">All Notes</h3>
                <Button
                    variant="default"
                    onClick={createNewNote}
                    className="font-medium text-base text-black gap-2"
                >
                    <DynamicIcon name="plus" className="size-4" />
                    add Note
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading && (
                    <div className="w-full flex items-center justify-center p-2">
                        <DynamicIcon name="loader-2" className="size-2.5 animate-spin" />
                    </div>
                )}

                {!isLoading && notes.length === 0 && (
                    <div className="p-4 text-sm text-muted-foreground">No notes</div>
                )}

                <ul className="">
                    {!isLoading && notes.map((n) => (
                        <li
                            key={n.id}
                            onClick={() => {
                                setSelectedNoteId(n.id)
                                console.log("Selected Note ID: ", n.id)
                            }}
                            className={cn(
                                "group cursor-pointer hover:bg-muted py-1.5 px-2 flex items-center justify-between rounded-md",
                                n.id === selectedNoteId && "bg-muted"
                            )}
                        >
                            <p className="text-sm font-medium text-gray-800">{n.title}</p>
                            <Button
                                variant="destructive"
                                size="icon-xs"
                                className="opacity-0 invisible transition-all duration-150 translate-x-4 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 bg-red-100 rounded-full"
                                onClick={(e) => handleDeleteNote(e, n.id)}
                            >
                                <DynamicIcon name="trash" className="size-3" />
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}

export default NotesSidebar;