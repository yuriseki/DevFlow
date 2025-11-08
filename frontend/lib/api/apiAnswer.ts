import { fetchHandler } from "@/lib/apiFetch";
import { AnswerCreate, AnswerLoad, AnswerUpdate } from "@/types/answer";
import { ActionResponse } from "@/types/global";

export const apiAnswer = {
  getById: (answerId: number): Promise<ActionResponse<AnswerLoad>> =>
    fetchHandler(`/api/v1/answer/load/${answerId}`),

  create: (data: AnswerCreate): Promise<ActionResponse<AnswerLoad>> =>
    fetchHandler(`/api/v1/answer/create`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (answerId: number, data: AnswerUpdate): Promise<ActionResponse<AnswerLoad>> =>
    fetchHandler(`/api/v1/answer/update/${answerId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (answerId: number): Promise<ActionResponse<void>> =>
    fetchHandler(`/api/v1/answer/delete/${answerId}`, {
      method: "DELETE",
    }),
};
