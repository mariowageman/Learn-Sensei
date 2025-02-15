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
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 400'%3E%3Crect fill='%23283951' width='800' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23ffffff'%3EAI Education%3C/text%3E%3C/svg%3E"
  },
  {
    title: "5 Tips for Effective Online Learning",
    date: "February 14, 2025",
    description: "Master the art of online learning with these proven strategies for success.",
    category: "Learning Tips",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 400'%3E%3Crect fill='%23283951' width='800' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23ffffff'%3ELearning Tips%3C/text%3E%3C/svg%3E"
  },
  {
    title: "The Future of Educational Technology",
    date: "February 13, 2025",
    description: "Explore emerging trends in educational technology and their impact on modern learning.",
    category: "EdTech",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 400'%3E%3Crect fill='%23283951' width='800' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23ffffff'%3EEdTech%3C/text%3E%3C/svg%3E"
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
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <AspectRatio ratio={2/1}>
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className={cn(
                      "object-cover w-full h-full",
                      "transition-transform duration-300 hover:scale-105"
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