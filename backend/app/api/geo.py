"""Geocoding and OpenStreetMap API endpoints."""
from fastapi import APIRouter, Query
from typing import Optional
from ..services.geo_service import geocode_location, fetch_osm_competitor_stats

router = APIRouter(prefix="/geo", tags=["geo"])


@router.get("/lookup")
async def lookup_location(
    pincode: Optional[str] = Query(None, description="6-digit Indian PIN Code"),
    village: Optional[str] = Query(None, description="Village or town name"),
    district: Optional[str] = Query(None, description="District name"),
    state: Optional[str] = Query(None, description="State name"),
):
    """Lookup latitude, longitude, district, state using OpenStreetMap Nominatim."""
    return await geocode_location(
        pin_code=pincode,
        village=village,
        district=district,
        state=state,
    )


@router.get("/competitors")
async def get_competitors(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    category: str = Query("Retail", description="Business category"),
    radius: int = Query(5000, description="Radius in meters"),
):
    """Query live competitor density from OpenStreetMap Overpass API."""
    return await fetch_osm_competitor_stats(
        lat=lat,
        lon=lon,
        category=category,
        radius_meters=radius,
    )
