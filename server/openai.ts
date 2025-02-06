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
        content: `Grade the answer and provide feedback. For incorrect answers, suggest 3 verified, popular educational YouTube videos from well-known channels like Khan Academy, Crash Course, or similar trusted educational content creators. The videos should be specifically about ${question.split(' ').slice(0, 3).join(' ')}. 

Return JSON with these fields:
- 'correct' (boolean)
- 'feedback' (string)
- 'videoSuggestions' (array of objects with 'title' and 'videoId' fields)

For videoId examples:
- Khan Academy videos (e.g., "aqm7QtiXSfs")
- Crash Course videos (e.g., "TeYJ59td7TU")
- National Geographic videos (e.g., "1TQBc7n6B7Y")

Make sure each videoId is exactly 11 characters and comes from a verified educational channel.`
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
    result.videoSuggestions = result.videoSuggestions
      .filter((v: any) => 
        v && typeof v.videoId === 'string' && v.videoId.length === 11
      )
      .slice(0, 3); // Ensure we only return up to 3 videos
  }

  return result;
}