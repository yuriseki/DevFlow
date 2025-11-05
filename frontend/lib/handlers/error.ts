import {
  RequestError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/http-errors";
import { ZodError, z } from "zod";

export type ResponseType = "api" | "server";

const formatResponse = (
  responseType: ResponseType,
  statusCode: number,
  message: string,
  errors?: Record<string, string[]> | undefined
) => {
  const responseContent = {
    success: false,
    error: {
      message,
      details: errors,
    },
  };

  return responseType === "api"
    ? responseContent.json(responseContent, { statusCode, errors })
    : { statusCode, ...responseContent };
};

const handleError = (error: unknown, responseType: ResponseType = "server") => {
  if (error instanceof RequestError) {
    return formatResponse(
      responseType,
      error.statusCode,
      error.message,
      error.errors
    );
  }

  if (error instanceof ZodError) {
    const validationError = new ValidationError(
      z.flattenError(error).fieldErrors as Record<string, string>
    );

    return formatResponse(
      responseType,
      validationError.statusCode,
      validationError.message,
      validationError.errors
    );
  }

  if (error instanceof Error) {
    return formatResponse(responseType, 500, error.message);
  }

  return formatResponse(responseType, 500, "Unexpected error occurred");
};

export default handleError;
