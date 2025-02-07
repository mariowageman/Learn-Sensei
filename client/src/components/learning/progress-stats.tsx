import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Timer, TrendingUp, Target, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProgressStatsProps {
  subject: string;
}

interface ProgressData {
  total: number;
  correct: number;
  percentage: number;
  streakDays: number;
  timeSpentMinutes: number;
  avgAccuracy: number;
  weeklyProgress: Array<{
    date: string;
    correct: number;
    total: number;
  }>;
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
    refetchInterval: 30000,
    staleTime: 30000,
    retry: false
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (error || !progress) {
    return null;
  }

  // Format time spent to show hours and minutes
  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
      return `${mins}m`;
    }
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="grid gap-4">
      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Learning Progress</h3>
          <span className="text-2xl font-bold">{progress.percentage}%</span>
        </div>

        <Progress value={progress.percentage} className="h-2" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>Total Questions</span>
            </div>
            <p className="text-lg font-semibold">{progress.total}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span>Correct Answers</span>
            </div>
            <p className="text-lg font-semibold">{progress.correct}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>Time Spent</span>
            </div>
            <p className="text-lg font-semibold">
              {formatTimeSpent(progress.timeSpentMinutes)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>Current Streak</span>
            </div>
            <p className="text-lg font-semibold">{progress.streakDays} days</p>
          </div>
        </div>
      </Card>

      {progress.weeklyProgress?.length > 0 && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Weekly Progress</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Avg. Accuracy: {progress.avgAccuracy}%</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {progress.weeklyProgress.map((day, index) => (
              <div key={day.date} className="text-center">
                <div className="h-20 relative">
                  <div
                    className="absolute bottom-0 w-full bg-primary/20 rounded-sm"
                    style={{
                      height: `${(day.correct / Math.max(...progress.weeklyProgress.map(d => d.total))) * 100}%`
                    }}
                  >
                    <div
                      className="absolute bottom-0 w-full bg-primary rounded-sm"
                      style={{
                        height: `${(day.correct / day.total) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {progress.recentAttempts?.length > 0 && (
        <Card className="p-4 space-y-4">
          <h4 className="text-sm font-medium">Recent Attempts</h4>
          <div className="space-y-2">
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
        </Card>
      )}
    </div>
  );
}