import { NextRequest } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const { messages }: { messages: Message[] } = await req.json();

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: `
      You are a professional career counselor. 
      Your goal is to ask questions to the user 
      and to provide a job description that matches the user's skills and experience.
      Please return only the question, without any additional text.
      The questions are going to be read by a voice assistant, 
      so do not use any special characters or markdown formatting.
    `,
    messages: messages,
  });

  return result.toDataStreamResponse();
}