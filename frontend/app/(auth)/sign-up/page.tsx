"use client";

import React from "react";
import AuthForm from "@/app/(auth)/components/forms/AuthForm";
import { SignUpSchema } from "@/app/(auth)/components/forms/validations";
import { signUpWithCredentials } from "@/lib/actions/auth.action";

const SignUp = () => {
  return (
    <AuthForm
      formType="SIGN_UP"
      schema={SignUpSchema}
      defaultValues={{
        name: "",
        username: "",
        email: "",
        password: "",
      }}
      onSubmit={signUpWithCredentials}
    />
  );
};
export default SignUp;
