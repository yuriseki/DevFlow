"use client";

import React from "react";
import AuthForm from "@/app/(auth)/components/forms/AuthForm";
import { SignInSchema } from "@/app/(auth)/components/forms/validations";
import { signInWithCredentials } from "@/lib/actions/auth.action";

const SignIn = () => {
  return (
    <AuthForm
      formType="SIGN_IN"
      schema={SignInSchema}
      defaultValues={{
        email: "",
        password: "",
      }}
      onSubmit={signInWithCredentials}
    />
  );
};
export default SignIn;
