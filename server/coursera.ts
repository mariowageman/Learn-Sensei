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
    start: "0",
    limit: "20",
    q: "search",
    query: "computer science", // Add a specific query
    orderBy: "popularity" // Order by popularity
  });

  console.log('Fetching courses from Coursera API...');
  console.log('API URL:', `${COURSERA_API_BASE}?${params.toString()}`);

  try {
    const auth = Buffer.from(`${process.env.COURSERA_API_KEY}:${process.env.COURSERA_API_SECRET}`).toString('base64');

    console.log('Making API request with authentication...');

    const response = await fetch(`${COURSERA_API_BASE}?${params.toString()}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('Received response status:', response.status);

    if (!response.ok) {
      console.error('Coursera API error:', response.status, response.statusText);
      const error = await response.text();
      console.error('Error details:', error);
      throw new Error(`Coursera API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    console.log('Received courses:', data.elements?.length || 0);

    if (!data.elements || data.elements.length === 0) {
      console.warn('No courses returned from API');
      // Return a sample course for testing
      return [{
        id: "1",
        slug: "introduction-to-computer-science",
        name: "Introduction to Computer Science",
        description: "Learn the basics of computer science and programming",
        workload: "10 hours",
        specializations: [],
        primaryLanguages: ["English"],
        instructors: [{
          fullName: "John Doe"
        }],
        partners: [{
          name: "Example University"
        }],
        photoUrl: "https://placekitten.com/400/300"
      }];
    }

    return courseSchema.array().parse(data.elements || []);
  } catch (error) {
    console.error('Error fetching Coursera courses:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : '');
    throw error;
  }
}