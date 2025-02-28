import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Clock, ChevronDown, ChevronUp, Star } from "lucide-react";
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
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [recentSubjects, setRecentSubjects] = useState<RecentSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastAccessedSubject, setLastAccessedSubject] = useState<string | null>(null);

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

        // Set the most recent subject as last accessed
        if (data.length > 0) {
          setLastAccessedSubject(data[0].subject);
        }
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

  const handleSubjectClick = (subject: string) => {
    setLastAccessedSubject(subject);
    if (onSelectSubject) {
      onSelectSubject(subject);
    }
  };

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

  // Create a unique list of subjects, maintaining the most recent order
  const uniqueSubjects: RecentSubject[] = [];
  const addedSubjects = new Set<string>();

  recentSubjects.forEach((subject) => {
    if (!addedSubjects.has(subject.subject)) {
      uniqueSubjects.push(subject);
      addedSubjects.add(subject.subject);
    }
  });

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

      <Card className="p-4">
        <ScrollArea className="max-h-[300px] pr-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {uniqueSubjects.slice(0, showAllSubjects ? undefined : 12).map((subject) => (
              <Button
                key={subject.id}
                variant={subject.subject === lastAccessedSubject ? "default" : "outline"}
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => handleSubjectClick(subject.subject)}
              >
                <div className="flex items-center gap-2 truncate">
                  {subject.subject === lastAccessedSubject ? (
                    <Star className="h-3 w-3 shrink-0 text-yellow-500" />
                  ) : (
                    <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">{subject.subject}</span>
                </div>
              </Button>
            ))}
          </div>

          {uniqueSubjects.length > 12 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAllSubjects(!showAllSubjects)} 
              className="mt-4 text-muted-foreground hover:text-foreground w-full justify-center"
            >
              {showAllSubjects ? (
                <>
                  Show Less
                  <ChevronUp className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Show {uniqueSubjects.length - 12} More
                  <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}