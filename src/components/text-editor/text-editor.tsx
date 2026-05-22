'use client'

import { 
  MDXEditor, 
  MDXEditorMethods, 
  headingsPlugin, 
  listsPlugin, 
  quotePlugin, 
  markdownShortcutPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  frontmatterPlugin,
  imagePlugin,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  thematicBreakPlugin
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { useRef } from 'react'

export default function TextEditor({ content, onContentChange}: { content: string, onContentChange: (newContent: string) => void }) {
  const editorRef = useRef<MDXEditorMethods>(null)

  return (
    <div className="h-full w-full bg-transparent text-gray-900! dark:text-gray-100!">
      <MDXEditor
        ref={editorRef}
        markdown={content}
        onChange={onContentChange}
        placeholder="Start typing..."
        className="h-full w-full bg-transparent text-slate-900 dark:text-slate-100"
        
        // Custom class add ki ha yahan aur prose ko hata diya ha
        contentEditableClassName="custom-markdown-editor min-h-[90vh] w-full max-w-full outline-none bg-transparent"
        
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin(),
          tablePlugin(),
          frontmatterPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
          codeMirrorPlugin({ 
            codeBlockLanguages: { 
              js: 'JavaScript', ts: 'TypeScript', css: 'CSS', 
              html: 'HTML', python: 'Python', bash: 'Bash' 
            } 
          }),
          markdownShortcutPlugin()
        ]}
      />
    </div>
  )
}