import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock, ArrowRight, X, Rss } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Footer } from "@/components/footer";
import { calculateReadingTime } from "@/lib/utils";
import { useState, useEffect } from "react";
//import { ShareButtons } from "@/components/share-buttons"; //Removed import

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  description: string;
  category: string;
  image: string;
  tags: string[];
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "effective-online-learning-tips",
    title: "5 Tips for Effective Online Learning",
    date: "February 15, 2025",
    description: "Master online learning with these essential tips and strategies. Learn how to stay focused, retain knowledge, and make the most of your educational journey.",
    category: "Education",
    image: "/assets/blog/ai-education.jpg",
    tags: ["Education", "Learning", "Study Tips", "Online Learning"],
    content: `
      Online learning has transformed education, offering flexibility and accessibility. However, staying focused and retaining knowledge requires the right approach. Whether you're self-studying or using an AI-powered platform like LearnSensei, these five tips will help you make the most of your learning experience.

      1. Set Clear Learning Goals

      Define specific and achievable objectives before starting any course. Ask yourself what you want to accomplish, what skills you aim to develop, and how you will measure your progress. LearnSensei personalizes learning paths based on your current skills, helping you set and reach meaningful milestones.

      2. Create a Distraction-Free Learning Space

      A focused environment is essential for online learning. Choose a quiet space, use noise-canceling headphones if necessary, and turn off notifications to avoid interruptions. LearnSensei optimizes your study sessions with AI-curated recommendations, ensuring you stay on track.

      3. Engage with Interactive and Multi-Format Content

      Combine different learning formats to improve retention. Watch videos for visual explanations, read summaries to reinforce key concepts, and test your knowledge with quizzes or hands-on exercises. LearnSensei's Sensei Mode offers AI-powered quizzes and personalized YouTube video explanations, making learning more engaging and effective.

      4. Apply What You Learn

      Knowledge sticks best when applied in real-world situations. Teach someone else, practice through real-life tasks, or work on projects related to your study topic. LearnSensei tracks your progress and identifies areas where you need more practice, helping you strengthen your understanding.

      5. Stay Consistent and Self-Motivated

      Consistency is key to online learning success. Set aside dedicated study time, use a habit tracker to monitor progress, and reward yourself for reaching goals. LearnSensei provides personalized insights and analytics, keeping you motivated by showing tangible improvements over time.

      Effective online learning goes beyond consuming information—it requires engagement, application, and consistency. With the right strategies and tools like LearnSensei, you can make your learning journey more efficient and rewarding. Ready to take your skills to the next level? Start exploring LearnSensei today.

      How AI Enhances Learning
      AI-powered systems can analyze a student's learning patterns, identify areas of struggle, and adapt content delivery in real-time. This personalization ensures that each student receives the support they need to succeed.

      Key Benefits:
      1. Personalized Learning Paths
      2. Immediate Feedback
      3. Adaptive Content Delivery
      4. Progress Tracking
      5. Engagement Analytics

      The Future of AI in Education
      As AI technology continues to evolve, we can expect even more innovative applications in education. Virtual reality integrations, natural language processing for better interaction, and predictive analytics for student success are just the beginning.

      Implementation Strategies
      Educational institutions can start small with AI implementation:
      - Begin with basic analytics
      - Introduce adaptive learning platforms
      - Train educators on AI tools
      - Monitor and adjust based on feedback

      Challenges and Considerations
      While AI brings many benefits, it's important to consider:
      - Data privacy and security
      - Equal access to technology
      - Balance between AI and human interaction
      - Cost of implementation

      Getting Started
      To begin implementing AI in your learning journey:
      1. Identify your learning goals
      2. Research available AI learning tools
      3. Start with one or two tools
      4. Track your progress
      5. Adjust based on results

      The Impact on Traditional Education
      AI is not replacing traditional education but enhancing it. By automating routine tasks, AI allows educators to focus on:
      - Complex problem-solving
      - Creative thinking
      - Social-emotional learning
      - Personal mentorship

      Conclusion
      AI-powered learning represents a significant step forward in education. By embracing these technologies thoughtfully, we can create more effective, engaging, and accessible learning experiences for everyone.
    `
  },
  {
    id: "effective-online-learning",
    title: "5 Tips for Effective Online Learning",
    date: "February 14, 2025",
    description: "Master the art of online learning with these proven strategies for success. Learn how to stay motivated, manage your time effectively, and achieve your learning goals.",
    category: "Learning Tips",
    image: "/assets/blog/learning-tips.jpg",
    tags: ["Online Learning", "Study Tips", "Productivity"],
    content: `
      Online learning has become increasingly popular, offering flexibility and accessibility. However, it requires different strategies than traditional classroom learning. Here are five essential tips for success in online education.

      1. Create a Dedicated Study Space
      Your environment plays a crucial role in learning effectiveness. Set up a quiet, organized space specifically for studying. This helps:
      - Minimize distractions
      - Maintain focus
      - Establish routine
      - Separate work and relaxation

      2. Develop a Schedule
      Time management is crucial for online learning success:
      - Set specific study hours
      - Break large tasks into smaller chunks
      - Use a calendar for deadlines
      - Include regular breaks
      - Stay consistent with your routine

      3. Active Engagement
      Passive reading isn't enough. Engage actively with the material:
      - Take detailed notes
      - Participate in discussions
      - Ask questions
      - Complete practice exercises
      - Teach concepts to others

      4. Utilize Available Resources
      Most online learning platforms offer various tools and resources:
      - Video tutorials
      - Interactive exercises
      - Discussion forums
      - Study guides
      - Virtual office hours

      5. Stay Connected
      Build a support network:
      - Join study groups
      - Participate in online forums
      - Connect with instructors
      - Share resources with peers
      - Seek help when needed

      Implementation Strategy
      Start by implementing one tip at a time:
      Week 1: Set up your study space
      Week 2: Create and follow a schedule
      Week 3: Practice active learning techniques
      Week 4: Explore available resources
      Week 5: Build your learning network

      Measuring Success
      Track your progress by:
      - Monitoring grades
      - Recording study hours
      - Evaluating comprehension
      - Getting feedback
      - Adjusting strategies as needed

      Common Challenges and Solutions
      Challenge: Procrastination
      Solution: Break tasks into smaller, manageable pieces

      Challenge: Technical issues
      Solution: Have backup plans and alternative devices ready

      Challenge: Motivation
      Solution: Set small, achievable goals and celebrate progress

      Challenge: Isolation
      Solution: Actively participate in online communities

      Conclusion
      Successful online learning requires dedication, organization, and the right strategies. By implementing these tips and consistently evaluating your progress, you can maximize your online learning experience and achieve your educational goals.
    `
  },
  {
    id: "future-educational-technology",
    title: "The Future of Educational Technology",
    date: "February 13, 2025",
    description: "Explore emerging trends in educational technology and their impact on modern learning. From virtual reality to adaptive learning systems, discover what's next in EdTech.",
    category: "EdTech",
    image: "/assets/blog/edtech-future.jpg",
    tags: ["EdTech", "Innovation", "Future", "Technology"],
    content: `
      Educational technology is rapidly evolving, reshaping how we learn and teach. This article explores the latest trends and innovations that are transforming education.

      Virtual and Augmented Reality
      VR and AR are creating immersive learning experiences:
      - Virtual field trips
      - 3D model exploration
      - Interactive simulations
      - Hands-on training in safe environments

      Artificial Intelligence in Education
      AI is personalizing the learning experience:
      - Adaptive learning paths
      - Automated grading
      - Intelligent tutoring
      - Predictive analytics
      - Learning pattern analysis

      Blockchain in Education
      Blockchain technology is revolutionizing credentials:
      - Secure certification
      - Skill verification
      - Credit transfer
      - Achievement tracking

      Internet of Things (IoT)
      IoT devices are enhancing the learning environment:
      - Smart classrooms
      - Connected devices
      - Real-time feedback
      - Environmental optimization

      Mobile Learning
      Mobile technology is making education more accessible:
      - Microlearning
      - Just-in-time learning
      - Social learning
      - Gamification

      Impact on Traditional Education
      These technologies are changing traditional education:
      - Blended learning models
      - Flipped classrooms
      - Personalized curriculum
      - Remote learning options

      Implementation Challenges
      Educational institutions face several challenges:
      - Cost of implementation
      - Teacher training
      - Infrastructure requirements
      - Technology integration
      - Privacy concerns

      Future Predictions
      Looking ahead, we can expect:
      - More personalized learning
      - Increased accessibility
      - Global collaboration
      - Real-time assessment
      - Lifelong learning support

      Best Practices for Adoption
      For successful implementation:
      1. Start with clear objectives
      2. Invest in training
      3. Build infrastructure gradually
      4. Monitor and evaluate
      5. Adapt based on feedback

      Conclusion
      Educational technology continues to evolve, offering new opportunities for learning and teaching. By staying informed and carefully implementing these technologies, we can create more effective and engaging educational experiences for all learners.
    `
  }
];

export default function BlogPage() {
  const [location, setLocation] = useLocation();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tag = params.get('tag');
    if (tag) {
      setSelectedTag(tag);
    }
  }, []);

  const filteredPosts = selectedTag
    ? blogPosts.filter(post => post.tags.includes(selectedTag))
    : blogPosts;

  const allTags = Array.from(
    new Set(blogPosts.flatMap(post => post.tags))
  ).sort();

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
      setLocation('/blog');
    } else {
      setSelectedTag(tag);
      setLocation(`/blog?tag=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4 mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2 whitespace-nowrap"
                onClick={() => {
                  window.location.href = '/feed.xml';
                }}
              >
                <Rss className="h-4 w-4" />
                RSS Feed
              </Button>
            </div>
            <p className="text-lg text-muted-foreground">
              Explore the latest insights in AI-powered learning and educational technology
            </p>
          </div>

          <div className="flex flex-wrap gap-2 py-4">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className={cn(
                  "cursor-pointer hover:bg-primary/80",
                  selectedTag === tag && "bg-primary text-primary-foreground"
                )}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
                {selectedTag === tag && (
                  <X className="ml-1 h-3 w-3" onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTag(null);
                    setLocation('/blog');
                  }} />
                )}
              </Badge>
            ))}
          </div>

          {selectedTag && (
            <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Showing posts tagged with "{selectedTag}"
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTag(null);
                  setLocation('/blog');
                }}
              >
                Clear filter
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative overflow-hidden">
                  <AspectRatio ratio={16/9} className="bg-muted">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className={cn(
                        "object-cover w-full h-full",
                        "transition-transform duration-500 ease-in-out",
                        "group-hover:scale-110"
                      )}
                    />
                  </AspectRatio>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {calculateReadingTime(post.content)} min read
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                    <Link href={`/blog/${post.id}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>{post.date}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground mb-4 line-clamp-3">{post.description}</p>
                  <div className="space-y-12">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTag === tag ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/80"
                          onClick={(e) => {
                            e.preventDefault();
                            handleTagClick(tag);
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/blog/${post.id}`}>
                      <Button className="w-full group mt-8">
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
      <Footer />
    </div>
  );
}