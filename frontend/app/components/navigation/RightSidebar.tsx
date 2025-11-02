import React from "react";
import ROUTES from "@/constants/routes";
import Image from "next/image";
import Link from "next/link";
import TagCard from "@/app/components/navigation/cards/TagCard";

const hotQuestions = [
  { _id: 1, title: "How to implement authentication in React?" },
  { _id: 2, title: "What is the difference between useEffect and useLayoutEffect?" },
  { _id: 3, title: "How to optimize React application performance?" },
  { _id: 4, title: "What are React hooks and how to use them?" },
  { _id: 5, title: "How to manage state in large React applications?" },
];

const popularTags = [
  { _id: 1, name: "JavaScript", questions: 1200, showCount: true, compact: false },
  { _id: 2, name: "React", questions: 950, showCount: true, compact: false },
  { _id: 3, name: "CSS", questions: 800, showCount: true, compact: false },
  { _id: 4, name: "Node.js", questions: 600, showCount: true, compact: false },
  { _id: 5, name: "TypeScript", questions: 500, showCount: true, compact: false },
];

const RightSidebar = () => {
  return (
    <section className="custom-scrollbar background-light900_dark200 light-border shadow-light-300 sticky top-0 right-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 pt-36 max-xl:hidden dark:shadow-none">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
      </div>
      <div className="mt-7 flex w-full flex-col gap-[30px]">
        {hotQuestions.map(({ _id, title }) => (
          <Link
            key={_id}
            href={ROUTES.QUESTION(_id)}
            className="flex cursor-pointer items-center justify-between gap-7"
          >
            <p className="body-medium text-dark500_light700 line-clamp-2">{title}</p>

            <Image src="/icons/chevron-right.svg" alt="Chevron" width={20} height={20} className="invert-colors" />
          </Link>
        ))}
      </div>

      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {popularTags.map(({ _id, name, questions }) => (
            <TagCard key={_id} _id={_id} name={name} questions={questions} showCount={true} compact={true} />
          ))}
        </div>
      </div>
    </section>
  );
};
export default RightSidebar;
