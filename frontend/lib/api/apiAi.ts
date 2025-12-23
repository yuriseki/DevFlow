import { ActionResponse } from "@/types/global";
import { POST as generateAnswer } from "../../app/api/ai/answers/route";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_NEXT_URL || "http://localhost:3000/api";

export const apiAI = {
  getAnswer: async (
    question: string,
    content: string
  ): Promise<ActionResponse<string>> => {
    const req = new Request(API_BASE_URL, {
      method: "POST",
      body: JSON.stringify({ question, content }),
    });
    const res = await generateAnswer(req);
    return res.json();
  },
};
