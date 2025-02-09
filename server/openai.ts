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
  // First, get the core concept and subject area being tested
  const conceptResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Extract the main educational concept being tested and the broader subject area. Return in JSON format with 'concept' (2-3 words) and 'subject' (1 word) fields describing the core topic and its broader category."
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
  const subjectArea = conceptData.subject || "";

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
    // Extract key terms for a more focused search
    const keyTermsResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Extract 2-3 key educational terms from the question and answer that would be most helpful for finding a relevant tutorial video. Return in JSON format with a 'terms' field containing a comma-separated list."
        },
        {
          role: "user",
          content: `Question: ${question}\nCorrect Answer: ${expectedAnswer}\nSubject Area: ${subjectArea}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const keyTermsData = JSON.parse(keyTermsResponse.choices[0].message.content || "{}");
    const keyTerms = keyTermsData.terms || "";

    // Create a highly focused search query combining all relevant information
    const searchQuery = `${subjectArea} ${concept} ${keyTerms} lesson`;
    const videoSuggestions = await searchEducationalVideos(searchQuery);
    result.videoSuggestions = videoSuggestions;
  }

  return result;
}