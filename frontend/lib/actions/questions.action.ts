"use server";

import { QuestionCreate, QuestionLoad } from "@/types/question";
import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "@/lib/handlers/action";
import { AskQuestionSchema } from "@/app/(root)/ask-question/components/validation";
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
