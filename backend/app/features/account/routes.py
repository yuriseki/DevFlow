"""This module provides the routes for the Account feature."""

from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core import get_session
from app.features.account.models.account import Account, AccountCreate, AccountLoad, \
    AccountUpdate, AccountSignInWithOauth, AccountSignUpWithCredentials, AccountSignInWithCredentials
from .services.account_services import AccountService

router = APIRouter(
    prefix="/api/v1/account",
    tags=["account"],
)

account_service = AccountService(Account, AccountCreate, AccountLoad, AccountUpdate)


@router.get("/load/{account_id}", response_model=AccountLoad)
async def get_account(account_id: int, session: AsyncSession = Depends(get_session)):
    """Loads a Account by its ID.

    Args:
        account_id: The ID of the Account to load.
        session: The database session.

    Returns:
        The loaded Account.

    Raises:
        HTTPException: If the Account is not found.
    """
    account = await account_service.load(session, account_id)
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    return account


@router.post("/create", response_model=AccountLoad)
async def create(account: AccountCreate, session: AsyncSession = Depends(get_session)):
    """Creates a new Account.

    Args:
        account: The data for the new Account.
        session: The database session.

    Returns:
        The created Account.
    """
    return await account_service.create(session, account)


@router.put('/update/{account_id}', response_model=AccountLoad)
async def update(account_id: int, account_update: AccountUpdate, session: AsyncSession = Depends(get_session)):
    """Updates a Account.

    Args:
        account_id: The ID of the Account to update.
        account_update: The new data for the Account.
        session: The database session.

    Returns:
        The updated Account.

    Raises:
        HTTPException: If the Account is not found.
    """
    db_obj = await account_service.load(session, account_id)
    if not db_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    return await account_service.update(session, account_update)


@router.delete("/delete/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(account_id: int, session: AsyncSession = Depends(get_session)):
    """Deletes a Account.

    Args:
        account_id: The ID of the Account to delete.
        session: The database session.

    Raises:
        HTTPException: If the Account is not found.
    """
    db_obj = await account_service.load(session, account_id)
    if not db_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    await account_service.delete(session, db_obj)
    return {"message": "Account deleted successfully"}


@router.post("/provider", response_model=AccountLoad)
async def load_by_provider_account_id(provider: str = Body(..., embed=True),
                                      session: AsyncSession = Depends(get_session)):
    account = await account_service.load_by_provider_account_id(session, provider)
    return account


@router.post("/sign-in-with-oauth", response_model=AccountLoad)
async def sign_in_with_oauth(account_with_oauth: AccountSignInWithOauth,
                             session: AsyncSession = Depends(get_session)):
    account = await account_service.sign_in_with_oauth(session, account_with_oauth)
    return account


@router.post("/sign-up-with-credentials", response_model=AccountLoad)
async def sign_up_with_credentials(account_sign_up_with_credentials: AccountSignUpWithCredentials,
                                   session: AsyncSession = Depends(get_session)):
    account = await account_service.sign_up_with_credentials(session, account_sign_up_with_credentials)
    return account

@router.post("/sign-in-with-credentials/", response_model=AccountLoad)
async def sign_in_with_credentials(account_sign_in_with_credentials: AccountSignInWithCredentials, session: AsyncSession = Depends(get_session)):
    account = await account_service.get_account_by_credentials(session, account_sign_in_with_credentials)
    return account
