"""This module provides the service for the Question feature."""

from typing import Type, List

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import not_
from sqlmodel import select, func, or_

from app.core.lib.base_model_service import BaseModelService
from ..models.question import Question, QuestionCreate, QuestionLoad, QuestionUpdate
from ..models.question_tag_relationship import QuestionTagRelationship
from ...tag.models.tag import Tag


class QuestionService(BaseModelService[Question, QuestionCreate, QuestionLoad, QuestionUpdate]):
    """The service for the Question feature.

    This class inherits from BaseModelService and provides the business logic for the Question feature.
    """

    def __init__(
        self,
        model: Type[Question],
        create_schema: Type[QuestionCreate],
        load_schema: Type[QuestionLoad],
        update_schema: Type[QuestionUpdate],
    ):
        """Initializes the QuestionService.

        Args:
            model: The Question model.
            create_schema: The QuestionCreate schema.
            load_schema: The QuestionLoad schema.
            update_schema: The QuestionUpdate schema.
        """
        super().__init__(model, create_schema, load_schema, update_schema)
        # The base BaseModelService includes a basic CRUD operation.
        # Feel free to override its functionality for more complex use cases.

    async def load(self, session: AsyncSession, id: int) -> QuestionLoad | None:
        result = await session.execute(
            select(Question)
            .where(Question.id == id)
            .options(selectinload(Question.tags), selectinload(Question.author), selectinload(Question.answers)),
        )
        question = result.scalar_one_or_none()
        if not question:
            return None
        return QuestionLoad.model_validate(question)

    async def create(self, session: AsyncSession, question_in: QuestionCreate, commit: bool = True) -> QuestionLoad:
        """Creates a new question, handling the relationship with tags."""
        question_data = question_in.model_dump(exclude={"tags"})
        tag_names = getattr(question_in, "tags", [])
        tag_names = [tag_name.lower() for tag_name in tag_names]

        db_question = Question(**question_data)

        if tag_names:
            unique_tag_names = set(tag_names)
            stmt = select(Tag).where(Tag.name.in_(unique_tag_names))
            result = await session.execute(stmt)
            existing_tags = result.scalars().all()
            existing_tag_map = {tag.name: tag for tag in existing_tags}

            processed_tags = []
            for name in unique_tag_names:
                if name in existing_tag_map:
                    processed_tags.append(existing_tag_map[name])
                else:
                    new_tag = Tag(name=name)  # type: ignore[call-arg]
                    processed_tags.append(new_tag)
            db_question.tags = processed_tags

        session.add(db_question)
        if commit:
            await session.commit()

        # After the question and relationships are saved, update the tag counts
        if tag_names:
            await self.update_num_questions_in_tags(session, tag_names, commit=commit)

        # Load the created question with relationships
        result = await session.execute(
            select(Question)
            .where(Question.id == db_question.id)
            .options(selectinload(Question.tags), selectinload(Question.author), selectinload(Question.answers))
        )
        db_question = result.scalar_one()
        question_load = QuestionLoad.model_validate(db_question)

        return question_load

    async def update(self, session: AsyncSession, question_in: QuestionUpdate, commit: bool = True) -> QuestionLoad:
        """Updates the question, handling the relationship with tags."""
        question_data = question_in.model_dump(exclude={"tags"})
        new_tag_names = [tag_name.lower() for tag_name in getattr(question_in, "tags", [])]

        # Load the existing question with its tags, author, and answers eagerly
        stmt = (
            select(Question)
            .where(Question.id == question_data["id"])
            .options(selectinload(Question.tags), selectinload(Question.author), selectinload(Question.answers))
        )
        result = await session.execute(stmt)
        db_question = result.scalar_one_or_none()

        if not db_question:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

        # Store original tag names before modification for update_num_questions_in_tags
        original_tag_names = [tag.name for tag in db_question.tags]

        # Update scalar fields
        for field, value in question_data.items():
            setattr(db_question, field, value)

        # Handle tags relationship
        if new_tag_names:
            unique_new_tag_names = set(new_tag_names)

            # Fetch existing tags from DB
            stmt_tags = select(Tag).where(Tag.name.in_(unique_new_tag_names)).options(selectinload(Tag.questions))
            result_tags = await session.execute(stmt_tags)
            existing_tags = result_tags.scalars().all()
            existing_tag_map = {tag.name: tag for tag in existing_tags}

            processed_tags = []
            for name in unique_new_tag_names:
                if name in existing_tag_map:
                    processed_tags.append(existing_tag_map[name])
                else:
                    new_tag = Tag(name=name)  # type: ignore[call-arg]
                    processed_tags.append(new_tag)
            db_question.tags = processed_tags  # Assign new list of tags
        else:
            db_question.tags = []  # Clear tags if none provided

        session.add(db_question)
        if commit:
            await session.commit()

        # After the question and relationships are saved, update the tag counts
        # We need to update counts for both original and new tags
        all_affected_tag_names = list(set(original_tag_names + new_tag_names))
        if all_affected_tag_names:
            await self.update_num_questions_in_tags(session, all_affected_tag_names, commit=commit)

        if commit:
            await session.refresh(db_question)
        return QuestionLoad.model_validate(db_question)

    async def update_num_questions_in_tags(self, session: AsyncSession, tag_names: List[str], commit: bool = True):
        """
        Updates the num_questions count for a list of tags by recalculating from the database.
        """
        if not tag_names:
            return

        # Find the tags
        tags_stmt = select(Tag).where(Tag.name.in_(tag_names))
        tags_result = await session.execute(tags_stmt)
        tags = tags_result.scalars().all()

        for tag in tags:
            # Recalculate the number of questions for this tag
            count_stmt = select(func.count(QuestionTagRelationship.question_id)).where(
                QuestionTagRelationship.tag_id == tag.id
            )
            questions_count = await session.scalar(count_stmt)
            tag.num_questions = questions_count
            session.add(tag)

        if commit:
            await session.commit()

    async def get_questions(
        self,
        session: AsyncSession,
        page: int = 1,
        page_size: int = 10,
        query: str = "",
        filter: str = "",
    ) -> List[QuestionLoad]:
        if filter == "popular":
            order = Question.upvotes.desc()  # type: ignore
        else:
            order = Question.created_at.desc()  # type: ignore

        smtm = (
            select(Question)
            .options(
                selectinload(Question.tags),
                selectinload(Question.answers),
                selectinload(Question.author),
            )
            .where(
                or_(
                    func.lower(Question.title).like(f"%{query.lower()}%"),
                    func.lower(Question.content).like(f"%{query.lower()}%"),
                ),
            )
            .offset((page - 1) * page_size)
            .limit(page_size)
            .order_by(order)
        )

        if filter == "unanswered":
            smtm = smtm.where(not_(Question.answers.any()))  # type: ignore

        result = await session.execute(smtm)
        questions = result.scalars().all()

        return [QuestionLoad.model_validate(question) for question in questions]
