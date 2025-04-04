import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { format } from "date-fns";
import { Pencil, Trash2, UserPlus } from "lucide-react";

// Define types based on your schema
interface User {
  id: number;
  username: string;
  roleId: number;
  createdAt: string;
  role: {
    name: string;
  };
}

interface Role {
  id: number;
  name: string;
}

const editUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  roleId: z.coerce.number(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

export function ManageUsers() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { toast } = useToast();

  // Fetch users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch roles for the select dropdown
  const { data: roles, isLoading: rolesLoading, error: rolesError } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
    onSuccess: (data) => {
      console.log("Fetched roles successfully:", data);
    },
    onError: (error) => {
      console.error("Error fetching roles:", error);
      toast({
        variant: "destructive",
        title: "Error loading roles",
        description: "Please refresh the page and try again"
      });
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 60000,
    // Make sure to handle 401 errors specially
    refetchOnWindowFocus: true
  });
  
  // Debug roles data
  console.log("Current roles state:", {
    isLoading: rolesLoading,
    error: rolesError,
    data: roles
  });
  console.log("Current roles state:", { roles, isLoading: rolesLoading, error: rolesError });

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: "",
      roleId: 0,
    },
  });

  // Create test users mutation
  const createTestUsersMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/users/create-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error("Failed to create test users");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "Test users created successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create test users",
      });
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async (data: EditUserFormValues & { userId: number }) => {
      const response = await fetch(`/api/users/${data.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditOpen(false);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
      });
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsDeleteOpen(false);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
      });
    },
  });

  const onEditSubmit = (data: EditUserFormValues) => {
    if (!selectedUser) return;
    updateMutation.mutate({ ...data, userId: selectedUser.id });
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    form.reset({
      username: user.username,
      roleId: user.roleId,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">User List</h2>
        <Button
          onClick={() => createTestUsersMutation.mutate()}
          disabled={createTestUsersMutation.isPending}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Create Test Users
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No users found. Click "Create Test Users" to add some test accounts.
                </TableCell>
              </TableRow>
            )}
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role.name}</TableCell>
                <TableCell>
                  {format(new Date(user.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(user)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit user</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete user</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] h-fit max-h-[90vh] overflow-y-auto flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex-grow flex flex-col">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onEditSubmit)} className="flex flex-col h-full space-y-4">
                {/* Form fields at the top */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="roleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value, 10))}
                          value={field.value ? String(field.value) : undefined}
                          defaultOpen={false}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a role">
                                {roles?.find((role) => role.id === field.value)?.name || "Select a role"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {rolesLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading roles...
                              </SelectItem>
                            ) : rolesError ? (
                              <SelectItem value="error" disabled>
                                Error loading roles
                              </SelectItem>
                            ) : !roles || roles.length === 0 ? (
                              <SelectItem value="empty" disabled>
                                No roles available
                              </SelectItem>
                            ) : (
                              roles.map((role) => (
                                <SelectItem key={role.id} value={String(role.id)}>
                                  {role.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Push the footer to the bottom */}
                <div className="flex-grow mt-auto pt-4">
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="w-full"
                    >
                      {updateMutation.isPending ? "Saving..." : "Save changes"}
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && deleteMutation.mutate(selectedUser.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}