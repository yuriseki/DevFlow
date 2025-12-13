import {
  ActionResponse,
  ErrorResponse,
  GetTagQuestionParams,
  PaginatedSearchParams,
} from "@/types/global";
import { TagLoad } from "@/types/tag";
import { GetTagQuestionSchema, PaginatedSearchParamsSchema } from "../validations";
import handleError from "../handlers/error";
import action from "@/lib/handlers/action";
import { apiTag } from "@/lib/api/apiTag";
import { GetQuestionSchema } from "@/app/(root)/ask-question/components/validation";
import { QuestionLoad } from "@/types/question";
import { int } from "zod";

export const getTags = async (
  params: PaginatedSearchParams
): Promise<ActionResponse<{ tags: TagLoad[]; isNext: boolean }>> => {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query = "", filter = "" } = params;

  const result = await apiTag.getTags(page, pageSize, query, filter);

  if (!result.success) {
    return handleError(result.error) as ErrorResponse;
  }

  const hasNext = result.data!.length === pageSize;

  return {
    success: true,
    data: { tags: result.data!, isNext: hasNext },
  };
};

export const getTagQuestions = async (
  params: GetTagQuestionParams
): Promise<ActionResponse<{ questions: QuestionLoad[]; isNext: boolean }>> => {
  const validationResult = await action({
    params,
    schema: GetTagQuestionSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { tagId, page = 1, pageSize = 10, query = "" } = params;

  const result = await apiTag.getTagQuestions(parseInt(tagId), page, pageSize, query, "");

  if (!result.success) {
    return handleError(result.error) as ErrorResponse;
  }

  const hasNext = result.data!.length === pageSize;

  return {
    success: true,
    data: { questions: result.data!, isNext: hasNext },
  }
};
