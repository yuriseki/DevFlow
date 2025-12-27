"""This module provides the service for the Answer feature."""

from typing import List, Type

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from sqlmodel import desc, func, select

from sqlalchemy.exc import IntegrityError

from app.core.lib.base_model_service import BaseModelService
from ..models.answer import Answer, AnswerCreate, AnswerLoad, AnswerUpdate, AnswersForQuestionResponse


class AnswerService(BaseModelService[Answer, AnswerCreate, AnswerLoad, AnswerUpdate]):
    """The service for the Answer feature.

    This class inherits from BaseModelService and provides the business logic for the Answer feature.
    """

    def __init__(
        self,
        model: Type[Answer],
        create_schema: Type[AnswerCreate],
        load_schema: Type[AnswerLoad],
        update_schema: Type[AnswerUpdate],
    ):
        """Initializes the AnswerService.

        Args:
            model: The Answer model.
            create_schema: The AnswerCreate schema.
            load_schema: The AnswerLoad schema.
            update_schema: The AnswerUpdate schema.
        """
        super().__init__(model, create_schema, load_schema, update_schema)
        # The base BaseModelService includes a basic CRUD operation.
        # Feel free to override its functionality for more complex use cases.

    async def create(self, session: AsyncSession, obj_in: AnswerCreate, commit: bool = True) -> AnswerLoad:
        obj = self.model(**obj_in.model_dump())
        session.add(obj)
        try:
            await session.flush()
            if commit:
                await session.commit()
                await session.refresh(obj, ["user"])
            return self.load_schema.model_validate(obj)
        except IntegrityError as e:
            await session.rollback()
            raise e

    async def get_answers_for_question(
        self,
        session: AsyncSession,
        question_id,
        page: int = 1,
        page_size: int = 10,
        filter: str = "",
    ) -> AnswersForQuestionResponse:
        """
        Retrieves answers for a specific question with pagination and total count.

        Args:
            session (AsyncSession): The async database session.
            question_id: The ID of the question to get answers for.
            page (int): The page number (default 1).
            page_size (int): Number of answers per page (default 10).

        Returns:
            AnswersForQuestionResponse: Object containing the list of answers and total count.
        """
        order = desc(Answer.upvotes)
        if filter == "popular":
            order = desc(Answer.upvotes)
        if filter == "oldest":
            order = Answer.created_at
        if filter == "latest":
            order = desc(Answer.created_at)

        smtm = (
            select(Answer)
            .options(selectinload(Answer.user))
            .where(Answer.question_id == question_id)
            .offset((page - 1) * page_size)
            .limit(page_size)
            .order_by(order)
        )

        result = await session.execute(smtm)
        answers = result.scalars().all()
        answers_list = [AnswerLoad.model_validate(answer) for answer in answers]

        count_stmt = select(func.count()).select_from(Answer).where(Answer.question_id == question_id)
        total_result = await session.execute(count_stmt)
        total = total_result.scalar() or 0

        return AnswersForQuestionResponse(answers=answers_list, total=total)
