import React from "react";
import {
  DEFAULT_EMPTY,
  DEFAULT_ERROR,
  EMPTY_QUESTION,
} from "@/constants/states";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface StateSkeletonProps {
  image: {
    light: string;
    dark: string;
    alt: string;
  };
  title: string;
  message: string;
  button?: {
    title: string;
    href: string;
  };
}

const StateSkeleton = ({
  image,
  title,
  message,
  button,
}: StateSkeletonProps) => (
  <div className="mt-16 flex w-full flex-col items-center justify-center sm:mt-36">
    <>
      <Image
        src={image.dark}
        alt={image.alt}
        height={270}
        width={200}
        className="hidden object-contain dark:block"
      />
      <Image
        src={image.light}
        alt={image.alt}
        height={270}
        width={200}
        className="block object-contain dark:hidden"
      />

      <h2 className="h2-bold text-dark200_light900 mt-8">{title}</h2>
      <p className="body-regular text-dark500_light700 my-3.5 max-w-md text-center">
        {message}
      </p>
      {button && (
        <Link href={button.href}>
          <Button className="paragraph-medium bg-primary-500 text-light-900 hover:bg-primary-500 mt-5 min-h-[46px] rounded-lg px-4 py-3">
            {button.text}
          </Button>
        </Link>
      )}
    </>
  </div>
);

interface Props<T> {
  success: boolean;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  data: T[] | null | undefined;
  empty?: {
    title: string;
    message: string;
    button?: {
      text: string;
      href: string;
    };
  };
  render: (data: T[]) => React.ReactNode;
}
const DataRenderer = <T,>({
  success,
  error,
  data,
  empty = EMPTY_QUESTION,
  render,
}): Props<T> => {
  if (!success) {
    return (
      <StateSkeleton
        image={{
          light: "/images/light-error.png",
          dark: "/images/dark-error.png",
          alt: "Error state illustration",
        }}
        title={error?.title || DEFAULT_ERROR.title}
        message={
          error?.details
            ? JSON.stringify(error.details, null, 2)
            : DEFAULT_ERROR.message
        }
        button={DEFAULT_ERROR.button}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <StateSkeleton
        image={{
          light: "/images/light-illustration.png",
          dark: "/images/dark-illustration.png",
          alt: "Empty state illustration",
        }}
        title={empty.title}
        message={empty.message}
        button={empty.button}
      />
    );
  }

  return <div>{render(data)}</div>;
};
export default DataRenderer;
