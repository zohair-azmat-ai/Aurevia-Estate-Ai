"""
Structured extraction service with OpenAI fallback heuristics.
"""

import re

from pydantic import BaseModel

from app.integrations.openai_client import get_openai_client
from app.models.enums import PropertyType, TransactionType


class ExtractionResult(BaseModel):
    budget_min: int | None = None
    budget_max: int | None = None
    budget_currency: str = "AED"
    location_preference: str | None = None
    property_type: PropertyType | None = None
    transaction_type: TransactionType | None = None
    bedrooms: int | None = None


class ExtractionService:
    async def extract(self, message_text: str) -> ExtractionResult:
        heuristic = self._heuristic_extract(message_text)
        client = get_openai_client()
        if client is None:
            return heuristic

        try:
            prompt = (
                "Extract real-estate fields from the message and return JSON with keys: "
                "budget_min, budget_max, budget_currency, location_preference, "
                "property_type, transaction_type, bedrooms."
            )
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                temperature=0,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": message_text},
                ],
            )
            content = response.choices[0].message.content or "{}"
            return ExtractionResult.model_validate_json(content)
        except Exception:
            return heuristic

    def _heuristic_extract(self, message_text: str) -> ExtractionResult:
        text = message_text.lower()
        budget_matches = re.findall(r"(\d[\d,\.]*)\s*(m|k|million)?", text)
        parsed_numbers: list[int] = []
        for raw, suffix in budget_matches:
            try:
                value = float(raw.replace(",", ""))
                if suffix == "m" or suffix == "million":
                    value *= 1_000_000
                elif suffix == "k":
                    value *= 1_000
                if value >= 1000:
                    parsed_numbers.append(int(value))
            except ValueError:
                continue

        bedrooms_match = re.search(r"(\d+)\s*(bed|br|bedroom)", text)
        bedrooms = int(bedrooms_match.group(1)) if bedrooms_match else None

        property_type = None
        for candidate in PropertyType:
            if candidate.value.replace("_", " ") in text:
                property_type = candidate
                break

        transaction_type = None
        if "rent" in text or "lease" in text:
            transaction_type = TransactionType.RENT
        if "buy" in text or "purchase" in text:
            transaction_type = TransactionType.BUY

        location = None
        for token in [
            "palm jumeirah",
            "downtown dubai",
            "dubai hills",
            "business bay",
            "jumeirah village circle",
            "dubai marina",
        ]:
            if token in text:
                location = token.title()
                break

        return ExtractionResult(
            budget_min=parsed_numbers[0] if parsed_numbers else None,
            budget_max=parsed_numbers[1] if len(parsed_numbers) > 1 else None,
            location_preference=location,
            property_type=property_type,
            transaction_type=transaction_type,
            bedrooms=bedrooms,
        )
