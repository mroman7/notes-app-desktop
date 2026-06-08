"use client"

import EditorClient from "@/components/editor/editor-client"
import NotesSidebar from "@/components/editor/notes-sidebar"


export default function WritePage() {



  return (
    <section className='bg-blue-100 min-h-screen'>
        <article className="flex flex-rows items-start">          
          <NotesSidebar />
          <EditorClient />
        </article>
    </section>
  )
}
