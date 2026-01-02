from operator import and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import func, select

from app.features.answer.models.answer import Answer
from app.features.interaction.models.interaction import (
    ActionContentType,
    ActionType,
    Interaction,
)
from app.features.question.models.question import Question
from app.features.vote.models.vote import Vote, VoteType

from ..models.badges import (
    AnswerCount,
    AnswerUpvotes,
    Badges,
    QuestionCount,
    QuestionUpvotes,
    TotalViews,
)


class BadgesService:
    async def get_user_badges(self, session: AsyncSession, user_id: int) -> Badges:
        total_badges = Badges(gold=0, silver=0, bronze=0)
        subq_questions = (
            select(func.count(Question.id))
            .select_from(Question)
            .where(Question.author_id == user_id)
        )
        total_questions = (await session.execute(subq_questions)).scalar() or 0
        total_badges = Badges(
            gold=total_badges.gold + total_questions // QuestionCount.GOLD,
            silver=total_badges.silver + total_questions // QuestionCount.SILVER,
            bronze=total_badges.bronze + total_questions // QuestionCount.BRONZE,
        )

        subq_answers = (
            select(func.count(Answer.id))
            .select_from(Answer)
            .where(Answer.user_id == user_id)
        )
        total_answers = (await session.execute(subq_answers)).scalar() or 0
        total_badges = Badges(
            gold=total_badges.gold + total_answers // AnswerCount.GOLD,
            silver=total_badges.silver + total_answers // AnswerCount.SILVER,
            bronze=total_badges.bronze + total_answers // AnswerCount.BRONZE,
        )

        subq_q_upvotes = (
            select(func.count(Vote.id))
            .select_from(Vote)
            .where(
                Vote.user_id == user_id,
                Vote.vote_type == VoteType.UPVOTE,
                Vote.target_vote == ActionContentType.QUESTION,
            )
        )
        total_question_upvotes = (await session.execute(subq_q_upvotes)).scalar() or 0
        total_badges = Badges(
            gold=total_badges.gold + total_question_upvotes // QuestionUpvotes.GOLD,
            silver=total_badges.silver
            + total_question_upvotes // QuestionUpvotes.SILVER,
            bronze=total_badges.bronze
            + total_question_upvotes // QuestionUpvotes.BRONZE,
        )

        subq_a_upvotes = (
            select(func.count(Vote.id))
            .select_from(Vote)
            .where(
                Vote.user_id == user_id,
                Vote.vote_type == VoteType.UPVOTE,
                Vote.target_vote == ActionContentType.ANSWER,
            )
        )
        total_answer_upvotes = (await session.execute(subq_a_upvotes)).scalar() or 0
        total_badges = Badges(
            gold=total_badges.gold + total_answer_upvotes // AnswerUpvotes.GOLD,
            silver=total_badges.silver + total_answer_upvotes // AnswerUpvotes.SILVER,
            bronze=total_badges.bronze + total_answer_upvotes // AnswerUpvotes.BRONZE,
        )

        subq_views = (
            select(func.count(Interaction.id))
            .select_from(Interaction)
            .where(
                Interaction.action_type == ActionType.VIEW,
                or_(
                    and_(
                        # Current user view other users posts.
                        Interaction.user_id == user_id,
                        Interaction.other_user_id != user_id,
                    ),
                    and_(
                        # Other users view current user posts.
                        Interaction.user_id != user_id,
                        Interaction.other_user_id == user_id,
                    ),
                ),
            )
        )
        total_views = (await session.execute(subq_views)).scalar() or 0
        total_badges = Badges(
            gold=total_badges.gold + total_views // TotalViews.GOLD,
            silver=total_badges.silver + total_views // TotalViews.SILVER,
            bronze=total_badges.bronze + total_views // TotalViews.BRONZE,
        )

        return total_badges
