from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import User, FestivalEvent
from app.services.festival_service import FestivalService
from app.schemas.all_schemas import FestivalEventCreate, FestivalEventResponse

router = APIRouter(prefix="/festivals", tags=["Festival Calendar & Seasonal Advisory"])

@router.get("", response_model=List[FestivalEventResponse])
def get_festivals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    events = FestivalService.get_events(db, current_user.id)
    return [FestivalEventResponse.model_validate(e) for e in events]

@router.post("", response_model=FestivalEventResponse, status_code=status.HTTP_201_CREATED)
def create_custom_event(
    payload: FestivalEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ev = FestivalService.create_custom_event(db, current_user.id, payload)
    return FestivalEventResponse.model_validate(ev)
