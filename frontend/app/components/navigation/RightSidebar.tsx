import React from "react";
import ROUTES from "@/constants/routes";
import Image from "next/image";
import Link from "next/link";
import TagCard from "@/app/components/cards/TagCard";
import { getHotQuestions } from "@/lib/actions/questions.action";
import DataRenderer from "@/components/DataRenderer";
import { getTopTags } from "@/lib/actions/tag.action";

const RightSidebar = async () => {
  const { success, data: hotQuestions, error } = await getHotQuestions();
  const { success: successTags, data: popularTags, error: errorTags } = await getTopTags();

  return (
    <section className="custom-scrollbar background-light900_dark200 light-border shadow-light-300 sticky top-0 right-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 pt-36 max-xl:hidden dark:shadow-none">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        <DataRenderer
          data={hotQuestions}
          empty={{
            title: "No questions found",
            message: "No questions have been asked yet."
          }}
          success={success}
          render={(hotQuestions) => (
            <div className="mt-7 flex w-full flex-col gap-7.5">
              {hotQuestions.map(({ id, title }) => (
                <Link
                  key={id}
                  href={ROUTES.QUESTION(id)}
                  className="flex cursor-pointer items-center justify-between gap-7"
                >
                  <p className="body-medium text-dark500_light700 line-clamp-2">
                    {title}
                  </p>

                  <Image
                    src="/icons/chevron-right.svg"
                    alt="Chevron"
                    width={20}
                    height={20}
                    className="invert-colors"
                  />
                </Link>
              ))}
            </div>
          )}
        />
      </div>
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <DataRenderer
          data={popularTags}
          empty={{
            title: "No tags found",
            message: "No tags has been created yet."
          }}
          success={success}
          render={(popularTags) => (
            <div className="mt-7 flex flex-col gap-4">
              {popularTags.map(({ id, name, num_questions }) => (
                <TagCard
                  key={id}
                  id={id}
                  name={name}
                  questions={num_questions}
                  showCount={true}
                  compact={true}
                />
              ))}
            </div>
          )}
        />
      </div>
    </section>
  );
};
export default RightSidebar;
