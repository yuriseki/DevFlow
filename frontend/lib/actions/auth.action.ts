"use server";

import {
  AccountCreate,
  AccountLoad,
  AccountSignInWithCredentials,
  AccountSignUpWithCredentials,
} from "@/types/account";
import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "@/lib/handlers/action";
import { SignUpSchema } from "@/lib/validations";
import handleError from "@/lib/handlers/error";
import { UserLoad } from "@/types/user";
import { apiUser } from "@/lib/api/apiUser";
import { apiAccount } from "@/lib/api/apiAccount";
import { SignInSchema } from "@/app/(auth)/components/forms/validations";
import { NotFoundError } from "@/lib/http-errors";
import { signIn } from "@/auth";

export async function signUpWithCredentials(
  params: AccountSignUpWithCredentials
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: SignUpSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { name, username, email, password } = validationResult.params;

  const existingEmailResult = await apiUser.loadByEmail(email);
  if (existingEmailResult.success) {
    const existingUserEmail = existingEmailResult.data as UserLoad;
    if (existingUserEmail) {
      throw new Error("User email already exists");
    }
  }

  const existingUserUsernameResult = await apiUser.loadByUsername(username);
  if (existingUserUsernameResult.success) {
    const existingUserUsername = existingUserUsernameResult.data as UserLoad;
    if (existingUserUsername) {
      throw new Error("Username already exists");
    }
  }

  const accountCreate: AccountSignUpWithCredentials = {
    name: name,
    username: username,
    email: email,
    password: password,
  };

  const accountCreateResult =
    await apiAccount.signUpWithCredentials(accountCreate);

  if (!accountCreateResult.success) {
    if (accountCreateResult.statusCode === 409) {
      throw new Error("User already exists");
    }
    throw new Error("Error creating user account");
  }

  await signIn("credentials", { email, password, redirect: false });

  return { success: true };
}

export async function signInWithCredentials(
  params: AccountSignInWithCredentials
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: SignInSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { email, password } = validationResult.params;

  const accountSignInWithCredentials: AccountSignInWithCredentials = {
    email,
    password,
  };

  const accountSignInResult: ActionResponse<AccountLoad> =
    await apiAccount.signInWithCredentials(accountSignInWithCredentials);
  if (!accountSignInResult.success) {
    throw new NotFoundError("Incorrect credentials");
  }

  await signIn("credentials", { email, password, redirect: false });
  return { success: true };
}
