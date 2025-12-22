import DataRenderer from "@/components/DataRenderer";
import { EMPTY_ANSWERS } from "@/constants/states";
import { AnswerLoad } from "@/types/answer";
import { ActionResponse } from "@/types/global";
import AnswerCard from "../cards/AnswerCard";

interface Props extends ActionResponse<AnswerLoad[]> {
  totalAnswers: number;
}

const AllAnswers = ({ data, success, error, totalAnswers }: Props) => {
  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">
          {totalAnswers === 0
            ? "Be the first one to answer"
            : `${totalAnswers} Answer${totalAnswers === 1 ? "" : "s"}`}
        </h3>
        <p>Filters</p>
      </div>

       <DataRenderer
         data={data}
         error={error}
         success={success}
         empty={EMPTY_ANSWERS}
         render={(answers) => answers.map((answer) => 
          <AnswerCard
            key={answer.id}
            {...answer}
          />
        )}
       />

    </div>
  );
};

export default AllAnswers;
