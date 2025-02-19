
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { PostEditor } from '@/components/post-editor';
import { ProtectedComponent } from '@/components/rbac/protected-component';
import { UserRole } from '@/lib/rbac';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/utils';
import type { BlogPost } from '@/pages/blog';

export default function CreateBlog() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: blogPosts } = useQuery<BlogPost[]>({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      const response = await fetch('/api/blog');
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      return response.json();
    }
  });

  const existingTags = Array.from(
    new Set(blogPosts?.flatMap(post => post.tags) || [])
  ).sort();

  const handleSave = async (content: string, title: string, tags: string[], image: string) => {
    try {
      const slug = slugify(title);
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          title,
          content,
          tags,
          description: content.slice(0, 150).replace(/<[^>]*>/g, ''),
          category: 'General',
          image: image || '/assets/blog/learning-tips.jpg',
        }),
      });

      if (!response.ok) throw new Error('Failed to create post');

      toast({
        title: 'Success',
        description: 'Blog post created successfully',
      });

      setLocation(`/blog/${slug}`);
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create blog post',
        variant: 'destructive',
      });
    }
  };

  return (
    <ProtectedComponent allowedRoles={[UserRole.ADMIN, UserRole.MODERATOR]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Create New Blog Post</h1>
        <PostEditor
          initialContent=""
          initialTitle=""
          initialTags={[]}
          existingTags={existingTags}
          onSave={handleSave}
          onCancel={() => setLocation('/blog')}
        />
      </div>
    </ProtectedComponent>
  );
}
