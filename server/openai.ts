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
    // Extract what the question is specifically testing
    const topicResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze this question and identify the exact concept or principle that the student needs help understanding. Consider the full context of the question, not just the blank part. Return JSON with fields: 'concept' (the exact concept/principle this question is testing), 'focusedSearch' (2-3 key terms that would help find a good tutorial about this specific concept)."
        },
        {
          role: "user",
          content: `Question: ${question}\nCorrect Answer: ${expectedAnswer}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const conceptData = JSON.parse(topicResponse.choices[0].message.content || "{}");
    const specificConcept = conceptData.concept || "";
    const searchTerms = conceptData.focusedSearch || "";

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
      // Create two targeted search queries using the specific concept and search terms
      const primaryQuery = `${specificConcept} tutorial how to`;
      const secondaryQuery = `${searchTerms} explained`;

      // Get videos for both the specific concept and the focused search terms
      const [conceptVideos, termVideos] = await Promise.all([
        searchEducationalVideos(primaryQuery, 2),
        searchEducationalVideos(secondaryQuery, 2)
      ]);

      // Combine and deduplicate videos, prioritizing concept-specific ones
      const seenIds = new Set();
      const combinedVideos = [...conceptVideos, ...termVideos].filter(video => {
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