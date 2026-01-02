"use server";

import {
  ActionResponse,
  ErrorResponse,
  GetUserParams,
  PaginatedSearchParams,
} from "@/types/global";
import { UserLoad } from "@/types/user";
import {
  GetUserAnswersSchema,
  GetUserQuestionsSchema,
  GetUserSchema,
  PaginatedSearchParamsSchema,
} from "../validations";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { apiUser } from "../api/apiUser";
import { apiQuestion } from "../api/apiQuestion";
import { apiAnswer } from "../api/apiAnswer";
import { QuestionLoad } from "@/types/question";
import { AnswerLoad } from "@/types/answer";
import { apiTag } from "../api/apiTag";
import { UserTag } from "@/types/tag";
import { Badges } from "@/types/badges";
import { apiBadges } from "../api/apiBadges";

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

    const totalQuestionsResult =
      await apiQuestion.getTotalQuestionByUser(userId);
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

interface GetUserQuestionsParams {
  page?: number;
  pageSize?: number;
  userId: number;
}

export async function getUserQuestions(params: GetUserQuestionsParams): Promise<
  ActionResponse<{
    questions: QuestionLoad[];
    isNext: boolean;
    total: number;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetUserQuestionsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, userId } = params;

  try {
    const result = await apiQuestion.getUserQuestions(userId, page, pageSize);

    const { success, data, error } = result;

    if (!success) {
      throw new Error(error?.message);
    }

    const { questions = [], total } = data!;
    const hasNext = total > (page - 1) * pageSize + questions?.length!;

    return {
      success: true,
      data: { questions: questions!, isNext: hasNext, total: total! },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

interface GetUSerAnswersParams {
  page?: number;
  pageSize?: number;
  userId: number;
}

export async function getUserAnswers(params: GetUSerAnswersParams): Promise<
  ActionResponse<{
    answers: AnswerLoad[];
    isNext: boolean;
    total: boolean;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetUserAnswersSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, userId } = params;

  try {
    const result = await apiAnswer.getUserAnswers(userId, page, pageSize);

    const { success, data, error } = result;

    if (!success) {
      throw new Error(error?.message);
    }

    const { answers = [], total } = data!;
    const hasNext = total > (page - 1) * pageSize + answers?.length!;

    return {
      success: true,
      data: { answers: answers!, isNext: hasNext, total: total! },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

interface GetUSerTagsParams {
  userId: number;
}

export async function getUserTopTags(params: GetUSerTagsParams): Promise<
  ActionResponse<{
    tags: UserTag[];
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
    const result = await apiTag.getTopTagsUser(userId);

    const { success, data: userTags, error } = result;

    if (!success) {
      throw new Error(error?.message);
    }

    return {
      success: true,
      data: { tags: userTags! },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserBadges(params: GetUserParams): Promise<
  ActionResponse<{
    badges: Badges;
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

  try{
    const result = await apiBadges.getUserBadges(userId);
    const {success, data, error}  = result;

    if (!success) {
      throw new Error(error?.message);
    }
    
    const badges = data;

    return {
      success: true,
      data: {badges: badges!},
    }
  }
  catch(error) {
    return handleError(error) as ErrorResponse;
  }
}
