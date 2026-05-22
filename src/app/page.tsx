"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { getNoteById, saveNote, deleteNote } from "@/lib/tauri";
import dynamic from "next/dynamic";
import { DynamicIcon } from "lucide-react/dynamic";
import { cn } from "@/lib/utils";

const TextEditor = dynamic(() => import("@/components/text-editor/text-editor"), { ssr: false });


export default function Home() {
  const [content, setContent] = useState<any>("");
  const [noteId, setNoteId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);




  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      const parsedId = Number(id);
      if (!isNaN(parsedId)) {
        const loadNote = async () => {
          try {
            const note = await getNoteById(parsedId);
            if (note) {
              setNoteId(note.id);
              setContent(note.content);
              setDirty(false);
            }
          } catch (error) {
            console.error("Failed to load note", error);
          }
        };
        void loadNote();
      }
    }
  }, []);

  const saveCurrentNote = useCallback(async (force = false) => {
    if (!dirty && !force) {
      return;
    }

    try {
      const note = await saveNote(noteId, content);
      setNoteId(note.id);
      setSaved(true);
      setDirty(false);
    } catch (error) {
      console.error("Failed to save note", error);
    }
  }, [content, dirty, noteId]);

  const handleDeleteNote = useCallback(async () => {
    if (!noteId) return;
    if (!confirm("Delete this note? This action cannot be undone.")) return;

    try {
      await deleteNote(noteId);
      setNoteId(null);
      setContent("");
      setDirty(false);
      setSaved(false);
      window.history.replaceState({}, "", window.location.pathname);
    } catch (error) {
      console.error("Failed to delete note", error);
    }
  }, [noteId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && (event.key === "s" || event.key === "S")) {
        event.preventDefault();
        void saveCurrentNote(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [saveCurrentNote]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void saveCurrentNote();
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [content, saveCurrentNote]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void saveCurrentNote();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [saveCurrentNote]);

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      setDirty(true);
    },
    [setContent],
  );


  const toastMessage = useMemo(() => {
    if (dirty) {
      return "Saving note...";
    }
    return "Note saved";
  }, [dirty]);

  return (
    <div className="w-full">

      <div className="px-4 h-screen overflow-auto">
        <TextEditor 
          key={noteId ?? "new"} 
          content={content} 
          onContentChange={handleContentChange} 
        />
      </div>

        <div className="bg-accent flex justify-end gap-4 fixed bottom-0 w-[calc(100vw-80px)] py-2 px-2">      
          
          <Button variant="destructive" size="sm" className={cn(noteId ? "visible" : "invisible")} onClick={handleDeleteNote}>
            Delete note
          </Button>
        </div>
      <Toast
        open={saved}
        message={toastMessage}
        onClose={() => setSaved(false)}
      />
    </div>
  );
}
