import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";

interface RecentSubject {
  id: number;
  subject: string;
  createdAt: string;
}

interface RecentSubjectsProps {
  onSelectSubject?: (subject: string) => void;
}

export function RecentSubjects({ onSelectSubject }: RecentSubjectsProps) {
  const [recentSubjects, setRecentSubjects] = useState<RecentSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentSubjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/recent-subjects");
        if (!response.ok) {
          throw new Error("Failed to fetch recent subjects");
        }
        const data = await response.json();
        setRecentSubjects(data);
      } catch (error) {
        console.error("Error fetching recent subjects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentSubjects();
    // Set up polling to refresh subjects every 10 seconds
    const intervalId = setInterval(fetchRecentSubjects, 10000);
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

  if (!recentSubjects?.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <History className="h-4 w-4" />
          <span>Recent Subjects</span>
        </div>
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">No recent subjects found. Start a new conversation!</p>
        </Card>
      </div>
    );
  }

  // Create a unique list of subjects, maintaining the most recent occurrence
  const uniqueSubjects = Array.from(
    recentSubjects.reduce((map, subject) => {
      // Only keep the most recent occurrence of each subject
      if (!map.has(subject.subject) || 
          new Date(subject.createdAt) > new Date(map.get(subject.subject)!.createdAt)) {
        map.set(subject.subject, subject);
      }
      return map;
    }, new Map<string, RecentSubject>())
  ).map(([_, subject]) => subject)
  // Sort by createdAt in descending order (most recent first)
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <History className="h-4 w-4" />
          <span>Recent Subjects</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {uniqueSubjects.length} subjects
        </span>
      </div>

      <ScrollArea className="h-auto max-h-[300px]">
        <div className="flex flex-wrap gap-2">
          {uniqueSubjects.map((subject) => (
            <Button
              key={subject.id}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => onSelectSubject?.(subject.subject)}
            >
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>{subject.subject}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}