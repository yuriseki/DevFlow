from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncEngine
from sqlalchemy.orm import sessionmaker
from sqlmodel import create_engine
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.settings import settings

async_engine = AsyncEngine(
    create_engine(
        url=settings.DATABASE_URL,
        echo=settings.DEV_MODE,
    )
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    session = sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
    )

    async with session() as s:
        try:
            yield s
        except:
            await s.rollback()
            raise
        finally:
            await s.close()
