import OpenAI from "openai";
import { searchEducationalVideos } from "./youtube";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
  // First, get the core concept being tested
  const conceptResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Extract the main educational concept being tested in this question. Return in JSON format with a 'concept' field containing a short phrase (2-3 words max) describing the core concept."
      },
      {
        role: "user",
        content: `Question: ${question}\nAnswer: ${expectedAnswer}`
      }
    ],
    response_format: { type: "json_object" }
  });

  const conceptData = JSON.parse(conceptResponse.choices[0].message.content || "{}");
  const concept = conceptData.concept || "";

  // Then check the answer
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
    // Create a more focused search query using both the question topic and correct answer
    const searchQuery = `${concept} ${expectedAnswer} explanation tutorial`;
    const videoSuggestions = await searchEducationalVideos(searchQuery);
    result.videoSuggestions = videoSuggestions;
  }

  return result;
}