"""This module provides the service for the Tag feature."""

from typing import List, Type

from sqlalchemy import asc, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import and_, col, func, or_, select

from app.core.lib.base_model_service import BaseModelService
from app.features.question.models.question import Question, QuestionLoad
from app.features.question.models.question_tag_relationship import (
    QuestionTagRelationship,
)

from ..models.tag import Tag, TagCreate, TagLoad, TagUpdate


class TagService(BaseModelService[Tag, TagCreate, TagLoad, TagUpdate]):
    """The service for the Tag feature.

    This class inherits from BaseModelService and provides the business logic for the Tag feature.
    """

    def __init__(
        self,
        model: Type[Tag] = Tag,
        create_schema: Type[TagCreate] = TagCreate,
        load_schema: Type[TagLoad] = TagLoad,
        update_schema: Type[TagUpdate] = TagUpdate,
    ):
        """Initializes the TagService.

        Args:
            model: The Tag model.
            create_schema: The TagCreate schema.
            load_schema: The TagLoad schema.
            update_schema: The TagUpdate schema.
        """
        super().__init__(model, create_schema, load_schema, update_schema)
        # The base BaseModelService includes a basic CRUD operation.
        # Feel free to override its functionality for more complex use cases.

    async def create(self, session: AsyncSession, obj_in: TagCreate, commit: bool = True) -> TagLoad:
        """Creates a new tag instance."""
        name = obj_in.name.lower().strip()
        tag_load = await self.load_by_name(session, name)
        if tag_load is None:
            tag_load = await super().create(session, obj_in, commit=commit)

        return tag_load

    async def load_by_name(self, session: AsyncSession, name: str) -> TagLoad | None:
        """Loads a tag by its name."""
        smtm = select(Tag).where(Tag.name == name)
        result = await session.execute(smtm)
        tag = result.scalar_one_or_none()
        if tag:
            tag_load: TagLoad = TagLoad.model_validate(tag)
            return tag_load

        return None

    async def get_tags(
        self,
        session: AsyncSession,
        page: int = 1,
        page_size: int = 10,
        query: str = "",
        filter: str = "",
    ) -> List[TagLoad]:
        """Return a list of tags bases on query"""

        # Default to popular
        order = desc(col(Tag.num_questions))
        if filter == "popular":
            order = desc(col(Tag.num_questions))
        if filter == "recent":
            order = asc(col(Tag.created_at))
        if filter == "oldest":
            order = desc(col(Tag.created_at))
        if filter == "name":
            order = asc(col(Tag.name))

        smtm = (
            select(Tag)
            .options(selectinload(Tag.questions))
            .where(
                or_(
                    func.lower(Tag.name) == query.lower(),
                    query == "",
                )
            )
            .offset((page - 1) * page_size)
            .limit(page_size)
            .order_by(order)
        )

        result = await session.execute(smtm)
        tags = result.scalars().all()

        tags_load = [TagLoad.model_validate(tag) for tag in tags]

        return tags_load

    async def get_tag_questions(
        self,
        session: AsyncSession,
        tag_id: int,
        page: int = 1,
        page_size: int = 10,
        query: str = "",
    ) -> List[QuestionLoad]:
        """Return a list of tags bases on query"""

        smtm = (
            select(Question)
            .join(QuestionTagRelationship)
            .options(
                selectinload(Question.tags),
                selectinload(Question.answers),
                selectinload(Question.author),
            )
            .where(
                and_(
                    Question.id == QuestionTagRelationship.question_id,
                    QuestionTagRelationship.tag_id == tag_id,
                    or_(
                        func.lower(Question.title).like(f"%{query.lower()}%"),
                        func.lower(Question.content).like(f"%{query.lower()}%"),
                    ),
                )
            )
            .offset((page - 1) * page_size)
            .limit(page_size)
            .order_by(desc(col(Question.upvotes)))
        )

        result = await session.execute(smtm)
        questions = result.scalars().all()

        questions_load = [QuestionLoad.model_validate(question) for question in questions]

        return questions_load
