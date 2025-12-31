"""This module provides the service for the Interaction feature."""

from typing import Type

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import func, select, update

from app.core.lib.base_model_service import BaseModelService
from app.features.answer.models.answer import Answer
from app.features.question.models.question import Question
from app.features.user.models import user
from app.features.user.models.user import User

from ..models.interaction import (
    ActionContentType,
    ActionPoints,
    ActionType,
    Interaction,
    InteractionCreate,
    InteractionLoad,
    InteractionUpdate,
)


class InteractionService(
    BaseModelService[Interaction, InteractionCreate, InteractionLoad, InteractionUpdate]
):
    """The service for the Interaction feature.

    This class inherits from BaseModelService and provides the business logic for
    the Interaction feature.
    """

    def __init__(
        self,
        model: Type[Interaction],
        create_schema: Type[InteractionCreate],
        load_schema: Type[InteractionLoad],
        update_schema: Type[InteractionUpdate],
    ):
        """Initializes the InteractionService.

        Args:
            model: The Interaction model.
            create_schema: The InteractionCreate schema.
            load_schema: The InteractionLoad schema.
            update_schema: The InteractionUpdate schema.
        """
        super().__init__(model, create_schema, load_schema, update_schema)
        # The base BaseModelService includes a basic CRUD operation.
        # Feel free to override its functionality for more complex use cases.

    async def create(
        self,
        session: AsyncSession,
        interaction: InteractionCreate,
        commit: bool = True,
    ):
        own_points, other_points = self.calculate_points(
            interaction.action_type, interaction.content_type
        )
        new_interaction = Interaction(**interaction.model_dump())
        new_interaction.points = own_points
        new_interaction.other_points = other_points

        # Update other user reputation.
        other_user_id = None
        if interaction.content_type == ActionContentType.QUESTION:
            question_smtm = (
                select(Question.author_id)
                .select_from(Question)
                .where(Question.id == interaction.target_id)
            )
            result = await session.execute(question_smtm)
            other_user_id = result.scalar_one_or_none()
        elif interaction.content_type == ActionContentType.ANSWER:
            answer_smtm = (
                select(Answer.user_id)
                .select_from(Answer)
                .where(Answer.id == interaction.target_id)
            )
            result = await session.execute(answer_smtm)
            other_user_id = result.scalar_one_or_none()

        if other_user_id:
            new_interaction.other_user_id = other_user_id

        session.add(new_interaction)
        await session.flush()

        # update user reputation.
        await self.update_user_reputation(session, interaction.user_id)

        # Update other user reputation.
        if other_user_id:
            await self.update_user_reputation(session, other_user_id)

        if commit:
            await session.commit()

    async def update_user_reputation(self, session: AsyncSession, user_id):
        own_reputation_smtm = (
            select(func.sum(Interaction.points))
            .select_from(Interaction)
            .where(Interaction.user_id == user_id)
        )
        result = await session.execute(own_reputation_smtm)
        total_own_points = result.scalar() or 0

        points_from_other_users_smtm = (
            select(func.sum(Interaction.other_points))
            .select_from(Interaction)
            .where(Interaction.other_user_id == user_id, Interaction.user_id != user_id)
        )
        result = await session.execute(points_from_other_users_smtm)
        total_from_others = result.scalar() or 0

        total_points = total_own_points + total_from_others
        update_smtm = (
            update(User).values(reputation=total_points).where(User.id == user_id)
        )
        await session.execute(update_smtm)

    def calculate_points(self, action: ActionType, content_type: ActionContentType):
        own_points = ActionPoints.NONE
        other_points = ActionPoints.NONE
        if action == ActionType.BOOKMARK:
            if content_type == ActionContentType.ANSWER:
                own_points = ActionPoints.BOOKMARK_CURRENT_USER
                other_points = ActionPoints.BOOKMARK_OWNER
            elif content_type == ActionContentType.QUESTION:
                own_points = ActionPoints.BOOKMARK_CURRENT_USER
                other_points = ActionPoints.BOOKMARK_OWNER
        elif action == ActionType.DELETE:
            if content_type == ActionContentType.ANSWER:
                own_points = ActionPoints.DELETE_ANSWER
            elif content_type == ActionContentType.QUESTION:
                own_points = ActionPoints.DELETE_QUESTION
        elif action == ActionType.DOWNVOTE:
            own_points = ActionPoints.DOWNVOTE_CURRENT_USER
            other_points = ActionPoints.DOWNVOTE_OWNER
        elif action == ActionType.UPVOTE:
            own_points = ActionPoints.UPVOTE_CURRENT_USER
            other_points = ActionPoints.UPVOTE_OWNER
        elif action == ActionType.POST:
            if content_type == ActionContentType.ANSWER:
                own_points = ActionPoints.POST_ANSWER
            elif content_type == ActionContentType.QUESTION:
                own_points = ActionPoints.POST_QUESTION

        return (own_points, other_points)
