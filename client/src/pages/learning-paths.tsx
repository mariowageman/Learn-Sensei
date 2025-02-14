
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Timer, BookOpen, ArrowRight, GraduationCap, Building2, Filter, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { AVAILABLE_SUBJECTS } from "../../../server/coursera";

interface LearningPath {
  id: number;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  topics: string[];
  prerequisites: number[];
  estimatedHours: number;
  instructor: string;
  partner: string;
  photoUrl?: string;
  externalLink: string;
}

const difficultyColors = {
  beginner: "bg-green-500 hover:bg-green-600",
  intermediate: "bg-blue-500 hover:bg-blue-600",
  advanced: "bg-[#C7AB62] hover:bg-[#B69B52]",
} as const;

export default function LearningPaths() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>("recommended");

  const { data: paths, isLoading } = useQuery<LearningPath[]>({
    queryKey: ["/api/learning-paths", selectedSubject],
    queryFn: async () => {
      const url = selectedSubject === "recommended"
        ? "/api/learning-paths?recommended=true"
        : selectedSubject
          ? `/api/learning-paths?subject=${encodeURIComponent(selectedSubject)}`
          : "/api/learning-paths";
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch paths');
      return response.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-8 py-8 space-y-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Coursera Courses</h1>
            <p className="text-muted-foreground">
              Explore curated courses from leading universities and companies
            </p>
          </div>
          <div className="w-[250px]">
            <Select
              value={selectedSubject || undefined}
              onValueChange={setSelectedSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Recommended
                  </div>
                </SelectItem>
                {AVAILABLE_SUBJECTS.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container max-w-6xl mx-auto px-8 py-8 space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Coursera Courses</h1>
            <p className="text-muted-foreground">
              Explore curated courses from leading universities and companies
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-[250px]">
              <Select
                value={selectedSubject || undefined}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      Recommended
                    </div>
                  </SelectItem>
                  {AVAILABLE_SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div key={selectedSubject} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paths?.map((path) => (
            <Card key={path.id} className="flex flex-col overflow-hidden">
              {path.photoUrl && (
                <div className="relative h-48 w-full">
                  <img
                    src={path.photoUrl}
                    alt={path.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="flex flex-col p-6 flex-1">
                <div className="space-y-4">
                  <Badge
                    className={`w-fit ${difficultyColors[path.difficulty]}`}
                  >
                    {path.difficulty}
                  </Badge>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">{path.title}</h2>
                    <p className="text-muted-foreground line-clamp-2">{path.description}</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between mt-6">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {path.instructor && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>{path.instructor}</span>
                      </div>
                    )}
                    {path.partner && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{path.partner}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{path.topics.length} Topics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      <span>{path.estimatedHours} hours estimated</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button
                      className="w-full"
                      onClick={() => window.open(path.externalLink, '_blank', 'noopener,noreferrer')}
                    >
                      View on Coursera
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
