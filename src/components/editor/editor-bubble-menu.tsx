import React from 'react'
import { BubbleMenu } from '@tiptap/react/menus'
import { Editor, useEditorState } from '@tiptap/react'
import { Button } from '../ui/button'
import { DynamicIcon } from 'lucide-react/dynamic'

interface EditorBubbleMenuProps {
  editor: Editor,

}

export default function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {

  const { isBold, isItalic, isStrikethrough } = useEditorState({
    editor, 
    selector: ctx => ({
      isBold: ctx.editor.isActive("bold"),
      isItalic: ctx.editor.isActive('italic'),
      isStrikethrough: ctx.editor.isActive('strike'),
    })
  })

  return (
    <BubbleMenu editor={editor} options={{ placement: 'bottom', offset: 8, flip: true }}>
      <div className="flex items-center gap-2">
        <Button
          size={"icon-xs"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={isBold ? 'is-active' : ''}
          type="button"
        >
          <DynamicIcon name='bold' className='size-3' />
        </Button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={isItalic ? 'is-active' : ''}
          type="button"
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={isStrikethrough ? 'is-active' : ''}
          type="button"
        >
          Strike
        </button>
      </div>
    </BubbleMenu>
  )
}
