import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 py-2">
      <Sun className="h-5 w-5 text-primary dark:text-white" />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        className="dark:bg-white/20"
      />
      <Moon className="h-5 w-5 text-primary dark:text-white" />
    </div>
  );
}
