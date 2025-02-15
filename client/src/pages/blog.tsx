import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Footer } from "@/components/footer";

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  description: string;
  category: string;
  image: string;
  tags: string[];
  content: string;
  estimatedReadTime: number;
}

export const blogPosts: BlogPost[] = [
  {
    id: "getting-started-ai-learning",
    title: "Getting Started with AI-Powered Learning",
    date: "February 15, 2025",
    description: "Discover how artificial intelligence is revolutionizing the way we learn and acquire new skills. We'll explore the latest trends and technologies that are shaping the future of education.",
    category: "AI Education",
    image: "/assets/blog/ai-education.jpg",
    tags: ["AI", "Education", "Technology", "Learning"],
    content: "Full article content here...",
    estimatedReadTime: 5
  },
  {
    id: "effective-online-learning",
    title: "5 Tips for Effective Online Learning",
    date: "February 14, 2025",
    description: "Master the art of online learning with these proven strategies for success. Learn how to stay motivated, manage your time effectively, and achieve your learning goals.",
    category: "Learning Tips",
    image: "/assets/blog/learning-tips.jpg",
    tags: ["Online Learning", "Study Tips", "Productivity"],
    content: "Full article content here...",
    estimatedReadTime: 4
  },
  {
    id: "future-educational-technology",
    title: "The Future of Educational Technology",
    date: "February 13, 2025",
    description: "Explore emerging trends in educational technology and their impact on modern learning. From virtual reality to adaptive learning systems, discover what's next in EdTech.",
    category: "EdTech",
    image: "/assets/blog/edtech-future.jpg",
    tags: ["EdTech", "Innovation", "Future", "Technology"],
    content: "Full article content here...",
    estimatedReadTime: 6
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4 mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
          <p className="text-lg text-muted-foreground">
            Explore the latest insights in AI-powered learning and educational technology
          </p>
        </div>

        <ScrollArea className="h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
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
                      {post.estimatedReadTime} min read
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                    <Link href={`/blog/${post.id}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>{post.date}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground mb-4 line-clamp-3">{post.description}</p>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/blog/${post.id}`}>
                      <Button variant="ghost" className="w-full group">
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