"use client";

import { Button } from "@/components/ui/button";
import { formUrlQuery } from "@/lib/url";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";

interface Props {
  page: number | undefined | string;
  isNext: boolean;
  containerClasses?: string;
}

const Pagination = ({ page = 1, isNext, containerClasses }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter()

  const handleNavigation = (type: 'prev' | 'next') => {
    const nextPageNumber = type === 'prev' ? Number(page) - 1 : Number(page) + 1;
    const value = nextPageNumber > 1 ? nextPageNumber.toString() : "1";

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value,
    });

    router.push(newUrl);
  }
  return (
    <div className={cn("flex w-full items-center justify-center gap-2 mt-5", containerClasses)}>
      {Number(page) > 1 && (
        <Button className="light-border-2 btn flex min-h-9 items-center justify-center gap-2 border"
          onClick={() => handleNavigation('prev')}
        >
          <p className="body-medium text-dark200_light800">Prev</p>
        </Button>
      )}

      <div className="flex items-center rounded-md bg-primary-500 px-3.5 py-2">
        <p className="body-semibold text-light-900">{page}</p>
      </div>

      {isNext && (
        <Button className="light-border-2 btn flex min-h-9 items-center justify-center gap-2 border"
          onClick={() => handleNavigation('next')}
        >
          <p className="body-medium text-dark200_light800">Next</p>
        </Button>
      )}
    </div>
  )
}

export default Pagination 
