import { AnswerLoad } from "@/types/answer"
import UserAvatar from "../navigation/UserAvatar"
import Link from "next/link"
import ROUTES from "@/constants/routes"
import { cn, getTimeStamp } from "@/lib/utils"
import Preview from "../editor/preview"
import Votes from "../votes/Votes"
import { Suspense } from "react"
import { hasVoted } from "@/lib/actions/vote.action"

interface Props extends AnswerLoad {
  containerClasses?: string;
  showReadMore?: boolean;
}


const AnswerCard = ({ id, user, content, created_at, upvotes, downvotes, question_id, containerClasses, showReadMore = false }: Props) => {
  const hasvotedpromise = hasVoted({
    targetId: id,
    targetType: "answer",
  })
  return (
    <article className={cn("light-border border-b py-10", containerClasses)}>
      <span id={`answer-${id}`} className="hash-span" />
      <div className="mb-5 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex flex-1 items-start gap-1 sm:items-center">
          <UserAvatar
            id={user.id}
            name={user.name}
            imageUrl={user.image}
            className="size-5 rounded-full object-cover max-sm:mt-2"
          />
          <Link href={ROUTES.PROFILE(user.id)} className="flex flex-col sm:flex-row sm:items-center">
            <p className="body-semibold text-dark300_light700">{user.name ?? "Anonymous"}</p>

            <p className="small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1">
              <span className="max-sm:hidden"> • </span>
              answered {getTimeStamp(created_at)}
            </p>
          </Link>
        </div>
        <div className="flex justify-end">
          <Suspense fallback={<div>Loading...</div>}>
            <Votes
              upvotes={upvotes || 0}
              downvotes={downvotes || 0}
              targetType="answer"
              targetId={id}
              hasVotedPromise={hasvotedpromise}
            />
          </Suspense>
        </div>
      </div>
      <Preview
        content={content}
      />
      {showReadMore && (
        <Link href={`/questions/${question_id}#answer-${id}`} className="body-semibold relative z-10 font-space-grotesk text-primary-500">
          <p className="mt-1">Read more...</p>
        </Link>
      )}
    </article>
  )
}

export default AnswerCard
