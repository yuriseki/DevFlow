import { z } from "zod";

export const AskQuestionSchema = z.object({
  title: z
    .string()
    .min(5, { error: "Title is required." })
    .max(100, { error: "Title cannot exceed 100 characters." }),

  content: z.string().min(1, { error: "Body is required" }),

  tags: z
    .array(
      z
        .string()
        .min(1, { error: "Tag is required." })
        .max(30, { error: "Tag cannot exceed 20 characters." })
    )
    .min(1, { error: "At least one tag is required." })
    .max(3, { error: "Cannot add more than 3 tags." }),
});

export const EditQuestionSchema = AskQuestionSchema.extend({
  id: z.int().min(1, { error: "ID is required." }),
});

export const GetQuestionSchema = z.object({
  id: z.int().min(1, { error: "ID is required." }),
});
