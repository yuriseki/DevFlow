"""This module provides the service for the Account feature."""
from typing import Type, List

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func

from app.core.lib.base_model_service import BaseModelService
from ..models.account import Account, AccountCreate, AccountLoad, AccountUpdate


class AccountService(BaseModelService[Account, AccountCreate, AccountLoad, AccountUpdate]):
    """The service for the Account feature.

    This class inherits from BaseModelService and provides the business logic for the Account feature.
    """

    def __init__(self, model: Type[Account], create_schema: Type[AccountCreate], load_schema: Type[AccountLoad],
                 update_schema: Type[AccountUpdate]):
        """Initializes the AccountService.

        Args:
            model: The Account model.
            create_schema: The AccountCreate schema.
            load_schema: The AccountLoad schema.
            update_schema: The AccountUpdate schema.
        """
        super().__init__(model, create_schema, load_schema, update_schema)
        # The base BaseModelService includes a basic CRUD operation.
        # Feel free to override its functionality for more complex use cases.

    async def create(self, session: AsyncSession, account: AccountCreate) -> AccountLoad:
        """Creates a new Account object.
        Args: AccountCreate

        Returns: AccountLoad
        """
        # Check if username and provider already exists.
        count_stmt = (select(func.count())
                      .where(Account.username == account.username,
                             Account.provider_account_id == account.provider_account_id))
        existing_account_count = await session.scalar(count_stmt)

        if existing_account_count > 0:
            # Use HTTP_409_CONFLICT for a duplicate entry conflict
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Account with this username and provider id already exists",
            )

        return await super().create(session, account)

    async def all(self, session: AsyncSession) -> List[AccountLoad]:
        """Returns a list of all Account objects."""
        stmt = select(Account)
        result = await session.execute(stmt)
        accounts = result.scalars().all()
        accounts_load_list: List[AccountLoad] = [AccountLoad.model_validate(account) for account in accounts]

        return accounts_load_list