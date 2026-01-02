from enum import Enum
from sqlmodel import SQLModel


class Badges(SQLModel):
    gold: int
    silver: int
    bronze: int

class QuestionCount(int, Enum):
    BRONZE = 10
    SILVER = 50
    GOLD = 100

class AnswerCount(int, Enum):
    BRONZE = 10
    SILVER = 50
    GOLD = 100

class QuestionUpvotes(int, Enum):
    BRONZE = 10
    SILVER = 50
    GOLD = 100

class AnswerUpvotes(int, Enum):
    BRONZE = 10
    SILVER = 50
    GOLD = 100

class TotalViews(int, Enum):
    BRONZE = 1000
    SILVER = 10000
    GOLD = 100000

