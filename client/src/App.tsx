
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Route, Switch } from "wouter";
import Home from "@/pages/home";
import LearningPaths from "@/pages/learning-paths";
import LearningPath from "@/pages/learning-path";
import SenseiMode from "@/pages/sensei";
import { DashboardPage } from "@/pages/dashboard";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/learning-paths" component={LearningPaths} />
        <Route path="/learning-path" component={LearningPath} />
        <Route path="/sensei" component={SenseiMode} />
      </Switch>
    </QueryClientProvider>
  );
}

export default App;
