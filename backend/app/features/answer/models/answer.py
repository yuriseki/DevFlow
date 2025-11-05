"""This module defines the data models for the Answer feature."""
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
import sqlalchemy as sa
from sqlmodel import SQLModel, Field, Column, func, Relationship


if TYPE_CHECKING:
    from app.features.question.models.question import Question
    from app.features.user.models.user import User


class AnswerBase(SQLModel):
    """Base model for Answer that contains shared fields."""
    content: str
    user_id : int = Field(foreign_key="user.id")
    question_id: int = Field(foreign_key="question.id")
    upvotes: int | None = 0
    downvotes: int | None = 0


class Answer(AnswerBase, table=True):
    """Represents the Answer table in the database."""
    id: int | None = Field(primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))
    user: "User" = Relationship(back_populates="answers")
    question: "Question" = Relationship(back_populates="answers")

class AnswerCreate(AnswerBase):
    """Schema for creating a new Answer.

    This schema is used in the create endpoint.
    """
    pass


class AnswerUpdate(SQLModel):
    """Schema for updating an existing Answer.

    This schema is used in the update endpoint.
    """
    pass


class AnswerLoad(AnswerBase):
    """Schema for loading a Answer.

    This schema is used in the load and list endpoints.
    """
    id: int
    created_at: datetime
    updated_at: datetime
    pass
