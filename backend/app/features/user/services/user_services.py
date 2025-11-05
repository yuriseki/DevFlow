"""This module provides the service for the User feature."""
from typing import Type

from app.core.lib.base_model_service import BaseModelService

from ..models.user import User, UserCreate, UserLoad, UserUpdate


class UserService(BaseModelService[User, UserCreate, UserLoad, UserUpdate]):
    """The service for the User feature.

    This class inherits from BaseModelService and provides the business logic for the User feature.
    """
    def __init__(self, model: Type[User], create_schema: Type[UserCreate], load_schema: Type[UserLoad], update_schema: Type[UserUpdate]):
        """Initializes the UserService.

        Args:
            model: The User model.
            create_schema: The UserCreate schema.
            load_schema: The UserLoad schema.
            update_schema: The UserUpdate schema.
        """
        super().__init__(model, create_schema, load_schema, update_schema)
        # The base BaseModelService includes a basic CRUD operation.
        # Feel free to override its functionality for more complex use cases.