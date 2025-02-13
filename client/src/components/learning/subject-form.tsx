import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters")
});

interface SubjectFormProps {
  onSubmit: (subject: string) => void;
}

export function SubjectForm({ onSubmit }: SubjectFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: ""
    }
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values.subject))}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Enter a subject (e.g. photosynthesis, quantum physics)"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-[#3F3EED] hover:bg-[#3F3EED]/90 text-white">Start Learning</Button>
      </form>
    </Form>
  );
}