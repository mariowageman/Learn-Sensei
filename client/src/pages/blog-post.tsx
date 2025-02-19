import { useRoute, Link } from "wouter";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Clock, ArrowLeft, Edit } from "lucide-react";
import { blogPosts, type BlogPost } from "./blog";
import { calculateReadingTime } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ShareButtons } from "@/components/share-buttons";
import { PostEditor } from "@/components/post-editor";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

import { ProtectedComponent } from "@/components/rbac/protected-component";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:id");
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const post = blogPosts.find((p: BlogPost) => p.id === params?.id);
    if (post) {
      setCurrentPost(post);
    }
  }, [params?.id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.id]);

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Post Not Found</h1>
            <p className="text-muted-foreground">The blog post you're looking for doesn't exist.</p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSave = async (content: string) => {
    try {
      const response = await fetch(`/api/blog/${currentPost.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('Failed to update post');

      // Update the local state with new content
      setCurrentPost(prev => prev ? { ...prev, content } : null);

      await queryClient.invalidateQueries({ queryKey: ['/api/blog'] });

      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive",
      });
    }
  };

  // Get related posts based on shared tags
  const relatedPosts = blogPosts
    .filter((p: BlogPost) => p.id !== currentPost.id)
    .filter((p: BlogPost) => p.tags.some((tag: string) => currentPost.tags.includes(tag)))
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <article className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link href="/blog">
                <Button variant="ghost">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Button>
              </Link>
              <ProtectedComponent requiredRole={["admin", "moderator"]}>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Post
                  </Button>
                )}
              </ProtectedComponent>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="secondary">{currentPost.category}</Badge>
                <span className="text-muted-foreground">{currentPost.date}</span>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {calculateReadingTime(currentPost.content)} min read
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">{currentPost.title}</h1>
            </div>
          </div>

          <div className="mb-8">
            <AspectRatio ratio={21/9} className="bg-muted rounded-lg overflow-hidden">
              <img 
                src={currentPost.image} 
                alt={currentPost.title}
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          </div>

          {isEditing ? (
            <PostEditor
              initialContent={currentPost.content}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div 
              className="prose dark:prose-invert max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: currentPost.content }}
            />
          )}

          <div className="flex flex-wrap gap-2 mb-8">
            {currentPost.tags.map((tag: string) => (
              <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/80"
                >
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <ShareButtons
              url={window.location.href}
              title={currentPost.title}
              description={currentPost.description}
            />
          </div>

          {relatedPosts.length > 0 && (
            <div className="border-t mt-12 pt-8">
              <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost: BlogPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`}>
                    <div className="group cursor-pointer">
                      <AspectRatio ratio={16/9} className="bg-muted rounded-lg overflow-hidden mb-4">
                        <img 
                          src={relatedPost.image} 
                          alt={relatedPost.title}
                          className="object-cover w-full h-full transition-transform group-hover:scale-105"
                        />
                      </AspectRatio>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {relatedPost.date}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
      <Footer />
    </div>
  );
}