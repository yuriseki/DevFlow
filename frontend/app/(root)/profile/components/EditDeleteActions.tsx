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
import { deleteAnswer } from "@/lib/actions/answer.action";
import { deleteQuestion } from "@/lib/actions/questions.action";
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
      try {
        const { success, error } = await deleteQuestion({ questionId: itemId });
        if (!success) {
          toast.error("Error deleting question", { description: error?.message })
        }
        else {
          toast.success("Question deleted", { description: "Your question has been deleted sussessfully." })
          // Revalidate current path to update the list
          router.refresh();
        }
      }
      catch (error) {
        toast.error("Error deleting question", { description: "Error deleting quesiton." })
      }

    } else if (type === "Answer") {
      try {
        const { success, error } = await deleteAnswer({ answerId: itemId });
        if (!success) {
          toast.error("Error deleting answer", { description: error?.message })
        } else {
          router.refresh();
          toast.success("Answer deleted", { description: "Your answer has been deleted sussessfully." })
        }
      }
      catch (error) {
        toast.error("Error deleting answer", { description: "The asnwer could not be deleted." })
      }
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
