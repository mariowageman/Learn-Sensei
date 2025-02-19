
import { db } from "./index";
import { blogPosts } from "./schema";

async function seed() {
  try {
    await db.insert(blogPosts).values([
      {
        slug: "5-tips-for-effective-online-learning",
        title: "5 Tips for Effective Online Learning",
        description: "Master the art of online learning with these proven strategies for success.",
        category: "Learning Tips",
        image: "/assets/blog/learning-tips.jpg",
        tags: ['Online Learning', 'Study Tips', 'Productivity'],
        content: "Online learning has become increasingly popular...",
        date: new Date("2025-02-14")
      },
      {
        slug: "future-educational-technology",
        title: "The Future of Educational Technology",
        description: "Explore emerging trends in educational technology and their impact on modern learning.",
        category: "EdTech",
        image: "/assets/blog/edtech-future.jpg",
        tags: ['EdTech', 'Innovation', 'Future', 'Technology'],
        content: "Educational technology is rapidly evolving...",
        date: new Date("2025-02-13")
      }
    ]);
    console.log("Seed data inserted successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

seed();
