"use server";

import { QuestionCreate, QuestionLoad, QuestionUpdate } from "@/types/question";
import {
  PaginatedSearchParams,
  ActionResponse,
  ErrorResponse,
} from "@/types/global";
import action from "@/lib/handlers/action";
import {
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
} from "@/app/(root)/ask-question/components/validation";
import { apiQuestion } from "@/lib/api/apiQuestion";
import handleError from "@/lib/handlers/error";
import { PaginatedSearchParamsSchema } from "../validations";

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

  const userId = validationResult?.session?.user?.id;

  const questionCreate = params;
  questionCreate.author_id = parseInt(userId!);

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
    authorize: true,
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
