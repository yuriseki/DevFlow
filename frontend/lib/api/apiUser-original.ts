import { fetchHandler } from "@/lib/handlers/apiFetch";
import { UserCreate, UserLoad, UserUpdate } from "@/types/user";
import { ActionResponse } from "@/types/global";

export const userApi = {
  getAll: (): Promise<ActionResponse<UserLoad[]>> =>
    fetchHandler(`/api/v1/user`),

  loadByEmail: (email: string): Promise<ActionResponse<UserLoad>> =>
    fetchHandler(`/api/v1/user/email`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  getById: (userId: number): Promise<ActionResponse<UserLoad>> =>
    fetchHandler(`/api/v1/user/load/${userId}`),

  create: (data: UserCreate): Promise<ActionResponse<UserLoad>> =>
    fetchHandler(`/api/v1/user/create`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    userId: number,
    data: UserUpdate
  ): Promise<ActionResponse<UserLoad>> =>
    fetchHandler(`/api/v1/user/update/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (userId: number): Promise<ActionResponse<void>> =>
    fetchHandler(`/api/v1/user/delete/${userId}`, {
      method: "DELETE",
    }),
};
