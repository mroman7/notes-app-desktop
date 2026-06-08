"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useNoteStore } from "@/store/note.store";

const TextEditor = dynamic(() => import('./editor'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const EditorClient = () => {
  const { selectedNoteId, editNote, notes  } = useNoteStore();

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
    <div className="w-full max-w-5xl mx-auto">
        <p className="text-center">Select a note to edit.</p>
    </div>
  </div>;
  
  return (
      <div className="flex h-full w-full">     
        <div className="flex-1 overflow-auto px-4 py-4 w-full max-w-5xl mx-auto">
          
          <TextEditor 
            key={selectedNoteId}
            defaultValue={selectedNote?.content}
            onContentChange={handleContentChange} 
            
          />
        </div>
    </div>
  );
};

export default EditorClient;