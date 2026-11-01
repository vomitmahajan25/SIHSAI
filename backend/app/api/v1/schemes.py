from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.services.scheme_service import SchemeService
from app.schemas.all_schemas import (
    SchemeResponse, SchemeEligibilityRequest, SchemeEligibilityResponse
)

router = APIRouter(prefix="/schemes", tags=["Government Schemes & Loans Guidance"])

@router.get("", response_model=List[SchemeResponse])
def get_schemes():
    return SchemeService.get_all_schemes()

@router.get("/{scheme_id}", response_model=SchemeResponse)
def get_scheme_detail(scheme_id: str):
    s = SchemeService.get_scheme_by_id(scheme_id)
    if not s:
        raise HTTPException(status_code=404, detail="Scheme not found.")
    return s

@router.post("/eligibility-check", response_model=SchemeEligibilityResponse)
def check_scheme_eligibility(payload: SchemeEligibilityRequest):
    matches = SchemeService.evaluate_eligibility(
        business_category=payload.business_category,
        business_type=payload.business_type,
        annual_turnover=payload.annual_turnover,
        experience_years=payload.experience_years,
        has_udyam=payload.has_udyam_registration,
        gender=payload.gender or "All",
        social_category=payload.social_category or "General"
    )
    return SchemeEligibilityResponse(
        matches=matches,
        disclaimer="Eligibility indicators are preliminary guidance based on official scheme guidelines. Final loan sanction, subsidy release, and approval rests solely with participating banks, lending institutions, and issuing government authorities."
    )
