import { useRoute } from "wouter";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Clock, ArrowLeft, Share2 } from "lucide-react";
import { Link } from "wouter";
import { blogPosts, type BlogPost } from "./blog";
import { calculateReadingTime } from "@/lib/utils";
import { useEffect } from "react";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:id");
  const post = blogPosts.find((p: BlogPost) => p.id === params?.id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.id]);

  if (!post) {
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

  const relatedPosts = blogPosts
    .filter((p: BlogPost) => p.id !== post.id)
    .filter((p: BlogPost) => p.tags.some((tag: string) => post.tags.includes(tag)))
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <article className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/blog">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="secondary">{post.category}</Badge>
                <span className="text-muted-foreground">{post.date}</span>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {calculateReadingTime(post.content)} min read
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
            </div>
          </div>

          <div className="mb-8">
            <AspectRatio ratio={21/9} className="bg-muted rounded-lg overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title}
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-8">
            {post.content}
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <Button
              variant="outline"
              onClick={() => {
                navigator.share({
                  title: post.title,
                  text: post.description,
                  url: window.location.href,
                });
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Article
            </Button>
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