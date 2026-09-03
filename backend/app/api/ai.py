"""AI advisor endpoint."""
from fastapi import APIRouter, Depends
from ..schemas import ChatRequest, ChatResponse
from ..services.ai_service import get_ai_response
from ..models import User, Assessment
from ..database import get_db
from ..api.deps import get_current_user
from sqlalchemy.orm import Session

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    context = payload.context or {}

    # If an assessment_id is provided, enrich context from DB
    if payload.assessment_id:
        assessment = (
            db.query(Assessment)
            .filter(
                Assessment.id == payload.assessment_id,
                Assessment.user_id == current_user.id,
            )
            .first()
        )
        if assessment and assessment.analysis_data:
            context = {**assessment.analysis_data, **context}

    result = await get_ai_response(
        question=payload.question,
        context=context,
        language=payload.language,
    )
    return ChatResponse(
        answer=result["answer"],
        confidence=result["confidence"],
        sources=result.get("sources", []),
    )
