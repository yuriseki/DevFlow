"""This module provides the service for the Vote feature."""
from typing import Type

from app.core.lib.base_model_service import BaseModelService

from ..models.vote import Vote, VoteCreate, VoteLoad, VoteUpdate


class VoteService(BaseModelService[Vote, VoteCreate, VoteLoad, VoteUpdate]):
    """The service for the Vote feature.

    This class inherits from BaseModelService and provides the business logic for the Vote feature.
    """
    def __init__(self, model: Type[Vote], create_schema: Type[VoteCreate], load_schema: Type[VoteLoad], update_schema: Type[VoteUpdate]):
        """Initializes the VoteService.

        Args:
            model: The Vote model.
            create_schema: The VoteCreate schema.
            load_schema: The VoteLoad schema.
            update_schema: The VoteUpdate schema.
        """
        super().__init__(model, create_schema, load_schema, update_schema)
        # The base BaseModelService includes a basic CRUD operation.
        # Feel free to override its functionality for more complex use cases.