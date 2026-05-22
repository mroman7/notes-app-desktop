"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllNotes, deleteNote } from "@/lib/tauri";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DynamicIcon } from "lucide-react/dynamic";

type Note = {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const results = await getAllNotes();
      setNotes(results);
    } catch (error) {
      console.error("Failed to load notes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (!confirm("Delete this note? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteNote(id);
      await loadNotes();
    } catch (error) {
      console.error("Failed to delete note", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Notes</h1>
          <p className="text-sm text-muted-foreground">
            All saved notes from the local SQLite database.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="default" className="h-auto py-2.5 px-5 font-medium text-sm">
              <DynamicIcon name="file-plus-corner" className="size-4" />
              New note
            </Button>
          </Link>
          <Button variant="ghost" className="h-auto py-2.5 px-5 font-medium text-sm" onClick={() => void loadNotes()}>
            <DynamicIcon name="refresh-cw" className="size-4" />
            Refresh
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading notes…</div>
      ) : notes.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          No notes available yet. Create a note from the editor to save it.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <Card key={note.id} className="h-full overflow-hidden p-5 transition-all duration-200 hover:bg-muted/40 hover:scale-[1.01] hover:shadow-md rounded-md max-h-60">
              <div className="mb-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <div>
                  <span>Updated {new Date(note.updated_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] uppercase tracking-[0.2em]">
                    #{note.id}
                  </span>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive"
                    onClick={() => void handleDeleteNote(note.id)}
                  >
                    <DynamicIcon name="trash" className="size-4" />
                  </Button>
                </div>
              </div>
              <Link href={`/?id=${note.id}`} className="block cursor-pointer text-left">
                <p className="line-clamp-6 whitespace-pre-wrap text-sm text-foreground">
                  {note.content || "(empty note)"}
                </p>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
