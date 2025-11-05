"""This module defines the data models for the QuestionTagRelationship feature."""
from sqlmodel import SQLModel, Field


class QuestionTagRelationship(SQLModel, table=True):
    question_id: int = Field(foreign_key="question.id", primary_key=True)
    tag_id: int = Field(foreign_key="tag.id", primary_key=True)
