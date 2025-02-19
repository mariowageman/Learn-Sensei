import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return (
      <Button 
        variant="ghost" 
        onClick={() => setLocation("/auth")}
        className="flex items-center gap-2 dark:text-white"
      >
        <UserIcon className="h-4 w-4" />
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback>
              {user.email?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem className="flex-col items-start">
          <div className="font-medium truncate max-w-[200px] break-words">{user.email}</div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocation("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}