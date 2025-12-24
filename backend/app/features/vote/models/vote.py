"""This module defines the data models for the Vote feature."""

from datetime import datetime, timezone
from typing import Optional
import sqlalchemy as sa
from sqlmodel import SQLModel, Field, Column, func
from enum import Enum


class TargetVote(str, Enum):
    ANSWER = "answer"
    QUESTION = "question"


class VoteType(str, Enum):
    UPVOTE = "upvote"
    DOWNVOTE = "downvote"


class VoteBase(SQLModel):
    """Base model for Vote that contains shared fields."""

    user_id: int = Field(foreign_key="user.id")
    target_id: int
    target_vote: TargetVote
    vote_type: VoteType


class Vote(VoteBase, table=True):
    """Represents the Vote table in the database."""

    id: int | None = Field(primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class VoteCreate(VoteBase):
    """Schema for creating a new Vote.

    This schema is used in the create endpoint.
    """

    pass


class VoteUpdate(SQLModel):
    """Schema for updating an existing Vote.

    This schema is used in the update endpoint.
    """

    id: int
    target_id: int
    target_vote: TargetVote
    vote_type: VoteType
    user_id: int


class VoteLoad(VoteBase):
    """Schema for loading a Vote.

    This schema is used in the load and list endpoints.
    """

    id: int
    created_at: datetime
    updated_at: datetime
    target_id: int
    target_vote: TargetVote
    vote_type: VoteType
    user_id: int


class VoteFind(SQLModel):
    user_id: int
    target_id: int
    target_vote: TargetVote


class VoteDoVote(SQLModel):
    user_id: int
    target_id: int
    target_vote: TargetVote
    vote_type: VoteType
