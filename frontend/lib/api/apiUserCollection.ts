import { fetchHandler } from "@/lib/apiFetch";
import { UserCollectionCreate, UserCollectionLoad, UserCollectionUpdate } from "@/types/user_collection";
import { ActionResponse } from "@/types/global";

export const apiUserCollection = {
  getById: (userCollectionId: number): Promise<ActionResponse<UserCollectionLoad>> =>
    fetchHandler(`/api/v1/user__collection/load/${userCollectionId}`),

  create: (data: UserCollectionCreate): Promise<ActionResponse<UserCollectionLoad>> =>
    fetchHandler(`/api/v1/user__collection/create`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (userCollectionId: number, data: UserCollectionUpdate): Promise<ActionResponse<UserCollectionLoad>> =>
    fetchHandler(`/api/v1/user__collection/update/${userCollectionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (userCollectionId: number): Promise<ActionResponse<void>> =>
    fetchHandler(`/api/v1/user__collection/delete/${userCollectionId}`, {
      method: "DELETE",
    }),
};
