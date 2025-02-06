import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Timer, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface LearningPath {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  topics: string[];
  prerequisites: number[];
  estimatedHours: number;
}

export default function LearningPaths() {
  const { data: paths, isLoading } = useQuery<LearningPath[]>({
    queryKey: ["/api/learning-paths"]
  });

  if (isLoading) {
    return (
      <div className="container py-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Learning Paths</h1>
        <p className="text-muted-foreground">
          Choose a structured learning path to progressively build your knowledge
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paths?.map((path) => (
          <Card key={path.id} className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold">{path.title}</h2>
                <Badge variant={
                  path.difficulty === "beginner" ? "default" :
                  path.difficulty === "intermediate" ? "secondary" : "destructive"
                }>
                  {path.difficulty}
                </Badge>
              </div>
              <p className="text-muted-foreground">{path.description}</p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{path.topics.length} Topics</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span>{path.estimatedHours} hours estimated</span>
              </div>
            </div>

            <Link href={`/learning-paths/${path.id}`}>
              <Button className="w-full">
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
