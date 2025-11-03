"use client";

import React from "react";
import { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const ThemeProvider = ({ children, ...props }: ThemeProviderProps & { children: React.ReactNode }) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};
export default ThemeProvider;
