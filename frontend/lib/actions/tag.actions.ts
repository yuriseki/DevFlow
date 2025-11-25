import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
} from "@/types/global";
import { TagLoad } from "@/types/tag";
import { PaginatedSearchParamsSchema } from "../validations";
import handleError from "../handlers/error";
import action from "@/lib/handlers/action";
import { apiTag } from "@/lib/api/apiTag";

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
