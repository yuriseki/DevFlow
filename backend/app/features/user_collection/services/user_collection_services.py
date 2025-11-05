"""This module provides the service for the UserCollection feature."""
from typing import Type

from app.core.lib.base_model_service import BaseModelService

from ..models.user_collection import UserCollection, UserCollectionCreate, UserCollectionLoad, UserCollectionUpdate


class UserCollectionService(BaseModelService[UserCollection, UserCollectionCreate, UserCollectionLoad, UserCollectionUpdate]):
    """The service for the UserCollection feature.

    This class inherits from BaseModelService and provides the business logic for the UserCollection feature.
    """
    def __init__(self, model: Type[UserCollection], create_schema: Type[UserCollectionCreate], load_schema: Type[UserCollectionLoad], update_schema: Type[UserCollectionUpdate]):
        """Initializes the UserCollectionService.

        Args:
            model: The UserCollection model.
            create_schema: The UserCollectionCreate schema.
            load_schema: The UserCollectionLoad schema.
            update_schema: The UserCollectionUpdate schema.
        """
        super().__init__(model, create_schema, load_schema, update_schema)
        # The base BaseModelService includes a basic CRUD operation.
        # Feel free to override its functionality for more complex use cases.