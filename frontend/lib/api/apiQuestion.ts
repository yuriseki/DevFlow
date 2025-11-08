import { fetchHandler } from "@/lib/apiFetch";
import { QuestionCreate, QuestionLoad, QuestionUpdate } from "@/types/question";
import { ActionResponse } from "@/types/global";

export const apiQuestion = {
  getById: (questionId: number): Promise<ActionResponse<QuestionLoad>> =>
    fetchHandler(`/api/v1/question/load/${questionId}`),

  create: (data: QuestionCreate): Promise<ActionResponse<QuestionLoad>> =>
    fetchHandler(`/api/v1/question/create`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (questionId: number, data: QuestionUpdate): Promise<ActionResponse<QuestionLoad>> =>
    fetchHandler(`/api/v1/question/update/${questionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (questionId: number): Promise<ActionResponse<void>> =>
    fetchHandler(`/api/v1/question/delete/${questionId}`, {
      method: "DELETE",
    }),
};
