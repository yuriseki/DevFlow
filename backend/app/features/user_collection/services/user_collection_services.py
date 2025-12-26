"""This module provides the service for the UserCollection feature."""

from typing import Type

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.lib.base_model_service import BaseModelService

from ..models.user_collection import (
    UserCollection,
    UserCollectionCreate,
    UserCollectionLoad,
    UserCollectionUpdate,
)


class UserCollectionService(
    BaseModelService[UserCollection, UserCollectionCreate, UserCollectionLoad, UserCollectionUpdate]
):
    """The service for the UserCollection feature.

    This class inherits from BaseModelService and provides the business logic for the UserCollection feature.
    """

    def __init__(
        self,
        model: Type[UserCollection],
        create_schema: Type[UserCollectionCreate],
        load_schema: Type[UserCollectionLoad],
        update_schema: Type[UserCollectionUpdate],
    ):
        """Initializes the UserCollectionService.

        Args:
            model: The UserCollection model.
            create_schema: The UserCollectionCreate schema.
            load_schema: The UserCollectionLoad schema.
            update_schema: The UserCollectionUpdate schema.
        """
        super().__init__(model, create_schema, load_schema, update_schema)
        # The base BaseModelService includes a basic CRUD operation.
        # Feel free to override its functionality for more complex use cases.

    async def load(self, session: AsyncSession, user_id: int, question_id: int):
        smtm = select(UserCollection).where(
            UserCollection.user_id == user_id,
            UserCollection.question_id == question_id,
        )

        result = await session.execute(smtm)
        collection = result.scalar_one_or_none()
        if collection is not None:
            collection = UserCollectionLoad.model_validate(collection)
        return collection

    async def toggle(self, session: AsyncSession, user_id: int, question_id: int):
        smtm = select(UserCollection).where(
            UserCollection.user_id == user_id,
            UserCollection.question_id == question_id,
        )
        result = await session.execute(smtm)
        collection = result.scalar_one_or_none()

        if not collection:
            new_collection = UserCollection(user_id=user_id, question_id=question_id)
            session.add(new_collection)
        else:
            await session.delete(collection)

        await session.commit()
