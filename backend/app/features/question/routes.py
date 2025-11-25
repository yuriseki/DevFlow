"""This module provides the routes for the Question feature."""

from app.core import get_session
from app.features.question.models.question import (
    Question,
    QuestionCreate,
    QuestionLoad,
    QuestionUpdate,
)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List

from .services.question_services import QuestionService

# import debugpy

# debugpy.listen(("0.0.0.0", 8000))
# print("Waiting for debugger attach...")
# debugpy.wait_for_client()
# print("Debugger attached!")

router = APIRouter(prefix="/api/v1/question", tags=["question"])

question_service = QuestionService(
    Question, QuestionCreate, QuestionLoad, QuestionUpdate
)


@router.get("/load/{question_id}", response_model=QuestionLoad)
async def get_question(question_id: int, session: AsyncSession = Depends(get_session)):
    """Loads a Question by its ID.

    Args:
        question_id: The ID of the Question to load.
        session: The database session.

    Returns:
        The loaded Question.

    Raises:
        HTTPException: If the Question is not found.
    """
    question = await question_service.load(session, question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Question not found"
        )
    return question


@router.post("/create", response_model=QuestionLoad)
async def create(
    question: QuestionCreate, session: AsyncSession = Depends(get_session)
):
    """Creates a new Question.

    Args:
        question: The data for the new Question.
        session: The database session.

    Returns:
        The created Question.
    """
    return await question_service.create(session, question)


@router.put("/update/{question_id}", response_model=QuestionLoad)
async def update(
    question_id: int,
    question_update: QuestionUpdate,
    session: AsyncSession = Depends(get_session),
):
    """Updates a Question.

    Args:
        question_id: The ID of the Question to update.
        question_update: The new data for the Question.
        session: The database session.

    Returns:
        The updated Question.

    Raises:
        HTTPException: If the Question is not found.
    """
    db_obj = await question_service.load(session, question_id)
    if not db_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Question not found"
        )
    return await question_service.update(session, question_update)


@router.delete("/delete/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(question_id: int, session: AsyncSession = Depends(get_session)):
    """Deletes a Question.

    Args:
        question_id: The ID of the Question to delete.
        session: The database session.

    Raises:
        HTTPException: If the Question is not found.
    """
    db_obj: QuestionLoad | None = await question_service.load(session, question_id)
    if not db_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Question not found"
        )
    await question_service.delete(session, db_obj)
    return {"message": "Question deleted successfully"}


@router.get("/questions", response_model=List[QuestionLoad])
async def get_questions(
    page: int = 1,
    page_size: int = 10,
    query: str = "",
    filter: str = "",
    session: AsyncSession = Depends(get_session),
):
    """Get multiple questions"""
    questions: List[QuestionLoad] = await question_service.get_questions(
        session, page, page_size, query, filter
    )
    return questions
