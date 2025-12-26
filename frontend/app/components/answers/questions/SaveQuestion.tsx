"use client";

import { toggleSaveQuestion } from "@/lib/actions/collection.action";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

const SaveQuestion = ({ questionId }: { questionId: number }) => {
  const session = useSession()
  const userId = session.data?.user?.id;

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (isLoading) {
      return;
    }
    if (!userId) {
      return toast.error("You need to be logged in to save a question");
    }

    setIsLoading(true);

    try {
      const { success, error } = await toggleSaveQuestion({ questionId });

      if (!success) {
        throw new Error(error instanceof Error ? error.message : "An error occurred");
      }

      toast.success("Question update successfully!");
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
    finally {
      setIsLoading(false);
    }
  }

  const hasSaved = false;
  
  return (
    <Image
      src={hasSaved ? `/icons/star-filled.svg` : `/icons/star-red.svg`}
      width={18}
      height={18}
      alt="save"
      className={`cursor-pointer ${isLoading && 'opacity-50'}`}
      aria-label="Save question"
      onClick={handleSave}
    />
  )
}

export default SaveQuestion
