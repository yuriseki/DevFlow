import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "@auth/core/providers/google";
import { apiAccount } from "@/lib/api/apiAccount";
import {
  AccountLoad,
  AccountSignInWithCredentials,
  AccountSignInWithOauth,
} from "@/types/account";
import { UserCreate, UserLoad } from "@/types/user";
import { ActionResponse } from "@/types/global";
import { SignInSchema } from "@/app/(auth)/components/forms/validations";
import { apiUser } from "@/lib/api/apiUser";
import * as z from "zod";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Google,
    Credentials({
      async authorize(
        credentials: Partial<Record<keyof z.infer<typeof SignInSchema>, string>>
      ) {
        const validatedFields = SignInSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const signInAccount: AccountSignInWithCredentials = {
            email,
            password,
          };

          const { data: existingAccount } =
            (await apiAccount.signInWithCredentials(
              signInAccount
            )) as ActionResponse<AccountLoad>;

          if (!existingAccount) {
            return null;
          }

          const { data: existingUser } = (await apiUser.getUser(
            existingAccount.user_id
          )) as ActionResponse<UserLoad>;

          if (existingUser) {
            return {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
              image: existingUser.image,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub as string;
      return session;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        if (account.type === "credentials") {
          token.sub = user.id;
        } else {
          const { data: existingAccount, success } =
            (await apiAccount.loadByProviderAccountId(
              account.providerAccountId
            )) as ActionResponse<AccountLoad>;

          if (success && existingAccount) {
            const userId = existingAccount.user_id;
            if (userId) token.sub = userId.toString();
          }
        }
      }

      return token;
    },
    async signIn({ user, profile, account }) {
      if (account?.type === "credentials") return true;

      // Ensure account and user are defined
      if (!account || !user) {
        console.error(
          "NextAuth signIn callback: 'account' or 'user' is undefined/null."
        );
        return false;
      }

      // Ensure essential account properties are defined
      const provider = account.provider;
      const providerAccountId = account.providerAccountId;

      if (!provider || !providerAccountId) {
        console.error(
          "NextAuth signIn callback: 'account.provider' or 'account.providerAccountId' is undefined/null."
        );
        return false;
      }

      // Construct userInfo with fallbacks
      const userInfo: UserCreate = {
        name: user.name || "Unknown Name",
        email: user.email || "unknown@example.com",
        image: user.image || "/default-avatar.png", // Provide a default image path
        username:
          provider === "github" && profile?.login
            ? (profile.login as string)
            : user.name?.toLowerCase() || "unknown_username", // Fallback for username
      };

      const accountWithOauth: AccountSignInWithOauth = {
        provider: provider as "github" | "google",
        provider_account_id: providerAccountId,
        user: userInfo,
      };

      const response = (await apiAccount.signInWithOauth(
        accountWithOauth
      )) as ActionResponse<AccountLoad>;

      if (!response.success) {
        console.error(
          "Failed to sign in with OAuth on backend:",
          response.error
        );
        return false;
      } else {
        return true;
      }
    },
  },
});
