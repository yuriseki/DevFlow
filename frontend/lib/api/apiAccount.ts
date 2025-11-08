import { fetchHandler } from "@/lib/apiFetch";
import { AccountCreate, AccountLoad, AccountUpdate } from "@/types/account";
import { ActionResponse } from "@/types/global";

export const apiAccount = {
  getById: (accountId: number): Promise<ActionResponse<AccountLoad>> =>
    fetchHandler(`/api/v1/account/load/${accountId}`),

  create: (data: AccountCreate): Promise<ActionResponse<AccountLoad>> =>
    fetchHandler(`/api/v1/account/create`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (accountId: number, data: AccountUpdate): Promise<ActionResponse<AccountLoad>> =>
    fetchHandler(`/api/v1/account/update/${accountId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (accountId: number): Promise<ActionResponse<void>> =>
    fetchHandler(`/api/v1/account/delete/${accountId}`, {
      method: "DELETE",
    }),

  loadByProvider: (provider: string): Promise<ActionResponse<AccountLoad>> =>
    fetchHandler(`/api/v1/account/provider`, {
      method: "POST",
      body: JSON.stringify({ provider }),
    }),
};
