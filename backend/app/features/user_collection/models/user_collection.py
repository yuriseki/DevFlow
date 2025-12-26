"""This module defines the data models for the UserCollection feature."""

from datetime import datetime, timezone
from typing import List, Optional

from sqlmodel import SQLModel, Field, Relationship

from app.features.question.models.question import Question, QuestionLoad
from app.features.user.models.user import User


class UserCollectionBase(SQLModel):
    """Base model for UserCollection that contains shared fields."""

    pass


class UserCollection(SQLModel, table=True):
    __tablename__ = "user_collection"
    """Represents the UserCollection table in the database."""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    question_id: int = Field(foreign_key="question.id", primary_key=True)
    user: "User" = Relationship(back_populates="collection")
    question: "Question" = Relationship()


class UserCollectionCreate(UserCollectionBase):
    """Schema for creating a new UserCollection.

    This schema is used in the create endpoint.
    """

    user_id: int
    question_id: int


class UserCollectionUpdate(SQLModel):
    """Schema for updating an existing UserCollection.

    This schema is used in the update endpoint.
    """

    pass


class UserCollectionLoad(UserCollectionBase):
    """Schema for loading a UserCollection.

    This schema is used in the load and list endpoints.
    """

    created_at: datetime
    updated_at: datetime
    user_id: int
    question_id: int


class UserCollectionPaginatedResponse(SQLModel):
    questions: List[QuestionLoad]
    total: int
