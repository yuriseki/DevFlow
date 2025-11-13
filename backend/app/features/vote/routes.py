"""This module provides the routes for the Vote feature."""

from app.core import get_session
from app.features.vote.models.vote import Vote, VoteCreate, VoteLoad, \
    VoteUpdate
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from .services.vote_services import VoteService

router = APIRouter(
    prefix="/api/v1/vote",
    tags=["vote"]
)

vote_service = VoteService(Vote, VoteCreate, VoteLoad, VoteUpdate)


@router.get("/load/{vote_id}", response_model=VoteLoad)
async def get_vote(vote_id: int, session: AsyncSession = Depends(get_session)):
    """Loads a Vote by its ID.

    Args:
        vote_id: The ID of the Vote to load.
        session: The database session.

    Returns:
        The loaded Vote.

    Raises:
        HTTPException: If the Vote is not found.
    """
    vote = await vote_service.load(session, vote_id)
    if not vote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vote not found")
    return vote


@router.post("/create", response_model=VoteLoad)
async def create(vote: VoteCreate, session: AsyncSession = Depends(get_session)):
    """Creates a new Vote.

    Args:
        vote: The data for the new Vote.
        session: The database session.

    Returns:
        The created Vote.
    """
    return await vote_service.create(session, vote)


@router.put('/update/{vote_id}', response_model=VoteLoad)
async def update(vote_id: int, vote_update: VoteUpdate, session: AsyncSession = Depends(get_session)):
    """Updates a Vote.

    Args:
        vote_id: The ID of the Vote to update.
        vote_update: The new data for the Vote.
        session: The database session.

    Returns:
        The updated Vote.

    Raises:
        HTTPException: If the Vote is not found.
    """
    db_obj = await vote_service.load(session, vote_id)
    if not db_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vote not found")
    return await vote_service.update(session, vote_update)


@router.delete("/delete/{vote_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(vote_id: int, session: AsyncSession = Depends(get_session)):
    """Deletes a Vote.

    Args:
        vote_id: The ID of the Vote to delete.
        session: The database session.

    Raises:
        HTTPException: If the Vote is not found.
    """
    db_obj = await vote_service.load(session, vote_id)
    if not db_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vote not found")
    await vote_service.delete(session, db_obj)
    return {"message": "Vote deleted successfully"}
