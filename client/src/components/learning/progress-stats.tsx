import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Timer, TrendingUp, Target, Award, Filter, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
    questionText: string;
    correctAnswer: string;
    videoSuggestions?: Array<{
      title: string;
      videoId: string;
    }>;
  }>;
}

export function ProgressStats({ subject }: ProgressStatsProps) {
  const [selectedAttempt, setSelectedAttempt] = useState<ProgressData['recentAttempts'][0] | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'subject'>('date');

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

  const formatTimeSpent = (minutes: number) => {
    const roundedMinutes = Math.round(minutes);
    const hours = Math.floor(roundedMinutes / 60);
    const mins = roundedMinutes % 60;
    if (hours === 0) {
      return `${mins}m`;
    }
    return `${hours}h ${mins}m`;
  };

  const filteredAttempts = progress.recentAttempts.filter(attempt => {
    if (filterStatus === 'all') return true;
    return filterStatus === 'correct' ? attempt.isCorrect : !attempt.isCorrect;
  });

  const sortedAttempts = [...filteredAttempts].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0; // Default to date sorting
  });

  return (
    <div className="grid gap-4">
      {progress.weeklyProgress?.length > 0 && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Weekly Progress</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-[#3A3D98]" />
              <span>Avg. Accuracy: {progress.avgAccuracy}%</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {progress.weeklyProgress.map((day, index) => (
              <div key={day.date} className="text-center">
                <div className="h-20 relative">
                  <div
                    className="absolute bottom-0 w-full bg-gray-100 rounded-sm"
                    style={{
                      height: `${(day.correct / Math.max(...progress.weeklyProgress.map(d => d.total))) * 100}%`
                    }}
                  >
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-r from-green-500 to-green-600 rounded-sm"
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

      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-[#3A3D98]">Learning Progress</h3>
          <span className="text-2xl font-bold text-[#3A3D98]">{progress.percentage}%</span>
        </div>

        <Progress 
          value={progress.percentage} 
          className="h-2 bg-gray-100 [&>[role=progressbar]]:bg-gradient-to-r [&>[role=progressbar]]:from-green-500 [&>[role=progressbar]]:to-green-600" 
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4 text-[#3A3D98]" />
              <span>Total Questions</span>
            </div>
            <p className="text-lg font-semibold">{progress.total}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-[#3A3D98]" />
              <span>Correct Answers</span>
            </div>
            <p className="text-lg font-semibold">{progress.correct}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4 text-[#3A3D98]" />
              <span>Time Spent</span>
            </div>
            <p className="text-lg font-semibold">
              {formatTimeSpent(progress.timeSpentMinutes)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4 text-[#3A3D98]" />
              <span>Current Streak</span>
            </div>
            <p className="text-lg font-semibold">{progress.streakDays} days</p>
          </div>
        </div>
      </Card>

      {progress.recentAttempts?.length > 0 && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium">Learning History</h4>
            <div className="flex items-center gap-2">
              <Select value={filterStatus} onValueChange={(value: 'all' | 'correct' | 'incorrect') => setFilterStatus(value)}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="correct">Correct</SelectItem>
                  <SelectItem value="incorrect">Incorrect</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: 'date' | 'subject') => setSortBy(value)}>
                <SelectTrigger className="w-[130px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="subject">Subject</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            {sortedAttempts.map((attempt) => (
              <Button
                key={attempt.id}
                variant="ghost"
                className="w-full justify-between hover:bg-gray-100"
                onClick={() => setSelectedAttempt(attempt)}
              >
                <div className="flex items-center gap-2">
                  {attempt.isCorrect ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="truncate">{attempt.questionText}</span>
                </div>
                <span className="text-sm text-muted-foreground shrink-0">
                  {new Date(attempt.createdAt).toLocaleDateString()}
                </span>
              </Button>
            ))}
          </div>
        </Card>
      )}

      <Dialog open={!!selectedAttempt} onOpenChange={() => setSelectedAttempt(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Question:</h4>
              <p className="text-lg">{selectedAttempt?.questionText}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Your Answer:</h4>
              <p className={`text-lg ${selectedAttempt?.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {selectedAttempt?.userAnswer}
              </p>
            </div>
            {!selectedAttempt?.isCorrect && (
              <div>
                <h4 className="font-medium mb-2">Correct Answer:</h4>
                <p className="text-lg text-green-600">{selectedAttempt?.correctAnswer}</p>
              </div>
            )}
            {selectedAttempt?.videoSuggestions && selectedAttempt.videoSuggestions.length > 0 && (
              <div>
                <h4 className="font-medium mb-4">Suggested Videos:</h4>
                <div className="grid gap-4">
                  {selectedAttempt.videoSuggestions.map((video, index) => (
                    <div key={index} className="space-y-2">
                      <h5 className="text-sm font-medium">{video.title}</h5>
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${video.videoId}`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}