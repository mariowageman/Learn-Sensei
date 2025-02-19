import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock, ArrowRight, X, Rss } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Footer } from "@/components/footer";
import { calculateReadingTime } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  description: string;
  category: string;
  image: string;
  tags: string[];
  content: string;
}

// Fetch blog posts from API
const useBlogPosts = () => {
  return useQuery<BlogPost[]>({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      const response = await fetch('/api/blog');
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      return response.json();
    }
  });
};

export default function BlogPage() {
  const [location, setLocation] = useLocation();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tag = params.get('tag');
    if (tag) {
      setSelectedTag(tag);
    }
  }, []);

  const { data: blogPosts, isLoading, error } = useBlogPosts();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) {
    console.error('Blog listing error:', error);
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Error Loading Posts</h1>
            <p className="text-muted-foreground">There was an error loading the blog posts. Please try again later.</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  if (!blogPosts) return null;

  const filteredPosts = selectedTag
    ? blogPosts.filter((post: BlogPost) => post.tags.includes(selectedTag))
    : blogPosts;

  const allTags = Array.from(
    new Set(blogPosts.flatMap((post: BlogPost) => post.tags))
  ).sort();

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
      setLocation('/blog');
    } else {
      setSelectedTag(tag);
      setLocation(`/blog?tag=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4 mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2 whitespace-nowrap"
                onClick={() => {
                  window.location.href = '/feed.xml';
                }}
              >
                <Rss className="h-4 w-4" />
                RSS Feed
              </Button>
            </div>
            <p className="text-lg text-muted-foreground">
              Explore the latest insights in AI-powered learning and educational technology
            </p>
          </div>

          <div className="flex flex-wrap gap-2 py-4">
            {allTags.map((tag: string) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className={cn(
                  "cursor-pointer hover:bg-primary/80",
                  selectedTag === tag && "bg-primary text-primary-foreground"
                )}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
                {selectedTag === tag && (
                  <X className="ml-1 h-3 w-3" onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTag(null);
                    setLocation('/blog');
                  }} />
                )}
              </Badge>
            ))}
          </div>

          {selectedTag && (
            <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Showing posts tagged with "{selectedTag}"
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTag(null);
                  setLocation('/blog');
                }}
              >
                Clear filter
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post: BlogPost) => (
              <Card key={post.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative overflow-hidden">
                  <AspectRatio ratio={16/9} className="bg-muted">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className={cn(
                        "object-cover w-full h-full",
                        "transition-transform duration-500 ease-in-out",
                        "group-hover:scale-110"
                      )}
                    />
                  </AspectRatio>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {calculateReadingTime(post.content)} min read
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors min-h-[3.5rem]">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground mb-4 line-clamp-3">{post.description}</p>
                  <div className="space-y-12">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant={selectedTag === tag ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/80"
                          onClick={(e) => {
                            e.preventDefault();
                            handleTagClick(tag);
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button className="w-full group mt-8">
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
      <Footer />
    </div>
  );
}