
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface RecentSubject {
  id: number;
  subject: string;
  createdAt: string;
}

interface RecentSubjectsProps {
  onSelectSubject: (subject: string) => void;
}

export function RecentSubjects({ onSelectSubject }: RecentSubjectsProps) {
  const { data: recentSubjects, isLoading } = useQuery<RecentSubject[]>({
    queryKey: ["/api/recent-subjects"],
    staleTime: 0,
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 3
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10" />
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
          <h3 className="text-sm font-medium text-muted-foreground">Recent Subjects</h3>
        </div>
        <p className="text-sm text-muted-foreground">No recent subjects found. Start a new conversation!</p>
      </div>
    );
  }

  // State to control how many subjects to display
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  
  // Create a unique list of subjects, maintaining the most recent order
  const uniqueSubjects: RecentSubject[] = [];
  const addedSubjects = new Set<string>();
  
  recentSubjects.forEach(subject => {
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
        <h3 className="text-sm font-medium text-muted-foreground">Recent Subjects</h3>
      </div>
      <ScrollArea className="max-h-[200px] pr-3">
        <div className="flex flex-wrap gap-2">
          {uniqueSubjects.slice(0, showAllSubjects ? uniqueSubjects.length : 10).map((subject) => (
            <Button
              key={subject.id}
              variant="outline"
              size="sm"
              className="inline-flex items-center hover:bg-accent/60 dark:text-white group"
              onClick={() => onSelectSubject(subject.subject)}
            >
              <Clock className="mr-1.5 h-3.5 w-3.5 group-hover:text-blue-500 transition-colors" />
              {subject.subject}
              <span className="ml-1.5 text-xs text-muted-foreground opacity-75">
                {new Date(subject.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
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
