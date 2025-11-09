"""This module provides the service for the Account feature."""
from typing import Type, List

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func

from app.core.lib.base_model_service import BaseModelService
from ..models.account import Account, AccountCreate, AccountLoad, AccountUpdate, AccountSignInWithOauth, \
    AccountSignUpWithCredentials, AccountSignInWithCredentials
from ...user.models.user import User
from ...user.routes import user_service


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

    async def load_by_provider_account_id(self, session: AsyncSession, provider: str) -> AccountLoad:
        """Loads an Account object by provider id."""
        stmt = select(Account).where(Account.provider_account_id == provider)
        result = await session.execute(stmt)
        account = result.scalar_one_or_none()

        if account is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

        account_load = AccountLoad.model_validate(account)

        return account_load

    async def sign_in_with_oauth(self, session: AsyncSession,
                                 account_sign_in_with_oauth: AccountSignInWithOauth) -> AccountLoad:
        account_is_new = False
        user_is_new = False
        update_user = False
        # Get user account
        try:
            account = await self.load_by_provider_account_id(session, account_sign_in_with_oauth.provider_account_id)
        except HTTPException as e:
            # Account do not exists, let's create one.
            if e.status_code == status.HTTP_404_NOT_FOUND:
                account_is_new = True
                account = AccountCreate(
                    username=account_sign_in_with_oauth.user.username,
                    image=account_sign_in_with_oauth.user.image,
                    provider=account_sign_in_with_oauth.provider,
                    provider_account_id=account_sign_in_with_oauth.provider_account_id,
                    password=None,
                    user_id=None,
                )

        # Check if user exists
        try:
            user = await user_service.load_by_email(session, account_sign_in_with_oauth.user.email)
            # User existis, let's updat it.
            if user.image != account_sign_in_with_oauth.user.image:
                result = await session.execute(select(User).where(User.id == user.id))
                user = result.scalar_one_or_none()
                update_user = True
                user.image = account_sign_in_with_oauth.user.image
                session.add(user)

        except HTTPException as e:
            # User do not exists, let's create one.
            if e.status_code == status.HTTP_404_NOT_FOUND:
                user_is_new = True
                user = account_sign_in_with_oauth.user
                user = User(**user.model_dump())
                session.add(user)
                await session.flush()
        except Exception as e:
            print(e)

        if account_is_new:
            new_account = Account(**account.model_dump())
            new_account.user_id = user.id
            session.add(new_account)
            account = new_account

        if account_is_new or user_is_new or update_user:
            await session.commit()
            await session.refresh(account)
            await session.refresh(user)

        account_load = AccountLoad.model_validate(account)
        return account_load

    async def sign_up_with_credentials(self, session: AsyncSession,
                                       account_sign_up_with_credentials: AccountSignUpWithCredentials) -> AccountLoad:
        user_exists = True
        # Check user by email.
        try:
            user_by_email = await user_service.load_by_email(session, account_sign_up_with_credentials.email)
        except HTTPException as e:
            if e.status_code == status.HTTP_404_NOT_FOUND:
                user_exists = False
            else:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")

        # Check user by username
        try:
            user_by_username = await user_service.load_by_username(session, account_sign_up_with_credentials.username)
        except HTTPException as e:
            if e.status_code == status.HTTP_404_NOT_FOUND:
                user_exists = False
            else:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")

        # Create the user
        if user_exists:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")
        else:
            new_user = User(
                name=account_sign_up_with_credentials.name,
                username=account_sign_up_with_credentials.username,
                email=account_sign_up_with_credentials.email,
                image="",
                reputation=0,
            )
            session.add(new_user)
            await session.flush()

            account = Account(
                username=account_sign_up_with_credentials.username,
                image=None,
                provider="email",
                provider_account_id=account_sign_up_with_credentials.email,
                user_id=new_user.id,
            )
            session.add(account)
            await session.commit()
            await session.refresh(account)
            await session.refresh(new_user)

            account_load = AccountLoad.model_validate(account)
            return account_load

    async def get_account_by_credentials(self, session: AsyncSession, sign_in_account = AccountSignInWithCredentials) -> AccountLoad:
        stmt = select(Account).where(Account.email == sign_in_account.email, Account.password == sign_in_account.password)
        result = await session.execute(stmt)
        account = result.scalar_one_or_none()

        if account is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

        account_load = AccountLoad.model_validate(account)

        return account_load