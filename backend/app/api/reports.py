"""Reports — generate and retrieve feasibility reports."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Assessment, User
from ..services.financial_service import calculate_emi
from .deps import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])

DISCLAIMER = (
    "This assessment is for decision support only and does not replace "
    "official financial or government-agency approval. Financial figures are "
    "indicative estimates based on available regional data."
)


@router.get("/{assessment_id}")
def get_report(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assessment = (
        db.query(Assessment)
        .filter(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
        )
        .first()
    )
    if not assessment:
        raise HTTPException(status_code=404, detail="Report not found.")

    analysis = assessment.analysis_data or {}
    finance = assessment.finance_data or {}
    scheme = finance.get("scheme") or {}

    return {
        "id": assessment.id,
        "generated_at": assessment.updated_at.isoformat(),
        "sections": {
            "executive_summary": {
                "business": assessment.business_name,
                "category": assessment.business_category,
                "location": f"{assessment.village}, {assessment.state}",
                "capital": assessment.available_capital,
                "score": assessment.feasibility_score,
                "verdict": analysis.get("verdict", ""),
                "confidence": assessment.confidence,
            },
            "market": analysis.get("market_reach", {}),
            "competition": analysis.get("competitor_stats", {}),
            "opportunity": analysis.get("opportunity", {}),
            "swot": analysis.get("swot", {}),
            "risks": analysis.get("risks", []),
            "pricing": analysis.get("pricing", {}),
            "finance": {
                "available_capital": assessment.available_capital,
                "project_cost": assessment.project_cost,
                "loan_amount": assessment.loan_amount,
                "scheme": scheme.get("name", ""),
                "interest_rate": scheme.get("interest_rate", 0),
                "tenure_years": scheme.get("tenure_years", 0),
                "moratorium_months": scheme.get("moratorium_months", 0),
                "emi": analysis.get("emi", {}),
            },
            "business_model": analysis.get("business_model", {}),
            "repayment_schedule": analysis.get("schedule", []),
            "working_capital_allocation": analysis.get("working_capital_allocation", []),
            "entrepreneur_readiness": analysis.get("readiness", 0),
            "launch_roadmap": analysis.get("launch_roadmap", []),
            "recommendation": analysis.get("recommendation", {}),
        },
        "data_sources": [
            "MoSJE scheme guidelines (indicative — verify with official documents)",
            "Regional demographic and market estimates",
            "Deterministic financial calculation engine",
        ],
        "disclaimer": DISCLAIMER,
    }
