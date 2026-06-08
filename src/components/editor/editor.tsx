import React, { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import {
  handleImageInputChange as utilHandleImageInputChange,
} from './editor-utils';
import { createEditorExtensions } from './extensions';
import { useDebounce } from "@uidotdev/usehooks";
import EditorBubbleMenu from './editor-bubble-menu';



interface TextEditorProps {
  defaultValue?: string,
  onContentChange: (value: string) => void
}


export default function TextEditor({ defaultValue, onContentChange }: TextEditorProps) {

  const [content, setContent] = useState<string | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const debounceContent = useDebounce(content, 500);


  useEffect(() => {
    if(debounceContent) {
      onContentChange(debounceContent);
    }
  }, [debounceContent]);



  // initialize Editor 
  const editor = useEditor({
    editorProps: {
      attributes: {
        class: 'focus:outline-none h-full min-h-screen prose max-w-full',
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of Array.from(items)) {
          if (!item.type.startsWith('image/')) continue;

          const file = item.getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result?.toString();
            if (!src) return;

            if (editor) {
              editor.chain().focus().setImage({ src }).run();
            } else {
              const { schema, tr } = view.state;
              const imageNode = schema.nodes.image?.create({ src });
              if (!imageNode) return;
              view.dispatch(tr.replaceSelectionWith(imageNode).scrollIntoView());
            }
          };

          reader.readAsDataURL(file);
          event.preventDefault();
          return true;
        }

        return false;
      },      
    },    
    extensions: createEditorExtensions(),
    content: content,
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
    autofocus: true,
    editable: true,
    onUpdate: ({ editor }) => {
      // Get HTML or JSON content and update your state
      const html = editor.getHTML()
      // const json = editor.getJSON()
      setContent(html)
    },
  })


  useEffect(() => {
    if (editor && defaultValue !== undefined) {
      if (editor.isEmpty) {
        editor.commands.setContent(defaultValue, { emitUpdate: false }); 
      }
    }
  }, [editor, defaultValue]);


  if (!editor) return null;
  
  return (
    <div className='h-full overflow-auto'>      

      {
        editor && 
        <EditorBubbleMenu editor={editor} />
      }

      <EditorContent 
        editor={editor} 
        className="font-medium text-base text-black/80 leading-tight tracking-wide notes_editor"        
      />
      <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => utilHandleImageInputChange(e, editor)}
        />
    </div>
  )
}
