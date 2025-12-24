"""This module provides the routes for the Vote feature."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core import get_session
from app.features.vote.models.vote import (
    Vote,
    VoteCreate,
    VoteDoVote,
    VoteFind,
    VoteLoad,
    VoteUpdate,
)

from .services.vote_services import VoteService

router = APIRouter(prefix="/api/v1/vote", tags=["vote"])

vote_service = VoteService(Vote, VoteCreate, VoteLoad, VoteUpdate)


@router.post("/find-vote", response_model=Optional[VoteLoad])
async def find_vote(vote: VoteFind, session: AsyncSession = Depends(get_session)):
    vote_load = await vote_service.find_vote(session, vote)
    if not vote_load:
        return None
    return vote_load


@router.post("/do-vote", response_model=None)
async def do_vote(vote: VoteDoVote, session: AsyncSession = Depends(get_session)):
    try:
        result = await vote_service.do_vote(session=session, vote=vote)
        return result
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error computing the vote",
        )
