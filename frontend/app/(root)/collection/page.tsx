import QuestionCard from "@/app/components/cards/QuestionCard";
import LocalSearch from "@/app/components/search/LocalSearch";
import DataRenderer from "@/components/DataRenderer";
import ROUTES from "@/constants/routes";
import { EMPTY_QUESTION } from "@/constants/states";
import { getSavedQuestions } from "@/lib/actions/collection.action";
import { QuestionLoad } from "@/types/question";



const Collection = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const awaitedParams = await searchParams;
  const { page, pageSize, query, filter } = awaitedParams;

  const result = await getSavedQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    filter: filter || "",
  });

  const data = result.data;
  const questions = data?.questions || [];

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>
      </section>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route={ROUTES.COLLECTION}
          imgSrc="/icons/search.svg"
          placeholder="Search saved questions..."
          otherClasses="flex-1"
          iconPosition="left"
        />
      </div>
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
    </>
  );
};
export default Collection;
