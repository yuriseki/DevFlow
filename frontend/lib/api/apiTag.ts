import { fetchHandler } from "@/lib/apiFetch";
import { TagCreate, TagLoad, TagUpdate } from "@/types/tag";
import { ActionResponse } from "@/types/global";

export const apiTag = {
  getById: (tagId: number): Promise<ActionResponse<TagLoad>> =>
    fetchHandler(`/api/v1/tag/load/${tagId}`),

  create: (data: TagCreate): Promise<ActionResponse<TagLoad>> =>
    fetchHandler(`/api/v1/tag/create`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (tagId: number, data: TagUpdate): Promise<ActionResponse<TagLoad>> =>
    fetchHandler(`/api/v1/tag/update/${tagId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (tagId: number): Promise<ActionResponse<void>> =>
    fetchHandler(`/api/v1/tag/delete/${tagId}`, {
      method: "DELETE",
    }),
};
