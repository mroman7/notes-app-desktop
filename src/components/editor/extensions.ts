import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';
import Emoji, { emojis } from '@tiptap/extension-emoji'
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

export function createEditorExtensions() {
  return [
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        keepAttributes: true,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: true,
      },
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      link: {
        openOnClick: false,
      },
      
    }),
    Image.configure({
      inline: true,
      allowBase64: true
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
    Placeholder.configure({
      placeholder: 'Starts Writing, What\'s in your thought?',
      showOnlyWhenEditable: true,
    }),
    Emoji.configure({
        enableEmoticons: true,        
        emojis: [...emojis]
      }),
  ];
}
