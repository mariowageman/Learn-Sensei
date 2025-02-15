import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, Award, Book } from "lucide-react";
import { ProgressStats } from "@/components/learning/progress-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/footer";
import { useState } from 'react';

interface SubjectPerformance {
  subject: string;
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;
}

interface DashboardData {
  overallProgress: {
    totalSubjects: number;
    completedSubjects: number;
    averageAccuracy: number;
    totalTimeSpent: number;
    currentStreak: number;
  };
  subjectPerformance: SubjectPerformance[];
}

export function DashboardPage() {
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
  });

  if (isLoading) {
    return <Skeleton className="h-screen w-full" />;
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <h1 className="text-4xl font-bold mb-8 text-[#111C2A] text-center">Learning Progress</h1>

        {/* Overall Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-[#3F3EED]" />
              <h3 className="font-medium">Overall Progress</h3>
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Completion</span>
                <span className="font-medium">
                  {Math.round((dashboardData.overallProgress.completedSubjects / 
                    Math.max(dashboardData.overallProgress.totalSubjects, 1)) * 100)}%
                </span>
              </div>
              <Progress 
                value={(dashboardData.overallProgress.completedSubjects / 
                  Math.max(dashboardData.overallProgress.totalSubjects, 1)) * 100}
                className="bg-gray-100 [&>[role=progressbar]]:bg-gradient-to-r [&>[role=progressbar]]:from-green-500 [&>[role=progressbar]]:to-green-600"
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#3F3EED]" />
              <h3 className="font-medium">Average Accuracy</h3>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-[#3F3EED]">
                {dashboardData.overallProgress.averageAccuracy}%
              </span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#3F3EED]" />
              <h3 className="font-medium">Learning Streak</h3>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-[#3F3EED]">
                {dashboardData.overallProgress.currentStreak} days
              </span>
            </div>
          </Card>
        </div>

        {/* Subject Performance */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#111C2A]">Subject Performance</h2>
          {dashboardData.subjectPerformance.slice(0, showAllSubjects ? dashboardData.subjectPerformance.length : 3).map((subject) => (
            <Card key={subject.subject} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-[#3F3EED]" />
                  <h3 className="text-xl font-medium">{subject.subject}</h3>
                </div>
                <span className="text-sm text-muted-foreground">
                  {subject.accuracy}% accuracy
                </span>
              </div>
              <Progress 
                value={subject.accuracy}
                className="mt-4 bg-gray-100 [&>[role=progressbar]]:bg-gradient-to-r [&>[role=progressbar]]:from-green-500 [&>[role=progressbar]]:to-green-600"
              />
            </Card>
          ))}
          {dashboardData.subjectPerformance.length > 3 && (
            <button 
              onClick={() => setShowAllSubjects(!showAllSubjects)} 
              className="mt-4 text-[#3F3EED] hover:text-[#2A2D88] text-sm font-medium flex items-center gap-1 transition-colors"
            >
              {showAllSubjects ? 'Show Less' : 'Show More'}
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`transform transition-transform ${showAllSubjects ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          )}
        </div>

        {/* Unified Learning History */}
        <div className="p-4">
          <h2 className="text-2xl font-semibold text-[#111C2A] mb-6">Learning History</h2>
          <ProgressStats subject="all" />
        </div>
      </div>
      <Footer />
    </div>
  );
}