"""This module provides the service for the Answer feature."""

from typing import List, Type

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import desc, select

from app.core.lib.base_model_service import BaseModelService
from ..models.answer import Answer, AnswerCreate, AnswerLoad, AnswerUpdate


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

    async def get_answers_for_question(
        self,
        session: AsyncSession,
        question_id,
        page: int = 1,
        page_size: int = 10,
    ) -> List[AnswerLoad]:
        """
        Retrieves answers for a specific question with pagination.

        Args:
            session (AsyncSession): The async database session.
            question_id: The ID of the question to get answers for.
            page (int): The page number (default 1).
            page_size (int): Number of answers per page (default 10).

        Returns:
            List[AnswerLoad]: A list of AnswerLoad objects.
        """
        smtm = (
            select(Answer)
            .where(Answer.question_id == question_id)
            .offset((page - 1) * page_size)
            .limit(page_size)
            .order_by(desc(Answer.created_at))
        )

        result = await session.execute(smtm)
        answers = result.scalars().all()

        return [AnswerLoad.model_validate(answer) for answer in answers]
