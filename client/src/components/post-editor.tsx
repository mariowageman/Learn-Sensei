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
import { useToast } from '@/hooks/use-toast'

interface PostEditorProps {
  initialContent: string;
  initialTitle: string;
  initialTags: string[];
  initialImage?: string;
  onSave: (content: string, title: string, tags: string[], image: string) => void;
  onCancel: () => void;
  existingTags?: string[];
}

export function PostEditor({ 
  initialContent, 
  initialTitle, 
  initialTags, 
  initialImage, 
  onSave, 
  onCancel,
  existingTags = []
}: PostEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState("");
  const [mainImage, setMainImage] = useState(initialImage || "");
  const { toast } = useToast();

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMainImage: boolean = false) => {
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { url } = await response.json();

      if (isMainImage) {
        setMainImage(url);
        toast({
          title: "Success",
          description: "Cover image uploaded successfully",
        });
      } else if (editor) {
        editor.chain().focus().setImage({ src: url }).run();
        toast({
          title: "Success",
          description: "Image inserted successfully",
        });
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
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
        <div className="mb-4">
          {mainImage && (
            <div className="relative w-full h-48 mb-2">
              <img 
                src={mainImage} 
                alt="Post cover" 
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setMainImage("")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={isUploading}
              className="relative"
            >
              <span className="dark:text-white">{isUploading ? "Uploading..." : "Upload Cover Image"}</span>
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => handleImageUpload(e, true)}
                accept="image/*"
                disabled={isUploading}
              />
            </Button>
          </div>
        </div>

        <Input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl font-bold mb-2 dark:text-white"
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
            <div className="relative">
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
              {existingTags.length > 0 && newTag && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-32 overflow-y-auto">
                  {existingTags
                    .filter(tag => 
                      tag.toLowerCase().includes(newTag.toLowerCase()) && 
                      !tags.includes(tag)
                    )
                    .map(tag => (
                      <div
                        key={tag}
                        className="px-2 py-1 hover:bg-muted cursor-pointer"
                        onClick={() => {
                          setTags([...tags, tag]);
                          setNewTag("");
                        }}
                      >
                        {tag}
                      </div>
                    ))}
                </div>
              )}
            </div>
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
              <span className="dark:text-white">Add</span>
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
          <Bold className="h-4 w-4 dark:text-white" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive('italic') && 'bg-muted-foreground/20')}
        >
          <Italic className="h-4 w-4 dark:text-white" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(editor.isActive('heading', { level: 1 }) && 'bg-muted-foreground/20')}
        >
          <Heading1 className="h-4 w-4 dark:text-white" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(editor.isActive('heading', { level: 2 }) && 'bg-muted-foreground/20')}
        >
          <Heading2 className="h-4 w-4 dark:text-white" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive('bulletList') && 'bg-muted-foreground/20')}
        >
          <List className="h-4 w-4 dark:text-white" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLinkInsert}
          className={cn(editor.isActive('link') && 'bg-muted-foreground/20')}
        >
          <LinkIcon className="h-4 w-4 dark:text-white" />
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className={cn(isUploading && 'opacity-50 cursor-not-allowed')}
            disabled={isUploading}
          >
            <ImageIcon className="h-4 w-4 dark:text-white" />
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => handleImageUpload(e, false)}
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
          <X className="h-4 w-4 mr-2 dark:text-white" />
          <span className="dark:text-white">Cancel</span>
        </Button>
        <Button
          onClick={() => onSave(editor.getHTML(), title, tags, mainImage)}
          disabled={!mainImage || !title.trim()}
        >
          <Save className="h-4 w-4 mr-2 dark:text-white" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}