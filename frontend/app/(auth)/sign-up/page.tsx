"use client";

import React from "react";
import AuthForm from "@/app/(auth)/components/forms/AuthForm";
import { SignUpSchema } from "@/app/(auth)/components/forms/validations";

const SignUp = () => {
  return (
    <AuthForm
      formType="SIGN_UP"
      schema={SignUpSchema}
      defaultValues={{
        name: "",
        userName: "",
        email: "",
        password: "",
      }}
      onSubmit={(data) => Promise.resolve({ success: true, data })}
    />
  );
};
export default SignUp;
