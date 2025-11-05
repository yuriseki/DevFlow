"""This module provides the routes for the Interaction feature."""

from app.core import get_session
from app.features.interaction.models.interaction import Interaction, InteractionCreate, InteractionLoad, \
    InteractionUpdate
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from .services.interaction_services import InteractionService

router = APIRouter(
    prefix="/api/v1/interaction",
    tags=["interaction"]
)

interaction_service = InteractionService(Interaction, InteractionCreate, InteractionLoad, InteractionUpdate)


@router.get("/load/{interaction_id}", response_model=InteractionLoad)
async def get_interaction(interaction_id: int, session: AsyncSession = Depends(get_session)):
    """Loads a Interaction by its ID.

    Args:
        interaction_id: The ID of the Interaction to load.
        session: The database session.

    Returns:
        The loaded Interaction.

    Raises:
        HTTPException: If the Interaction is not found.
    """
    interaction = await interaction_service.load(session, interaction_id)
    if not interaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interaction not found")
    return interaction


@router.post("/create", response_model=InteractionLoad)
async def create(interaction: InteractionCreate, session: AsyncSession = Depends(get_session)):
    """Creates a new Interaction.

    Args:
        interaction: The data for the new Interaction.
        session: The database session.

    Returns:
        The created Interaction.
    """
    return await interaction_service.create(session, interaction)


@router.put('/update/{interaction_id}', response_model=InteractionLoad)
async def update(interaction_id: int, interaction_update: InteractionUpdate, session: AsyncSession = Depends(get_session)):
    """Updates a Interaction.

    Args:
        interaction_id: The ID of the Interaction to update.
        interaction_update: The new data for the Interaction.
        session: The database session.

    Returns:
        The updated Interaction.

    Raises:
        HTTPException: If the Interaction is not found.
    """
    db_obj = await interaction_service.load(session, interaction_id)
    if not db_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interaction not found")
    return await interaction_service.update(session, db_obj, interaction_update)


@router.delete("/delete/{interaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(interaction_id: int, session: AsyncSession = Depends(get_session)):
    """Deletes a Interaction.

    Args:
        interaction_id: The ID of the Interaction to delete.
        session: The database session.

    Raises:
        HTTPException: If the Interaction is not found.
    """
    db_obj = await interaction_service.load(session, interaction_id)
    if not db_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interaction not found")
    await interaction_service.delete(session, db_obj)
    return {"message": "Interaction deleted successfully"}
