import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Home from "@/pages/home";
import LearningPaths from "@/pages/learning-paths";
import LearningPath from "@/pages/learning-path";
import SenseiMode from "@/pages/sensei";
import { DashboardPage } from "@/pages/dashboard";

const Stack = createNativeStackNavigator();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Dashboard" component={DashboardPage} />
          <Stack.Screen name="LearningPaths" component={LearningPaths} />
          <Stack.Screen name="LearningPath" component={LearningPath} />
          <Stack.Screen name="Sensei" component={SenseiMode} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}

export default App;