"""This module provides the routes for the UserCollection feature."""

from app.core import get_session
from app.features.question.models import question
from app.features.user_collection.models.user_collection import (
    UserCollection,
    UserCollectionCreate,
    UserCollectionLoad,
    UserCollectionPaginatedResponse,
    UserCollectionUpdate,
)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from .services.user_collection_services import UserCollectionService

router = APIRouter(prefix="/api/v1/user_collection", tags=["user_collection"])

user_collection_service = UserCollectionService(
    UserCollection, UserCollectionCreate, UserCollectionLoad, UserCollectionUpdate
)


@router.get("/load/{user_id}/{question_id}", response_model=UserCollectionLoad)
async def get_user_collection(
    user_id: int, question_id: int, session: AsyncSession = Depends(get_session)
):
    """Loads a UserCollection by its user_id and question_id."""
    user_collection = await user_collection_service.load(session, user_id, question_id)
    if not user_collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="UserCollection not found"
        )
    return user_collection


@router.post("/toggle/{user_id}/{question_id}", status_code=status.HTTP_202_ACCEPTED)
async def toggle(
    user_id: int, question_id: int, session: AsyncSession = Depends(get_session)
):
    await user_collection_service.toggle(session, user_id, question_id)
    return {"message": "User Collectoin has been toggled."}


@router.post("/user-collection", response_model=UserCollectionPaginatedResponse)
async def get_user_saved_questions(
    user_id: int,
    page: int = 1,
    page_size: int = 10,
    query: str = "",
    filter: str = "",
    session: AsyncSession = Depends(get_session),
):
    result: UserCollectionPaginatedResponse = (
        await user_collection_service.get_user_saved_questions(
            session,
            user_id,
            page,
            page_size,
            query,
            filter,
        )
    )
    return result
