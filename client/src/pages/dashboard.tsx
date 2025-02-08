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
    <div className="container py-8 space-y-8">
      <h1 className="text-4xl font-bold mb-8">Learning Dashboard</h1>
      
      {/* Overall Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
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
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Average Accuracy</h3>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold">
              {dashboardData.overallProgress.averageAccuracy}%
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Learning Streak</h3>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold">
              {dashboardData.overallProgress.currentStreak} days
            </span>
          </div>
        </Card>
      </div>

      {/* Subject Performance Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Book className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-medium">Subject Performance</h3>
        </div>
        <div className="space-y-4">
          {dashboardData.subjectPerformance.map((subject) => (
            <div key={subject.subject} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{subject.subject}</span>
                <span className="text-sm text-muted-foreground">
                  {subject.accuracy}% accuracy
                </span>
              </div>
              <Progress value={subject.accuracy} />
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-medium">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {dashboardData.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <span className="font-medium">{activity.subject}</span>
                <p className="text-sm text-muted-foreground">{activity.type}</p>
              </div>
              <div className="text-right">
                <span className={activity.result === 'Correct' ? 'text-green-500' : 'text-red-500'}>
                  {activity.result}
                </span>
                <p className="text-sm text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
