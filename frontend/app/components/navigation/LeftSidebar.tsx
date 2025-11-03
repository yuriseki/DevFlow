import React from "react";
import NavLinks from "@/app/components/navigation/navbar/NavLinks";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const LeftSidebar = () => {
  return (
    <section className="custom-scrollbar background-light900_dark200 light-border shadow-light-300 sticky top-0 left-0 flex h-screen flex-col justify-between overflow-y-auto border-r p-6 pt-36 max-sm:hidden lg:w-[266px] dark:shadow-none">
      <div className="flex flex-1 flex-col gap-6">
        <NavLinks isMobileNav={false} />
      </div>
      <div className="flex flex-col gap-3">
        <Button asChild className="small-medium btn-secondary min-h-[41px] w-full rounded-lg py-3 shadow-none">
          <Link href={ROUTES.SIGN_IN}>
            <Image src="/icons/account.svg" alt="account" width={20} height={20} className="invert-colors lg:hidden" />
            <span className="primary-text-gradient max-lg:hidden">Log In</span>
          </Link>
        </Button>

        <Button
          asChild
          className="small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none"
        >
          <Link href={ROUTES.SIGN_UP}>
            <Image src="/icons/sign-up.svg" alt="sugn-up" width={20} height={20} className="invert-colors lg:hidden" />
            <span className="max-lg:hidden">Sign Up</span>
          </Link>
        </Button>
      </div>
    </section>
  );
};
export default LeftSidebar;
