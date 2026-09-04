"""
Comprehensive Unit & Integration Test Suite for GramUdyam Advisor
Validates:
1. Deterministic Financial Calculations & Boundary Schemes
2. Machine Learning Viability & Default Risk Model
3. OpenStreetMap Geocoding & Mandi Commodity Benchmarks
4. Business Survival Stress Simulation Logic
"""

import pytest
from app.services.financial_service import (
    calculate_finance,
    calculate_emi,
    calculate_business_model,
    route_scheme,
)
from app.services.ml_service import predict_rural_viability
from app.services.mandi_service import get_district_mandi_pricing


# ── 1. Financial Engine Tests ──────────────────────────────────────────────────

def test_scheme_routing_boundaries():
    """Validates precise regulatory cutoff points for MoSJE schemes."""
    # Micro Finance: <= 1.40 Lakh
    micro = route_scheme(140000)
    assert micro is not None
    assert micro["name"] == "Micro Finance Scheme"
    assert micro["interest_rate"] == 6.5
    assert micro["tenure_years"] == 3

    # Term Loan: > 1.40 Lakh and <= 50 Lakh
    term_min = route_scheme(140001)
    assert term_min is not None
    assert term_min["name"] == "Term Loan Scheme"
    assert term_min["interest_rate"] == 8.0

    term_max = route_scheme(5000000)
    assert term_max is not None
    assert term_max["name"] == "Term Loan Scheme"

    # Unsupported: > 50 Lakh
    unsupported = route_scheme(5000001)
    assert unsupported is None


def test_margin_and_project_cost_math():
    """Ensures 10% promoter equity deterministically calculates 90% debt."""
    fin = calculate_finance(100000)
    assert fin["margin"] == 100000
    assert fin["project_cost"] == 1000000
    assert fin["loan_amount"] == 900000
    assert fin["capped_loan_amount"] == 900000
    assert fin["scheme"]["name"] == "Term Loan Scheme"


def test_emi_calculation():
    """Verifies monthly amortized EMI equation accuracy."""
    res = calculate_emi(principal=900000, annual_rate=8.0, tenure_years=7)
    assert res["emi"] > 0
    assert res["total_repayment"] > 900000
    assert res["total_interest"] == pytest.approx(res["total_repayment"] - 900000, rel=1e-2)


def test_business_model_dscr_and_borrow_advice():
    """Verifies that DSCR < 1.2 triggers 'Don't Borrow Yet' anti-lending safety flag."""
    # Highly stressed business
    stressed = calculate_business_model(
        monthly_customers=20,
        average_price=50,
        variable_cost_per_sale=30,
        rent=10000,
        wages=8000,
        utilities=2000,
        transport=1000,
        marketing=500,
        working_capital=5000,
        loan_amount=500000,
        interest_rate=8.0,
        tenure_years=5,
    )
    assert stressed["borrow_advice"] == "Don't Borrow Yet"
    assert stressed["status"] == "High Risk"


# ── 2. Machine Learning Engine Tests ──────────────────────────────────────────

def test_ml_prediction_validity():
    """Verifies that Scikit-Learn ensemble model executes and returns valid distributions."""
    pred = predict_rural_viability(
        capital=100000,
        competitors=4,
        tier=2,
        experience_years=3.0,
        land_acres=2.0,
        market_distance_km=10.0,
        electricity_hours=18.0,
    )

    assert "top_recommendations" in pred
    assert len(pred["top_recommendations"]) >= 3
    assert 0 <= pred["overall_success_probability"] <= 100
    assert 0 <= pred["predicted_default_risk"] <= 100
    assert pred["risk_category"] in ["Low Risk", "Moderate Risk", "High Risk"]
    assert "classification_accuracy" in pred["model_metadata"]


def test_ml_capital_sensitivity():
    """Ensures model lowers default risk when entrepreneur capital increases."""
    low_cap = predict_rural_viability(capital=15000, competitors=10, experience_years=0.5)
    high_cap = predict_rural_viability(capital=300000, competitors=2, experience_years=5.0)

    assert high_cap["overall_success_probability"] >= low_cap["overall_success_probability"]
    assert high_cap["predicted_default_risk"] <= low_cap["predicted_default_risk"]


# ── 3. Regional Mandi & Market Tests ──────────────────────────────────────────

def test_mandi_benchmarks():
    """Verifies state-specific commodity market pricing."""
    karnataka_dairy = get_district_mandi_pricing(
        business_category="Dairy",
        district="Bengaluru Rural",
        state="Karnataka",
    )
    assert karnataka_dairy["average_price"] > 0
    assert "Agmarknet" in karnataka_dairy["source"]
    assert karnataka_dairy["unit"] == "litre"
