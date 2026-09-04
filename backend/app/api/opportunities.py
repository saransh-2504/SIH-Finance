"""Opportunity Radar — ranked list of businesses for a given location and capital."""
from fastapi import APIRouter, Depends, Query
from ..services.assessment_service import BUSINESS_PROFILES, build_full_assessment
from ..models import User
from .deps import get_current_user

router = APIRouter(prefix="/opportunities", tags=["opportunities"])


@router.get("")
async def get_opportunities(
    capital: float = Query(..., gt=0, description="Available capital in Rs."),
    state: str = Query("Karnataka"),
    district: str = Query(""),
    village: str = Query(""),
    current_user: User = Depends(get_current_user),
):
    results = []
    for category in BUSINESS_PROFILES:
        analysis = await build_full_assessment(
            business_category=category,
            available_capital=capital,
            village=village,
            state=state,
            district=district,
        )
        p = BUSINESS_PROFILES[category]
        results.append({
            "business": category,
            "score": analysis["score"],
            "verdict": analysis["verdict"],
            "competition": (
                "Very High" if p["competition"] < 50
                else "High" if p["competition"] < 65
                else "Moderate" if p["competition"] < 78
                else "Low"
            ),
            "capital_fit": (
                "Very High" if p["capital"] > 90
                else "High" if p["capital"] > 78
                else "Medium"
            ),
            "risk": (
                "Low" if p["risk"] > 78
                else "Medium" if p["risk"] > 62
                else "High"
            ),
            "opportunity": "High" if p["opportunity"] > 80 else "Medium",
            "project_cost": analysis["finance"]["project_cost"],
            "scheme": analysis["finance"].get("scheme", {}).get("name", ""),
            "opportunity_text": analysis["opportunity"]["headline"],
            "score_drivers": analysis["score_drivers"],
            "confidence": "Medium",
            "data_note": "Regional estimates — validate locally before investing.",
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return {"opportunities": results, "count": len(results)}
