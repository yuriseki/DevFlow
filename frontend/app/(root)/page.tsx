import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import LocalSearch from "@/app/components/search/LocalSearch";
import HomeFilter from "@/app/components/filters/HomeFilter";
import QuestionCard from "@/app/components/cards/QuestionCard";
import { getQuestions } from "@/lib/actions/questions.action";
import DataRenderer from "@/components/DataRenderer";
import { EMPTY_QUESTION } from "@/constants/states";
import { QuestionLoad } from "@/types/question";
import CommonFilter from "../components/filters/CommonFilter";
import { HomePageFilters } from "@/constants/filters";
import Pagination from "../components/Pagination";

const Home = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const awaitedParams = await searchParams;
  const { page, pageSize, query, filter } = awaitedParams;

  const result = await getQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    filter: filter || "",
  });

  const data = result.data;
  const questions = data?.questions || [];
  const isNext = data?.isNext || false;

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
      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route="/"
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
          iconPosition="left"
        />
        <CommonFilter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </section>
      <HomeFilter />
      <DataRenderer
        success={result.success}
        error={result.error}
        data={questions}
        empty={EMPTY_QUESTION}
        render={(questions: QuestionLoad[]) => (
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
      <Pagination
        page={page}
        isNext={isNext || false}
      />
    </>
  );
};
export default Home;
