import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, TrendingUp, Clock, Award, Book } from "lucide-react";
import { ProgressStats } from "@/components/learning/progress-stats";
import { Skeleton } from "@/components/ui/skeleton";

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
  recentActivity: {
    subject: string;
    type: string;
    result: string;
    timestamp: string;
  }[];
}

export function DashboardPage() {
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
    <div className="container max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
      <h1 className="text-4xl font-bold mb-8 text-[#3A3D98] text-center">Progress</h1>

      {/* Overall Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-[#3A3D98]" />
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
            <Target className="h-5 w-5 text-[#3A3D98]" />
            <h3 className="font-medium">Average Accuracy</h3>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-[#3A3D98]">
              {dashboardData.overallProgress.averageAccuracy}%
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#3A3D98]" />
            <h3 className="font-medium">Learning Streak</h3>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-[#3A3D98]">
              {dashboardData.overallProgress.currentStreak} days
            </span>
          </div>
        </Card>
      </div>

      {/* Subject Performance Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Book className="h-5 w-5 text-[#3A3D98]" />
          <h3 className="text-xl font-medium">Subject Performance</h3>
        </div>
        <div className="space-y-8">
          {dashboardData.subjectPerformance.map((subject) => (
            <div key={subject.subject} className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{subject.subject}</span>
                <span className="text-sm text-muted-foreground">
                  {subject.accuracy}% accuracy
                </span>
              </div>
              <Progress 
                value={subject.accuracy}
                className="bg-gray-100 [&>[role=progressbar]]:bg-gradient-to-r [&>[role=progressbar]]:from-green-500 [&>[role=progressbar]]:to-green-600"
              />
              {/* Learning History for each subject */}
              <div className="mt-4 border-t pt-4">
                <ProgressStats subject={subject.subject} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}