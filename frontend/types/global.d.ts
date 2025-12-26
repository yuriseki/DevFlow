import { NextResponse } from "next/server";

interface Tag {
  id: number;
  name: string;
}

interface Author {
  id: number;
  name: string;
  image: string;
}

interface ExtendedUser {
  id: string;
  provider_account_id: string;
}

interface Question {
  id: number;
  title: string;
  tags: Tag[];
  author: Author;
  createdAt: Date;
  upvotes: number;
  answers: number;
  views: number;
}

type ActionResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  status?: number;
};

type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
type ErrorResponse<T = null> = ActionResponse<undefined> & { success: false };
type APIErrorResponse<T = null> = NextResponse<ErrorResponse>;
type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface PaginatedSearchParams {
  page?: number;
  pageSize?: number;
  query?: string;
  filter?: string;
}

interface GetTagQuestionParams extends Omit<PaginatedSearchParams, "filter"> {
  tagId: string;
}

interface IncrementViewsParams {
  questionId: number;
}

interface GetAnswersParams extends PaginatedSearchParams {
  question_id: number;
}

interface CreateVoteParams {
  targetId: number;
  targetType: "question" | "answer";
  voteType: "upvote" | "downvote";
}

type HasVotedParams = Pick<CreateVoteParams, "targetId" | "targetType">;

interface HasVotedResponse {
  hasUpvoted: boolean;
  hasDownvoted: boolean;
}

interface CollectionBaseParams {
  questionId: number;
}
