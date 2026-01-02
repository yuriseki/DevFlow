from fastapi import APIRouter, Depends, status
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core import get_session
from app.features.badges.services.badges_services import BadgesService

from .models.badges import Badges

router = APIRouter(prefix="/api/v1/badges", tags=["badges"])
badges_service = BadgesService()


@router.get("/user-badges/{user_id}", response_model=Badges)
async def get_user_badges(
    user_id: int, session: AsyncSession = Depends(get_session)
):
    badges: Badges = await badges_service.get_user_badges(session, user_id)
    return badges
