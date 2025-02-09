import OpenAI from "openai";
import { searchEducationalVideos } from "./youtube";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateExplanation(subject: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a helpful tutor that explains concepts at a 6th-grade level. Return explanation in JSON format with an 'explanation' field. Keep explanations clear and engaging."
      },
      {
        role: "user",
        content: `Please explain ${subject} in simple terms and return as JSON.`
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function generateQuestion(subject: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Generate a fill-in-the-blank question about the subject with exactly one blank. Return in JSON format with 'question' and 'answer' fields."
      },
      {
        role: "user",
        content: `Create a question about ${subject}`
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function checkAnswer(question: string, expectedAnswer: string, userAnswer: string) {
  try {
    // Get the main educational concept being tested
    const topicResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the full question to understand: 1) the broader educational concept being tested, 2) any prerequisite concepts needed to understand this topic, and 3) specific technical terms used. Focus on what the student needs to learn to understand this topic, not just the specific answer. Return JSON with fields: 'mainConcept' (the primary concept), 'prerequisites' (comma-separated foundational concepts), and 'technicalTerms' (key vocabulary)."
        },
        {
          role: "user",
          content: `Question: ${question}\nCorrect Answer: ${expectedAnswer}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const conceptData = JSON.parse(topicResponse.choices[0].message.content || "{}");
    const mainConcept = conceptData.mainConcept || "";
    const prerequisites = typeof conceptData.prerequisites === 'string' ? conceptData.prerequisites : '';
    const technicalTerms = typeof conceptData.technicalTerms === 'string' ? conceptData.technicalTerms : '';

    // Check the answer
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Grade the answer and provide feedback. Return JSON with 'correct' (boolean) and 'feedback' (string) fields."
        },
        {
          role: "user",
          content: `Question: ${question}\nExpected: ${expectedAnswer}\nSubmitted: ${userAnswer}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    if (!result.correct) {
      // Create focused search queries for different aspects of the concept
      const conceptQuery = `${mainConcept} explanation tutorial`;
      const foundationQuery = prerequisites ? `${prerequisites.split(',')[0]} basics tutorial` : mainConcept;

      // Get videos for both concept explanation and foundational understanding
      const [conceptVideos, foundationVideos] = await Promise.all([
        searchEducationalVideos(conceptQuery, 2),
        searchEducationalVideos(foundationQuery, 2)
      ]);

      // Combine and deduplicate videos, prioritizing concept-specific ones
      const seenIds = new Set();
      const combinedVideos = [...conceptVideos, ...foundationVideos].filter(video => {
        if (seenIds.has(video.videoId)) return false;
        seenIds.add(video.videoId);
        return true;
      }).slice(0, 3);

      result.videoSuggestions = combinedVideos;
    }

    return result;
  } catch (error) {
    console.error('Error checking answer:', error);
    return {
      correct: false,
      feedback: "Sorry, there was an error checking your answer. Please try again.",
      videoSuggestions: []
    };
  }
}