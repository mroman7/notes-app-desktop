"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useNoteStore } from "@/store/note.store";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { DynamicIcon } from "lucide-react/dynamic";
import { Button } from "../ui/button";



const TextEditor = dynamic(() => import('./editor'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const EditorClient = () => {
  const { selectedNoteId, editNote, notes, addNote } = useNoteStore();

  const selectedNote = notes.find(item => item.id === selectedNoteId)

  const handleContentChange = (newValue: string) => {
    // console.log("New Value: ", newValue);
    try {      
      if(!selectedNoteId) return alert("Note ID not found!")
      editNote(
        selectedNoteId as number, 
        selectedNote?.title,
        newValue
      )      
      console.info("--- Note Saved! ---");
    } catch (error) {
      alert("Unable to Save Note, Please try again later.");
      console.error("Error Saving Note: ", error)
    }
  }


  if (!selectedNoteId) return <div className="w-full h-full">
    <div className="w-full max-w-7xl mx-auto flex items-center justify-center p-4 min-h-screen h-full">
      <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <DynamicIcon name="folder-code" className="size-4" />
        </EmptyMedia>
        <EmptyTitle>No Note Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any note yet. Get started by creating
          your first Note.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button 
          variant={"outline"} 
          className="w-full max-w-48"
          type="button"
          onClick={async () => await addNote("Untitled Note")}
        >
          <DynamicIcon name="plus" className="size-4" />
          Add Note</Button>
      </EmptyContent>      
    </Empty>
    </div>
  </div>;
  
  return (
    <div className="flex h-full w-full max-w-6xl overflow-auto px-4  mx-auto py-8">
      
      <TextEditor 
        key={selectedNoteId}
        defaultValue={selectedNote?.content}
        onContentChange={handleContentChange} 
        
      />
    </div>
  );
};

export default EditorClient;