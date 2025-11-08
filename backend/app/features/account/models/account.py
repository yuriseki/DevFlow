"""This module defines the data models for the Account feature."""
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import UniqueConstraint
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.features.user.models.user import User


class AccountBase(SQLModel):
    """Base model for Account that contains shared fields."""
    username: str
    image: str | None
    provider: str
    provider_account_id: str
    user_id: int = Field(foreign_key="user.id")


class Account(AccountBase, table=True):
    """Represents the Account table in the database."""
    id: int | None = Field(primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))
    password: str | None
    user: Optional["User"] = Relationship(back_populates="accounts")

    __table_args__ = (UniqueConstraint("provider_account_id", "username", name="uq_provider_account_id_username"),)


class AccountCreate(AccountBase):
    """Schema for creating a new Account.

    This schema is used in the create endpoint.
    """
    password: str


class AccountUpdate(SQLModel):
    """Schema for updating an existing Account.

    This schema is used in the update endpoint.
    """
    password: str


class AccountLoad(AccountBase):
    """Schema for loading a Account.

    This schema is used in the load and list endpoints.
    """
    id: int
    created_at: datetime
    updated_at: datetime
