import React from "react";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import LocalSearch from "@/app/components/search/LocalSearch";
import HomeFilter from "@/app/components/filters/HomeFilter";
import QuestionCard from "@/app/components/cards/QuestionCard";
import { auth } from "@/auth";
import { getQuestions } from "@/lib/actions/questions.action";

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

const Home = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, pageSize, query, filter } = await searchParams;

  const result = await getQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    filter: filter || "",
  });

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Button
          className="primary-gradient text-light-900 min-h-[46px] px-4 py-3"
          asChild
        >
          <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
        </Button>
      </section>
      <section className="mt-11">
        <LocalSearch
          route="/"
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />
      </section>
      <HomeFilter />
      {result.success ? (
        <div className="mt-10 flex w-full flex-col gap-6">
          {result.data?.questions && result.data.questions.length > 0 ? (
            result.data.questions.map((question) => {
              const questionForCard = {
                id: question.id,
                title: question.title,
                tags: question.tags
                  ? question.tags.map((tag) => ({ ...tag, id: tag.id }))
                  : [],
                author: {
                  ...question.author,
                  id: question.author.id,
                },
                createdAt: question.created_at,
                upvotes: question.upvotes || 0,
                answers: question.answers?.length || 0,
                views: question.views || 0,
              };
              return (
                <QuestionCard
                  key={question.id}
                  question={questionForCard}
                />
              );
            })
          ) : (
            <div className="mt-10 flex w-full items-center justify-center">
              <p className="text-dark400_light700">No questions found.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-10 flex w-full items-center justify-center">
          <p className="text-dark400_light700">
            {result.error?.message || "Failed to fetch questions"}
          </p>
        </div>
      )}
    </>
  );
};
export default Home;
