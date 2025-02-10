
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Clock } from "lucide-react";

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
    staleTime: 30000
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
    return null;
  }

  const uniqueSubjects = Array.from(new Set(recentSubjects.map(s => s.subject))).map(subject => 
    recentSubjects.find(s => s.subject === subject)!
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <History className="h-4 w-4" />
        <h3 className="text-sm font-medium">Recent Subjects</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {uniqueSubjects.map((subject) => (
          <Button
            key={subject.id}
            variant="outline"
            size="sm"
            className="inline-flex items-center hover:bg-accent/60"
            onClick={() => onSelectSubject(subject.subject)}
          >
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            {subject.subject}
          </Button>
        ))}
      </div>
    </div>
  );
}
