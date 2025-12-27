"use server";

import action from "@/lib/handlers/action";
import {
  AnswerServeSchema as AnswerServerSchema,
  GetAnswersSchema,
} from "@/lib/validations";
import { AccountLoad } from "@/types/account";
import { AnswerCreate, AnswerLoad } from "@/types/answer";
import {
  ActionResponse,
  ErrorResponse,
  ExtendedUser,
  GetAnswersParams,
} from "@/types/global";
import { apiAccount } from "../api/apiAccount";
import { apiAnswer } from "../api/apiAnswer";
import handleError from "../handlers/error";

type AnswerInput = {
  content: string;
  question_id: number;
};

export async function createAnswer(
  params: AnswerInput
): Promise<ActionResponse<AnswerLoad>> {
  const validationResult = await action({
    params,
    schema: AnswerServerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { content, question_id } = validationResult.params!;
  const providerAccountId = (validationResult?.session?.user as ExtendedUser)
    ?.provider_account_id;

  const { data: account } = (await apiAccount.loadByProviderAccountId(
    providerAccountId
  )) as ActionResponse<AccountLoad>;
  if (!account) {
    return handleError(new Error("Account not fount")) as ErrorResponse;
  }

  const answerCreate: AnswerCreate = {
    content,
    question_id,
    user_id: account.user_id!,
  };

  const result = await apiAnswer.create(answerCreate);
  if (!result.success) {
    return handleError(result.error) as ErrorResponse;
  }

  return { success: result.success, data: result.data };
}

export async function getAnswers(params: GetAnswersParams): Promise<
  ActionResponse<{
    answers: AnswerLoad[];
    isNext: boolean;
    totalAnswers: number;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetAnswersSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { question_id, page = 1, pageSize = 10, filter = "" } = params;

  const result = await apiAnswer.getAnswersForQuestion(
    question_id,
    page,
    pageSize,
    filter,
  );

  if (!result.success) {
    return handleError(result.error) as ErrorResponse;
  }

  const totalAnswers = result.data?.total || 0;
  const hasNext = totalAnswers > ((page -1) * pageSize) + result.data!.answers.length;

  return {
    success: true,
    data: { answers: result.data!.answers, isNext: hasNext, totalAnswers: totalAnswers },
  };
}
