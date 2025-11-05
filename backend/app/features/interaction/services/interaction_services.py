"""This module provides the service for the Interaction feature."""
from typing import Type

from app.core.lib.base_model_service import BaseModelService

from ..models.interaction import Interaction, InteractionCreate, InteractionLoad, InteractionUpdate


class InteractionService(BaseModelService[Interaction, InteractionCreate, InteractionLoad, InteractionUpdate]):
    """The service for the Interaction feature.

    This class inherits from BaseModelService and provides the business logic for the Interaction feature.
    """
    def __init__(self, model: Type[Interaction], create_schema: Type[InteractionCreate], load_schema: Type[InteractionLoad], update_schema: Type[InteractionUpdate]):
        """Initializes the InteractionService.

        Args:
            model: The Interaction model.
            create_schema: The InteractionCreate schema.
            load_schema: The InteractionLoad schema.
            update_schema: The InteractionUpdate schema.
        """
        super().__init__(model, create_schema, load_schema, update_schema)
        # The base BaseModelService includes a basic CRUD operation.
        # Feel free to override its functionality for more complex use cases.