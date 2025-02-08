import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Gauge, Turtle, Clock, Rocket } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

interface IntensityAdjusterProps {
  pathId: number;
  currentIntensity?: string;
}

const intensityLevels = {
  relaxed: {
    icon: Turtle,
    label: "Relaxed Pace",
    description: "Take your time, focus on understanding"
  },
  normal: {
    icon: Clock,
    label: "Normal Pace",
    description: "Balanced learning experience"
  },
  intensive: {
    icon: Rocket,
    label: "Intensive Mode",
    description: "Accelerated learning path"
  }
} as const;

export function IntensityAdjuster({ pathId, currentIntensity = 'normal' }: IntensityAdjusterProps) {
  const updateIntensityMutation = useMutation({
    mutationFn: async (intensity: string) => {
      const response = await apiRequest(
        "PATCH",
        `/api/learning-paths/${pathId}/intensity`,
        { intensity }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/learning-paths/${pathId}`] });
    }
  });

  const currentLevel = intensityLevels[currentIntensity as keyof typeof intensityLevels];
  const CurrentIcon = currentLevel?.icon || Gauge;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          disabled={updateIntensityMutation.isPending}
        >
          <CurrentIcon className="h-4 w-4" />
          {currentLevel?.label || "Adjust Intensity"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {Object.entries(intensityLevels).map(([key, { icon: Icon, label, description }]) => (
          <DropdownMenuItem
            key={key}
            className="flex items-start gap-2 p-3"
            disabled={key === currentIntensity || updateIntensityMutation.isPending}
            onClick={() => updateIntensityMutation.mutate(key)}
          >
            <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
