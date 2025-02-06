import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProgressStatsProps {
  subject: string;
}

export function ProgressStats({ subject }: ProgressStatsProps) {
  const { data: progress, isLoading } = useQuery({
    queryKey: [`/api/progress/${subject}`],
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Learning Progress</h3>
        <span className="text-2xl font-bold">{progress?.percentage}%</span>
      </div>
      
      <Progress value={progress?.percentage || 0} className="h-2" />
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Total Questions: {progress?.total}</span>
        <span>Correct Answers: {progress?.correct}</span>
      </div>

      {progress?.recentAttempts?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Attempts</h4>
          <div className="space-y-1">
            {progress.recentAttempts.map((attempt, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
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
