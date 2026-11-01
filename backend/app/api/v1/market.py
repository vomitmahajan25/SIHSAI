from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_business
from app.models.entities import User, Business, Profile, MarketObservation
from app.services.market_service import MarketService
from app.schemas.all_schemas import (
    MarketObservationCreate, MarketObservationResponse, MarketInsightsResponse
)

router = APIRouter(prefix="/market", tags=["Hyper-Local Market Analysis"])

@router.get("/insights", response_model=MarketInsightsResponse)
def get_market_insights(
    business: Business = Depends(get_current_business),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    locality: Optional[str] = None,
    district: Optional[str] = None,
    state: Optional[str] = None,
    category: Optional[str] = None
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    loc = locality or business.locality or (profile.district if profile else "Central Market")
    dist = district or (profile.district if profile else "Pune")
    st = state or (profile.state if profile else "Maharashtra")
    cat = category or business.business_category or "Kirana & Retail"

    insights = MarketService.get_insights(loc, dist, st, cat)
    return MarketInsightsResponse(**insights)

@router.get("/observations", response_model=List[MarketObservationResponse])
def get_observations(business: Business = Depends(get_current_business), db: Session = Depends(get_db)):
    obs = MarketService.get_observations(db, business.id)
    return [MarketObservationResponse.model_validate(o) for o in obs]

@router.post("/observations", response_model=MarketObservationResponse, status_code=status.HTTP_201_CREATED)
def record_observation(
    payload: MarketObservationCreate,
    current_user: User = Depends(get_current_user),
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    obs = MarketService.create_observation(db, current_user.id, business.id, payload)
    return MarketObservationResponse.model_validate(obs)
