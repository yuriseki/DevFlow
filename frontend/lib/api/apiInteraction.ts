import { fetchHandler } from "@/lib/apiFetch";
import { InteractionCreate, InteractionLoad, InteractionUpdate } from "@/types/interaction";
import { ActionResponse } from "@/types/global";

export const apiInteraction = {
  getById: (interactionId: number): Promise<ActionResponse<InteractionLoad>> =>
    fetchHandler(`/api/v1/interaction/load/${interactionId}`),

  create: (data: InteractionCreate): Promise<ActionResponse<InteractionLoad>> =>
    fetchHandler(`/api/v1/interaction/create`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (interactionId: number, data: InteractionUpdate): Promise<ActionResponse<InteractionLoad>> =>
    fetchHandler(`/api/v1/interaction/update/${interactionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (interactionId: number): Promise<ActionResponse<void>> =>
    fetchHandler(`/api/v1/interaction/delete/${interactionId}`, {
      method: "DELETE",
    }),
};
