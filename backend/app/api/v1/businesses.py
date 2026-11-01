from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_business
from app.models.entities import User, Business
from app.schemas.all_schemas import BusinessResponse, BusinessCreate, BusinessUpdate

router = APIRouter(prefix="/business", tags=["Business"])

@router.get("", response_model=BusinessResponse)
def get_business(business: Business = Depends(get_current_business)):
    return business

@router.post("", response_model=BusinessResponse, status_code=status.HTTP_201_CREATED)
def create_business(payload: BusinessCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Business).filter(Business.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Business profile already exists for this user.")

    biz = Business(
        user_id=current_user.id,
        business_name=payload.business_name,
        business_category=payload.business_category,
        business_type=payload.business_type,
        experience_years=Decimal(str(payload.experience_years)),
        locality=payload.locality,
        market_area=payload.market_area,
        num_employees=payload.num_employees,
        operating_days=payload.operating_days,
        main_products=payload.main_products,
        avg_daily_sales=Decimal(str(payload.avg_daily_sales)),
        avg_daily_expenses=Decimal(str(payload.avg_daily_expenses)),
        inventory_investment=Decimal(str(payload.inventory_investment)),
        outstanding_debt=Decimal(str(payload.outstanding_debt)),
        working_capital=Decimal(str(payload.working_capital)),
        supplier_terms=payload.supplier_terms,
        business_goals=payload.business_goals,
    )
    db.add(biz)
    db.commit()
    db.refresh(biz)
    return biz

@router.put("", response_model=BusinessResponse)
def update_business(payload: BusinessUpdate, business: Business = Depends(get_current_business), db: Session = Depends(get_db)):
    for field, val in payload.model_dump(exclude_unset=True).items():
        if field in ["experience_years", "avg_daily_sales", "avg_daily_expenses", "inventory_investment", "outstanding_debt", "working_capital"]:
            if val is not None:
                setattr(business, field, Decimal(str(val)))
        else:
            setattr(business, field, val)

    db.commit()
    db.refresh(business)
    return business
