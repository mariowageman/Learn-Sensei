import { Quiz } from "@/components/learning/quiz";
import { SubjectForm } from "@/components/learning/subject-form";
import { useState } from "react";

export default function SenseiMode() {
  const [subject, setSubject] = useState<string>("");

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="w-full max-w-[800px] mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold">Sensei Mode</h1>
          <p className="text-muted-foreground">
            Test your knowledge with AI-powered quizzes and get instant feedback
          </p>
        </div>

        {!subject ? (
          <div className="max-w-xl mx-auto">
            <SubjectForm onSubmit={setSubject} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold break-words">
                Testing knowledge: {subject}
              </h2>
              <button
                onClick={() => setSubject("")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Change subject
              </button>
            </div>
            <Quiz subject={subject} />
          </div>
        )}
      </div>
    </div>
  );
}
