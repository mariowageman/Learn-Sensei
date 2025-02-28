
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";

interface RecentSubject {
  id: number;
  subject: string;
  createdAt: string;
}

export function RecentSubjects() {
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [recentSubjects, setRecentSubjects] = useState<RecentSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentSubjects = async () => {
      try {
        const response = await fetch("/api/recent-subjects");
        if (!response.ok) {
          throw new Error("Failed to fetch recent subjects");
        }
        const data = await response.json();
        setRecentSubjects(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching recent subjects:", error);
        setIsLoading(false);
      }
    };

    fetchRecentSubjects();
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

  // Create a unique list of subjects, maintaining the most recent order
  const uniqueSubjects: RecentSubject[] = [];
  const addedSubjects = new Set<string>();

  recentSubjects.forEach((subject) => {
    if (!addedSubjects.has(subject.subject)) {
      uniqueSubjects.push(subject);
      addedSubjects.add(subject.subject);
    }
  });

  console.log(`Displaying ${uniqueSubjects.length} unique subjects`);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <History className="h-4 w-4" />
        <span>Recent Subjects</span>
      </div>
      <ScrollArea className="max-h-[200px] pr-3">
        <div className="flex flex-wrap gap-2">
          {uniqueSubjects.slice(0, showAllSubjects ? uniqueSubjects.length : 10).map((subject) => (
            <Button
              key={subject.id}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              asChild
            >
              <a href={`/sensei?subject=${encodeURIComponent(subject.subject)}`}>
                <Clock className="h-3 w-3 text-muted-foreground" />
                {subject.subject}
              </a>
            </Button>
          ))}
        </div>
        {uniqueSubjects.length > 10 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAllSubjects(!showAllSubjects)} 
            className="mt-3 text-muted-foreground hover:text-foreground flex items-center gap-1 w-full justify-center"
          >
            {showAllSubjects ? 'Show Less' : 'Show More'}
            {showAllSubjects ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
        )}
      </ScrollArea>
    </div>
  );
}
