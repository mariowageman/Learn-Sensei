import { useRoute, Link } from "wouter";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Clock, ArrowLeft, Edit } from "lucide-react";
import { type BlogPost } from "./blog";
import { calculateReadingTime } from "@/lib/utils";
import { useState } from "react";
import { ShareButtons } from "@/components/share-buttons";
import { PostEditor } from "@/components/post-editor";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProtectedComponent } from "@/components/rbac/protected-component";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Combine both queries into one component-level query
  const { data: posts = [], isLoading: isLoadingPosts } = useQuery<BlogPost[]>({
    queryKey: ['blogPosts'],
    enabled: !!params?.slug
  });

  const { data: currentPost, isLoading: isLoadingPost, error } = useQuery<BlogPost>({
    queryKey: ['blogPost', params?.slug],
    queryFn: async () => {
      if (!params?.slug) throw new Error('No slug provided');
      const response = await fetch(`/api/blog/${params.slug}`);
      if (!response.ok) throw new Error('Failed to fetch blog post');
      return response.json();
    },
    enabled: !!params?.slug
  });

  const isLoading = isLoadingPosts || isLoadingPost;

  // Calculate related posts outside of render
  const relatedPosts = currentPost
    ? posts
        .filter(p => p.slug !== currentPost.slug)
        .filter(p => currentPost.tags.some(tag => p.tags.includes(tag)))
        .slice(0, 2)
    : [];

  const handleSave = async (content: string, title: string, tags: string[]) => {
    if (!currentPost) return;
    try {
      const response = await fetch(`/api/blog/${currentPost.slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, title, tags }),
      });

      if (!response.ok) throw new Error('Failed to update post');

      await queryClient.invalidateQueries({ queryKey: ['blogPost', currentPost.slug] });
      await queryClient.invalidateQueries({ queryKey: ['blogPosts'] });

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

  if (isLoading) return <div>Loading...</div>;
  if (error) {
    console.error('Blog post error:', error);
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Error Loading Post</h1>
            <p className="text-muted-foreground">There was an error loading the blog post. Please try again later.</p>
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
                <span className="text-muted-foreground">{new Date(currentPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
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
                        {new Date(relatedPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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