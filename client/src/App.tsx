import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import LearningPaths from "@/pages/learning-paths";
import LearningPath from "@/pages/learning-path";
import SenseiMode from "@/pages/sensei";
import CookiePolicy from "@/pages/cookie-policy";
import { DashboardPage } from "@/pages/dashboard";
import BlogPage from "@/pages/blog";
import { CookieConsent } from "@/components/cookie-consent";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Home as HomeIcon, Brain, Menu, LayoutDashboard, BookText } from "lucide-react";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import BlogPost from "@/pages/blog-post";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { ProtectedRoute } from '@/components/auth/protected-route';
import { UserMenu } from '@/components/auth/user-menu';
import { AuthProvider } from '@/lib/auth-context';
import AuthPage from "@/pages/auth";
import SettingsPage from "@/pages/settings";

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
      <Link href="/blog">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={onNavigate}
        >
          <BookText className="h-4 w-4" />
          Blog
        </Button>
      </Link>
    </>
  );
}

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    fetch('/debug/check-logo')
      .then(res => res.json())
      .then(data => {
        console.log('Logo file check:', data);
        if (!data.exists) {
          setLogoError(true);
        }
      })
      .catch(err => {
        console.error('Error checking logo:', err);
        setLogoError(true);
      });
  }, []);

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
        <div className="flex items-center gap-4">
          <div className="sm:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-2 mt-4">
                  <NavigationLinks onNavigate={() => setIsOpen(false)} />
                  <div className="px-2 mt-2">
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 sm:static sm:transform-none sm:left-0">
            <Link href="/" className="flex items-center">
              {logoError ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-12 w-12 -my-2 text-primary dark:text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  <path d="M6 8h4" />
                  <path d="M14 8h4" />
                  <path d="M6 12h4" />
                  <path d="M14 12h4" />
                </svg>
              ) : (
                <img
                  src="/learn-sensei-logo-icon.png"
                  alt="Learn Sensei Logo"
                  className="h-12 w-12 -my-2"
                  onError={(e) => {
                    console.error('Logo failed to load:', e);
                    setLogoError(true);
                  }}
                />
              )}
              <span className="sr-only">Learn Sensei</span>
            </Link>
          </div>

          <div className="w-8 sm:hidden"></div>
        </div>

        <div className="hidden sm:flex items-center justify-center flex-1">
          <NavigationLinks />
        </div>

        <div className="flex items-center">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}

function Router() {
  useScrollTop();
  return (
    <>
      <Navigation />
      <div className="flex flex-col min-h-screen">
        <Switch>
          <Route path="/auth">
            <div data-page="auth">
              <AuthPage />
            </div>
          </Route>
          <ProtectedRoute path="/settings">
            <div data-page="settings">
              <SettingsPage />
            </div>
          </ProtectedRoute>
          <ProtectedRoute path="/dashboard">
            <div data-page="dashboard">
              <DashboardPage />
            </div>
          </ProtectedRoute>
          <ProtectedRoute path="/learning-paths">
            <div data-page="learning-paths">
              <LearningPaths />
            </div>
          </ProtectedRoute>
          <ProtectedRoute path="/learning-paths/:id">
            <div data-page="learning-paths">
              <LearningPath />
            </div>
          </ProtectedRoute>
          <ProtectedRoute path="/sensei">
            <div data-page="sensei">
              <SenseiMode />
            </div>
          </ProtectedRoute>
          <Route path="/">
            <div data-page="home">
              <Home />
            </div>
          </Route>
          <Route path="/blog">
            <div data-page="blog">
              <BlogPage />
            </div>
          </Route>
          <Route path="/blog/:id">
            <div data-page="blog-post">
              <BlogPost />
            </div>
          </Route>
          <Route path="/cookie-policy">
            <div data-page="cookie-policy">
              <CookiePolicy />
            </div>
          </Route>
          <Route path="/terms">
            <div data-page="terms">
              <Terms />
            </div>
          </Route>
          <Route path="/privacy">
            <div data-page="privacy">
              <Privacy />
            </div>
          </Route>
          <Route>
            <div data-page="not-found">
              <NotFound />
            </div>
          </Route>
        </Switch>
      </div>
      <CookieConsent />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <Router />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;