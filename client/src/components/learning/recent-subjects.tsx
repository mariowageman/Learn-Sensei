import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";

interface DashboardData {
  subjectPerformance: Array<{
    subject: string;
    totalAttempts: number;
    correctAnswers: number;
    accuracy: number;
  }>;
}

interface RecentSubjectsProps {
  onSelectSubject?: (subject: string) => void;
}

export function RecentSubjects({ onSelectSubject }: RecentSubjectsProps) {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch subjects");
        }
        const data: DashboardData = await response.json();
        const subjectNames = data.subjectPerformance.map(item => item.subject);
        setSubjects(subjectNames);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
    // Poll for updates every 30 seconds
    const intervalId = setInterval(fetchSubjects, 30000);
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <History className="h-4 w-4" />
          <span>Recent Subjects</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-[120px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!subjects?.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <History className="h-4 w-4" />
          <span>Recent Subjects</span>
        </div>
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">No subjects found. Start a new conversation!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <History className="h-4 w-4" />
          <span>Recent Subjects</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {subjects.length} subjects
        </span>
      </div>

      <ScrollArea className="h-auto max-h-[300px]">
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => onSelectSubject?.(subject)}
            >
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>{subject}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}