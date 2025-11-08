import { fetchHandler } from "@/lib/apiFetch";
import { VoteCreate, VoteLoad, VoteUpdate } from "@/types/vote";
import { ActionResponse } from "@/types/global";

export const apiVote = {
  getById: (voteId: number): Promise<ActionResponse<VoteLoad>> =>
    fetchHandler(`/api/v1/vote/load/${voteId}`),

  create: (data: VoteCreate): Promise<ActionResponse<VoteLoad>> =>
    fetchHandler(`/api/v1/vote/create`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (voteId: number, data: VoteUpdate): Promise<ActionResponse<VoteLoad>> =>
    fetchHandler(`/api/v1/vote/update/${voteId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (voteId: number): Promise<ActionResponse<void>> =>
    fetchHandler(`/api/v1/vote/delete/${voteId}`, {
      method: "DELETE",
    }),
};
