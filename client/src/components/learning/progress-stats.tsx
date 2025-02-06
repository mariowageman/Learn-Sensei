import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProgressStatsProps {
  subject: string;
}

interface ProgressData {
  total: number;
  correct: number;
  percentage: number;
  recentAttempts: Array<{
    id: number;
    isCorrect: boolean;
    userAnswer: string;
    createdAt: string;
  }>;
}

export function ProgressStats({ subject }: ProgressStatsProps) {
  const { data: progress, isLoading, error } = useQuery<ProgressData>({
    queryKey: [`/api/progress/${subject}`],
    refetchInterval: 30000, // Only refresh every 30 seconds
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: false // Don't retry on error to prevent flickering
  });

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (error || !progress) {
    return null; // Don't show anything if there's an error or no data
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Learning Progress</h3>
        <span className="text-2xl font-bold">{progress.percentage}%</span>
      </div>

      <Progress value={progress.percentage} className="h-2" />

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Total Questions: {progress.total}</span>
        <span>Correct Answers: {progress.correct}</span>
      </div>

      {progress.recentAttempts?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Attempts</h4>
          <div className="space-y-1">
            {progress.recentAttempts.map((attempt) => (
              <div key={attempt.id} className="flex items-center gap-2 text-sm">
                {attempt.isCorrect ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="truncate flex-1">{attempt.userAnswer}</span>
                <span className="text-muted-foreground">
                  {new Date(attempt.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}