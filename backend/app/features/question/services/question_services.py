"""This module provides the service for the Question feature."""

from typing import List, Type

from fastapi import HTTPException, status
from sqlalchemy import not_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import delete, desc, func, or_, select

from app.core.lib.base_model_service import BaseModelService
from app.features.answer.models.answer import Answer
from app.features.interaction.models.interaction import (
    ActionContentType,
    Interaction,
    MostsInteractedTags,
)
from app.features.user_collection.models.user_collection import UserCollection
from app.features.vote.models.vote import TargetVote, Vote

from ...tag.models.tag import Tag
from ..models.question import (
    Question,
    QuestionCreate,
    QuestionLoad,
    QuestionUpdate,
    UserQuestionsResponse,
)
from ..models.question_tag_relationship import QuestionTagRelationship


class QuestionService(
    BaseModelService[Question, QuestionCreate, QuestionLoad, QuestionUpdate]
):
    """The service for the Question feature.

    This class inherits from BaseModelService and provides the business logic for
    the Question feature.
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

    async def delete(self, session: AsyncSession, id: int, commit: bool = True) -> None:
        # Delete associated answers
        await session.execute(delete(Answer).where(Answer.question_id == id))

        # Delete associated tags relationships
        await session.execute(
            delete(QuestionTagRelationship).where(
                QuestionTagRelationship.question_id == id
            )
        )

        # Delete user_collection
        await session.execute(
            delete(UserCollection).where(UserCollection.question_id == id)
        )

        # Delete vote
        await session.execute(
            delete(Vote).where(
                Vote.target_id == id, Vote.target_vote == TargetVote.QUESTION
            )
        )

        # Delete the question itself
        await session.execute(delete(Question).where(Question.id == id))
        if commit:
            await session.commit()

    async def load(self, session: AsyncSession, id: int) -> QuestionLoad | None:
        result = await session.execute(
            select(Question)
            .where(Question.id == id)
            .options(
                selectinload(Question.tags),
                selectinload(Question.author),
                selectinload(Question.answers),
            ),
        )
        question = result.scalar_one_or_none()
        if not question:
            return None
        # Ensure views is 0 if null from database
        question.views = question.views or 0
        return QuestionLoad.model_validate(question)

    async def create(
        self, session: AsyncSession, question_in: QuestionCreate, commit: bool = True
    ) -> QuestionLoad:
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
        await session.flush()  # Flush to get the id without committing
        question_id = db_question.id
        if commit:
            await session.commit()

        # After the question and relationships are saved, update the tag counts
        if tag_names:
            await self.update_num_questions_in_tags(session, tag_names, commit=commit)

        # Load the created question with relationships
        result = await session.execute(
            select(Question)
            .where(Question.id == question_id)
            .options(
                selectinload(Question.tags),
                selectinload(Question.author),
                selectinload(Question.answers),
            )
        )
        db_question = result.scalar_one()
        # Ensure views is 0 if null from database
        db_question.views = db_question.views or 0
        question_load = QuestionLoad.model_validate(db_question)

        return question_load

    async def update(
        self, session: AsyncSession, question_in: QuestionUpdate, commit: bool = True
    ) -> QuestionLoad:
        """Updates the question, handling the relationship with tags."""
        question_data = question_in.model_dump(exclude={"tags"})
        tags_value = getattr(question_in, "tags", None)

        # Load the existing question with its tags, author, and answers eagerly
        stmt = (
            select(Question)
            .where(Question.id == question_data["id"])
            .options(
                selectinload(Question.tags),
                selectinload(Question.author),
                selectinload(Question.answers),
            )
        )
        result = await session.execute(stmt)
        db_question = result.scalar_one_or_none()

        if not db_question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Question not found"
            )

        # Update scalar fields
        for field, value in question_data.items():
            if value is None:
                continue
            # Ignore views if it is 0
            if field == "views" and value == 0:
                continue
            setattr(db_question, field, value)

        # Handle tags relationship only if tags are provided
        if tags_value is not None:
            new_tag_names = [tag_name.lower() for tag_name in tags_value]

            # Store original tag names before modification for
            # update_num_questions_in_tags
            original_tag_names = [tag.name for tag in db_question.tags]

            if new_tag_names:
                unique_new_tag_names = set(new_tag_names)

                # Fetch existing tags from DB
                stmt_tags = (
                    select(Tag)
                    .where(Tag.name.in_(unique_new_tag_names))
                    .options(selectinload(Tag.questions))
                )
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
                db_question.tags = []  # Clear tags if empty list provided

            session.add(db_question)
            if commit:
                await session.commit()

            # After the question and relationships are saved, update the tag counts
            # We need to update counts for both original and new tags
            all_affected_tag_names = list(set(original_tag_names + new_tag_names))
            if all_affected_tag_names:
                await self.update_num_questions_in_tags(
                    session, all_affected_tag_names, commit=commit
                )
        else:
            session.add(db_question)
            if commit:
                await session.commit()

        if commit:
            await session.refresh(db_question)
        # Ensure views is 0 if null from database
        db_question.views = db_question.views or 0
        return QuestionLoad.model_validate(db_question)

    async def update_num_questions_in_tags(
        self, session: AsyncSession, tag_names: List[str], commit: bool = True
    ):
        """
        Updates the num_questions count for a list of tags by recalculating from
        the database.
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
        user_id: int = 0,
    ) -> List[QuestionLoad]:
        order = desc(Question.created_at)
        if filter == "popular":
            order = desc(Question.views)
        if filter == "newest":
            order = desc(Question.created_at)
        if filter == "unanswered":
            order = Question.created_at
        if filter == "recommended":
            if user_id > 0:
                return await self.get_suggested_questions(session, user_id)
            else:
                order = desc(Question.upvotes)

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

        # Ensure views is 0 if null from database
        for question in questions:
            question.views = question.views or 0

        return [QuestionLoad.model_validate(question) for question in questions]

    async def get_hot_questions(self, session: AsyncSession) -> List[QuestionLoad]:
        smtm = (
            select(Question)
            .options(
                selectinload(Question.tags),
                selectinload(Question.answers),
                selectinload(Question.author),
            )
            .limit(5)
            .order_by(desc(Question.views), desc(Question.upvotes))
        )

        result = await session.execute(smtm)
        questions = result.scalars().all()
        return [QuestionLoad.model_validate(q) for q in questions]

    async def get_total_question_by_user(
        self, session: AsyncSession, user_id: int
    ) -> int:
        smtm = (
            select(func.count(Question.id))
            .select_from(Question)
            .where(Question.author_id == user_id)
        )

        result = await session.scalar(smtm)
        return result

    async def get_user_questions(
        self, session: AsyncSession, user_id: int, page: int = 1, page_size: int = 10
    ):
        base_smtm = (
            select(Question)
            .options(
                selectinload(Question.tags),
                selectinload(Question.answers),
                selectinload(Question.author),
            )
            .where(Question.author_id == user_id)
            .order_by(desc(Question.views), desc(Question.upvotes))
        )

        paginated_smtm = base_smtm.offset((page - 1) * page_size).limit(page_size)
        paginated_result = await session.execute(paginated_smtm)
        questions = paginated_result.scalars().all()
        questions_load = [QuestionLoad.model_validate(q) for q in questions]

        count_smtm = select(func.count()).select_from(base_smtm.subquery())
        count_result = await session.execute(count_smtm)
        total = count_result.scalar() or 0

        return UserQuestionsResponse(questions=questions_load, total=total)

    async def get_top_interacted_tags(
        self, session: AsyncSession, user_id: int
    ) -> List[MostsInteractedTags]:
        stmt = (
            select(Tag.id, Tag.name, func.count(Interaction.id).label("count"))
            .join(Question, Interaction.target_id == Question.id)
            .join(
                QuestionTagRelationship,
                QuestionTagRelationship.question_id == Question.id,
            )
            .join(Tag, Tag.id == QuestionTagRelationship.tag_id)
            .where(
                Interaction.content_type == ActionContentType.QUESTION,
                Interaction.user_id == user_id,
            )
            .limit(5)
            .group_by(Tag.id, Tag.name)
            .order_by(func.count(Interaction.id).desc())
        )
        result = (await session.execute(stmt)).mappings().all()
        return [MostsInteractedTags.model_validate(row) for row in result]

    async def get_suggested_questions(
        self, session: AsyncSession, user_id: int
    ) -> List[QuestionLoad]:
        interacted_tags = await self.get_top_interacted_tags(session, user_id)
        if not interacted_tags:
            return []  # Or raise an error, depending on requirements

        tag_ids = [tag.id for tag in interacted_tags]

        # Remove the questions that the user has already interacted with.
        smtm = (
            select(Interaction.target_id)
            .where(
                Interaction.user_id == user_id,
                Interaction.content_type == ActionContentType.QUESTION,
                Interaction.other_user_id != user_id,
            )
            .distinct()
        )

        interacted_questions = (await session.exec(smtm)).all()
        interacted_question_ids = [row for row in interacted_questions] or []
        smtm = (
            select(Question)
            .join(
                QuestionTagRelationship,
                QuestionTagRelationship.question_id == Question.id,
            )
            .where(
                QuestionTagRelationship.tag_id.in_(tag_ids),
                Question.id.not_in(interacted_question_ids),  # pyright: ignore
                Question.author_id != user_id,
            )
            .options(
                selectinload(Question.tags),
                selectinload(Question.author),
                selectinload(Question.answers),
            )
            .order_by(desc(Question.upvotes))
        )

        questions = (await session.exec(smtm)).all()
        return [QuestionLoad.model_validate(q) for q in questions]
