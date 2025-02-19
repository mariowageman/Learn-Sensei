
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
        content: `
<h1>5 Tips for Effective Online Learning</h1>

<p>Online learning has transformed education, offering flexibility and accessibility like never before. However, it also presents unique challenges that require specific strategies to overcome.</p>

<h2>1. Create a Dedicated Study Space</h2>
<p>Your environment plays a crucial role in learning effectiveness:</p>
<ul>
  <li>Choose a quiet, well-lit area</li>
  <li>Ensure proper seating and desk setup</li>
  <li>Keep necessary materials within reach</li>
</ul>

<h2>2. Establish a Consistent Schedule</h2>
<p>Routine is key to successful online learning:</p>
<ul>
  <li>Set specific study hours</li>
  <li>Create daily and weekly goals</li>
  <li>Use a digital calendar for reminders</li>
</ul>

<h2>3. Practice Active Learning</h2>
<p>Engage actively with the material through:</p>
<ul>
  <li>Taking detailed notes</li>
  <li>Participating in online discussions</li>
  <li>Creating mind maps and summaries</li>
</ul>

<h2>4. Minimize Distractions</h2>
<p>Stay focused during study sessions:</p>
<ul>
  <li>Turn off phone notifications</li>
  <li>Use website blockers</li>
  <li>Communicate boundaries to family/roommates</li>
</ul>

<h2>5. Take Regular Breaks</h2>
<p>Maintain productivity with the Pomodoro Technique:</p>
<ul>
  <li>Study for 25 minutes</li>
  <li>Take a 5-minute break</li>
  <li>Take longer breaks after 4 sessions</li>
</ul>`,
        date: new Date("2024-02-14")
      },
      {
        slug: "future-educational-technology",
        title: "The Future of Educational Technology",
        description: "Explore emerging trends in educational technology and their impact on modern learning.",
        category: "EdTech",
        image: "/assets/blog/edtech-future.jpg",
        tags: ['EdTech', 'Innovation', 'Future', 'Technology'],
        content: `
<h1>The Future of Educational Technology</h1>

<p>Educational technology is rapidly evolving, reshaping how we learn and teach. Let's explore the key trends that are transforming education.</p>

<h2>Artificial Intelligence in Education</h2>
<p>AI is revolutionizing personalized learning through:</p>
<ul>
  <li>Adaptive learning platforms</li>
  <li>Automated grading systems</li>
  <li>Intelligent tutoring systems</li>
</ul>

<h2>Virtual and Augmented Reality</h2>
<p>Immersive technologies are enhancing learning experiences:</p>
<ul>
  <li>Virtual field trips and simulations</li>
  <li>3D modeling for complex concepts</li>
  <li>Interactive learning environments</li>
</ul>

<h2>Gamification and Learning</h2>
<p>Game-based learning elements increase engagement through:</p>
<ul>
  <li>Achievement systems</li>
  <li>Progress tracking</li>
  <li>Interactive challenges</li>
</ul>

<h2>Mobile Learning</h2>
<p>Mobile technology enables:</p>
<ul>
  <li>Learning on-the-go</li>
  <li>Microlearning modules</li>
  <li>Social learning communities</li>
</ul>`,
        date: new Date("2024-02-13").toISOString().split('T')[0]
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
