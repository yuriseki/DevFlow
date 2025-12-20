"""This module defines the data models for the Tag feature."""

from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
import sqlalchemy as sa
from sqlalchemy import ForeignKey
from sqlmodel import SQLModel, Field, Column, func, Relationship
from app.features.question.models.question_tag_relationship import (
    QuestionTagRelationship,
)

if TYPE_CHECKING:
    from app.features.question.models.question import Question


class TagBase(SQLModel):
    """Base model for Tag that contains shared fields."""

    name: str = Field(unique=True)


class Tag(TagBase, table=True):
    """Represents the Tag table in the database."""

    id: int | None = Field(primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    num_questions: int | None = 0
    questions: List["Question"] = Relationship(
        back_populates="tags", link_model=QuestionTagRelationship
    )


class TagCreate(TagBase):
    """Schema for creating a new Tag.

    This schema is used in the create endpoint.
    """

    pass


class TagUpdate(SQLModel):
    """Schema for updating an existing Tag.

    This schema is used in the update endpoint.
    """

    pass


class TagLoad(TagBase):
    """Schema for loading a Tag.

    This schema is used in the load and list endpoints.
    """

    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    num_questions: int
