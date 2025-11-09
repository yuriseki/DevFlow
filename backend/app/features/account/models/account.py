"""This module defines the data models for the Account feature."""
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING

from sqlalchemy import UniqueConstraint
from sqlmodel import SQLModel, Field, Relationship

from app.features.user.models.user import UserCreate

if TYPE_CHECKING:
    from app.features.user.models.user import User


class AccountBase(SQLModel):
    """Base model for Account that contains shared fields."""
    username: str
    image: str | None
    provider: str
    provider_account_id: str
    user_id: int | None = Field(foreign_key="user.id")


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
    user_id: int | None
    password: str | None


class AccountUpdate(SQLModel):
    """Schema for updating an existing Account.

    This schema is used in the update endpoint.
    """
    password: str | None


class AccountLoad(AccountBase):
    """Schema for loading a Account.

    This schema is used in the load and list endpoints.
    """
    id: int
    created_at: datetime
    updated_at: datetime


class AccountSignInWithOauth(SQLModel):
    """Schema for sign in an Account.
    This schema is used in the sign in with OAuth provider endpoint.
    """
    provider: str
    provider_account_id: str
    user: "UserCreate"


class AccountSignUpWithCredentials(SQLModel):
    """Schema for sign in an Account with credentials."""
    name: str
    username: str
    email: str
    password: str


class AccountSignInWithCredentials(SQLModel):
    email: str
    password: str
