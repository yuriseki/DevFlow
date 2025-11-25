import React from "react";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import LocalSearch from "@/app/components/search/LocalSearch";
import HomeFilter from "@/app/components/filters/HomeFilter";
import QuestionCard from "@/app/components/cards/QuestionCard";
import { auth } from "@/auth";
import { getQuestions } from "@/lib/actions/questions.action";
import DataRenderer from "@/components/DataRenderer";
import { EMPTY_QUESTION } from "@/constants/states";
import { QuestionLoad } from "@/types/question";

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

  const { data } = result;
  const { questions } = data || [];

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
      <DataRenderer
        success={result.success}
        error={result.error}
        data={questions}
        empty={EMPTY_QUESTION}
        render={(questions) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
              />
            ))}
          </div>
        )}
      />
    </>
  );
};
export default Home;
