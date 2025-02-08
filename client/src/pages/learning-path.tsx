import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Timer, BookOpen, CheckCircle, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { IntensityAdjuster } from "@/components/learning/intensity-adjuster";

interface LearningPath {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  topics: string[];
  prerequisites: number[];
  estimatedHours: number;
  progress?: {
    id: number;
    currentTopic: number;
    completed: boolean;
    completedTopics: number[];
    intensity?: string; // Changed from number to string
  }[];
}

export default function LearningPath() {
  const [, params] = useRoute<{ id: string }>("/learning-paths/:id");
  const id = params?.id;

  const { data: path, isLoading } = useQuery<LearningPath>({
    queryKey: [`/api/learning-paths/${id}`],
    enabled: !!id
  });

  const startMutation = useMutation({
    mutationFn: async (topicIndex: number) => {
      const response = await apiRequest(
        "POST",
        `/api/learning-paths/${id}/progress`,
        { topicIndex }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/learning-paths/${id}`] });
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (topicIndex: number) => {
      const response = await apiRequest(
        "PATCH",
        `/api/learning-paths/${id}/progress`,
        { completedTopic: topicIndex }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/learning-paths/${id}`] });
    }
  });

  if (isLoading || !path) {
    return (
      <div className="container max-w-4xl mx-auto px-6 py-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  const progress = path.progress?.[0];
  const completedCount = progress?.completedTopics?.length ?? 0;
  const progressPercent = (completedCount / path.topics.length) * 100;

  const difficultyColors = {
    beginner: "bg-green-500 hover:bg-green-600",
    intermediate: "bg-blue-500 hover:bg-blue-600",
    advanced: "bg-[#C7AB62] hover:bg-[#B69B52]",
  };

  return (
    <div className="container max-w-4xl mx-auto px-6 py-6 space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Badge 
            className={`w-fit ${difficultyColors[path.difficulty.toLowerCase()]}`}
          >
            {path.difficulty}
          </Badge>
          <h1 className="text-3xl font-bold">{path.title}</h1>
        </div>
        <p className="text-muted-foreground">{path.description}</p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Overall Progress</p>
            <div className="text-sm text-muted-foreground">
              {completedCount} of {path.topics.length} topics completed
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span className="text-sm">{path.estimatedHours} hours estimated</span>
            </div>
            {progress && (
              <IntensityAdjuster 
                pathId={path.id} 
                currentIntensity={progress.intensity} 
              />
            )}
          </div>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Topics</h2>
        <div className="grid gap-4">
          {path.topics.map((topic, index) => {
            const isCompleted = progress?.completedTopics?.includes(index);
            const isLocked = index > 0 && !progress?.completedTopics?.includes(index - 1);
            const isCurrent = progress?.currentTopic === index;

            return (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : isLocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <h3 className="font-medium">{topic}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isCompleted ? "Completed" : isLocked ? "Locked" : "Ready to start"}
                      </p>
                    </div>
                  </div>
                  {!isLocked && (
                    <Button
                      onClick={() => {
                        if (!progress) {
                          startMutation.mutate(index);
                        } else if (!isCompleted && (index === 0 || progress.completedTopics?.includes(index - 1))) {
                          completeMutation.mutate(index);
                        }
                      }}
                      disabled={
                        startMutation.isPending || 
                        completeMutation.isPending || 
                        isCompleted || 
                        (!!progress && !isCompleted && index !== progress.currentTopic)
                      }
                    >
                      {!progress ? "Start Learning" : "Complete Topic"}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}