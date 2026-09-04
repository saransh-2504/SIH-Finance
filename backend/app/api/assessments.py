"""Assessment CRUD — create, read, list, delete."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Assessment, User
from ..schemas import AssessmentCreate, AssessmentOut
from ..services.financial_service import calculate_finance
from ..services.assessment_service import build_full_assessment
from .deps import get_current_user

router = APIRouter(prefix="/assessments", tags=["assessments"])


@router.post("", response_model=AssessmentOut, status_code=201)
async def create_assessment(
    payload: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    finance = calculate_finance(payload.available_capital)
    analysis = await build_full_assessment(
        business_category=payload.business_category,
        available_capital=payload.available_capital,
        village=payload.village,
        state=payload.state or "India",
        district=payload.district or "",
        pin_code=payload.pin_code or "",
        latitude=payload.latitude,
        longitude=payload.longitude,
    )

    assessment = Assessment(
        user_id=current_user.id,
        village=payload.village,
        block=payload.block,
        district=payload.district,
        state=payload.state,
        pin_code=payload.pin_code,
        latitude=payload.latitude,
        longitude=payload.longitude,
        business_name=payload.business_name,
        business_category=payload.business_category,
        goals=payload.goals,
        available_capital=payload.available_capital,
        project_cost=finance["project_cost"],
        loan_amount=finance["capped_loan_amount"],
        feasibility_score=analysis["score"],
        confidence=analysis["confidence"],
        finance_data=finance,
        analysis_data=analysis,
        status="complete",
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return AssessmentOut.model_validate(assessment)


@router.get("", response_model=list[AssessmentOut])
def list_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [
        AssessmentOut.model_validate(a)
        for a in db.query(Assessment)
        .filter(Assessment.user_id == current_user.id)
        .order_by(Assessment.created_at.desc())
        .all()
    ]


@router.get("/{assessment_id}", response_model=AssessmentOut)
def get_assessment(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assessment = (
        db.query(Assessment)
        .filter(Assessment.id == assessment_id, Assessment.user_id == current_user.id)
        .first()
    )
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    return AssessmentOut.model_validate(assessment)


@router.delete("/{assessment_id}", status_code=204)
def delete_assessment(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assessment = (
        db.query(Assessment)
        .filter(Assessment.id == assessment_id, Assessment.user_id == current_user.id)
        .first()
    )
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    db.delete(assessment)
    db.commit()
