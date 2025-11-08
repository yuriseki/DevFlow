"""This module provides the service for the User feature."""
from typing import Type, List

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func

from app.core.lib.base_model_service import BaseModelService
from ..models.user import User, UserCreate, UserLoad, UserUpdate


class UserService(BaseModelService[User, UserCreate, UserLoad, UserUpdate]):
    """The service for the User feature.

    This class inherits from BaseModelService and provides the business logic for the User feature.
    """

    def __init__(self, model: Type[User], create_schema: Type[UserCreate], load_schema: Type[UserLoad],
                 update_schema: Type[UserUpdate]):
        """Initializes the UserService.

        Args:
            model: The User model.
            create_schema: The UserCreate schema.
            load_schema: The UserLoad schema.
            update_schema: The UserUpdate schema.
        """
        super().__init__(model, create_schema, load_schema, update_schema)
        # The base BaseModelService includes a basic CRUD operation.
        # Feel free to override its functionality for more complex use cases.

    async def create(self, session: AsyncSession, user: UserCreate) -> UserLoad:
        """Creates a new User object.
        Args: UserCreate

        Returns: UserLoad
        """
        # Check if email already exists.
        count_stmt = select(func.count()).where(User.email == user.email)
        existing_user_count = await session.scalar(count_stmt)

        if existing_user_count > 0:
            # Use HTTP_409_CONFLICT for a duplicate entry conflict
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists",
            )

        # Check if username already exists.
        count_stmt = select(func.count()).where(User.username == user.username)
        existing_user_count = await session.scalar(count_stmt)

        if existing_user_count > 0:
            # Use HTTP_409_CONFLICT for a duplicate entry conflict
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this username already exists",
            )

        return await super().create(session, user)

    @staticmethod
    async def all(session: AsyncSession) -> List[UserLoad]:
        """Returns a list of all User objects."""
        stmt = select(User)
        result = await session.execute(stmt)
        users = result.scalars().all()
        user_load_list: List[UserLoad] = [UserLoad.model_validate(user) for user in users]

        return user_load_list

    async def load_by_email(self, session: AsyncSession, email: str) -> UserLoad:
        """Loads a User object by email."""
        stmt = select(User).where(User.email == email)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()

        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        user_load = UserLoad.model_validate(user)

        return user_load

    @staticmethod
    async def load_by_username(session: AsyncSession, username: str) -> UserLoad:
        """Loads a User object by username."""
        stmt = select(User).where(User.username == username)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()

        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        user_load = UserLoad.model_validate(user)

        return user_load