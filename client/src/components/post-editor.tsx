
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
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

interface PostEditorProps {
  initialContent: string;
  initialTitle: string;
  initialTags: string[];
  onSave: (content: string, title: string, tags: string[]) => void;
  onCancel: () => void;
}

export function PostEditor({ initialContent, initialTitle, initialTags, onSave, onCancel }: PostEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
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

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();
      editor?.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  }

  const handleLinkInsert = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <Input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl font-bold mb-2"
        />
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="group">
              {tag}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => setTags(tags.filter((_, i) => i !== index))}
              />
            </Badge>
          ))}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="w-32"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTag.trim()) {
                  e.preventDefault();
                  setTags([...tags, newTag.trim()]);
                  setNewTag("");
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (newTag.trim()) {
                  setTags([...tags, newTag.trim()]);
                  setNewTag("");
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
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
          onClick={() => onSave(editor.getHTML(), title, tags)}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
