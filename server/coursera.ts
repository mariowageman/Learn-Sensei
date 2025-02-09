import { z } from "zod";

const courseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  photoUrl: z.string().optional(),
  description: z.string(),
  workload: z.string().optional(),
  specializations: z.array(z.unknown()).optional().default([]),
  primaryLanguages: z.array(z.string()).optional().default([]),
  subtitleLanguages: z.array(z.string()).optional().default([]),
  partnerLogo: z.string().optional(),
  instructors: z.array(z.object({
    fullName: z.string(),
    title: z.string().optional(),
    department: z.string().optional(),
  })).optional().default([]),
  partners: z.array(z.object({
    name: z.string(),
    shortName: z.string().optional(),
  })).optional().default([]),
});

export type CourseraCourse = z.infer<typeof courseSchema>;

const COURSERA_API_BASE = "https://api.coursera.org/api/courses.v1";

// Common subjects that users might be interested in
export const AVAILABLE_SUBJECTS = [
  "Computer Science",
  "Data Science",
  "Business",
  "Mathematics",
  "Language Learning",
  "Art & Design",
  "Social Sciences",
  "Personal Development",
  "Health & Medicine",
  "Physical Science",
] as const;

export type Subject = typeof AVAILABLE_SUBJECTS[number];

export async function fetchCourseraCourses(subject?: string): Promise<CourseraCourse[]> {
  const params = new URLSearchParams({
    fields: "photoUrl,description,workload,specializations,primaryLanguages,subtitleLanguages,partnerLogo,instructors,partners",
    includes: "instructors,partners",
    start: "0",
    limit: "20",
    q: "search",
    query: subject ? subject.toLowerCase().replace(/\s+/g, ' ') : "computer science",
    orderBy: "popularity"
  });

  console.log('Fetching courses from Coursera API...', { subject, url: `${COURSERA_API_BASE}?${params.toString()}` });

  try {
    const auth = Buffer.from(`${process.env.COURSERA_API_KEY}:${process.env.COURSERA_API_SECRET}`).toString('base64');

    const response = await fetch(`${COURSERA_API_BASE}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Coursera API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);

      // Return sample data for development
      return getSampleCourses(subject);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    if (!data.elements || data.elements.length === 0) {
      console.warn('No courses returned from API, using sample data');
      return getSampleCourses(subject);
    }

    return courseSchema.array().parse(data.elements);
  } catch (error) {
    console.error('Error fetching Coursera courses:', error);
    return getSampleCourses(subject);
  }
}

function getSampleCourses(subject?: string): CourseraCourse[] {
  const subjectTitle = subject || "Computer Science";
  return Array(6).fill(null).map((_, index) => ({
    id: `sample-${index + 1}`,
    slug: `introduction-to-${subjectTitle.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
    name: `${subjectTitle} Course ${index + 1}`,
    description: `Learn ${subjectTitle} with our comprehensive course ${index + 1}`,
    workload: `${10 + index * 5} hours`,
    specializations: [],
    primaryLanguages: ["English"],
    subtitleLanguages: ["English"],
    instructors: [{
      fullName: `Prof. John Doe ${index + 1}`,
      title: `${subjectTitle} Professor`,
      department: `Department of ${subjectTitle}`
    }],
    partners: [{
      name: "Example University",
      shortName: "EU"
    }],
    photoUrl: `https://placekitten.com/${400 + index}/${300 + index}`
  }));
}