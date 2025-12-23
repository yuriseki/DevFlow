import { z } from "zod";

export const SignUpSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(30, { message: "Username cannot exceed 30 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores.",
    }),

  name: z
    .string()
    .min(1, { message: "Name is required." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "Name can only contain letters and spaces.",
    }),

  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Please provide a valid email address." }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character.",
    }),
});

export const PaginatedSearchParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
  query: z.string().optional(),
  filter: z.string().optional(),
  sort: z.string().optional(),
});

export const GetTagQuestionSchema = PaginatedSearchParamsSchema.extend({
  tagId: z.string().min(1, { message: "Tag ID is required." }),
});

export const IncrementViewsSchema = z.object({
  questionId: z.number().int().positive({ error: "Question id is required" }),
});

export const AnswerSchema = z.object({
  content: z
    .string()
    .min(100, { error: "Answer has to have more than 100 character." }),
});

export const AnswerServeSchema = AnswerSchema.extend({
  question_id: z.number().int().min(1, { error: "Question ID is required" }),
});

export const GetAnswersSchema = PaginatedSearchParamsSchema.extend({
  question_id: z.number().int().min(1, { error: "Question ID is required" }),
});

export const AIAnswerSchema = z.object({
  question: z.string().min(5, {
    message: "Question title must be at least 5 characters.",
  }),
  content: z.string().min(10, {
    message: "Question description must have Minimum of 10 characters.",
  }),
  userAnswer: z.string().optional(),
});
