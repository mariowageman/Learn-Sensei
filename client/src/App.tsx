import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import LearningPaths from "@/pages/learning-paths";
import LearningPath from "@/pages/learning-path";
import { Button } from "@/components/ui/button";
import { BookOpen, Home as HomeIcon } from "lucide-react";

function Navigation() {
  return (
    <nav className="border-b">
      <div className="container py-4 flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <HomeIcon className="h-4 w-4" />
            Home
          </Button>
        </Link>
        <Link href="/learning-paths">
          <Button variant="ghost" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Learning Paths
          </Button>
        </Link>
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
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;