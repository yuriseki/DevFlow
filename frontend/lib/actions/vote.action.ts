"use server";

import {
  ActionResponse,
  ErrorResponse,
  HasVotedParams,
  HasVotedResponse,
} from "@/types/global";
import { CreateVoteSchema, hasVotedSchema } from "../validations";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  VoteDoVote,
  TargetVote,
  VoteType,
  VoteFind,
  VoteLoad,
} from "@/types/vote";
import { apiVote } from "../api/apiVote";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";
type VoteParams = {
  targetId: number;
  targetType: "question" | "answer";
  voteType: "upvote" | "downvote";
};

export async function CreateVote(
  params: VoteParams
): Promise<ActionResponse<any>> {
  const validationResult = await action({
    params,
    schema: CreateVoteSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType } = validationResult.params!;
  const userIdFromSession = validationResult.session?.user?.id;

  if (!userIdFromSession) {
    return handleError(new Error("Unauthorized")) as ErrorResponse;
  }

  const vote: VoteDoVote = {
    user_id: parseInt(userIdFromSession),
    target_id: targetId,
    target_vote: targetType as TargetVote,
    vote_type: voteType as VoteType,
  };

  const result = await apiVote.doVote(vote);

  revalidatePath(ROUTES.QUESTION(targetId));

  return { success: result.success, data: {} };
}

export async function hasVoted(
  params: HasVotedParams
): Promise<ActionResponse<HasVotedResponse>> {
  const validationResult = await action({
    params,
    schema: hasVotedSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType } = validationResult.params!;
  const userIdFromSession = validationResult.session?.user?.id;

  if (!userIdFromSession) {
    return handleError(new Error("Unauthorized")) as ErrorResponse;
  }

  try {
    const voteFind: VoteFind = {
      user_id: parseInt(userIdFromSession),
      target_id: targetId,
      target_vote: targetType as TargetVote,
    };

    const vote_result = await apiVote.findVote(voteFind);

    if (vote_result) {
      return {
        success: true,
        data: {
          hasUpvoted: vote_result.data?.vote_type === "upvote",
          hasDownvoted: vote_result.data?.vote_type === "downvote",
        },
      };
    } else {
      return {
        success: false,
        data: { hasUpvoted: false, hasDownvoted: false },
      };
    }
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
