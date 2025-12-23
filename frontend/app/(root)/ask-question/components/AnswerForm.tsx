"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { AnswerSchema } from "@/lib/validations";
import React, { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { ReloadIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { createAnswer } from "@/lib/actions/answer.action";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { apiAI } from "@/lib/api/apiAi";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

const Editor = dynamic(() => import("@/app/components/editor"), {
  // Make sure we turn SSR off
  ssr: false,
});

interface Props {
  questionId: number;
  questionTitle: string;
  questionContent: string;
}

export default function AnswerForm<T extends FieldValues>({
  questionId,
  questionTitle,
  questionContent,
}: Props) {
  const [isAnswering, startAnswertingTransition] = useTransition();
  const [isAISubmitting, setIsAISubmitting] = useState(false);
  const session = useSession();

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof AnswerSchema>) => {
    startAnswertingTransition(async () => {
      const result = await createAnswer({
        question_id: questionId,
        content: values.content,
      });

      if (result.success) {
        form.reset();

        toast.success("Yout answer as been posted successfully");

        if (editorRef.current) {
          editorRef.current.setMarkdown("");
        }
      } else {
        toast.error(result.error?.message);
      }
    });
  };

  const editorRef = React.useRef<MDXEditorMethods>(null);

  const generateAIAnswer = async () => {
    if (session.status !== "authenticated") {
      toast.info("You need to be logged in to use this feature.");
    }

    setIsAISubmitting(true);

    try {
      const { success, data, error } = await apiAI.getAnswer(
        questionTitle,
        questionContent
      );

      if (!success) {
        return toast.error(error?.message);
      }

      console.log("data", data);
      let formattedAnswer = data!.replace(/<br>/g, " ").toString().trim();

      if (editorRef.current) {
        editorRef.current.setMarkdown(formattedAnswer);
        form.setValue("content", formattedAnswer);
        form.trigger("content");
      }

      toast.success("AI generated answers is completed.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "There was a problem with your request."
      );
    } finally {
      setIsAISubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer here
        </h4>
        <Button
          className="btn light-border-2 text-primary-500 gap-1.5 rounded-md border px-4 py-2.5 shadow-none"
          disabled={isAISubmitting}
          onClick={generateAIAnswer}
        >
          {isAISubmitting ? (
            <>
              <ReloadIcon className="sizw-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Image
                src="/icons/stars.svg"
                alt="Generate AI Answer"
                height={12}
                width={12}
                className="object-contain"
              />
              Generate AI Answer
            </>
          )}
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-6 flex w-full flex-col gap-10"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormControl className="mt-3.5">
                  <Editor
                    editorRef={editorRef}
                    value={field.value}
                    fieldChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className={"flex justify-end"}>
            <Button
              type="submit"
              className="primary-gradient w-fit"
            >
              {isAnswering ? (
                <>
                  <ReloadIcon className="sizw-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Answer"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
