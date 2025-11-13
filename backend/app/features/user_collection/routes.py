"""This module provides the routes for the UserCollection feature."""

from app.core import get_session
from app.features.user_collection.models.user_collection import UserCollection, UserCollectionCreate, UserCollectionLoad, \
    UserCollectionUpdate
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from .services.user_collection_services import UserCollectionService

router = APIRouter(
    prefix="/api/v1/user__collection",
    tags=["user__collection"]
)

user__collection_service = UserCollectionService(UserCollection, UserCollectionCreate, UserCollectionLoad, UserCollectionUpdate)


@router.get("/load/{user__collection_id}", response_model=UserCollectionLoad)
async def get_user__collection(user__collection_id: int, session: AsyncSession = Depends(get_session)):
    """Loads a UserCollection by its ID.

    Args:
        user__collection_id: The ID of the UserCollection to load.
        session: The database session.

    Returns:
        The loaded UserCollection.

    Raises:
        HTTPException: If the UserCollection is not found.
    """
    user__collection = await user__collection_service.load(session, user__collection_id)
    if not user__collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="UserCollection not found")
    return user__collection


@router.post("/create", response_model=UserCollectionLoad)
async def create(user__collection: UserCollectionCreate, session: AsyncSession = Depends(get_session)):
    """Creates a new UserCollection.

    Args:
        user__collection: The data for the new UserCollection.
        session: The database session.

    Returns:
        The created UserCollection.
    """
    return await user__collection_service.create(session, user__collection)


@router.put('/update/{user__collection_id}', response_model=UserCollectionLoad)
async def update(user__collection_id: int, user__collection_update: UserCollectionUpdate, session: AsyncSession = Depends(get_session)):
    """Updates a UserCollection.

    Args:
        user__collection_id: The ID of the UserCollection to update.
        user__collection_update: The new data for the UserCollection.
        session: The database session.

    Returns:
        The updated UserCollection.

    Raises:
        HTTPException: If the UserCollection is not found.
    """
    db_obj = await user__collection_service.load(session, user__collection_id)
    if not db_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="UserCollection not found")
    return await user__collection_service.update(session, user__collection_update)


@router.delete("/delete/{user__collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(user__collection_id: int, session: AsyncSession = Depends(get_session)):
    """Deletes a UserCollection.

    Args:
        user__collection_id: The ID of the UserCollection to delete.
        session: The database session.

    Raises:
        HTTPException: If the UserCollection is not found.
    """
    db_obj = await user__collection_service.load(session, user__collection_id)
    if not db_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="UserCollection not found")
    await user__collection_service.delete(session, db_obj)
    return {"message": "UserCollection deleted successfully"}
