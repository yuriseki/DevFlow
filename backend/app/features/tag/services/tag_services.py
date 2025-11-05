"""This module provides the service for the Tag feature."""
from typing import Type

from app.core.lib.base_model_service import BaseModelService

from ..models.tag import Tag, TagCreate, TagLoad, TagUpdate


class TagService(BaseModelService[Tag, TagCreate, TagLoad, TagUpdate]):
    """The service for the Tag feature.

    This class inherits from BaseModelService and provides the business logic for the Tag feature.
    """
    def __init__(self, model: Type[Tag], create_schema: Type[TagCreate], load_schema: Type[TagLoad], update_schema: Type[TagUpdate]):
        """Initializes the TagService.

        Args:
            model: The Tag model.
            create_schema: The TagCreate schema.
            load_schema: The TagLoad schema.
            update_schema: The TagUpdate schema.
        """
        super().__init__(model, create_schema, load_schema, update_schema)
        # The base BaseModelService includes a basic CRUD operation.
        # Feel free to override its functionality for more complex use cases.