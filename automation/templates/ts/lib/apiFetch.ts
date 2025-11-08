import { ActionResponse } from "@/types/global";
import logger from "@/lib/logger";
import handleError from "@/lib/handlers/error";
import { clearTimeout } from "node:timers";
import { RequestError } from "@/lib/http-errors";

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export async function fetchHandler<T>(
  endpoint: string,
  options: FetchOptions = {},
  baseUrl?: string
): Promise<ActionResponse<T>> {
  if (baseUrl == null || baseUrl === "") {
    baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  const url = `${baseUrl}${endpoint}`;
  const {
    timeout = 5000,
    headers: customHeaders = {},
    ...restOptions
  } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const headers: HeadersInit = { ...defaultHeaders, ...customHeaders };
  const config: RequestInit = {
    ...restOptions,
    headers,
    signal: controller.signal,
  };

  try {
    const res = await fetch(url, config);

    clearTimeout(id);

    if (!res.ok) {
      throw new RequestError(res.status, res.statusText);
    }

    return await res.json();
  } catch (e: unknown) {
    if (e instanceof Error) {
      if (e.name === "AbortError") {
        logger.warn(`Request to ${url} timed out`);
      } else {
        logger.error(`Error fetching ${url}: ${e.message}`);
      }
    } else {
      logger.error(`Error fetching ${url}: An unknown error occurred`);
    }

    return handleError(e) as ActionResponse<T>;
  }
}