import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Timer, TrendingUp, Target, Award, Filter, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
  subjects?: string[];
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
    subject: string;
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
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [pageSize, setPageSize] = useState<number>(5);

  const { data: progress, isLoading } = useQuery<ProgressData>({
    queryKey: [`/api/progress/${subject}`],
    refetchInterval: 30000,
    staleTime: 30000,
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!progress) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          <p>No progress data available yet.</p>
          <p>Start answering questions to see your progress!</p>
        </div>
      </Card>
    );
  }

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const filteredAttempts = progress.recentAttempts?.filter(attempt => {
    if (filterStatus !== 'all' && filterStatus === 'correct' !== attempt.isCorrect) {
      return false;
    }
    if (filterSubject !== 'all' && attempt.subject !== filterSubject) {
      return false;
    }
    return true;
  }) || [];

  const sortedAttempts = [...filteredAttempts].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.subject.localeCompare(b.subject);
  });

  const visibleAttempts = sortedAttempts.slice(0, pageSize);

  return (
    <div className="space-y-4">
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

      {sortedAttempts.length > 0 && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h4 className="text-sm font-medium">Learning History</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              {progress.subjects && progress.subjects.length > 1 && (
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {progress.subjects.map(subj => (
                      <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={filterStatus} onValueChange={(value: 'all' | 'correct' | 'incorrect') => setFilterStatus(value)}>
                <SelectTrigger className="w-full sm:w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="correct">Correct</SelectItem>
                  <SelectItem value="incorrect">Incorrect</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: 'date' | 'subject') => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[130px]">
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

          <div className="max-h-[600px] overflow-y-auto space-y-2 mb-4">
            {visibleAttempts.map((attempt) => (
              <Button
                key={attempt.id}
                variant="ghost"
                className="w-full justify-between hover:bg-gray-100 px-4 py-3"
                onClick={() => setSelectedAttempt(attempt)}
              >
                <div className="flex items-center gap-2 max-w-[70%]">
                  {attempt.isCorrect ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                  )}
                  <div className="truncate text-left">
                    <span className="block truncate">{attempt.questionText}</span>
                    <span className="text-sm text-muted-foreground">{attempt.subject}</span>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground shrink-0">
                  {new Date(attempt.createdAt).toLocaleDateString()}
                </span>
              </Button>
            ))}
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-sm text-muted-foreground">
              Showing {Math.min(pageSize, sortedAttempts.length)} of {sortedAttempts.length} entries
            </span>
            <Select 
              value={pageSize.toString()} 
              onValueChange={(value) => setPageSize(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Show entries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Show 5</SelectItem>
                <SelectItem value="10">Show 10</SelectItem>
                <SelectItem value="20">Show 20</SelectItem>
                <SelectItem value="50">Show 50</SelectItem>
                <SelectItem value="100">Show 100</SelectItem>
              </SelectContent>
            </Select>
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
              <p className="text-lg break-words">{selectedAttempt?.questionText}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Your Answer:</h4>
              <p className={`text-lg break-words ${selectedAttempt?.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {selectedAttempt?.userAnswer}
              </p>
            </div>
            {!selectedAttempt?.isCorrect && (
              <div>
                <h4 className="font-medium mb-2">Correct Answer:</h4>
                <p className="text-lg text-green-600 break-words">{selectedAttempt?.correctAnswer}</p>
              </div>
            )}
            {selectedAttempt?.videoSuggestions && selectedAttempt.videoSuggestions.length > 0 && (
              <div>
                <h4 className="font-medium mb-4">Suggested Videos:</h4>
                <div className="grid gap-4">
                  {selectedAttempt.videoSuggestions.map((video, index) => (
                    <div key={index} className="space-y-2">
                      <h5 className="text-sm font-medium break-words">{video.title}</h5>
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