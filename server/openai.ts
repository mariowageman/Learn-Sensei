import OpenAI from "openai";

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
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Grade the answer and provide feedback. For incorrect answers, suggest 3 educational YouTube videos that would help learn this concept. Return JSON with 'correct' (boolean), 'feedback' (string), and 'videoSuggestions' (array of objects with 'title' and 'videoId' fields) fields. For videoId, ONLY return the YouTube video ID (e.g., for 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', return 'dQw4w9WgXcQ'). Make sure the videoId is exactly 11 characters long."
      },
      {
        role: "user",
        content: `Question: ${question}\nExpected: ${expectedAnswer}\nSubmitted: ${userAnswer}`
      }
    ],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");

  // Ensure videoSuggestions are properly formatted
  if (!result.correct && Array.isArray(result.videoSuggestions)) {
    result.videoSuggestions = result.videoSuggestions.filter((v: any) => 
      v && typeof v.videoId === 'string' && v.videoId.length === 11
    );
  }

  return result;
}