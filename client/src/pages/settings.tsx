import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManageUsers } from "@/components/admin/manage-users";
import { 
  User, 
  Shield, 
  Bell, 
  Lock,
  LogOut,
  Calendar,
  Clock,
  Users
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'subscriber':
        return 'default';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full platform access and management capabilities';
      case 'subscriber':
        return 'Premium features and content access';
      case 'moderator':
        return 'Content moderation and management privileges';
      default:
        return 'Standard platform features and access';
    }
  };

  return (
    <div className="min-h-screen bg-background pt-8 pb-12">
      <div className="container max-w-6xl mx-auto px-4 space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground text-lg">
            Manage your account profile and preferences
          </p>
        </div>

        <Separator className="my-6" />

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            {user.role === 'admin' && (
              <TabsTrigger value="manage-users" className="gap-2">
                <Users className="h-4 w-4" />
                Manage Users
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Profile Overview Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-2xl bg-primary/10">
                        {user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <CardTitle className="text-2xl">{user.username}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getRoleBadgeVariant(user.role)} className="text-sm">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Account Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Details
                  </CardTitle>
                  <CardDescription>
                    Your account information and status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Username</span>
                      <span className="text-sm text-muted-foreground">{user.username}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Account ID</span>
                      <span className="text-sm text-muted-foreground">{user.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Account Status</span>
                      <Badge variant="outline" className="text-sm">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Role & Permissions Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Role & Permissions
                  </CardTitle>
                  <CardDescription>
                    Your access level and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Current Role</span>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getRoleDescription(user.role)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex items-center justify-center mt-4 mb-16 md:mb-4">
              <Button 
                variant="destructive" 
                onClick={logout}
                className="w-auto"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </TabsContent>

          {user.role === 'admin' && (
            <TabsContent value="manage-users">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ManageUsers />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}