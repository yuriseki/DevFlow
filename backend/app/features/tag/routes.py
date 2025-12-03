"""This module provides the routes for the Tag feature."""

from typing import List
from app.core import get_session
from app.features.question.models.question import QuestionLoad
from app.features.tag.models.tag import Tag, TagCreate, TagLoad, TagUpdate
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from .services.tag_services import TagService

router = APIRouter(prefix="/api/v1/tag", tags=["tag"])

tag_service = TagService(Tag, TagCreate, TagLoad, TagUpdate)


@router.get("/load/{tag_id}", response_model=TagLoad)
async def get_tag(tag_id: int, session: AsyncSession = Depends(get_session)):
    """Loads a Tag by its ID.

    Args:
        tag_id: The ID of the Tag to load.
        session: The database session.

    Returns:
        The loaded Tag.

    Raises:
        HTTPException: If the Tag is not found.
    """
    tag = await tag_service.load(session, tag_id)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
        )
    return tag


@router.post("/create", response_model=TagLoad)
async def create(tag: TagCreate, session: AsyncSession = Depends(get_session)):
    """Creates a new Tag.

    Args:
        tag: The data for the new Tag.
        session: The database session.

    Returns:
        The created Tag.
    """
    return await tag_service.create(session, tag)


@router.put("/update/{tag_id}", response_model=TagLoad)
async def update(
    tag_id: int, tag_update: TagUpdate, session: AsyncSession = Depends(get_session)
):
    """Updates a Tag.

    Args:
        tag_id: The ID of the Tag to update.
        tag_update: The new data for the Tag.
        session: The database session.

    Returns:
        The updated Tag.

    Raises:
        HTTPException: If the Tag is not found.
    """
    db_obj = await tag_service.load(session, tag_id)
    if not db_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
        )
    return await tag_service.update(session, tag_update)


@router.delete("/delete/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(tag_id: int, session: AsyncSession = Depends(get_session)):
    """Deletes a Tag.

    Args:
        tag_id: The ID of the Tag to delete.
        session: The database session.

    Raises:
        HTTPException: If the Tag is not found.
    """
    db_obj = await tag_service.load(session, tag_id)
    if not db_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
        )
    await tag_service.delete(session, db_obj)
    return {"message": "Tag deleted successfully"}


@router.get("/tags", response_model=List[TagLoad])
async def get_tags(
    page: int = 1,
    page_size: int = 10,
    query: str = "",
    filter: str = "",
    session: AsyncSession = Depends(get_session),
):
    """Get multiple tags"""
    tags: List[TagLoad] = await tag_service.get_tags(
        session, page, page_size, query, filter
    )
    return tags

@router.get("/{tag_id}/questions", status_code=status.HTTP_204_NO_CONTENT)
async def get_tag_questions(
    tag_id: int,
    page: int = 1,
    page_size: int = 10,
    session: AsyncSession = Depends(get_session),
):
    """Get questions with a given tag"""
    questions: List[QuestionLoad] = await tag_service.get_tag_questions(
         session, tag_id, page, page_size
    )
    return questions
