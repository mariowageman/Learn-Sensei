import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Button } from './ui/button'
import { 
  Bold, 
  Italic, 
  List, 
  Heading1, 
  Heading2, 
  Link as LinkIcon,
  Image as ImageIcon,
  Save,
  X
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface PostEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export function PostEditor({ initialContent, onSave, onCancel }: PostEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2]
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:underline cursor-pointer',
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none min-h-[200px] p-4 focus:outline-none',
      },
    },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await response.json();
      editor?.chain().focus().setImage({ src: url }).run();

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Image upload failed:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }

  const handleLinkInsert = () => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return; // Cancelled
    }

    if (url === '') {
      editor?.chain().focus().unsetLink().run();
      return;
    }

    editor?.chain().focus().setLink({ href: url }).run();
  }

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="border-b bg-muted p-2 flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive('bold') && 'bg-muted-foreground/20')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive('italic') && 'bg-muted-foreground/20')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(editor.isActive('heading', { level: 1 }) && 'bg-muted-foreground/20')}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(editor.isActive('heading', { level: 2 }) && 'bg-muted-foreground/20')}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive('bulletList') && 'bg-muted-foreground/20')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLinkInsert}
          className={cn(editor.isActive('link') && 'bg-muted-foreground/20')}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className={cn(isUploading && 'opacity-50 cursor-not-allowed')}
            disabled={isUploading}
          >
            <ImageIcon className="h-4 w-4" />
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleImageUpload}
              accept="image/*"
              disabled={isUploading}
            />
          </Button>
        </div>
      </div>

      <EditorContent editor={editor} />

      <div className="border-t bg-muted p-2 flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={onCancel}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={() => onSave(editor.getHTML())}
          disabled={isUploading}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}