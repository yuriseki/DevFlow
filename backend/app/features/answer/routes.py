"""This module provides the routes for the Answer feature."""

from typing import List
from app.core import get_session
from app.features.answer.models.answer import (
    Answer,
    AnswerCreate,
    AnswerLoad,
    AnswerUpdate,
)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from .services.answer_services import AnswerService

router = APIRouter(prefix="/api/v1/answer", tags=["answer"])

answer_service = AnswerService(Answer, AnswerCreate, AnswerLoad, AnswerUpdate)


@router.get("/load/{answer_id}", response_model=AnswerLoad)
async def get_answer(answer_id: int, session: AsyncSession = Depends(get_session)):
    """Loads a Answer by its ID.

    Args:
        answer_id: The ID of the Answer to load.
        session: The database session.

    Returns:
        The loaded Answer.

    Raises:
        HTTPException: If the Answer is not found.
    """
    answer = await answer_service.load(session, answer_id)
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Answer not found"
        )
    return answer


@router.post("/create", response_model=AnswerLoad)
async def create(answer: AnswerCreate, session: AsyncSession = Depends(get_session)):
    """Creates a new Answer.

    Args:
        answer: The data for the new Answer.
        session: The database session.

    Returns:
        The created Answer.
    """
    return await answer_service.create(session, answer)


@router.put("/update/{answer_id}", response_model=AnswerLoad)
async def update(
    answer_id: int,
    answer_update: AnswerUpdate,
    session: AsyncSession = Depends(get_session),
):
    """Updates a Answer.

    Args:
        answer_id: The ID of the Answer to update.
        answer_update: The new data for the Answer.
        session: The database session.

    Returns:
        The updated Answer.

    Raises:
        HTTPException: If the Answer is not found.
    """
    db_obj = await answer_service.load(session, answer_id)
    if not db_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Answer not found"
        )
    return await answer_service.update(session, answer_update)


@router.delete("/delete/{answer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(answer_id: int, session: AsyncSession = Depends(get_session)):
    """Deletes a Answer.

    Args:
        answer_id: The ID of the Answer to delete.
        session: The database session.

    Raises:
        HTTPException: If the Answer is not found.
    """
    db_obj = await answer_service.load(session, answer_id)
    if not db_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Answer not found"
        )
    await answer_service.delete(session, db_obj)
    return {"message": "Answer deleted successfully"}


@router.get("/answers-for-question/{question_id}", response_model=List[AnswerLoad])
async def get_answers_for_question(
    question_id: int,
    page: int = 1,
    page_size: int = 10,
    session: AsyncSession = Depends(get_session),
):
    """Gets all answer for a given qustion.

    Args:
        question_id: The question id.
        session: The database session.

    Raises:
        HTTPException: If the Answer is not found.
    """
    answers: List[AnswerLoad] = await answer_service.get_answers_for_question(
        session, question_id, page, page_size
    )
    return answers
