"use server";

import { QuestionCreate, QuestionLoad, QuestionUpdate } from "@/types/question";
import { AccountLoad } from "@/types/account";
import {
  PaginatedSearchParams,
  ActionResponse,
  ErrorResponse,
  IncrementViewsParams,
} from "@/types/global";
import action from "@/lib/handlers/action";
import {
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
} from "@/app/(root)/ask-question/components/validation";
import { apiQuestion } from "@/lib/api/apiQuestion";

interface ExtendedUser {
  id: string;
  provider_account_id: string;
}
import { apiAccount } from "@/lib/api/apiAccount";
import handleError from "@/lib/handlers/error";
import {
  IncrementViewsSchema,
  PaginatedSearchParamsSchema,
} from "../validations";

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

  return { success: result.success, data: result.data };
}

export async function getQuestions(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ questions: QuestionLoad[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query = "", filter = "" } = params;

  const result = await apiQuestion.getQuestions(page, pageSize, query, filter);

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
