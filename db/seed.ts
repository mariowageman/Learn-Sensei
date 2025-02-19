import { db } from "./index";
import { blogPosts } from "./schema";

async function seed() {
  try {
    await db.insert(blogPosts).values([
      {
        slug: "ai-learning-evolution",
        title: "The Evolution of AI in Learning: Beyond Personalization",
        description: "Discover how AI is transforming education beyond simple personalization.",
        category: "AI in Education",
        image: "/assets/blog/The-Evolution-of-AI-in-Learning-Beyond-Personalization.jpeg?v=2",
        tags: ['AI', 'Education', 'Technology', 'Personalization'],
        content: `
<h1>The Evolution of AI in Learning: Beyond Personalization</h1>

<p>Artificial intelligence (AI) is rapidly transforming the education landscape, moving beyond simple personalization to offer more profound impacts on teaching and learning.</p>

<h2>Personalized Learning Experiences</h2>
<p>AI-powered systems can adapt to individual student needs, providing customized learning paths and pacing. This ensures that students receive the support they need, when they need it.</p>

<h2>Intelligent Tutoring Systems</h2>
<p>AI tutors can provide real-time feedback and guidance, acting as virtual teaching assistants. They can identify knowledge gaps and offer targeted interventions to improve student understanding.</p>

<h2>Automated Assessment and Feedback</h2>
<p>AI can automate the grading process, freeing up educators' time and providing students with quicker feedback on their work. This allows for more efficient learning and assessment cycles.</p>

<h2>Data-Driven Insights for Educators</h2>
<p>AI systems can collect and analyze data on student performance, providing educators with valuable insights into learning patterns and areas where students may be struggling. This data-driven approach can inform instructional decisions and improve teaching effectiveness.</p>

<h2>Ethical Considerations and Future Directions</h2>
<p>While AI offers exciting possibilities, it's crucial to address ethical considerations surrounding data privacy, algorithmic bias, and the role of human interaction in education. The future of AI in learning involves continuous exploration and responsible development to maximize its benefits and minimize potential risks.</p>
        `,
        date: new Date("2024-02-15")
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