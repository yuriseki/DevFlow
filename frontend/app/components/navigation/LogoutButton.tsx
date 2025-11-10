"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useTransition } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    startTransition(() => {
      signOut({ redirect: false }).then(() => {
        router.refresh();
      });
    });
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isPending}
      className="base-medium w-fit !bg-transparent px-4 py-3"
    >
      <LogOut className="size-5 text-black dark:text-white" />
      <span className="text-dark300_light900">
        {isPending ? "Logging out..." : "Log Out"}
      </span>
    </Button>
  );
}
