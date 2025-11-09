"""This module provides the routes for the User feature."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core import get_session
from app.features.user.models.user import User, UserCreate, UserLoad, \
    UserUpdate
from .services.user_services import UserService

router = APIRouter(
    prefix="/api/v1/user",
    tags=["user"],
)

user_service = UserService(User, UserCreate, UserLoad, UserUpdate)


@router.get("/", response_model=List[UserLoad])
async def get_all(session: AsyncSession = Depends(get_session)):
    """Gets all Users."""
    users = await user_service.all(session)
    return users


@router.post("/email", response_model=UserLoad)
async def load_by_email(email: str = Body(..., embed=True), session: AsyncSession = Depends(get_session)):
    user = await user_service.load_by_email(session, email)
    return user

@router.post("/username", response_model=UserLoad)
async def load_by_username(username: str = Body(..., embed=True), session: AsyncSession = Depends(get_session)):
    user = await user_service.load_by_username(session, username)
    return user

@router.get("/load/{user_id}", response_model=UserLoad)
async def get_user(user_id: int, session: AsyncSession = Depends(get_session)):
    """Loads a User by its ID.

    Args:
        user_id: The ID of the User to load.
        session: The database session.

    Returns:
        The loaded User.

    Raises:
        HTTPException: If the User is not found.
    """
    user = await user_service.load(session, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("/create", response_model=UserLoad)
async def create(user: UserCreate, session: AsyncSession = Depends(get_session)):
    """Creates a new User.

    Args:
        user: The data for the new User.
        session: The database session.

    Returns:
        The created User.
    """
    return await user_service.create(session, user)


@router.put('/update/{user_id}', response_model=UserLoad)
async def update(user_id: int, user_update: UserUpdate, session: AsyncSession = Depends(get_session)):
    """Updates a User.

    Args:
        user_id: The ID of the User to update.
        user_update: The new data for the User.
        session: The database session.

    Returns:
        The updated User.

    Raises:
        HTTPException: If the User is not found.
    """
    db_obj = await user_service.load(session, user_id)
    if not db_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return await user_service.update(session, db_obj, user_update)


@router.delete("/delete/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(user_id: int, session: AsyncSession = Depends(get_session)):
    """Deletes a User.

    Args:
        user_id: The ID of the User to delete.
        session: The database session.

    Raises:
        HTTPException: If the User is not found.
    """
    db_obj = await user_service.load(session, user_id)
    if not db_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await user_service.delete(session, db_obj)
    return {"message": "User deleted successfully"}
