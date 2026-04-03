"""
Intent detection service with OpenAI fallback heuristics.
"""

from pydantic import BaseModel

from app.integrations.openai_client import get_openai_client
from app.models.enums import IntentType


class IntentResult(BaseModel):
    intent: IntentType
    confidence: float
    reasoning: str
    sentiment: float = 0.0


class IntentService:
    async def detect(self, message_text: str) -> IntentResult:
        heuristic = self._heuristic_detect(message_text)
        client = get_openai_client()
        if client is None:
            return heuristic

        try:
            prompt = (
                "Classify the real-estate user message into one intent from: "
                "inquiry, viewing_request, pricing, complaint, follow_up, other. "
                "Return JSON with intent, confidence, reasoning, sentiment."
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
            parsed = IntentResult.model_validate_json(content)
            return parsed
        except Exception:
            return heuristic

    def _heuristic_detect(self, message_text: str) -> IntentResult:
        text = message_text.lower()
        sentiment = 0.0
        if any(token in text for token in ["urgent", "upset", "complaint", "delay", "angry"]):
            sentiment = -0.7
        if "viewing" in text or "visit" in text:
            return IntentResult(
                intent=IntentType.VIEWING_REQUEST,
                confidence=0.87,
                reasoning="Detected viewing-related keywords.",
                sentiment=sentiment,
            )
        if any(token in text for token in ["price", "pricing", "cost", "budget"]):
            return IntentResult(
                intent=IntentType.PRICING,
                confidence=0.82,
                reasoning="Detected pricing-related keywords.",
                sentiment=sentiment,
            )
        if any(token in text for token in ["follow up", "following up", "update me", "next steps"]):
            return IntentResult(
                intent=IntentType.FOLLOW_UP,
                confidence=0.79,
                reasoning="Detected follow-up language.",
                sentiment=sentiment,
            )
        if any(token in text for token in ["complaint", "bad", "upset", "frustrated", "delay"]):
            return IntentResult(
                intent=IntentType.COMPLAINT,
                confidence=0.9,
                reasoning="Detected complaint sentiment and trigger terms.",
                sentiment=-0.8,
            )
        return IntentResult(
            intent=IntentType.INQUIRY,
            confidence=0.7,
            reasoning="Defaulted to general inquiry.",
            sentiment=sentiment,
        )
