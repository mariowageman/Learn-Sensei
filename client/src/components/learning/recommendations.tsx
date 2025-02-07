import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface Recommendation {
  pathId: number;
  title: string;
  reason: string;
  difficulty: string;
  confidenceScore: number;
  topics: string[];
}

export function LearningRecommendations() {
  const { data: recommendations, isLoading } = useQuery<Recommendation[]>({
    queryKey: ["/api/recommendations"],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recommended for You</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.pathId} className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{recommendation.title}</h3>
                <p className="text-muted-foreground">{recommendation.reason}</p>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{recommendation.topics.length} Topics</span>
                </div>
              </div>
              <Link href={`/learning-paths/${recommendation.pathId}`}>
                <Button className="w-full mt-4">
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
