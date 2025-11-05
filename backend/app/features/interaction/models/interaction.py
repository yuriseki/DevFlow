"""This module defines the data models for the Interaction feature."""
from datetime import datetime, timezone
from enum import Enum
from typing import Optional
import sqlalchemy as sa
from sqlmodel import SQLModel, Field, Column, func


class ActionType(str, Enum):
    QUESTION = "question"
    ANSWER = "answer"
    UPVOTE = "upvote"
    DOWNVOTE = "downvote"
    TAG = "tag"


class InteractionBase(SQLModel):
    """Base model for Interaction that contains shared fields."""
    pass


class Interaction(InteractionBase, table=True):
    """Represents the Interaction table in the database."""
    id: int | None = Field(primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))
    user_id: int = Field(foreign_key="user.id")
    content_type: str
    target_id: int
    action_type: ActionType


class InteractionCreate(InteractionBase):
    """Schema for creating a new Interaction.

    This schema is used in the create endpoint.
    """
    user_id: int
    content_type: str
    target_id: int
    action_type: ActionType


class InteractionUpdate(SQLModel):
    """Schema for updating an existing Interaction.

    This schema is used in the update endpoint.
    """
    pass


class InteractionLoad(InteractionBase):
    """Schema for loading a Interaction.

    This schema is used in the load and list endpoints.
    """
    id: int
    created_at: datetime
    updated_at: datetime
    user_id: int
    content_type: str
    target_id: int
    action_type: ActionType
