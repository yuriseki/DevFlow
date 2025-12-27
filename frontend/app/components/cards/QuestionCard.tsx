import React from "react";
import { getTimeStamp } from "@/lib/utils";
import Link from "next/link";
import TagCard from "@/app/components/cards/TagCard";
import ROUTES from "@/constants/routes";
import Metric from "@/app/components/cards/Metric";
import SaveQuestion from "../answers/questions/SaveQuestion";
import { hasSavedQuestion } from "@/lib/actions/collection.action";
import { QuestionLoad } from "@/types/question";

interface Props {
  question: QuestionLoad;
}

const QuestionCard = ({
  question: { id, title, tags, author, created_at, upvotes, answers, views },
}: Props) => {
  const hasSavedQuestionPromise = hasSavedQuestion({ questionId: parseInt("0" + id) });
  return (
    <div className="card-wrapper rounded-[10px] p-9 sm:px-11">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div>
          <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
            {getTimeStamp(created_at)}
          </span>
          <SaveQuestion
            questionId={parseInt("0" + id )}
            hasSavedQuestionPromise={hasSavedQuestionPromise}
          />
          <Link href={ROUTES.QUESTION(parseInt("0" + id))}>
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
              {title}
            </h3>
          </Link>
        </div>
      </div>
      <div className="mt-3.5 flex w-full flex-wrap gap-2">
        {tags.map((tag) => (
          <TagCard
            key={tag.id}
            id={tag.id}
            name={tag.name}
            compact
          />
        ))}
      </div>
      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <Metric
          imgUrl={author.image}
          alt={author.name}
          value={author.name}
          title={`• asked ${getTimeStamp(created_at)}`}
          href={ROUTES.PROFILE(author.id)}
          textStyles="body-medium text-dark400_light700"
          isAuthor
          titleStyles="max-sm:hidden"
        />

        <div className="flex items-center gap-3 max-sm:flex-wrap max-sm:justify-start">
          <Metric
            imgUrl="/icons/like.svg"
            alt="like"
            value={upvotes!}
            title=" Votes"
            textStyles="small-medium text-dark400_light800"
          />
          <Metric
            imgUrl="/icons/message.svg"
            alt="answers"
            value={answers?.length || 0}
            title=" Answers"
            textStyles="small-medium text-dark400_light800"
          />
          <Metric
            imgUrl="/icons/eye.svg"
            alt="views"
            value={views || 0}
            title=" Views"
            textStyles="small-medium text-dark400_light800"
          />
        </div>
      </div>
    </div>
  );
};
export default QuestionCard;
