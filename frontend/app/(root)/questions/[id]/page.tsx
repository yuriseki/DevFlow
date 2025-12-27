import Metric from "@/app/components/cards/Metric";
import TagCard from "@/app/components/cards/TagCard";
import Preview from "@/app/components/editor/preview";
import UserAvatar from "@/app/components/navigation/UserAvatar";
import ROUTES from "@/constants/routes";
import { getQuestion, incrementViews } from "@/lib/actions/questions.action";
import { formatNumber, getTimeStamp } from "@/lib/utils";
import { RouteParams, Tag } from "@/types/global";
import Link from "next/link";
import { redirect } from "next/navigation";
import { after } from "next/server";
import AnswerForm from "../../ask-question/components/AnswerForm";
import { getAnswers } from "@/lib/actions/answer.action";
import AllAnswers from "@/app/components/answers/AllAnswers";
import Votes from "@/app/components/votes/Votes";
import { hasVoted } from "@/lib/actions/vote.action";
import { Suspense } from "react";
import SaveQuestion from "@/app/components/answers/questions/SaveQuestion";
import { hasSavedQuestion } from "@/lib/actions/collection.action";

const QuestionDetails = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const {page, pageSize, filter} = await searchParams;
  const { success, data: question } = await getQuestion({
    id: parseInt(id),
  });

  after(async () => {
    await incrementViews({ questionId: parseInt(id) });
  });

  if (!success || !question) return redirect("/404");

  const { success: areAnswersLoaded, data: answersResult, error: answersError } = await getAnswers({
    question_id: parseInt(id),
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    filter: filter,
  })

  const hasVotedPromise = hasVoted({ targetId: question.id, targetType: "question" });

  const totalAnswers = answersResult?.totalAnswers || 0;

  question.views++;
  const { author, created_at, answers, views, tags, content, title } = question;

  const hasSavedQuestionPromise = hasSavedQuestion({ questionId: parseInt(id) });
  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            <UserAvatar
              id={author._id}
              name={author.name}
              className="size-[22px]"
              fallbackClassName="text-[10px]"
            />
            <Link href={ROUTES.PROFILE(author._id)}>
              <p className="paragraph-semibold text-dark300_light700">
                {author.name}
              </p>
            </Link>
          </div>
          <div className="flex justify-end items-center gap-4">
            <Suspense fallback={<div>Loading...</div>}>
              <Votes
                upvotes={question.upvotes || 0}
                downvotes={question.downvotes || 0}
                targetType="question"
                targetId={question.id}
                hasVotedPromise={hasVotedPromise}
              />
            </Suspense>

            <Suspense fallback={<div>Loading...</div>}>
              <SaveQuestion
                questionId={parseInt(id)}
                hasSavedQuestionPromise={hasSavedQuestionPromise}
              />
            </Suspense>
          </div>
        </div>
        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">
          {title}
        </h2>
      </div>

      <div className="mt-5 mb-8 flex flex-wrap gap-4">
        <Metric
          imgUrl="/icons/clock.svg"
          alt="clock icon"
          value={` asked ${getTimeStamp(new Date(created_at))}`}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/message.svg"
          alt="message icon"
          value={answers?.length || 0}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/eye.svg"
          alt="eye icon"
          value={formatNumber(views)}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
      </div>

      <Preview content={content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {tags?.map((tag: Tag) => (
          <TagCard
            key={tag.id}
            id={tag.id.toString()}
            name={tag.name}
            compact
          />
        ))}
      </div>
      <section className="my-5">
        <AllAnswers
          page={Number(page) || 1}
          isNext={answersResult?.isNext || false}
          data={answersResult?.answers}
          success={areAnswersLoaded}
          error={answersError}
          totalAnswers={totalAnswers || 0}
        />
      </section>

      <section className="my-5">
        <AnswerForm
          questionId={question.id}
          questionTitle={question.title}
          questionContent={question.content}
        />
      </section>
    </>
  );
};
export default QuestionDetails;
