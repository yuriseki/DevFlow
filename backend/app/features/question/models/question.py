"""This module defines the data models for the Question feature."""

from datetime import datetime, timezone
from typing import List
from typing import Optional, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from app.features.answer.models.answer import AnswerLoad
from app.features.tag.models.tag import TagLoad
from app.features.user.models.user import UserLoad
from .question_tag_relationship import QuestionTagRelationship

if TYPE_CHECKING:
    from app.features.answer.models.answer import Answer
    from app.features.tag.models.tag import Tag
    from app.features.user.models.user import User


class QuestionBase(SQLModel):
    """Base model for Question that contains shared fields."""

    title: str
    content: str
    views: int | None
    upvotes: int | None = 0
    downvotes: int | None = 0
    author_id: int = Field(foreign_key="user.id")


class Question(QuestionBase, table=True):
    """Represents the Question table in the database."""

    id: int | None = Field(primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    answers: List["Answer"] | None = Relationship(back_populates="question")
    tags: List["Tag"] = Relationship(
        back_populates="questions", link_model=QuestionTagRelationship
    )
    author: Optional["User"] = Relationship(back_populates="questions")


class QuestionCreate(SQLModel):
    """Schema for creating a new Question.

    This schema is used in the create endpoint.
    """

    title: str
    content: str
    tags: List[str]
    author_id: int


class QuestionUpdate(SQLModel):
    """Schema for updating an existing Question.

    This schema is used in the update endpoint.
    """

    id: int
    title: str | None = None
    content: str | None = None
    tags: List[str] | None = None
    author_id: int | None = None
    views: int | None = None


class QuestionLoad(QuestionBase):
    """Schema for loading a Question.

    This schema is used in the load and list endpoints.
    """

    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    tags: List[TagLoad] | None
    author: Optional[UserLoad]
    answers: List[AnswerLoad] | None
    views: int = 0
