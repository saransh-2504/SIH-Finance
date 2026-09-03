"""Pydantic request/response schemas."""
from __future__ import annotations
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, EmailStr, field_validator


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    preferred_language: str = "en"

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain an uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain a number.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str]
    preferred_language: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain an uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain a number.")
        return v


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None


# ── Assessment ────────────────────────────────────────────────────────────────

class AssessmentCreate(BaseModel):
    village: str
    block: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    business_name: str
    business_category: str
    goals: Optional[str] = None
    available_capital: float

    @field_validator("available_capital")
    @classmethod
    def capital_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Capital must be positive.")
        if v > 50_000_000:
            raise ValueError("Capital exceeds supported assessment range.")
        return v


class AssessmentOut(BaseModel):
    id: str
    village: str
    block: Optional[str]
    district: Optional[str]
    state: Optional[str]
    pin_code: Optional[str]
    business_name: str
    business_category: str
    goals: Optional[str]
    available_capital: float
    project_cost: float
    loan_amount: float
    feasibility_score: Optional[int]
    confidence: Optional[str]
    market_data: Optional[Any]
    finance_data: Optional[Any]
    analysis_data: Optional[Any]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Finance ───────────────────────────────────────────────────────────────────

class FinanceCalcRequest(BaseModel):
    margin: float
    business_category: Optional[str] = None

    @field_validator("margin")
    @classmethod
    def margin_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Margin must be positive.")
        return v


class BusinessModelRequest(BaseModel):
    monthly_customers: int
    average_price: float
    variable_cost_per_sale: float
    rent: float
    wages: float
    utilities: float
    transport: float
    marketing: float
    working_capital: float
    loan_amount: float
    interest_rate: float
    tenure_years: int


# ── AI Advisor ────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    question: str
    assessment_id: Optional[str] = None
    context: Optional[dict] = None
    language: str = "en"


class ChatResponse(BaseModel):
    answer: str
    confidence: str
    sources: list[str] = []
    disclaimer: str = (
        "AI responses are for informational guidance only. "
        "Financial calculations use deterministic rules. "
        "This is not financial, legal, or government advice."
    )
