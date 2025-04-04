import { Quiz } from "@/components/learning/quiz";
import { SubjectForm } from "@/components/learning/subject-form";
import { RecentSubjects } from "@/components/learning/recent-subjects";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function SenseiMode() {
  const [subject, setSubject] = useState<string>("");

  const handleSubjectSelect = (selectedSubject: string) => {
    setSubject(selectedSubject);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3F3EED] to-[#3F3EED]/80">
              Sensei Mode
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enter a subject, answer AI-generated questions, and get immediate feedback. If you answer incorrectly, Sensei Mode provides a video explanation so you can learn and improve on the spot. No more wasted time—just focused learning tailored to you.
            </p>
          </div>

          {!subject ? (
            <div className="space-y-8">
              <div className="max-w-xl mx-auto">
                <SubjectForm onSubmit={setSubject} />
              </div>
              <RecentSubjects onSelectSubject={handleSubjectSelect} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-bold break-words">
                  Testing knowledge: {subject}
                </h2>
                <Button
                  onClick={() => setSubject("")}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Change subject
                </Button>
              </div>
              <Quiz subject={subject} />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}