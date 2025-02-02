import { SubjectForm } from "@/components/learning/subject-form";
import { Conversation } from "@/components/learning/conversation";
import { Quiz } from "@/components/learning/quiz";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const [subject, setSubject] = useState<string>("");
  const [showQuiz, setShowQuiz] = useState(false);

  const { data: session, isLoading } = useQuery({
    queryKey: ["/api/session"],
    enabled: !!subject
  });

  if (!subject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-[800px] space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">AI Learning Assistant</h1>
            <p className="text-muted-foreground">
              Enter any subject you'd like to learn about and get an interactive explanation
            </p>
          </div>
          <SubjectForm onSubmit={setSubject} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="w-full max-w-[800px] mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Learning about: {subject}</h2>
          <Button
            variant="outline"
            onClick={() => setShowQuiz(!showQuiz)}
          >
            {showQuiz ? "Back to Lesson" : "Take Quiz"}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : showQuiz ? (
          <Quiz subject={subject} />
        ) : (
          <Conversation subject={subject} />
        )}
      </div>
    </div>
  );
}
