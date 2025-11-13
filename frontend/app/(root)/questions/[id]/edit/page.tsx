import React from "react";
import QuestionForm from "@/app/(root)/ask-question/components/QuestionForm";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import ROUTES from "@/constants/routes";
import { RouteParams } from "@/types/global";
import { getQuestion } from "@/lib/actions/questions.action";

const EditQuestion = async ({ params }: RouteParams) => {
  const { id } = await params;
  if (!id) return notFound();
  const session = await auth();

  if (!session) {
    return redirect(ROUTES.SIGN_IN);
  }

  const { success, data: question } = await getQuestion({ id: parseInt(id) });

  if (!success) return notFound();

  if (parseInt(question?.author_id) !== parseInt(session?.user?.id))
    return redirect(ROUTES.QUESTION(parseInt(id)));

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Update Question</h1>

      <div className="mt-9">
        <QuestionForm
          question={question}
          isEdit
        />
      </div>
    </>
  );
};
export default EditQuestion;
