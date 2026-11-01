import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_business
from app.models.entities import User, Business, BusinessPlan
from app.services.business_plan_service import BusinessPlanService
from app.services.pdf_service import PDFService
from app.schemas.all_schemas import BusinessPlanCreate, BusinessPlanResponse

router = APIRouter(prefix="/business-plans", tags=["Business Plan Generator"])

@router.get("", response_model=List[BusinessPlanResponse])
def get_business_plans(business: Business = Depends(get_current_business), db: Session = Depends(get_db)):
    plans = db.query(BusinessPlan).filter(BusinessPlan.business_id == business.id).order_by(BusinessPlan.created_at.desc()).all()
    results = []
    for p in plans:
        results.append(BusinessPlanResponse(
            id=p.id,
            user_id=p.user_id,
            business_id=p.business_id,
            title=p.title,
            plan_data=json.loads(p.plan_data_json),
            created_at=p.created_at,
            updated_at=p.updated_at
        ))
    return results

@router.post("", response_model=BusinessPlanResponse, status_code=status.HTTP_201_CREATED)
def generate_business_plan(
    payload: BusinessPlanCreate,
    current_user: User = Depends(get_current_user),
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    plan = BusinessPlanService.generate_plan(db, current_user.id, business.id, payload)
    return BusinessPlanResponse(
        id=plan.id,
        user_id=plan.user_id,
        business_id=plan.business_id,
        title=plan.title,
        plan_data=json.loads(plan.plan_data_json),
        created_at=plan.created_at,
        updated_at=plan.updated_at
    )

@router.get("/{plan_id}", response_model=BusinessPlanResponse)
def get_plan_detail(
    plan_id: str,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    plan = db.query(BusinessPlan).filter(
        BusinessPlan.id == plan_id,
        BusinessPlan.business_id == business.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Business plan not found.")

    return BusinessPlanResponse(
        id=plan.id,
        user_id=plan.user_id,
        business_id=plan.business_id,
        title=plan.title,
        plan_data=json.loads(plan.plan_data_json),
        created_at=plan.created_at,
        updated_at=plan.updated_at
    )

@router.get("/{plan_id}/pdf")
def export_plan_pdf(
    plan_id: str,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    plan = db.query(BusinessPlan).filter(
        BusinessPlan.id == plan_id,
        BusinessPlan.business_id == business.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Business plan not found.")

    data = json.loads(plan.plan_data_json)
    pdf_buffer = PDFService.generate_business_plan_pdf(data)

    clean_filename = f"gramvikas_business_plan_{plan_id[:8]}.pdf"
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={clean_filename}"}
    )
