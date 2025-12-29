import UserAvatar from "@/app/components/navigation/UserAvatar";
import { auth } from "@/auth";
import { getUser, getUserAnswers, getUserQuestions } from "@/lib/actions/user.action";
import { RouteParams } from "@/types/global";
import { notFound } from "next/navigation";
import ProfileLink from "../components/ProfileLink";
import dayjs from "dayjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Stats from "../components/Stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataRenderer from "@/components/DataRenderer";
import QuestionCard from "@/app/components/cards/QuestionCard";
import { QuestionLoad } from "@/types/question";
import { EMPTY_ANSWERS, EMPTY_QUESTION } from "@/constants/states";
import Pagination from "@/app/components/Pagination";
import { AnswerLoad } from "@/types/answer";
import AnswerCard from "@/app/components/cards/AnswerCard";

const Profile = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { page, pageSize } = await searchParams;

  if (!id) {
    notFound();
  }

  const loggedInUser = await auth();
  const { success, data, error } = await getUser({ userId: parseInt(id) });

  if (!success) {
    return (
      <div>
        <div className="h1-bold text-dark100_light900">{error?.message}</div>
      </div>
    )
  }

  const { user, totalQuestions, totalAnswers } = data!;

  const { success: questionsSuccess, data: questionsData, error: questionsError } = await getUserQuestions({
    userId: parseInt(id),
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
  });

  const { questions, isNext: questionsIsNext } = questionsData!;
  
  const { success: answersSuccess, data: answersData, error: answersError } = await getUserAnswers({
    userId: parseInt(id),
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 2,
  });

  const { answers, isNext: answersIsNext } = answersData!;

  return (
    <>
      <section className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <UserAvatar
            id={user.id.toString()}
            name={user.name}
            imageUrl={user.image}
            className="size-35 rounded-full object-cover"
            fallbackClassName="text-6xl fond-bolder"
          />
          <div className="mt-3">
            <h2 className="h2-bold text-dark100_light900">{user.name}</h2>
            <p className="paragraph-regular text-dark200_light800">@{user.username}</p>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
            {user.portfolio && <ProfileLink
              imgUrl="/icons/link.svg"
              href={user.portfolio}
              title="Portfolio"
            />}
            {user.location && <ProfileLink
              imgUrl="/icons/location.svg"
              title="Location"
            />}
            <ProfileLink
              imgUrl="/icons/calendar.svg"
              title={dayjs(user.created_at).format("MMMM YYYY")}
            />

            {user.bio && (
              <p className="paragraph-regular text-dark400_light800 mt-8">{user.bio}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3" >
          {loggedInUser?.user?.id === id && (
            <Link href="/profile/edit" >
              <Button className="paragraph-medium btn-secondary text-dark300_light900 min-h-12 min-w-44 px-4 py-3">Edit Profile</Button>
            </Link>
          )}
        </div>
      </section>

      <Stats
        totalQuestions={totalQuestions}
        totalAnswers={totalAnswers}
        badges={{
          GOLD: 0,
          SILVER: 0,
          BRONZE: 0,
        }}
      ></Stats>

      <section className="mt-10 flex gap-10">
        <Tabs defaultValue="top-posts" className="flex-2">
          <TabsList className="background-light800_dark400 min-h-10.5 p-1">
            <TabsTrigger value="top-posts" className="tab cursor-pointer z-10">Top Posts</TabsTrigger>
            <TabsTrigger value="answers" className="tab cursor-pointer">Answers</TabsTrigger>
          </TabsList>
          <TabsContent value="top-posts" className="mt-5 flex w-full flex-col gap-6">
            <DataRenderer
              data={questions}
              empty={EMPTY_QUESTION}
              success={questionsSuccess}
              error={questionsError}
              render={(questions: QuestionLoad[]) => (
                <div className="flex w-full flex-col gap-6">
                  {questions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                    />
                  ))}
                </div>
              )}
            />
            <Pagination page={page} isNext={questionsIsNext} />
          </TabsContent>
          <TabsContent value="answers" className="flex w-full flex-col gap-6">
            <DataRenderer
              data={answers}
              empty={EMPTY_ANSWERS}
              success={answersSuccess}
              error={answersError}
              render={(answers: AnswerLoad[]) => (
                <div className="flex w-full flex-col gap-6">
                  {answers.map((answer) => (
                    <AnswerCard
                      key={answer.id}
                      {...answer}
                      content={answer.content.slice(0, 300)}
                      containerClasses="card-wrapper rounded-[10px] px-7 py-9 sm:px-11"
                      showReadMore
                    />
                  ))}
                </div>
              )}
            />
            <Pagination page={page} isNext={answersIsNext} />
          </TabsContent>
        </Tabs>

        <div className="flex w-full min-w-62.5 flex-1 flex-col max-lg:hidden">
          <h3 className="h3-bold text-dark200_light900">Top Tech</h3>
          <div className="mt-7 flex-col gap-4">
            <p>List of tags</p>
          </div>
        </div>
      </section>
    </>
  );
};
export default Profile;
