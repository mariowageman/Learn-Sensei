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
    // First, get the specific topic and learning objective
    const topicResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the question and extract: 1) the main topic being tested, 2) the specific concept or skill being assessed, and 3) key terms needed to understand the answer. Return in JSON format with 'topic', 'concept', and 'keyTerms' fields. For keyTerms, provide a comma-separated string of terms."
        },
        {
          role: "user",
          content: `Question: ${question}\nCorrect Answer: ${expectedAnswer}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const topicData = JSON.parse(topicResponse.choices[0].message.content || "{}");
    const mainTopic = topicData.topic || "";
    const specificConcept = topicData.concept || "";
    // Ensure keyTerms is a string, default to empty string if undefined
    const keyTerms = typeof topicData.keyTerms === 'string' ? topicData.keyTerms : '';

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
      // Generate educational video search query using the specific topic and concept
      const searchTerms = [
        mainTopic,
        specificConcept,
        ...(keyTerms ? keyTerms.split(',').map(term => term.trim()) : [])
      ].filter(Boolean);

      // Create a highly focused search query
      const searchQuery = searchTerms.join(' ');
      const videoSuggestions = await searchEducationalVideos(searchQuery);
      result.videoSuggestions = videoSuggestions;
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