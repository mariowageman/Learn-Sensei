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

export function Quiz({ subject }: QuizProps) {
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);

  const { data: question, isLoading } = useQuery<Question>({
    queryKey: ["/api/quiz", subject]
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
        message: data.feedback
      });
      if (data.correct) {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/quiz", subject] });
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
    <div className="space-y-8">
      <Card className="p-6">
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
      )}
    </div>
  );
}