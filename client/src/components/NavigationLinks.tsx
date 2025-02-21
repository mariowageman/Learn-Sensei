
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function NavigationLinks() {
  const [location] = useLocation();

  const linkStyle = "inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50";
  const activeLinkStyle = "bg-[#3F3EED]/10 text-[#3F3EED]";

  return (
    <div className="flex items-center gap-6">
      <Link 
        href="/dashboard" 
        className={cn(linkStyle, {
          [activeLinkStyle]: location === '/dashboard'
        })}
      >
        Dashboard
      </Link>
      <Link 
        href="/learning-paths" 
        className={cn(linkStyle, {
          [activeLinkStyle]: location === '/learning-paths'
        })}
      >
        Learning Paths
      </Link>
      <Link 
        href="/sensei" 
        className={cn(linkStyle, {
          [activeLinkStyle]: location === '/sensei'
        })}
      >
        Sensei Mode
      </Link>
    </div>
  );
}
