"""AI advisor service using OpenAI (optional — gracefully falls back if key missing)."""
from __future__ import annotations
import json
from typing import Optional
from ..config import get_settings

settings = get_settings()

SYSTEM_PROMPT = """You are a practical rural business advisor embedded in a business intelligence platform.

Your role:
- Help rural entrepreneurs understand their business assessment, financial model, and market data.
- Explain financial calculations, scheme eligibility, risks and opportunities clearly.
- Always distinguish between verified data and estimates.
- NEVER guarantee loan approval, profit, or business success.
- NEVER invent government scheme rules, interest rates, or local statistics not in the provided context.
- Use simple, direct language appropriate for first-time entrepreneurs.
- When the user asks in Hindi or Kannada, respond in the same language.
- Keep responses concise and actionable — not generic motivational text.

Financial rules you must respect (these are deterministic — do not override them):
- Project Cost = Available Capital / 0.10
- Loan = Project Cost × 0.90 (subject to scheme caps)
- Micro Finance: project cost ≤ Rs. 1.40 lakh → max loan Rs. 1.25 lakh, 6.5% p.a., 3 years
- Term Loan: project cost Rs. 1.40 lakh–Rs. 50 lakh → max loan Rs. 45 lakh, 8% p.a., 7 years
- Above Rs. 50 lakh: not supported — recommend consulting the financing authority.

Always end with: "These insights are for decision support. Final loan approval and eligibility depend on the relevant financing authority."
"""


def build_context_block(context: Optional[dict]) -> str:
    if not context:
        return ""
    try:
        return f"\n\nCurrent assessment context:\n{json.dumps(context, indent=2, ensure_ascii=False)[:3000]}"
    except Exception:
        return ""


async def get_ai_response(
    question: str,
    context: Optional[dict] = None,
    language: str = "en",
) -> dict:
    """Call OpenAI or return a deterministic fallback."""
    if not settings.llm_api_key:
        return _fallback_response(question, context, language)

    try:
        from openai import AsyncOpenAI  # type: ignore
        client = AsyncOpenAI(api_key=settings.llm_api_key)

        lang_instruction = ""
        if language == "hi":
            lang_instruction = "\nRespond in Hindi (Devanagari script)."
        elif language == "kn":
            lang_instruction = "\nRespond in Kannada (Kannada script)."

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT + lang_instruction + build_context_block(context)},
            {"role": "user", "content": question},
        ]

        response = await client.chat.completions.create(
            model=settings.llm_model,
            messages=messages,
            max_tokens=600,
            temperature=0.3,
        )
        answer = response.choices[0].message.content or ""
        return {
            "answer": answer.strip(),
            "confidence": "medium",
            "sources": ["Assessment context", "Deterministic financial rules"],
        }
    except Exception as exc:
        return _fallback_response(question, context, language, error=str(exc))


def _fallback_response(
    question: str,
    context: Optional[dict],
    language: str,
    error: str = "",
) -> dict:
    """Rule-based fallback when LLM is unavailable."""
    q = question.lower()

    # Extract context values safely
    score = context.get("score", "N/A") if context else "N/A"
    borrow_advice = context.get("recommendation", {}).get("borrow_advice", "") if context else ""
    status = context.get("business_model", {}).get("status", "") if context else ""
    coverage = context.get("business_model", {}).get("repayment_coverage", 0) if context else 0
    scheme_name = context.get("finance", {}).get("scheme", {}).get("name", "the applicable scheme") if context else "the applicable scheme"

    if "score" in q or "why" in q and "recommend" in q:
        answer = (
            f"Your business assessment score is {score}/100. "
            "The score combines market demand, competition, capital fit, profitability potential, "
            "supplier accessibility, distribution reach, operational complexity, seasonality, "
            "financial resilience and funding compatibility. "
            "Each component is weighted based on available regional indicators. "
            "Confidence is Medium — validate locally before investing."
        )
    elif "loan" in q or "borrow" in q or "scheme" in q or "finance" in q:
        answer = (
            f"Based on the current financial model, the advice is: {borrow_advice or 'review your repayment capacity'}. "
            f"Repayment coverage is {coverage:.1f}x — a coverage above 1.8x is considered healthy. "
            f"The applicable scheme is {scheme_name}. "
            "Do not borrow more than the business model can support. "
            "Final loan eligibility and approval depend on the relevant financing authority."
        )
    elif "risk" in q:
        answer = (
            "The main risks for your business are listed in the Risks section of your assessment. "
            "Common risks include input cost volatility, competition, seasonal demand variation and repayment pressure during ramp-up. "
            "Review each risk and its mitigation before committing capital."
        )
    elif "competition" in q:
        answer = (
            "Competition analysis is based on available regional business data. "
            "The concentration of similar businesses in your area affects how easily you can acquire customers. "
            "Differentiate through delivery, quality, subscriptions or underserved customer segments."
        )
    elif "margin" in q or "profit" in q:
        answer = (
            "Operating surplus is calculated as revenue minus variable costs minus fixed costs. "
            f"Current model status is {status or 'calculated'}. "
            "To improve margin: reduce variable costs through bulk procurement, "
            "increase average transaction value, or add a complementary product line."
        )
    elif "hindi" in q or "हिंदी" in q:
        answer = (
            "आपका व्यवसाय मूल्यांकन तैयार है। वित्तीय गणनाएँ निर्धारक नियमों पर आधारित हैं। "
            "ऋण अनुमोदन और पात्रता संबंधित वित्तपोषण प्राधिकरण पर निर्भर करती है।"
        )
    else:
        answer = (
            f"Your assessment shows a score of {score}/100 with {status or 'calculated'} financial health. "
            "The recommendation is based on market demand, competition, capital fit and repayment capacity. "
            "Review the full assessment for detailed insights on market reach, financial model and risks. "
            "These insights are for decision support. Final loan approval and eligibility depend on the relevant financing authority."
        )

    if error:
        answer += " (AI service temporarily unavailable — this is a rule-based response.)"

    return {
        "answer": answer,
        "confidence": "medium",
        "sources": ["Deterministic financial rules", "Assessment context"],
    }
