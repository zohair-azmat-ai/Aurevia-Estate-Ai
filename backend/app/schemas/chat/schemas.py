"""
Chat agent schemas.
"""

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    user_id: str | None = None


class PropertySuggestion(BaseModel):
    id: str
    title: str
    location: str
    property_type: str
    transaction_type: str
    price_aed: int
    bedrooms: int | None = None
    bathrooms: int | None = None
    area_sqft: int | None = None
    summary: str
    match_reason: str


class MarketInsight(BaseModel):
    location: str
    average_rent_aed: int | None = None
    average_sale_price_aed: int | None = None
    trend: str
    insight: str


class ExtractedCriteria(BaseModel):
    intent: str | None = None
    property_type: str | None = None
    location: str | None = None
    budget: int | None = None
    bedrooms: int | None = None
    high_priority: bool = False


class ChatResponse(BaseModel):
    reply: str
    suggestions: list[PropertySuggestion]
    extracted: ExtractedCriteria
    market_insight: MarketInsight | None = None
    lead_id: str | None = None
    lead_created: bool = False
    high_priority: bool = False
