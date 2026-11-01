from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import User, Profile, Business, Debt
from app.schemas.all_schemas import ProfileResponse, ProfileUpdate, OnboardingPayload, BusinessResponse

router = APIRouter(prefix="/profile", tags=["Profiles"])

@router.get("", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return profile

@router.put("", response_model=ProfileResponse)
def update_profile(payload: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    return profile

@router.post("/onboarding")
def complete_onboarding(payload: OnboardingPayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Update Profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    profile.full_name = payload.full_name
    profile.preferred_language = payload.preferred_language
    profile.district = payload.district
    profile.state = payload.state
    profile.pin_code = payload.pin_code
    profile.phone_number = payload.phone_number
    profile.is_onboarded = True

    # 2. Create or Update Business
    biz = db.query(Business).filter(Business.user_id == current_user.id).first()
    if not biz:
        biz = Business(user_id=current_user.id)
        db.add(biz)

    biz.business_name = payload.business_name
    biz.business_category = payload.business_category
    biz.business_type = payload.business_type
    biz.experience_years = Decimal(str(payload.experience_years))
    biz.locality = payload.locality
    biz.market_area = payload.market_area
    biz.num_employees = payload.num_employees
    biz.operating_days = payload.operating_days
    biz.main_products = payload.main_products

    # Financial Assumptions
    biz.avg_daily_sales = Decimal(str(payload.avg_daily_sales))
    biz.avg_daily_expenses = Decimal(str(payload.avg_daily_expenses))
    biz.inventory_investment = Decimal(str(payload.inventory_investment))
    biz.outstanding_debt = Decimal(str(payload.outstanding_debt))
    biz.working_capital = Decimal(str(payload.working_capital))
    biz.supplier_terms = payload.supplier_terms
    biz.business_goals = payload.business_goals

    db.commit()
    db.refresh(profile)
    db.refresh(biz)

    # 3. If outstanding debt was provided, record initial debt entry
    if payload.outstanding_debt > 0:
        existing_debt = db.query(Debt).filter(Debt.business_id == biz.id).first()
        if not existing_debt:
            from datetime import date
            initial_debt = Debt(
                business_id=biz.id,
                user_id=current_user.id,
                lender_name="Existing Debt Recorded at Onboarding",
                lender_type="informal",
                principal_amount=Decimal(str(payload.outstanding_debt)),
                current_balance=Decimal(str(payload.outstanding_debt)),
                start_date=date.today(),
                status="active"
            )
            db.add(initial_debt)
            db.commit()

    return {
        "status": "success",
        "message": "Onboarding successfully completed.",
        "profile": ProfileResponse.model_validate(profile),
        "business": BusinessResponse.model_validate(biz)
    }
