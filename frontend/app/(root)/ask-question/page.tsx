import React from "react";
import QuestionForm from "@/app/(root)/ask-question/components/QuestionForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ROUTES from "@/constants/routes";

const AskAQuestion = async () => {
  const session = await auth();

  if (!session) {
    return redirect(ROUTES.SIGN_IN);
  }

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Ask a Question</h1>

      <div className="mt-9">
        <QuestionForm />
      </div>
    </>
  );
};
export default AskAQuestion;
