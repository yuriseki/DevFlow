"use server";

import { QuestionCreate, QuestionLoad, QuestionUpdate } from "@/types/question";
import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "@/lib/handlers/action";
import {
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
} from "@/app/(root)/ask-question/components/validation";
import { apiQuestion } from "@/lib/api/apiQuestion";
import handleError from "@/lib/handlers/error";

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

  const { id } = validationResult.params;

  const result = await apiQuestion.getQuestion(id);
  if (!result.success) {
    return handleError(result.error) as ErrorResponse;
  }

  return { success: result.success, data: result.data };
}
