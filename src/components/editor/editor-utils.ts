import { ChangeEvent } from "react";
import { Editor } from "@tiptap/react";


export function createBase64FromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const src = reader.result?.toString();
      if (src) {
        resolve(src);
      } else {
        reject(new Error('Failed to read image file'));
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}



export async function insertImageFile(editor: Editor | null, file: File) {
  if (!editor) return;
  const src = await createBase64FromFile(file);
  editor.chain().focus().setImage({ src }).run();
}

export function handleImageInputChange(
  event: ChangeEvent<HTMLInputElement>,
  editor: Editor | null
) {
  const file = event.target.files?.[0];
  if (!file) return;

  insertImageFile(editor, file);
  event.target.value = '';
}
