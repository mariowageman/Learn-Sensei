import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

const blogPosts = [
  {
    title: "Getting Started with AI-Powered Learning",
    date: "February 15, 2025",
    description: "Discover how artificial intelligence is revolutionizing the way we learn and acquire new skills.",
    category: "AI Education",
    image: "/assets/blog/ai-education.jpg"
  },
  {
    title: "5 Tips for Effective Online Learning",
    date: "February 14, 2025",
    description: "Master the art of online learning with these proven strategies for success.",
    category: "Learning Tips",
    image: "/assets/blog/learning-tips.jpg"
  },
  {
    title: "The Future of Educational Technology",
    date: "February 13, 2025",
    description: "Explore emerging trends in educational technology and their impact on modern learning.",
    category: "EdTech",
    image: "/assets/blog/edtech-future.jpg"
  }
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        <p className="text-lg text-muted-foreground">
          Explore the latest insights in AI-powered learning and educational technology
        </p>
      </div>

      <ScrollArea className="h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {blogPosts.map((post, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative overflow-hidden">
                <AspectRatio ratio={2/1} className="bg-muted">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className={cn(
                      "object-cover w-full h-full",
                      "transition-all duration-500 ease-in-out transform",
                      "group-hover:scale-125",
                      "will-change-transform"
                    )}
                  />
                </AspectRatio>
              </div>
              <CardHeader>
                <div className="text-sm text-muted-foreground">{post.category}</div>
                <CardTitle className="mt-2">{post.title}</CardTitle>
                <CardDescription>{post.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}