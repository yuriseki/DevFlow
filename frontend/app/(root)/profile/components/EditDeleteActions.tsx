"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
interface Props {
  type: string;
  itemId: number;
}

const EditDeleteActions = ({ type, itemId }: Props) => {
  const router = useRouter()

  const handleEdit = async () => {
    if (type === "Question") {
      router.push(`/questions/${itemId}/edit`);
    }
  };

  const handleDelete = async () => {

    if (type === 'Question') {
      // Call api to delete the question.

      toast.success("Question deleted", { description: "Your question has been deleted sussessfully." })
    } else if (type === "Answer") {
      // Call api to delete answer.
      toast.success("Answer deleted", { description: "Your answer has been deleted sussessfully." })
    }
  };
  return (
    <div className="flex items-center justify-end gap-3 max-sm:w-full">
      {type === "Question" && (
        <Image
          src="/icons/edit.svg"
          alt="edit"
          width={14}
          height={14}
          className="cursor-pointer object-contain"
          onClick={handleEdit}
        />
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild className="cursor-pointer">
          <Image
            src="/icons/trash.svg"
            alt="trash"
            width={14}
            height={14}
          />
        </AlertDialogTrigger>
        <AlertDialogContent className="background-light800_dark300">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete
              your {type === "Question" ? "question" : "answer"} and remove it
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="btn">Cancel</AlertDialogCancel>
            <AlertDialogAction className="border-primary-100 bg-primary-500 text-light-800" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default EditDeleteActions
