"""Update user

Revision ID: 752f75186a8a
Revises: 4157c1b3f243
Create Date: 2025-12-19 23:47:57.704934

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

import sqlmodel

# revision identifiers, used by Alembic.
revision: str = "752f75186a8a"
down_revision: Union[str, Sequence[str], None] = "4157c1b3f243"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
