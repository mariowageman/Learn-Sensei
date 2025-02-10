import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, SkipForward, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest } from "@/lib/api";
import { ProgressStats } from "./progress-stats";

interface QuizProps {
  subject: string;
}

interface Question {
  id: number;
  text: string;
  answer: string;
}

interface VideoSuggestion {
  title: string;
  videoId: string;
}

interface CheckAnswerResponse {
  correct: boolean;
  feedback: string;
  videoSuggestions?: VideoSuggestion[];
}

export function Quiz({ subject }: QuizProps) {
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    message: string;
    videoSuggestions?: VideoSuggestion[];
  } | null>(null);

  // Reset timer when component mounts or subject changes
  useEffect(() => {
    setStartTime(new Date());
  }, [subject]);

  const { data: question, isLoading: isQuestionLoading, refetch } = useQuery<Question>({
    queryKey: [`/api/quiz/${subject}`]
  });

  const mutation = useMutation<CheckAnswerResponse, Error, { answer: string, timeSpent: number }>({
    mutationFn: async ({ answer, timeSpent }) => {
      if (!question?.id) {
        throw new Error("No question loaded");
      }
      const response = await apiRequest("POST", "/api/quiz/check", {
        questionId: question.id,
        answer,
        timeSpent
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to check answer");
      }
      return data;
    },
    onSuccess: (data) => {
      setFeedback({
        correct: data.correct,
        message: data.feedback,
        videoSuggestions: data.videoSuggestions
      });

      // Update progress immediately
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${subject}`] });

      if (data.correct) {
        setTimeout(() => {
          refetch();
          setCurrentAnswer("");
          setFeedback(null);
          // Reset timer for new question
          setStartTime(new Date());
        }, 2000);
      }
    },
    onError: (error) => {
      setFeedback({
        correct: false,
        message: error.message || "Failed to submit answer. Please try again."
      });
    }
  });

  const handleSubmit = () => {
    if (!currentAnswer.trim()) return;

    // Calculate time spent in minutes
    const endTime = new Date();
    const timeSpentMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

    mutation.mutate({ 
      answer: currentAnswer.trim(),
      timeSpent: timeSpentMinutes
    });
  };

  const handleNextQuestion = () => {
    refetch();
    setCurrentAnswer("");
    setFeedback(null);
    // Reset timer for new question
    setStartTime(new Date());
  };

  if (isQuestionLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  const getButtonVariant = () => {
    if (!feedback) return "default";
    return feedback.correct ? "success" : "destructive";
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Fill in the blank:</h3>
        <p className="text-xl mb-6 break-words">{question?.text}</p>

        <div className="space-y-4">
          <Input
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer..."
            disabled={mutation.isPending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !mutation.isPending) {
                handleSubmit();
              }
            }}
            className="w-full"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!currentAnswer.trim() || mutation.isPending}
              variant="blue"
              className="w-full sm:w-auto transition-colors duration-300"
            >
              {mutation.isPending ? "Checking..." : "Submit Answer"}
            </Button>
            <Button
              onClick={handleNextQuestion}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Next Question
            </Button>
          </div>
        </div>
      </Card>

      {feedback && (
        <>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Answer:</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="cursor-pointer">
                    <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="left" className="max-w-[280px]">
                  <p className="break-words">{feedback.message}</p>
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-xl mb-6 break-words">{question?.answer}</p>
          </Card>
          <div className="space-y-4">

            {!feedback.correct && feedback.videoSuggestions && feedback.videoSuggestions.length > 0 && (
              <Card className="p-4">
                <h4 className="font-medium mb-4">Suggested Learning Videos:</h4>
                <div className="space-y-6">
                  {feedback.videoSuggestions.map((video, index) => (
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
              </Card>
            )}
          </div>
        </>
      )}
      <ProgressStats subject={subject} />
    </div>
  );
}