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
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Home as HomeIcon, Brain, Menu, LayoutDashboard, BookText } from "lucide-react";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import BlogPost from "@/pages/blog-post";
import CreateBlog from "@/pages/create-blog";
import Home2 from "@/pages/home2";
import { useScroll } from "@/hooks/use-scroll-top";
import { ProtectedRoute } from '@/components/auth/protected-route';
import { UserMenu } from '@/components/auth/user-menu';
import { AuthProvider } from '@/lib/auth-context';
import AuthPage from "@/pages/auth";
import SettingsPage from "@/pages/settings";
import cn from 'classnames';
import { useLocation } from "wouter";

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();

  return (
    <>
      <Link href="/">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 dark:text-white",
            location === "/" && "bg-accent text-accent-foreground"
          )}
          onClick={onNavigate}
        >
          <HomeIcon className="h-4 w-4" />
          Home
        </Button>
      </Link>
      <Link href="/sensei">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 dark:text-white",
            location === "/sensei" && "bg-accent text-accent-foreground"
          )}
          onClick={onNavigate}
        >
          <Brain className="h-4 w-4" />
          Sensei Mode
        </Button>
      </Link>
      <Link href="/learning-paths">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 dark:text-white",
            location === "/learning-paths" && "bg-accent text-accent-foreground"
          )}
          onClick={onNavigate}
        >
          <BookOpen className="h-4 w-4" />
          Learning Paths
        </Button>
      </Link>
      <Link href="/dashboard">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 dark:text-white",
            location === "/dashboard" && "bg-accent text-accent-foreground"
          )}
          onClick={onNavigate}
        >
          <LayoutDashboard className="h-4 w-4" />
          Progress
        </Button>
      </Link>
      <Link href="/blog">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 dark:text-white",
            location === "/blog" && "bg-accent text-accent-foreground"
          )}
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
  const { isVisible } = useScroll();
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [location] = useLocation();

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const windowWidth = window.innerWidth;
      if (!isOpen && touch.clientX > windowWidth - 30) {
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
        if (!isOpen && deltaX < -50) {
          setIsOpen(true);
          setTouchStart(null);
        } else if (isOpen && deltaX > 50) {
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
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="container max-w-6xl mx-auto py-4 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img
              src="/logo.svg"
              alt="Learn Sensei Logo"
              className="h-12 w-12 -my-2"
            />
            <span className="sr-only">Learn Sensei</span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center justify-center flex-1">
          <NavigationLinks />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
          <UserMenu />
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 pt-20">
                <div className="flex flex-col gap-4">
                  <Link href="/">
                    <SheetClose asChild>
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full justify-start gap-2 dark:text-white",
                          location === "/" && "bg-accent text-accent-foreground"
                        )}
                      >
                        <HomeIcon className="h-4 w-4" />
                        Home
                      </Button>
                    </SheetClose>
                  </Link>
                  <Link href="/sensei">
                    <SheetClose asChild>
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full justify-start gap-2 dark:text-white",
                          location === "/sensei" && "bg-accent text-accent-foreground"
                        )}
                      >
                        <Brain className="h-4 w-4" />
                        Sensei Mode
                      </Button>
                    </SheetClose>
                  </Link>
                  <Link href="/learning-paths">
                    <SheetClose asChild>
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full justify-start gap-2 dark:text-white",
                          location === "/learning-paths" && "bg-accent text-accent-foreground"
                        )}
                      >
                        <BookOpen className="h-4 w-4" />
                        Learning Paths
                      </Button>
                    </SheetClose>
                  </Link>
                  <Link href="/dashboard">
                    <SheetClose asChild>
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full justify-start gap-2 dark:text-white",
                          location === "/dashboard" && "bg-accent text-accent-foreground"
                        )}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Progress
                      </Button>
                    </SheetClose>
                  </Link>
                  <Link href="/blog">
                    <SheetClose asChild>
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full justify-start gap-2 dark:text-white",
                          location === "/blog" && "bg-accent text-accent-foreground"
                        )}
                      >
                        <BookText className="h-4 w-4" />
                        Blog
                      </Button>
                    </SheetClose>
                  </Link>
                  <div className="px-2">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  const { isVisible } = useScroll();
  return (
    <>
      <Navigation />
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        isVisible ? "pt-[73px]" : "pt-0"
      )}>
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
          <Route path="/create-blog">
            <div data-page="create-blog">
              <CreateBlog />
            </div>
          </Route>
          <Route path="/home2">
            <div data-page="home2">
              <Home2 />
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