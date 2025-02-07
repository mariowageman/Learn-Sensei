import { SubjectForm } from "@/components/learning/subject-form";
import { Conversation } from "@/components/learning/conversation";
import { Quiz } from "@/components/learning/quiz";
import { LearningRecommendations } from "@/components/learning/recommendations";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const [subject, setSubject] = useState<string>("");
  const [showQuiz, setShowQuiz] = useState(true);

  const { data: session, isLoading } = useQuery({
    queryKey: ["/api/session"],
    enabled: !!subject
  });

  if (!subject) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-4">
        <div className="w-full max-w-[800px] mx-auto px-4 space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold">AI Learning Assistant</h1>
            <p className="text-muted-foreground">
              Enter any subject you'd like to learn about and get an interactive explanation
            </p>
          </div>
          <SubjectForm onSubmit={setSubject} />
          <LearningRecommendations />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="w-full max-w-[800px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-bold break-words">Learning about: {subject}</h2>
          <Button
            variant="outline"
            onClick={() => setShowQuiz(!showQuiz)}
            className="w-full sm:w-auto"
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