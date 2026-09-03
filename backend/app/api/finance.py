"""Finance endpoints — calculate, EMI, schedule, business model."""
from fastapi import APIRouter, HTTPException
from ..schemas import FinanceCalcRequest, BusinessModelRequest
from ..services.financial_service import (
    calculate_finance,
    calculate_emi,
    quarterly_schedule,
    calculate_business_model,
    SCHEMES,
)

router = APIRouter(prefix="/finance", tags=["finance"])

DISCLAIMER = (
    "Indicative calculation only. Final loan sanction depends on official "
    "eligibility criteria and approval by the relevant financing authority."
)


@router.post("/calculate")
def finance_calculate(payload: FinanceCalcRequest):
    try:
        finance = calculate_finance(payload.margin)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    scheme = finance.get("scheme")
    emi_data = calculate_emi(
        finance["capped_loan_amount"],
        scheme["interest_rate"] if scheme else 0,
        scheme["tenure_years"] if scheme else 1,
    ) if scheme else {"emi": 0, "total_interest": 0, "total_repayment": 0}

    schedule = quarterly_schedule(
        finance["capped_loan_amount"],
        scheme["interest_rate"] if scheme else 0,
        scheme["tenure_years"] if scheme else 1,
    ) if scheme else []

    return {
        "finance": finance,
        "emi": emi_data,
        "schedule": schedule,
        "disclaimer": DISCLAIMER,
    }


@router.post("/business-model")
def business_model(payload: BusinessModelRequest):
    try:
        result = calculate_business_model(
            monthly_customers=payload.monthly_customers,
            average_price=payload.average_price,
            variable_cost_per_sale=payload.variable_cost_per_sale,
            rent=payload.rent,
            wages=payload.wages,
            utilities=payload.utilities,
            transport=payload.transport,
            marketing=payload.marketing,
            working_capital=payload.working_capital,
            loan_amount=payload.loan_amount,
            interest_rate=payload.interest_rate,
            tenure_years=payload.tenure_years,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"model": result, "disclaimer": DISCLAIMER}


@router.get("/schemes")
def list_schemes():
    return {
        "schemes": SCHEMES,
        "source": (
            "Scheme parameters from MoSJE guidelines. "
            "Verify against the latest official documents before use."
        ),
        "disclaimer": DISCLAIMER,
    }
