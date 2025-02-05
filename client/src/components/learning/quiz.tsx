import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";
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
    videoSuggestions?: string[];
  } | null>(null);

  const { data: question, isLoading } = useQuery<Question>({
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

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-medium mb-4">Fill in the blank:</h3>
        <p className="text-xl mb-6">{question?.text}</p>

        <div className="space-y-4">
          <Input
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer..."
            disabled={mutation.isPending}
          />
          <Button
            onClick={() => mutation.mutate(currentAnswer)}
            disabled={!currentAnswer || mutation.isPending}
            className="w-full"
          >
            Submit Answer
          </Button>
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
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
          
          {!feedback.correct && feedback.videoSuggestions && (
            <Card className="p-4">
              <h4 className="font-medium mb-2">Suggested Learning Videos:</h4>
              <ul className="space-y-2">
                {feedback.videoSuggestions.map((title, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {title}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}