"use server";

import {
  ActionResponse,
  CollectionBaseParams,
  ErrorResponse,
  ExtendedUser,
} from "@/types/global";
import { CollectionBaseSchema } from "../validations";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { getQuestion } from "./questions.action";
import { apiUserCollection } from "../api/apiUserCollection";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";

export async function toggleSaveQuestion(
  params: CollectionBaseParams
): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const userId = (validationResult?.session?.user as ExtendedUser)?.id;

  try {
    const { data: question } = await getQuestion({ id: questionId });
    if (!question) {
      throw new Error("Question not found");
    }

    revalidatePath(ROUTES.QUESTION(questionId));
    const result = await apiUserCollection.toggle(parseInt(userId), questionId);

    return { success: result.success };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function hasSavedQuestion(
  params: CollectionBaseParams
): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const userId = (validationResult?.session?.user as ExtendedUser)?.id;

  try {
   
    const result = await apiUserCollection.getUserCollection(
      parseInt(userId),
      questionId
    );
    const isInUserCollection = result.success;

    return {
      success: true,
      data: {saved: isInUserCollection},
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
