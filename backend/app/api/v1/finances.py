from datetime import date
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Response, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_business
from app.models.entities import User, Business, Profile
from app.services.financial_engine import FinancialEngine
from app.services.pdf_service import PDFService
from app.schemas.all_schemas import FinancialSummaryResponse

router = APIRouter(prefix="/finance", tags=["Financial Calculation Engine"])

@router.get("/summary", response_model=FinancialSummaryResponse)
def get_financial_summary(
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    res = FinancialEngine.calculate_summary(db, business.id, start_date, end_date)
    return res

@router.get("/cash-flow")
def get_cash_flow(
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    res = FinancialEngine.calculate_summary(db, business.id, start_date, end_date)
    return {
        "timeframe": res["timeframe"],
        "cash_inflows": res["cash_inflows"],
        "cash_outflows": res["cash_outflows"],
        "net_cash_flow": res["net_cash_flow"],
        "currency": res["currency"],
        "currency_symbol": res["currency_symbol"]
    }

@router.get("/profit-loss")
def get_profit_loss(
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    res = FinancialEngine.calculate_summary(db, business.id, start_date, end_date)
    return {
        "timeframe": res["timeframe"],
        "revenue": res["total_revenue"],
        "cogs": res["cogs"],
        "gross_profit": res["gross_profit"],
        "operating_expenses": res["operating_expenses"],
        "net_profit": res["net_profit"],
        "net_margin_percentage": res["net_profit_margin_pct"]
    }

@router.get("/break-even")
def get_break_even(
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    res = FinancialEngine.calculate_summary(db, business.id)
    return {
        "monthly_break_even_sales": res["break_even_monthly_revenue"],
        "daily_break_even_sales": res["daily_break_even_sales"],
        "burn_rate_daily": res["burn_rate_daily"],
        "currency_symbol": "₹"
    }

@router.get("/trend")
def get_trend(
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
    months: int = Query(6, ge=2, le=12)
):
    return FinancialEngine.get_monthly_trend(db, business.id, months)

@router.get("/export/pdf")
def export_financial_pdf(
    current_user: User = Depends(get_current_user),
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    summary = FinancialEngine.calculate_summary(db, business.id, start_date, end_date)
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    ent_name = profile.full_name if profile else "Entrepreneur"

    pdf_buffer = PDFService.generate_financial_report_pdf(summary, business.business_name, ent_name)

    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=gramvikas_financial_report_{date.today().isoformat()}.pdf"}
    )
