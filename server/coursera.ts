import { z } from "zod";

const courseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  photoUrl: z.string().optional(),
  description: z.string(),
  workload: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  primaryLanguages: z.array(z.string()).optional(),
  subtitleLanguages: z.array(z.string()).optional(),
  partnerLogo: z.string().optional(),
  instructors: z.array(z.object({
    fullName: z.string(),
    title: z.string().optional(),
    department: z.string().optional(),
  })),
  partners: z.array(z.object({
    name: z.string(),
    shortName: z.string().optional(),
  })),
});

export type CourseraCourse = z.infer<typeof courseSchema>;

const COURSERA_API_BASE = "https://api.coursera.org/api/courses.v1";

export async function fetchCourseraCourses(): Promise<CourseraCourse[]> {
  const params = new URLSearchParams({
    fields: "photoUrl,description,workload,specializations,primaryLanguages,subtitleLanguages,partnerLogo,instructors,partners",
    includes: "instructors,partners",
    q: "search",
    limit: "20",
    start: "0"
  });

  const response = await fetch(`${COURSERA_API_BASE}?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${process.env.COURSERA_API_KEY}:${process.env.COURSERA_API_SECRET}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Coursera API error: ${response.statusText}`);
  }

  const data = await response.json();
  return courseSchema.array().parse(data.elements);
}
