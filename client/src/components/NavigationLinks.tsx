import { Link, useLocation } from "wouter";
import { navigationMenuTriggerStyle } from "./ui/navigation-menu";
import { cn } from "@/lib/utils";

export default function NavigationLinks() {
  const [location] = useLocation();

  return (
    <div className="flex items-center gap-6">
      <Link 
        href="/dashboard" 
        className={cn(navigationMenuTriggerStyle(), {
          'bg-[#3F3EED]/10 text-[#3F3EED]': location === '/dashboard'
        })}
      >
        Dashboard
      </Link>
      <Link 
        href="/learning-paths" 
        className={cn(navigationMenuTriggerStyle(), {
          'bg-[#3F3EED]/10 text-[#3F3EED]': location === '/learning-paths'
        })}
      >
        Learning Paths
      </Link>
      <Link 
        href="/sensei" 
        className={cn(navigationMenuTriggerStyle(), {
          'bg-[#3F3EED]/10 text-[#3F3EED]': location === '/sensei'
        })}
      >
        Sensei Mode
      </Link>
    </div>
  );
}