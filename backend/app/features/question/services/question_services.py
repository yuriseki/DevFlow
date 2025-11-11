"""This module provides the service for the Question feature."""
from typing import Type, List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func

from app.core.lib.base_model_service import BaseModelService
from app.features.tag.services.tag_services import TagService
from ..models.question import Question, QuestionCreate, QuestionLoad, QuestionUpdate
from ...tag.models.tag import TagCreate, Tag, TagLoad
from ..models.question_tag_relationship import QuestionTagRelationship


class QuestionService(BaseModelService[Question, QuestionCreate, QuestionLoad, QuestionUpdate]):
    """The service for the Question feature.

    This class inherits from BaseModelService and provides the business logic for the Question feature.
    """

    def __init__(self, model: Type[Question], create_schema: Type[QuestionCreate], load_schema: Type[QuestionLoad],
                 update_schema: Type[QuestionUpdate]):
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

    async def create(self, session: AsyncSession, question_in: QuestionCreate, commit: bool = True) -> QuestionLoad:
        """Creates a new question, handling the relationship with tags."""
        question_data = question_in.model_dump(exclude={'tags'})
        tag_names = getattr(question_in, 'tags', [])
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
                    new_tag = Tag(name=name)
                    processed_tags.append(new_tag)
            db_question.tags = processed_tags

        session.add(db_question)
        await session.commit()

        # After the question and relationships are saved, update the tag counts
        if tag_names:
            await self.update_num_questions_in_tags(session, tag_names, commit=True)

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
            count_stmt = (select(func.count(QuestionTagRelationship.question_id))
                          .where(QuestionTagRelationship.tag_id == tag.id))
            questions_count = await session.scalar(count_stmt)
            tag.num_questions = questions_count
            session.add(tag)

        if commit:
            await session.commit()
