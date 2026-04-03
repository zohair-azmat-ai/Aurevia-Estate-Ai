"""
AI real estate chat agent service.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.integrations.openai_client import get_openai_client
from app.models.enums import Channel, IntentType, LeadStatus, PropertyType, TransactionType
from app.schemas.chat.schemas import (
    ChatResponse,
    ExtractedCriteria,
    MarketInsight,
    PropertySuggestion,
)
from app.schemas.lead.schemas import LeadCreate
from app.services.lead.service import LeadService

SYSTEM_PROMPT = """You are a premium real estate AI advisor in Dubai.
You help users find properties based on budget, location, and preferences.
You speak professionally, concisely, and persuasively.
Always guide the user toward a decision.
If user shows strong buying intent, mark as high-quality lead."""


@dataclass
class PropertyRecord:
    id: str
    title: str
    location: str
    property_type: str
    transaction_type: str
    price_aed: int
    bedrooms: int | None
    bathrooms: int | None
    area_sqft: int | None
    summary: str


PROPERTY_CATALOG: list[PropertyRecord] = [
    PropertyRecord(
        id="marina-studio-01",
        title="Marina Gate Studio Residence",
        location="Dubai Marina",
        property_type="studio",
        transaction_type="rent",
        price_aed=78_000,
        bedrooms=0,
        bathrooms=1,
        area_sqft=540,
        summary="Waterfront studio with concierge access, modern finishes, and strong rental demand.",
    ),
    PropertyRecord(
        id="marina-1bhk-02",
        title="Dubai Marina 1BR Executive Apartment",
        location="Dubai Marina",
        property_type="1bhk",
        transaction_type="rent",
        price_aed=92_000,
        bedrooms=1,
        bathrooms=2,
        area_sqft=812,
        summary="High-floor one-bedroom with marina views, premium tower amenities, and quick tram access.",
    ),
    PropertyRecord(
        id="jvc-studio-03",
        title="JVC Smart Studio Investment Unit",
        location="JVC",
        property_type="studio",
        transaction_type="rent",
        price_aed=58_000,
        bedrooms=0,
        bathrooms=1,
        area_sqft=487,
        summary="Efficient studio in JVC with attractive rental yield and easy move-in appeal.",
    ),
    PropertyRecord(
        id="jvc-1bhk-04",
        title="JVC One-Bedroom Lifestyle Apartment",
        location="JVC",
        property_type="1bhk",
        transaction_type="rent",
        price_aed=74_000,
        bedrooms=1,
        bathrooms=2,
        area_sqft=760,
        summary="Well-priced one-bedroom near Circle Mall, ideal for young professionals and end users.",
    ),
    PropertyRecord(
        id="palm-villa-05",
        title="Palm Jumeirah Signature Villa",
        location="Palm Jumeirah",
        property_type="villa",
        transaction_type="buy",
        price_aed=24_000_000,
        bedrooms=5,
        bathrooms=6,
        area_sqft=7200,
        summary="Ultra-prime beachfront villa with private pool, garden, and high-net-worth buyer appeal.",
    ),
    PropertyRecord(
        id="downtown-apt-06",
        title="Downtown Burj View 2BR Residence",
        location="Downtown Dubai",
        property_type="2bhk",
        transaction_type="buy",
        price_aed=3_250_000,
        bedrooms=2,
        bathrooms=3,
        area_sqft=1380,
        summary="Premium Downtown apartment suited to buyers prioritizing prestige, walkability, and resale resilience.",
    ),
]

MARKET_INSIGHTS: dict[str, MarketInsight] = {
    "dubai marina": MarketInsight(
        location="Dubai Marina",
        average_rent_aed=88_000,
        average_sale_price_aed=1_850_000,
        trend="Stable-to-up",
        insight="Dubai Marina remains one of the strongest leasing markets for one-bedroom stock, with consistent tenant demand and resilient resale interest.",
    ),
    "jvc": MarketInsight(
        location="JVC",
        average_rent_aed=62_000,
        average_sale_price_aed=950_000,
        trend="Upward",
        insight="JVC is attractive for value-driven tenants and investors, especially for studios and one-bedroom units with yield-focused positioning.",
    ),
    "palm jumeirah": MarketInsight(
        location="Palm Jumeirah",
        average_rent_aed=420_000,
        average_sale_price_aed=17_500_000,
        trend="Luxury-led growth",
        insight="Palm Jumeirah continues to outperform in the ultra-prime segment, with limited inventory and strong international buyer appetite.",
    ),
    "downtown dubai": MarketInsight(
        location="Downtown Dubai",
        average_rent_aed=140_000,
        average_sale_price_aed=3_100_000,
        trend="Premium steady",
        insight="Downtown remains a prestige-led buy market where branded towers and Burj-facing inventory command the deepest premiums.",
    ),
}

LOCATION_ALIASES = {
    "dubai marina": "Dubai Marina",
    "marina": "Dubai Marina",
    "jvc": "JVC",
    "palm jumeirah": "Palm Jumeirah",
    "downtown": "Downtown Dubai",
    "downtown dubai": "Downtown Dubai",
    "business bay": "Business Bay",
}

PROPERTY_TYPE_TO_ENUM: dict[str, PropertyType] = {
    "studio": PropertyType.APARTMENT,
    "1bhk": PropertyType.APARTMENT,
    "2bhk": PropertyType.APARTMENT,
    "apartment": PropertyType.APARTMENT,
    "villa": PropertyType.VILLA,
    "townhouse": PropertyType.TOWNHOUSE,
    "office": PropertyType.OFFICE,
    "warehouse": PropertyType.WAREHOUSE,
    "land": PropertyType.LAND,
}


class ChatAgentService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.lead_service = LeadService(db)

    async def handle_message(self, message: str, user_id: str | None = None) -> ChatResponse:
        extracted = await self._extract_criteria(message)
        suggestions = self.search_properties(extracted)
        market_insight = self.get_market_insights(extracted.location)
        lead_id: str | None = None
        lead_created = False

        if extracted.budget and extracted.location and extracted.property_type:
            lead_id = await self.create_lead(message, extracted, user_id=user_id)
            lead_created = lead_id is not None

        reply = await self._compose_reply(
            message=message,
            extracted=extracted,
            suggestions=suggestions,
            market_insight=market_insight,
            lead_created=lead_created,
        )

        return ChatResponse(
            reply=reply,
            suggestions=suggestions,
            extracted=ExtractedCriteria(
                intent=extracted.intent,
                property_type=extracted.property_type,
                location=extracted.location,
                budget=extracted.budget,
                bedrooms=extracted.bedrooms,
                high_priority=extracted.high_priority,
            ),
            market_insight=market_insight,
            lead_id=lead_id,
            lead_created=lead_created,
            high_priority=extracted.high_priority,
        )

    async def _extract_criteria(self, message: str) -> ExtractedCriteria:
        llm_result = await self._extract_with_llm(message)
        if llm_result:
            return llm_result
        return self._extract_with_rules(message)

    async def _extract_with_llm(self, message: str) -> ExtractedCriteria | None:
        client = get_openai_client()
        if client is None:
            return None

        user_prompt = f"""
Extract structured real estate search information from this user message.
Return valid JSON only with keys:
intent, property_type, location, budget, bedrooms, high_priority.

Rules:
- intent should be "buy", "rent", or null
- property_type examples: studio, 1bhk, 2bhk, apartment, villa, townhouse, office
- location should be a Dubai area if present
- budget should be an integer AED value if present
- bedrooms should be an integer if clearly implied
- high_priority should be true if strong buying intent or budget > 1000000

Message: {message}
"""
        try:
            response = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                temperature=0,
                max_tokens=250,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
            )
            content = response.choices[0].message.content or "{}"
            payload = json.loads(content)
            extracted = self._extract_with_rules(message)
            return ExtractedCriteria(
                intent=payload.get("intent") or extracted.intent,
                property_type=(payload.get("property_type") or extracted.property_type),
                location=self._normalize_location(payload.get("location") or extracted.location),
                budget=self._coerce_int(payload.get("budget")) or extracted.budget,
                bedrooms=self._coerce_int(payload.get("bedrooms")) or extracted.bedrooms,
                high_priority=bool(payload.get("high_priority") or extracted.high_priority),
            )
        except Exception:
            return None

    def _extract_with_rules(self, message: str) -> ExtractedCriteria:
        text = message.lower()
        intent = "buy" if any(word in text for word in ["buy", "purchase", "invest"]) else None
        if intent is None and any(word in text for word in ["rent", "lease", "leasing"]):
            intent = "rent"

        property_type = None
        for label in ["studio", "1bhk", "2bhk", "villa", "townhouse", "office", "warehouse", "land", "apartment"]:
            if label in text or label.replace("bhk", " bhk") in text:
                property_type = label
                break
        if property_type is None and "1 bhk" in text:
            property_type = "1bhk"
        if property_type is None and "2 bhk" in text:
            property_type = "2bhk"

        location = None
        for alias, normalized in LOCATION_ALIASES.items():
            if alias in text:
                location = normalized
                break

        bedrooms = None
        bedroom_match = re.search(r"\b([1-6])\s*(?:bhk|bed|bedroom)\b", text)
        if bedroom_match:
            bedrooms = int(bedroom_match.group(1))
        elif property_type == "studio":
            bedrooms = 0

        budget = self._extract_budget(text)
        if intent is None and budget and budget < 300_000:
            intent = "rent"
        high_priority = bool((budget and budget > 1_000_000) or (intent == "buy" and any(token in text for token in ["buy", "purchase", "invest", "ready"])))

        return ExtractedCriteria(
            intent=intent,
            property_type=property_type,
            location=location,
            budget=budget,
            bedrooms=bedrooms,
            high_priority=high_priority,
        )

    def _extract_budget(self, text: str) -> int | None:
        million_match = re.search(r"(\d+(?:\.\d+)?)\s*m\b", text)
        if million_match:
            return int(float(million_match.group(1)) * 1_000_000)

        k_match = re.search(r"(\d+(?:\.\d+)?)\s*k\b", text)
        if k_match:
            return int(float(k_match.group(1)) * 1_000)

        under_match = re.search(r"(?:under|budget)\s*(\d{2,8})", text)
        if under_match:
            return int(under_match.group(1))

        raw_match = re.search(r"\b(\d{5,8})\b", text)
        if raw_match:
            return int(raw_match.group(1))
        return None

    def search_properties(self, filters: ExtractedCriteria) -> list[PropertySuggestion]:
        scored_matches: list[tuple[int, PropertySuggestion]] = []
        for item in PROPERTY_CATALOG:
            score = 0
            if filters.intent:
                if item.transaction_type != filters.intent:
                    continue
                score += 4
            if filters.location:
                if item.location.lower() != filters.location.lower():
                    continue
                score += 5
            if filters.property_type:
                if item.property_type == filters.property_type:
                    score += 5
                elif filters.property_type in {"apartment", "1bhk", "2bhk", "studio"} and item.property_type in {"studio", "1bhk", "2bhk"}:
                    score += 2
                else:
                    continue
            if filters.bedrooms is not None and item.bedrooms is not None:
                if item.bedrooms == filters.bedrooms:
                    score += 3
                elif abs(item.bedrooms - filters.bedrooms) > 1:
                    continue
            if filters.budget:
                if item.price_aed <= filters.budget:
                    score += 4
                elif item.price_aed <= int(filters.budget * 1.2):
                    score += 1
                else:
                    continue

            scored_matches.append(
                (
                    score,
                PropertySuggestion(
                    id=item.id,
                    title=item.title,
                    location=item.location,
                    property_type=item.property_type,
                    transaction_type=item.transaction_type,
                    price_aed=item.price_aed,
                    bedrooms=item.bedrooms,
                    bathrooms=item.bathrooms,
                    area_sqft=item.area_sqft,
                    summary=item.summary,
                    match_reason=self._build_match_reason(item, filters),
                ),
                )
            )

        if not scored_matches:
            fallback = PROPERTY_CATALOG[:3]
            return [
                PropertySuggestion(
                    id=item.id,
                    title=item.title,
                    location=item.location,
                    property_type=item.property_type,
                    transaction_type=item.transaction_type,
                    price_aed=item.price_aed,
                    bedrooms=item.bedrooms,
                    bathrooms=item.bathrooms,
                    area_sqft=item.area_sqft,
                    summary=item.summary,
                    match_reason="Closest premium match based on the current brief.",
                )
                for item in fallback
            ]

        scored_matches.sort(key=lambda item: item[0], reverse=True)
        return [match for _, match in scored_matches[:3]]

    async def create_lead(
        self,
        message: str,
        extracted: ExtractedCriteria,
        user_id: str | None = None,
    ) -> str | None:
        budget = extracted.budget
        property_enum = PROPERTY_TYPE_TO_ENUM.get(extracted.property_type or "")
        if property_enum is None:
            property_enum = PropertyType.APARTMENT

        payload = LeadCreate(
            name=f"Chat lead {user_id}" if user_id else "Chat agent lead",
            channel=Channel.WEBSITE,
            intent=IntentType.INQUIRY if extracted.intent == "rent" else IntentType.PRICING,
            intent_confidence=0.9,
            property_type=property_enum,
            transaction_type=TransactionType(extracted.intent) if extracted.intent else None,
            location_preference=extracted.location,
            budget_min=budget,
            budget_max=budget,
            budget_currency="AED",
            bedrooms=extracted.bedrooms,
            status=LeadStatus.ESCALATED if extracted.high_priority else LeadStatus.QUALIFIED,
            is_escalated=extracted.high_priority,
            escalation_reason="High budget or strong buying intent detected in chat."
            if extracted.high_priority
            else None,
            ai_summary=message,
            source_metadata=json.dumps({"source": "chat_agent", "high_priority": extracted.high_priority}),
        )
        lead = await self.lead_service.create_lead(payload)
        await self.db.commit()
        return str(lead.id)

    def get_market_insights(self, location: str | None) -> MarketInsight | None:
        if not location:
            return None
        return MARKET_INSIGHTS.get(location.lower())

    async def _compose_reply(
        self,
        message: str,
        extracted: ExtractedCriteria,
        suggestions: list[PropertySuggestion],
        market_insight: MarketInsight | None,
        lead_created: bool,
    ) -> str:
        llm_reply = await self._reply_with_llm(message, extracted, suggestions, market_insight, lead_created)
        if llm_reply:
            return llm_reply

        intro = "I’ve understood your brief"
        if extracted.property_type or extracted.location or extracted.budget:
            intro += " and shortlisted the most relevant options."
        else:
            intro += " and I can narrow the search quickly once you share budget, area, and property type."

        suggestion_line = ""
        if suggestions:
            top = suggestions[0]
            suggestion_line = f" A strong first option is {top.title} in {top.location} at AED {top.price_aed:,}."

        insight_line = ""
        if market_insight:
            insight_line = f" In {market_insight.location}, the current market is {market_insight.trend.lower()}."

        lead_line = " I’ve also captured this as a lead for follow-up." if lead_created else ""
        close = " If you want, I can now refine this into the best 2-3 options or compare rent versus buy for your brief."
        return f"{intro}{suggestion_line}{insight_line}{lead_line}{close}"

    async def _reply_with_llm(
        self,
        message: str,
        extracted: ExtractedCriteria,
        suggestions: list[PropertySuggestion],
        market_insight: MarketInsight | None,
        lead_created: bool,
    ) -> str | None:
        client = get_openai_client()
        if client is None:
            return None
        try:
            context = {
                "criteria": extracted.model_dump(),
                "suggestions": [item.model_dump() for item in suggestions],
                "market_insight": market_insight.model_dump() if market_insight else None,
                "lead_created": lead_created,
            }
            response = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                temperature=0.35,
                max_tokens=350,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": (
                            f"User message: {message}\n"
                            f"Structured context: {json.dumps(context)}\n"
                            "Write a concise premium advisor reply with a recommendation and next step."
                        ),
                    },
                ],
            )
            return response.choices[0].message.content
        except Exception:
            return None

    def _build_match_reason(self, item: PropertyRecord, filters: ExtractedCriteria) -> str:
        reasons: list[str] = []
        if filters.location and item.location.lower() == filters.location.lower():
            reasons.append(f"matches {item.location}")
        if filters.budget and item.price_aed <= int(filters.budget * 1.05):
            reasons.append("fits the stated budget")
        if filters.property_type and item.property_type == filters.property_type:
            reasons.append(f"aligns with the requested {filters.property_type}")
        if filters.intent and item.transaction_type == filters.intent:
            reasons.append(f"suited for {filters.intent}")
        return ", ".join(reasons) if reasons else "strong fit for the current search brief"

    def _normalize_location(self, value: str | None) -> str | None:
        if not value:
            return None
        return LOCATION_ALIASES.get(value.lower(), value.strip())

    def _coerce_int(self, value: Any) -> int | None:
        if value is None or value == "":
            return None
        try:
            return int(float(value))
        except (TypeError, ValueError):
            return None
