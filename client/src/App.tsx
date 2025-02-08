import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import LearningPaths from "@/pages/learning-paths";
import LearningPath from "@/pages/learning-path";
import SenseiMode from "@/pages/sensei";
import { Button } from "@/components/ui/button";
import { BookOpen, Home as HomeIcon, Brain, Menu } from "lucide-react";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

function NavigationLinks() {
  return (
    <>
      <Link href="/">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <HomeIcon className="h-4 w-4" />
          Home
        </Button>
      </Link>
      <Link href="/sensei">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Brain className="h-4 w-4" />
          Sensei Mode
        </Button>
      </Link>
      <Link href="/learning-paths">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <BookOpen className="h-4 w-4" />
          Learning Paths
        </Button>
      </Link>
    </>
  );
}

function Navigation() {
  return (
    <nav className="border-b">
      <div className="container py-4 px-4 flex items-center justify-between">
        {/* Mobile Menu */}
        <div className="sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col gap-2 mt-4">
                <NavigationLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-4">
          <NavigationLinks />
        </div>

        <ThemeToggle />
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