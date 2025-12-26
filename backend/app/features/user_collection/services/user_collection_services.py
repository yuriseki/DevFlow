"""This module provides the service for the UserCollection feature."""

from typing import Type

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import and_, desc, func, or_, select

from app.core.lib.base_model_service import BaseModelService
from app.features.question.models.question import Question, QuestionLoad

from ..models.user_collection import (
    UserCollection,
    UserCollectionCreate,
    UserCollectionLoad,
    UserCollectionPaginatedResponse,
    UserCollectionUpdate,
)


class UserCollectionService(
    BaseModelService[
        UserCollection, UserCollectionCreate, UserCollectionLoad, UserCollectionUpdate
    ]
):
    """The service for the UserCollection feature.

    This class inherits from BaseModelService and provides the business logic for the UserCollection feature.
    """

    def __init__(
        self,
        model: Type[UserCollection],
        create_schema: Type[UserCollectionCreate],
        load_schema: Type[UserCollectionLoad],
        update_schema: Type[UserCollectionUpdate],
    ):
        """Initializes the UserCollectionService.

        Args:
            model: The UserCollection model.
            create_schema: The UserCollectionCreate schema.
            load_schema: The UserCollectionLoad schema.
            update_schema: The UserCollectionUpdate schema.
        """
        super().__init__(model, create_schema, load_schema, update_schema)
        # The base BaseModelService includes a basic CRUD operation.
        # Feel free to override its functionality for more complex use cases.

    async def load(self, session: AsyncSession, user_id: int, question_id: int):
        smtm = select(UserCollection).where(
            UserCollection.user_id == user_id,
            UserCollection.question_id == question_id,
        )

        result = await session.execute(smtm)
        collection = result.scalar_one_or_none()
        if collection is not None:
            collection = UserCollectionLoad.model_validate(collection)
        return collection

    async def toggle(self, session: AsyncSession, user_id: int, question_id: int):
        smtm = select(UserCollection).where(
            UserCollection.user_id == user_id,
            UserCollection.question_id == question_id,
        )
        result = await session.execute(smtm)
        collection = result.scalar_one_or_none()

        if not collection:
            new_collection = UserCollection(user_id=user_id, question_id=question_id)
            session.add(new_collection)
        else:
            await session.delete(collection)

        await session.commit()

    async def get_user_saved_questions(
        self,
        session: AsyncSession,
        user_id: int,
        page: int = 1,
        page_size: int = 10,
        query: str = "",
        filter: str = "",
    ) -> UserCollectionPaginatedResponse:
        order = desc(Question.upvotes)
        if filter == "mostrecent":
            order = desc(UserCollection.created_at)
        if filter == "mostvoted":
            order = desc(Question.upvotes)
        if filter == "mostviewed":
            order = desc(Question.upvotes)
        if filter == "mostanswered":
            order = desc(Question.answers)

        base_smtm = (
            select(Question)
            .join(UserCollection)
            .options(
                selectinload(Question.tags),
                selectinload(Question.answers),
                selectinload(Question.author),
            )
            .where(
                and_(
                    Question.id == UserCollection.question_id,
                    UserCollection.user_id == user_id,
                    or_(
                        func.lower(Question.title).like(f"%{query.lower()}%"),
                        func.lower(Question.content).like(f"%{query.lower()}%"),
                    ),
                )
            )
        )

        paginated_smtm = (
            base_smtm.offset((page - 1) * page_size).limit(page_size).order_by(order)
        )
        paginated_result = await session.execute(paginated_smtm)
        questions = paginated_result.scalars().all()
        questions_load = [QuestionLoad.model_validate(q) for q in questions]

        count_smtm = select(func.count()).select_from(base_smtm.subquery())

        count_result = await session.execute(count_smtm)
        total = count_result.scalar() or 0

        return UserCollectionPaginatedResponse(questions=questions_load, total=total)
