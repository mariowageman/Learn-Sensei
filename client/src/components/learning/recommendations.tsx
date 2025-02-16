import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ArrowRight, Timer, Trophy } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface Recommendation {
  pathId: number;
  title: string;
  reason: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  confidenceScore: number;
  topics: string[];
  estimatedHours?: number;
}

const difficultyColors = {
  beginner: "bg-green-500 hover:bg-green-600",
  intermediate: "bg-blue-500 hover:bg-blue-600",
  advanced: "bg-[#C7AB62] hover:bg-[#B69B52]",
} as const;

export function LearningRecommendations() {
  const { toast } = useToast();
  const { data: recommendations, isLoading, error } = useQuery<Recommendation[]>({
    queryKey: ["/api/recommendations"],
    refetchInterval: 300000, // Refresh every 5 minutes
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error loading recommendations",
        description: "Please try again later",
      });
      console.error("Failed to load recommendations:", err);
    },
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

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">
          Unable to load recommendations. Please try again later.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recommended for You</h2>
      {recommendations?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.pathId} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge 
                    className={`${difficultyColors[recommendation.difficulty]}`}
                  >
                    {recommendation.difficulty}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm min-w-[80px]">
                    <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span className="text-muted-foreground whitespace-nowrap">
                      {Math.max(70, Math.round(recommendation.confidenceScore * 100))}% match
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{recommendation.title}</h3>
                  <p className="text-muted-foreground">{recommendation.reason}</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{recommendation.topics.length} Topics</span>
                  </div>
                  {recommendation.estimatedHours && (
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      <span>{recommendation.estimatedHours} hours estimated</span>
                    </div>
                  )}
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
      ) : (
        <Card className="p-6">
          <p className="text-muted-foreground">
            Complete some lessons or take quizzes to get personalized recommendations!
          </p>
        </Card>
      )}
    </div>
  );
}