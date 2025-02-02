import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/api";

interface ConversationProps {
  subject: string;
}

interface Message {
  role: "assistant" | "user";
  content: string;
}

export function Conversation({ subject }: ConversationProps) {
  const form = useForm({
    defaultValues: {
      message: ""
    }
  });

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", subject]
  });

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      await apiRequest("POST", "/api/messages", { message, subject });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", subject] });
      form.reset();
    }
  });

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[60vh]">
        <div className="space-y-4 p-4">
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            messages?.map((message, i) => (
              <Card
                key={i}
                className={`p-4 ${
                  message.role === "assistant"
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {message.content}
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values.message))}
        className="flex gap-4"
      >
        <Input
          placeholder="Ask a follow-up question..."
          {...form.register("message")}
          disabled={mutation.isPending}
        />
        <Button type="submit" disabled={mutation.isPending}>
          Send
        </Button>
      </form>
    </div>
  );
}