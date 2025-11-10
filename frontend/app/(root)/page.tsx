import React from "react";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import LocalSearch from "@/app/components/search/LocalSearch";
import HomeFilter from "@/app/components/filters/HomeFilter";
import QuestionCard from "@/app/components/cards/QuestionCard";
import { auth } from "@/auth";

const questions = [
  {
    _id: 1,
    title: "How to learn React",
    description: "I want to learn React, can anyone help me?",
    tags: [
      { _id: 1, name: "react" },
      { _id: 2, name: "javascript" },
    ],
    author: {
      _id: 1,
      name: "John Doe",
      image:
        "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740&q=80",
    },
    upvotes: 10,
    answers: 5,
    views: 101,
    createdAt: new Date("2025-05-25"),
  },
  {
    _id: 2,
    title: "What is Next.js?",
    description: "Can someone explain what Next.js is?",
    tags: [
      { _id: 3, name: "nextjs" },
      { _id: 2, name: "javascript" },
    ],
    author: {
      _id: 2,
      name: "Jane Smith",
      image:
        "https://img.freepik.com/free-vector/woman-with-braided-hair-illustration_1308-174675.jpg?semt=ais_hybrid&w=740&q=80",
    },
    upvotes: 7,
    answers: 3,
    views: 75,
    createdAt: new Date("2025-05-25"),
  },
  {
    _id: 3,
    title: "Best practices for CSS",
    description: "What are the best practices for writing CSS?",
    tags: [
      { _id: 4, name: "css" },
      { _id: 5, name: "webdev" },
    ],
    author: {
      _id: 3,
      name: "Alice Johnson",
      image:
        "https://img.freepik.com/free-vector/woman-with-braided-hair-illustration_1308-174675.jpg?semt=ais_hybrid&w=740&q=80",
    },
    upvotes: 15,
    answers: 8,
    views: 150,
    createdAt: new Date("2025-05-25"),
  },
  {
    _id: 4,
    title: "JavaScript async/await",
    description: "How does async/await work in JavaScript?",
    tags: [
      { _id: 2, name: "javascript" },
      { _id: 6, name: "async" },
    ],
    author: {
      _id: 4,
      name: "Bob Brown",
      image:
        "https://img.freepik.com/free-vector/woman-with-braided-hair-illustration_1308-174675.jpg?semt=ais_hybrid&w=740&q=80",
    },
    upvotes: 12,
    answers: 4,
    views: 90,
    createdAt: new Date("2025-05-25"),
  },
  {
    _id: 5,
    title: "State management in React",
    description: "What are the options for state management in React?",
    tags: [
      { _id: 1, name: "react" },
      { _id: 7, name: "state-management" },
    ],
    author: {
      _id: 5,
      name: "Charlie Davis",
      image:
        "https://img.freepik.com/free-vector/woman-with-braided-hair-illustration_1308-174675.jpg?semt=ais_hybrid&w=740&q=80",
    },
    upvotes: 9,
    answers: 6,
    views: 80,
    createdAt: new Date("2025-05-25"),
  },
  {
    _id: 6,
    title: "TypeScript vs JavaScript",
    description: "Should I use TypeScript or JavaScript for my next project?",
    tags: [
      { _id: 8, name: "typescript" },
      { _id: 2, name: "javascript" },
    ],
    author: {
      _id: 6,
      name: "Diana Evans",
      image:
        "https://img.freepik.com/free-vector/woman-with-braided-hair-illustration_1308-174675.jpg?semt=ais_hybrid&w=740&q=80",
    },
    upvotes: 14,
    answers: 7,
    views: 120,
    createdAt: new Date("2025-05-25"),
  },
  {
    _id: 7,
    title: "Responsive design techniques",
    description: "What are some techniques for responsive web design?",
    tags: [
      { _id: 5, name: "webdev" },
      { _id: 9, name: "responsive-design" },
    ],
    author: {
      _id: 7,
      name: "Ethan Foster",
      image:
        "https://img.freepik.com/free-vector/woman-with-braided-hair-illustration_1308-174675.jpg?semt=ais_hybrid&w=740&q=80",
    },
    upvotes: 11,
    answers: 2,
    views: 95,
    createdAt: new Date("2025-05-25"),
  },
  {
    _id: 8,
    title: "Deploying a web app",
    description: "What are the best platforms for deploying a web application?",
    tags: [
      { _id: 10, name: "deployment" },
      { _id: 5, name: "webdev" },
    ],
    author: {
      _id: 8,
      name: "Fiona Green",
      image:
        "https://img.freepik.com/free-vector/woman-with-braided-hair-illustration_1308-174675.jpg?semt=ais_hybrid&w=740&q=80",
    },
    upvotes: 13,
    answers: 5,
    views: 110,
    createdAt: new Date("2025-05-25"),
  },
  {
    _id: 9,
    title: "Understanding closures in JavaScript",
    description: "Can someone explain closures in JavaScript?",
    tags: [
      { _id: 2, name: "javascript" },
      { _id: 11, name: "closures" },
    ],
    author: {
      _id: 9,
      name: "George Harris",
      image:
        "https://img.freepik.com/free-vector/woman-with-braided-hair-illustration_1308-174675.jpg?semt=ais_hybrid&w=740&q=80",
    },
    upvotes: 8,
    answers: 3,
    views: 70,
    createdAt: new Date("2025-05-25"),
  },
];

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

const Home = async ({ searchParams }: SearchParams) => {
  const { query = "", filter = "" } = await searchParams;
  const filteredQuestions = questions.filter((question) =>
    question.title.toLowerCase().includes(query?.toLowerCase())
  );
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
      <div className="mt-10 flex w-full flex-col gap-6">
        {filteredQuestions.map((question) => (
          <QuestionCard
            key={question._id}
            question={question}
          />
        ))}
      </div>
    </>
  );
};
export default Home;
