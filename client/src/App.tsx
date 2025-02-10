import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import LearningPaths from "@/pages/learning-paths";
import LearningPath from "@/pages/learning-path";
import SenseiMode from "@/pages/sensei";
import { DashboardPage } from "@/pages/dashboard";
import { Button } from "@/components/ui/button";
import { BookOpen, Home as HomeIcon, Brain, Menu, LayoutDashboard } from "lucide-react";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Link href="/">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2"
          onClick={onNavigate}
        >
          <HomeIcon className="h-4 w-4" />
          Home
        </Button>
      </Link>
      <Link href="/sensei">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2"
          onClick={onNavigate}
        >
          <Brain className="h-4 w-4" />
          Sensei Mode
        </Button>
      </Link>
      <Link href="/learning-paths">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2"
          onClick={onNavigate}
        >
          <BookOpen className="h-4 w-4" />
          Learning Paths
        </Button>
      </Link>
      <Link href="/dashboard">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2"
          onClick={onNavigate}
        >
          <LayoutDashboard className="h-4 w-4" />
          Progress
        </Button>
      </Link>
    </>
  );
}

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!isOpen && touch.clientX < 30) {
        setTouchStart({ x: touch.clientX, y: touch.clientY });
      } else if (isOpen) {
        setTouchStart({ x: touch.clientX, y: touch.clientY });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = Math.abs(touch.clientY - touchStart.y);

      if (Math.abs(deltaX) > deltaY) {
        if (!isOpen && deltaX > 50) {
          setIsOpen(true);
          setTouchStart(null);
        } else if (isOpen && deltaX < -50) {
          setIsOpen(false);
          setTouchStart(null);
        }
      }
    };

    const handleTouchEnd = () => {
      setTouchStart(null);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, isOpen]);

  return (
    <nav className="border-b">
      <div className="container max-w-6xl mx-auto py-4 px-4 flex items-center justify-between">
        {/* Mobile Menu and Logo */}
        <div className="flex items-center gap-4">
          <div className="sm:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="p-1">
                  <Menu className="h-10 w-10" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-2 mt-4">
                  <NavigationLinks onNavigate={() => setIsOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo - centered on mobile, left-aligned on desktop */}
          <div className="absolute left-1/2 -translate-x-1/2 sm:static sm:transform-none sm:left-0">
            <Link href="/" className="flex items-center">
              <img 
                src="/src/assets/learn-sensei-logo-icon.svg"
                alt="Learn Sensei Logo"
                className="h-12 w-12 -my-2 hover:opacity-90 transition-opacity"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
              />
            </Link>
          </div>

          {/* Placeholder div to maintain mobile layout */}
          <div className="w-8 sm:hidden"></div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center justify-center flex-1">
          <NavigationLinks />
        </div>

        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/learning-paths" component={LearningPaths} />
        <Route path="/learning-paths/:id" component={LearningPath} />
        <Route path="/sensei" component={SenseiMode} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;