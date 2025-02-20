import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";

export default function AuthPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      const redirectPath = sessionStorage.getItem('redirectPath') || '/';
      sessionStorage.removeItem('redirectPath');
      setLocation(redirectPath);
    }
  }, [user, setLocation]);

  return (
    <div className="container relative min-h-[calc(100vh-40px)] mt-[40px] flex flex-col items-center justify-start px-4 pt-4">
      <div className="w-full max-w-[450px] mx-auto">
        <div className="flex w-full flex-col justify-start sm:justify-center space-y-4 sm:space-y-6 sm:w-[350px] mx-auto">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome to Learn Sensei
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account or create a new one
            </p>
          </div>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Card>
                <LoginForm />
              </Card>
            </TabsContent>
            <TabsContent value="register">
              <Card>
                <RegisterForm />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
