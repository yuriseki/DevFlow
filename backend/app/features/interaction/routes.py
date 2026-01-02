"""This module provides the routes for the Interaction feature."""

from typing import List

from fastapi import APIRouter, Depends, status
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core import get_session
from app.features.interaction.models.interaction import (
    Interaction,
    InteractionCreate,
    InteractionLoad,
    InteractionUpdate,
)
from app.features.question.models.question import QuestionLoad

from .services.interaction_services import InteractionService

router = APIRouter(prefix="/api/v1/interaction", tags=["interaction"])

interaction_service = InteractionService(
    Interaction, InteractionCreate, InteractionLoad, InteractionUpdate
)


@router.post("/create")
async def create(
    interaction: InteractionCreate, session: AsyncSession = Depends(get_session)
):
    """Creates a new Interaction.

    Args:
        interaction: The data for the new Interaction.
        session: The database session.

    Returns:
        The created Interaction.
    """
    try:
        await interaction_service.create(session, interaction)
        return status.HTTP_200_OK
    except Exception:
        return status.HTTP_500_INTERNAL_SERVER_ERROR


