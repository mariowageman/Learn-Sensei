import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Timer, TrendingUp, Target, Award, Filter, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

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
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, filterStatus, filterSubject, pageSize]);

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

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const filteredAttempts = progress.recentAttempts?.filter(attempt => {
    if (filterStatus !== 'all' && filterStatus === 'correct' !== attempt.isCorrect) {
      return false;
    }
    if (filterSubject !== 'all' && attempt.subject !== filterSubject) {
      return false;
    }
    if (selectedDate) {
      const attemptDate = new Date(attempt.createdAt);
      if (!isSameDay(attemptDate, selectedDate)) {
        return false;
      }
    }
    return true;
  }) || [];

  const sortedAttempts = [...filteredAttempts]; 

  const totalPages = Math.ceil(sortedAttempts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleAttempts = sortedAttempts.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  // Handle date selection with page reset
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setCurrentPage(1);
  };

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

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h4 className="text-sm font-medium">Learning History</h4>
          <div className="flex flex-col sm:flex-row gap-2">
            {progress.subjects && progress.subjects.length > 1 && (
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-full sm:w-[130px] flex items-center justify-center sm:justify-start text-center">
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
              <SelectTrigger className="w-full sm:w-[130px] flex items-center justify-center sm:justify-start text-center">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="correct">Correct</SelectItem>
                <SelectItem value="incorrect">Incorrect</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[150px] flex items-center justify-center sm:justify-start text-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {selectedDate && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDateSelect(undefined)}
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto space-y-2 mb-4">
          {sortedAttempts.length > 0 ? (
            visibleAttempts.map((attempt) => (
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
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No history entries match your current filters.</p>
              <p>Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-4">
          <span className="text-sm text-muted-foreground">
            Showing {sortedAttempts.length > 0 ? `${startIndex + 1}-${Math.min(startIndex + pageSize, sortedAttempts.length)} of ${sortedAttempts.length}` : '0'} entries
          </span>

          <div className="flex items-center gap-2">
            <Select 
              value={pageSize.toString()} 
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                setCurrentPage(1); 
              }}
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

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm min-w-[80px] text-center">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={!!selectedAttempt} onOpenChange={() => setSelectedAttempt(null)}>
        <DialogContent className="sm:max-w-[80vw] md:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
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
                <h4 className="font-medium mb-4">Suggested Learning Videos:</h4>
                <div className="space-y-6">
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
                      <p className="text-xs text-muted-foreground mt-1">
                        Can't see the video? <a
                          href={`https://www.youtube.com/watch?v=${video.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-primary"
                        >
                          Watch on YouTube
                        </a>
                      </p>
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