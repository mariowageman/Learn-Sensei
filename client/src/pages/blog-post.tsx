import { useRoute, Link } from "wouter";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Clock, ArrowLeft, Edit } from "lucide-react";
import { BlogPost } from "@/types/blog";
import { calculateReadingTime } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ShareButtons } from "@/components/share-buttons";
import { PostEditor } from "@/components/post-editor";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { ProtectedComponent } from "@/components/rbac/protected-component";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:id");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentPost, isLoading } = useQuery<BlogPost>({
    queryKey: ['/api/blog', params?.id],
    enabled: !!params?.id,
  });

  const updatePost = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('Failed to update post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive",
      });
    },
  });

  const handleSave = async (content: string) => {
    if (!currentPost) return;
    updatePost.mutate({ id: currentPost.id, content });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

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

  // Get related posts based on shared tags -  This part will likely need backend integration as well.  For now, leaving it as is, acknowledging the limitation.
  const relatedPosts = []; // Placeholder until backend integration is complete


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

          {/* Related posts section -  This will require backend integration for fetching related posts. */}
          {/* Leaving this section as is for now, acknowledging the incompleteness. */}

        </div>
      </article>
      <Footer />
    </div>
  );
}