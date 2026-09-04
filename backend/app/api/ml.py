"""
ML API endpoints — Rural Business Machine Learning Model Predictions.
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
from ..services.ml_service import predict_rural_viability

router = APIRouter(prefix="/ml", tags=["machine-learning"])


class MLRecommendationRequest(BaseModel):
    capital: float = Field(..., gt=0, description="Available capital in INR")
    competitors: int = Field(5, ge=0, le=50, description="Competitor density in 5km")
    tier: int = Field(2, ge=1, le=3, description="Regional tier (1: Urban fringe, 2: Agricultural, 3: Remote)")
    experience_years: float = Field(2.0, ge=0, le=40, description="Years of relevant experience")
    land_acres: float = Field(1.0, ge=0, le=100, description="Available land in acres")
    market_distance_km: float = Field(10.0, ge=0.5, le=200, description="Distance to nearest mandi/market in km")
    electricity_hours: float = Field(16.0, ge=0, le=24, description="Daily electricity availability in hours")


@router.post("/predict")
def predict_business_ml(payload: MLRecommendationRequest) -> Dict[str, Any]:
    """
    Runs real-time Machine Learning inference using trained Scikit-Learn models
    (RandomForest Classifier & GradientBoosting Regressor).
    """
    return predict_rural_viability(
        capital=payload.capital,
        competitors=payload.competitors,
        tier=payload.tier,
        experience_years=payload.experience_years,
        land_acres=payload.land_acres,
        market_distance_km=payload.market_distance_km,
        electricity_hours=payload.electricity_hours,
    )


@router.get("/predict")
def predict_business_ml_get(
    capital: float = Query(100000.0, gt=0),
    competitors: int = Query(5, ge=0),
    tier: int = Query(2, ge=1, le=3),
    experience: float = Query(2.0, ge=0),
    land: float = Query(1.0, ge=0),
    distance: float = Query(10.0, ge=0),
    electricity: float = Query(16.0, ge=0, le=24),
) -> Dict[str, Any]:
    """
    GET version for quick interactive widget queries.
    """
    return predict_rural_viability(
        capital=capital,
        competitors=competitors,
        tier=tier,
        experience_years=experience,
        land_acres=land,
        market_distance_km=distance,
        electricity_hours=electricity,
    )
