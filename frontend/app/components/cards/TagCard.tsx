import React from "react";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import { Badge } from "@/components/ui/badge";
import { cn, getDevIconClassName, getTechDescription } from "@/lib/utils";
import Image from "next/image";

interface Props {
  id: string;
  name: string;
  questions?: number;
  showCount?: boolean;
  compact?: boolean;
  remove?: boolean;
  isButton?: boolean;
  handleRemove?: () => void;
}

const TagCard = ({
  id,
  name,
  questions,
  showCount,
  compact,
  remove,
  isButton,
  handleRemove,
}: Props) => {
  const iconClass = getDevIconClassName(name);
  const iconDescription = getTechDescription(name);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const content = (
    <>
      <Badge className="subtle-medium background-light800_dark300 text-dark400_light500 flex flex-row gap-2 rounded-md border-none px-4 py-2 uppercase">
        <div className="flex-center space-x-2">
          <i className={`${iconClass} text-sm`}></i>
          <span>{name}</span>
        </div>

        {remove && (
          <Image
            src="/icons/close.svg"
            alt="Remove"
            width={12}
            height={12}
            className="cursor-pointer object-contain invert-0 dark:invert"
            onClick={handleRemove}
          />
        )}
      </Badge>

      {showCount && (
        <p className="small-medium text-dark500_light700">{questions}</p>
      )}
    </>
  );

  if (compact) {
    return isButton ? (
      <button
        onClick={handleClick}
        className="flex justify-between gap-2"
      >
        {content}
      </button>
    ) : (
      <Link
        href={ROUTES.TAG(id)}
        className="flex justify-between gap-2"
      >
        {content}
      </Link>
    );
  }
  else {
    return <Link href={ROUTES.TAG(id)} className="shadow-light100_darknone">
      <article className="background-light900_dark200 ligbo flex w-full flex-col rounded-2xl border px-8 sm:w-[260px] p-6">
        <div className="flex items-center justify-between">
          <div className="w-fit background-dark400_light900 rounded-sm px-5 py-1.5">
            <p className="paragraph-semibold text-dark300_light900">{name}</p>
          </div>
          <i className={cn(iconClass, "text-2xl")} aria-hidden="true" />
        </div>
        <p className="small-regular text-dark500_light700 mt-5 line-clamp-3 w-fit">
          {iconDescription}
        </p>

        <p className="small-medium text-dark400_light500 mt-3.5">
          <span className="body-semibold primary-text-gradient mr-2.5">{questions}+</span>Questions
        </p>
      </article>
    </Link >
  }
};
export default TagCard;
