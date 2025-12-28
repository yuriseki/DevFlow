"use server";

import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
} from "@/types/global";
import { UserLoad } from "@/types/user";
import { GetUserSchema, PaginatedSearchParamsSchema } from "../validations";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { apiUser } from "../api/apiUser";
import { apiQuestion } from "../api/apiQuestion";
import { apiAnswer } from "../api/apiAnswer";

export async function getUsers(
  params: PaginatedSearchParams
): Promise<
  ActionResponse<{ users: UserLoad[]; isNext: boolean; totalUsers: number }>
> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query = "", filter = "" } = params;

  const result = await apiUser.getUsers(page, pageSize, query, filter);

  if (!result.success) {
    return handleError(result.error) as ErrorResponse;
  }

  const totalUsers = result.data?.total || 0;
  const hasNext =
    totalUsers > (page - 1) * pageSize + result.data!.users.length;

  return {
    success: true,
    data: { users: result.data!.users, isNext: hasNext, totalUsers },
  };
}

interface GetUserParams {
  userId: number;
}

export async function getUser(params: GetUserParams): Promise<
  ActionResponse<{
    user: UserLoad;
    totalQuestions: number;
    totalAnswers: number;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetUserSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId } = params;

  try {
    const userResult = await apiUser.getUser(userId);
    const user = userResult.data;

    if (!user) throw new Error("User not found");

    const totalQuestionsResult = await apiQuestion.getTotalQuestionByUser(userId);
    const totalQuestions = totalQuestionsResult.data || 0;
    const totalAnswersResult = await apiAnswer.getTotalAnswersByUser(userId);
    const totalAnswers = totalAnswersResult.data || 0;

    return {
      success: true,
      data: {
        user,
        totalQuestions,
        totalAnswers,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
