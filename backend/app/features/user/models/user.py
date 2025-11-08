"""This module defines the data models for the User feature."""
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.features.account.models.account import Account
    from app.features.question.models.question import Question
    from app.features.answer.models.answer import Answer
    from app.features.user_collection.models.user_collection import UserCollection


class UserBase(SQLModel):
    """Base model for User that contains shared fields."""
    name: str
    username: str
    email: str
    bio: Optional[str] = None
    image: str
    location: Optional[str] = None
    portfolio: Optional[str] = None
    reputation: Optional[float] = 0


class User(UserBase, table=True):
    """Represents the User table in the database."""
    id: int | None = Field(primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))
    accounts: Optional[List["Account"]] = Relationship(back_populates="user")
    questions: Optional[List["Question"]] = Relationship(back_populates="author")
    answers: Optional[List["Answer"]] = Relationship(back_populates="user")
    collection: Optional[List["UserCollection"]] = Relationship(back_populates="user")


class UserCreate(UserBase):
    """Schema for creating a new User.

    This schema is used in the create endpoint.
    """
    pass


class UserUpdate(SQLModel):
    """Schema for updating an existing User.

    This schema is used in the update endpoint.
    """
    pass


class UserLoad(UserBase):
    """Schema for loading a User.

    This schema is used in the load and list endpoints.
    """
    id: int
    created_at: datetime
    updated_at: datetime
