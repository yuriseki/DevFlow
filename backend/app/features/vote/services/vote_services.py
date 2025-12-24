"""This module provides the service for the Vote feature."""

from typing import Type

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.functions import count
from sqlmodel import delete, func, select, update

from app.core.lib.base_model_service import BaseModelService
from app.features.answer.models.answer import Answer
from app.features.question.models.question import Question

from ..models.vote import (
    TargetVote,
    Vote,
    VoteCreate,
    VoteDoVote,
    VoteFind,
    VoteLoad,
    VoteType,
    VoteUpdate,
)


class VoteService(BaseModelService[Vote, VoteCreate, VoteLoad, VoteUpdate]):
    """The service for the Vote feature.

    This class inherits from BaseModelService and provides the business logic for the Vote feature.
    """

    def __init__(
        self,
        model: Type[Vote],
        create_schema: Type[VoteCreate],
        load_schema: Type[VoteLoad],
        update_schema: Type[VoteUpdate],
    ):
        """Initializes the VoteService.

        Args:
            model: The Vote model.
            create_schema: The VoteCreate schema.
            load_schema: The VoteLoad schema.
            update_schema: The VoteUpdate schema.
        """
        super().__init__(model, create_schema, load_schema, update_schema)
        # The base BaseModelService includes a basic CRUD operation.
        # Feel free to override its functionality for more complex use cases.

    async def find_vote(
        self,
        session: AsyncSession,
        vote: VoteFind,
    ) -> VoteLoad | None:
        smtm = (
            select(Vote)
            .where(
                Vote.user_id == vote.user_id,
                Vote.target_id == vote.target_id,
                Vote.target_vote == vote.target_vote,
            )
            .limit(1)
        )

        result = await session.execute(smtm)
        scalar_result = result.scalars()
        first_vote = scalar_result.first()
        if first_vote is None:
            return None

        vote_load = VoteLoad.model_validate(first_vote)
        return vote_load

    async def do_vote(
        self,
        session: AsyncSession,
        vote: VoteDoVote,
    ) -> VoteLoad | None:
        vote_find = VoteFind.model_validate(vote.model_dump())
        existing_vote = await self.find_vote(session, vote_find)

        if not existing_vote:
            # Create a new vote
            new_vote = Vote(**vote.model_dump())
            session.add(new_vote)
            await session.commit()
            await session.refresh(new_vote)
        else:
            # Update vote.
            existing_vote_db = await session.get(Vote, existing_vote.id)
            if existing_vote_db and existing_vote_db.vote_type == vote.vote_type:
                # Remove existing vote.
                await session.delete(existing_vote_db)
                await session.commit()
            elif existing_vote_db:
                # Change vote type
                existing_vote_db.vote_type = vote.vote_type
                await session.commit()

        # Update target count.
        if vote.target_vote == TargetVote.QUESTION:
            upvotes_smtm = (
                select(func.count())
                .select_from(Vote)
                .where(
                    Vote.target_id == vote.target_id,
                    Vote.target_vote == TargetVote.QUESTION,
                    Vote.vote_type == VoteType.UPVOTE,
                )
            )
            result = await session.execute(upvotes_smtm)
            upvotes_count = result.scalar()

            downvotes_smtm = (
                select(func.count())
                .select_from(Vote)
                .where(
                    Vote.target_id == vote.target_id,
                    Vote.target_vote == TargetVote.QUESTION,
                    Vote.vote_type == VoteType.DOWNVOTE,
                )
            )
            result = await session.execute(downvotes_smtm)
            downvotes_count = result.scalar()

            smtm = (
                update(Question)
                .where(Question.id == vote.target_id)
                .values(upvotes=upvotes_count, downvotes=downvotes_count)
            )
            await session.execute(smtm)
            await session.commit()

        elif vote.target_vote == TargetVote.ANSWER:
            upvotes_smtm = (
                select(func.count())
                .select_from(Vote)
                .where(
                    Vote.target_id == vote.target_id,
                    Vote.target_vote == TargetVote.ANSWER,
                    Vote.vote_type == VoteType.UPVOTE,
                )
            )
            result = await session.execute(upvotes_smtm)
            upvotes_count = result.scalar()

            downvotes_smtm = (
                select(func.count())
                .select_from(Vote)
                .where(
                    Vote.target_id == vote.target_id,
                    Vote.target_vote == TargetVote.ANSWER,
                    Vote.vote_type == VoteType.DOWNVOTE,
                )
            )
            result = await session.execute(downvotes_smtm)
            downvotes_count = result.scalar()

            smtm = (
                update(Answer)
                .where(Answer.id == vote.target_id)
                .values(upvotes=upvotes_count, downvotes=downvotes_count)
            )
            await session.execute(smtm)
            await session.commit()
        return None
