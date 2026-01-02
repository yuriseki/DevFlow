"use server";

import { QuestionCreate, QuestionLoad, QuestionUpdate } from "@/types/question";
import { AccountLoad } from "@/types/account";
import {
  PaginatedSearchParams,
  ActionResponse,
  ErrorResponse,
  IncrementViewsParams,
  ExtendedUser,
  GetUserParams,
} from "@/types/global";
import action from "@/lib/handlers/action";
import {
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
} from "@/app/(root)/ask-question/components/validation";
import { apiQuestion } from "@/lib/api/apiQuestion";

import { apiAccount } from "@/lib/api/apiAccount";
import handleError from "@/lib/handlers/error";
import {
  DeleteQuestionSchema,
  GetUserSchema,
  IncrementViewsSchema,
  PaginatedSearchParamsSchema,
} from "../validations";
import { createInteraction } from "./interaction.action";
import { ActionContentType, ActionType } from "@/types/interaction";
import { apiInteraction } from "../api/apiInteraction";

export async function createQuestion(
  params: QuestionCreate
): Promise<ActionResponse<QuestionLoad>> {
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  // Replace user.id by user.accounts.provider_account_id, so then I can manage both
  // cases: email authentication and SSO.
  const providerAccountId = (validationResult?.session?.user as ExtendedUser)
    ?.provider_account_id;

  const { data: account } = (await apiAccount.loadByProviderAccountId(
    providerAccountId
  )) as ActionResponse<AccountLoad>;
  if (!account) {
    return handleError(new Error("Account not found")) as ErrorResponse;
  }

  const questionCreate = params;
  questionCreate.author_id = account.user_id!;

  const result = await apiQuestion.create(questionCreate);
  if (!result.success) {
    return handleError(result.error) as ErrorResponse;
  }

  // Update user reputation.
  await createInteraction({
    contentType: ActionContentType.QUESTION,
    targetId: result.data!.id,
    actionType: ActionType.POST,
  });

  return { success: result.success, data: result.data };
}

export async function editQuestion(
  params: QuestionUpdate
): Promise<ActionResponse<QuestionLoad>> {
  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const questionUpdate = params;

  const result = await apiQuestion.update(questionUpdate.id, questionUpdate);
  if (!result.success) {
    return handleError(result.error) as ErrorResponse;
  }

  return { success: result.success, data: result.data };
}

interface getQuestionParams {
  id: number;
}

export async function getQuestion(
  params: getQuestionParams
): Promise<ActionResponse<QuestionLoad>> {
  const validationResult = await action({
    params,
    schema: GetQuestionSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { id } = validationResult.params!;

  const result = await apiQuestion.getQuestion(id);
  if (!result.success) {
    return handleError(result.error) as ErrorResponse;
  }

  // Update user reputation.
  await createInteraction({
    contentType: ActionContentType.QUESTION,
    targetId: id,
    actionType: ActionType.VIEW,
  });
  return { success: result.success, data: result.data };
}

export async function getQuestions(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ questions: QuestionLoad[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query = "", filter = "" } = params;
  const userId = (validationResult?.session?.user as ExtendedUser)
    ?.id || "0";


  const result = await apiQuestion.getQuestions(page, pageSize, query, filter, parseInt(userId));

  if (!result.success) {
    return handleError(result.error) as ErrorResponse;
  }

  const hasNext = result.data!.length === pageSize;

  return {
    success: true,
    data: { questions: result.data!, isNext: hasNext },
  };
}

export async function incrementViews(
  params: IncrementViewsParams
): Promise<ActionResponse<{ views: number }>> {
  const validationResult = await action({
    params,
    schema: IncrementViewsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;

  try {
    const response = await apiQuestion.getQuestion(questionId);

    if (!response.success || !response.data) {
      throw new Error("Question not found");
    }

    const question = response.data;

    const questionUpdate: QuestionUpdate = {
      id: question.id,
      views: (question.views ?? 0) + 1,
    };

    await apiQuestion.update(questionId, questionUpdate);

    return {
      success: true,
      data: { views: questionUpdate.views! },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getHotQuestions(): Promise<
  ActionResponse<QuestionLoad[]>
> {
  try {
    const response = await apiQuestion.getHotQuestions();

    if (!response.success || !response.data) {
      throw new Error("Questions not found");
    }

    const questions = response.data;

    return {
      success: true,
      data: questions,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

interface deleteQuestionParams {
  questionId: number;
}

export async function deleteQuestion(params: deleteQuestionParams): Promise<
  ActionResponse<{
    success: boolean;
    error?: string;
  }>
> {
  const validationResult = await action({
    params,
    schema: DeleteQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const sessionUserId = (validationResult?.session?.user as ExtendedUser)?.id;

  if (!sessionUserId) {
    throw new Error("Only authenticated users can delete questions.");
  }

  // Check if the current user is the author of the question.
  const {
    success: successQuestion,
    data: question,
    error: errorQuestion,
  } = await apiQuestion.getQuestion(questionId);

  if (!successQuestion) {
    throw new Error("Error deleting quesiton: " + errorQuestion?.message);
  }

  if (question?.author_id !== parseInt(sessionUserId)) {
    throw new Error("You can only delete the questions you are the author.");
  }

  try {
    const { success, error } = await apiQuestion.delete(questionId);
    if (!success) {
      throw new Error("Error deleting quesiton: " + error?.message);
    }

    // Update user reputation.
    await createInteraction({
      contentType: ActionContentType.QUESTION,
      targetId: questionId,
      actionType: ActionType.DELETE,
    });

    return {
      success: true,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getRecommendedQuestions(params: GetUserParams): Promise<
  ActionResponse<{
    questions: QuestionLoad[];
  }>
> {
  const validationResult = await action({
    params,
    schema: GetUserSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId } = params;

  try {
    const result = await apiQuestion.getSuggestedQuestions(userId);
    const { success, data = [], error } = result;

    if (!success) {
      throw new Error(error?.message);
    }

    return {
      success: true,
      data: { questions: data },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
