import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, SkipForward } from "lucide-react";
import { apiRequest } from "@/lib/api";

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
  url: string;
}

export function Quiz({ subject }: QuizProps) {
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    message: string;
    videoSuggestions?: VideoSuggestion[];
  } | null>(null);

  const { data: question, isLoading, refetch } = useQuery<Question>({
    queryKey: [`/api/quiz/${subject}`]
  });

  const mutation = useMutation({
    mutationFn: async (answer: string) => {
      const response = await apiRequest("POST", "/api/quiz/check", {
        questionId: question?.id,
        answer
      });
      return response.json();
    },
    onSuccess: (data) => {
      setFeedback({
        correct: data.correct,
        message: data.feedback,
        videoSuggestions: data.videoSuggestions
      });
      if (data.correct) {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: [`/api/quiz/${subject}`] });
          setCurrentAnswer("");
          setFeedback(null);
        }, 2000);
      }
    }
  });

  const handleNextQuestion = () => {
    refetch();
    setCurrentAnswer("");
    setFeedback(null);
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  function getEmbedUrl(url: string) {
    // Handle different YouTube URL formats
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&\?]{10,12})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  }

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
            className="w-full"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => mutation.mutate(currentAnswer)}
              disabled={!currentAnswer || mutation.isPending}
              className="w-full sm:w-auto flex-1"
            >
              Submit Answer
            </Button>
            <Button
              onClick={handleNextQuestion}
              variant="outline"
              className="w-full sm:w-auto flex-1 gap-2"
            >
              <SkipForward className="h-4 w-4" />
              Next Question
            </Button>
          </div>
        </div>
      </Card>

      {feedback && (
        <div className="space-y-4">
          <Alert
            variant={feedback.correct ? "default" : "destructive"}
            className="animate-in fade-in"
          >
            {feedback.correct ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription className="break-words">{feedback.message}</AlertDescription>
          </Alert>

          {!feedback.correct && feedback.videoSuggestions && (
            <Card className="p-4">
              <h4 className="font-medium mb-4">Suggested Learning Videos:</h4>
              <div className="space-y-6">
                {feedback.videoSuggestions.map((video, index) => (
                  <div key={index} className="space-y-2">
                    <h5 className="text-sm font-medium break-words">{video.title}</h5>
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={getEmbedUrl(video.url)}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}