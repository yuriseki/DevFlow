"""This module provides the service for the Question feature."""
from typing import Type

from app.core.lib.base_model_service import BaseModelService

from ..models.question import Question, QuestionCreate, QuestionLoad, QuestionUpdate


class QuestionService(BaseModelService[Question, QuestionCreate, QuestionLoad, QuestionUpdate]):
    """The service for the Question feature.

    This class inherits from BaseModelService and provides the business logic for the Question feature.
    """
    def __init__(self, model: Type[Question], create_schema: Type[QuestionCreate], load_schema: Type[QuestionLoad], update_schema: Type[QuestionUpdate]):
        """Initializes the QuestionService.

        Args:
            model: The Question model.
            create_schema: The QuestionCreate schema.
            load_schema: The QuestionLoad schema.
            update_schema: The QuestionUpdate schema.
        """
        super().__init__(model, create_schema, load_schema, update_schema)
        # The base BaseModelService includes a basic CRUD operation.
        # Feel free to override its functionality for more complex use cases.