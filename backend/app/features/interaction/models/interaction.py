"""This module defines the data models for the Interaction feature."""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional
import sqlalchemy as sa
from sqlmodel import SQLModel, Field, Column, func

class ActionContentType(str, Enum):
    QUESTION = "question"
    ANSWER = "answer"
    TAG = "tag"


class ActionType(str, Enum):
    VIEW = "view"
    UPVOTE = "upvote"
    DOWNVOTE = "downvote"
    BOOKMARK = "bookmark"
    POST = "post"
    EDIT = "edit"
    DELETE = "delete"
    SEARCH = "search"


class ActionPoints(int, Enum):
    NONE = 0
    VIEW = 0
    UPVOTE_CURRENT_USER = 2
    UPVOTE_OWNER = 10
    DOWNVOTE_CURRENT_USER = -1
    DOWNVOTE_OWNER = -2
    BOOKMARK_CURRENT_USER = 0
    BOOKMARK_OWNER = 1
    POST_QUESTION = 5
    POST_ANSWER = 10
    DELETE_QUESTION = -5
    DELETE_ANSWER = -10


class InteractionBase(SQLModel):
    """Base model for Interaction that contains shared fields."""

    pass


class Interaction(InteractionBase, table=True):
    """Represents the Interaction table in the database."""

    id: int | None = Field(primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    user_id: int = Field(foreign_key="user.id")
    content_type: ActionContentType
    target_id: int
    action_type: ActionType
    points: int
    other_user_id: int | None = Field(None, foreign_key="user.id")
    other_points: int | None


class InteractionCreate(InteractionBase):
    """Schema for creating a new Interaction.

    This schema is used in the create endpoint.
    """

    user_id: int
    content_type: ActionContentType
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
    content_type: ActionContentType
    target_id: int
    action_type: ActionType
    points: ActionPoints
    other_user_id: int | None
    other_points: ActionPoints

class MostsInteractedTags(SQLModel):
    id: int
    name: str
    count: int

