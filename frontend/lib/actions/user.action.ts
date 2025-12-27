"use server";

import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
} from "@/types/global";
import { UserLoad } from "@/types/user";
import { PaginatedSearchParamsSchema } from "../validations";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { apiUser } from "../api/apiUser";

export async function getUsers(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ users: UserLoad[]; isNext: boolean; totalUsers: number }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query = "", filter = "" } = params;

  const result = await apiUser.getUsers(
    page, pageSize, query, filter
  );

  if (!result.success) {
    return handleError(result.error) as ErrorResponse;
  }

  const totalUsers = result.data?.total || 0;
  const hasNext = totalUsers > ((page - 1) * pageSize) + result.data!.users.length;

  return {
    success: true,
    data: {users: result.data!.users, isNext: hasNext, totalUsers}
  }
}
