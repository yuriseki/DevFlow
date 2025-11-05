"""This module provides the service for the Answer feature."""
from typing import Type

from app.core.lib.base_model_service import BaseModelService

from ..models.answer import Answer, AnswerCreate, AnswerLoad, AnswerUpdate


class AnswerService(BaseModelService[Answer, AnswerCreate, AnswerLoad, AnswerUpdate]):
    """The service for the Answer feature.

    This class inherits from BaseModelService and provides the business logic for the Answer feature.
    """
    def __init__(self, model: Type[Answer], create_schema: Type[AnswerCreate], load_schema: Type[AnswerLoad], update_schema: Type[AnswerUpdate]):
        """Initializes the AnswerService.

        Args:
            model: The Answer model.
            create_schema: The AnswerCreate schema.
            load_schema: The AnswerLoad schema.
            update_schema: The AnswerUpdate schema.
        """
        super().__init__(model, create_schema, load_schema, update_schema)
        # The base BaseModelService includes a basic CRUD operation.
        # Feel free to override its functionality for more complex use cases.