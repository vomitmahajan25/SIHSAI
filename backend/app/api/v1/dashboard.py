from datetime import date
from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_business
from app.models.entities import User, Business, Profile, Transaction, Product, FestivalEvent
from app.services.financial_engine import FinancialEngine
from app.services.inventory_service import InventoryService
from app.services.festival_service import FestivalService
from app.schemas.all_schemas import (
    DashboardSummaryResponse, MetricCard, TransactionResponse, ProductResponse, FestivalEventResponse
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard / Overview"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    today = date.today()
    month_start = date(today.year, today.month, 1)

    # 1. Today's transactions
    today_trans = db.query(Transaction).filter(
        Transaction.business_id == business.id,
        Transaction.date == today
    ).all()
    today_sales_val = sum(float(t.amount) for t in today_trans if t.transaction_type == "sale")
    today_exp_val = sum(float(t.amount) for t in today_trans if t.transaction_type in ["operating_expense", "inventory_purchase"])
    today_profit_val = today_sales_val - today_exp_val

    # 2. Month's financial engine summary
    fin = FinancialEngine.calculate_summary(db, business.id, month_start, today)

    # 3. Recent 5 transactions
    recent_t = db.query(Transaction).filter(
        Transaction.business_id == business.id
    ).order_by(Transaction.date.desc(), Transaction.created_at.desc()).limit(6).all()

    # 4. Low stock products
    products = InventoryService.get_products(db, business.id)
    low_stocks = [p for p in products if p["is_low_stock"]][:5]

    # 5. Upcoming 3 festivals
    all_festivals = FestivalService.get_events(db, current_user.id)
    upcoming_f = [f for f in all_festivals if f.date >= today][:4]

    # Quick tips
    quick_tips = [
        "Record every cash and UPI sale before closing your galla today.",
        "Check your inventory threshold: replenish items flagged with low stock.",
        "Maintain a credit cap of ₹500 to keep your working capital safe."
    ]
    if fin["net_profit"] < 0:
        quick_tips.insert(0, "Your monthly expenses currently exceed recorded sales. Delay non-critical equipment purchases.")

    user_name = profile.full_name if profile else "Entrepreneur"
    locality_display = f"{business.locality or ''}, {profile.district if profile else ''}".strip(", ")

    return DashboardSummaryResponse(
        user_name=user_name,
        business_name=business.business_name,
        locality=locality_display,
        today_sales=MetricCard(
            label="Today's Sales",
            value=today_sales_val,
            formatted_value=f"₹{today_sales_val:,.2f}",
            is_positive=True,
            subtitle="Recorded today"
        ),
        today_expenses=MetricCard(
            label="Today's Expenses",
            value=today_exp_val,
            formatted_value=f"₹{today_exp_val:,.2f}",
            is_positive=False,
            subtitle="Stock & daily costs"
        ),
        estimated_daily_profit=MetricCard(
            label="Today's Profit",
            value=today_profit_val,
            formatted_value=f"₹{today_profit_val:,.2f}",
            is_positive=today_profit_val >= 0,
            subtitle="Sales minus expenses"
        ),
        month_revenue=MetricCard(
            label="Month's Revenue",
            value=fin["total_revenue"],
            formatted_value=f"₹{fin['total_revenue']:,.2f}",
            is_positive=True,
            subtitle="Gross recorded sales"
        ),
        month_expenses=MetricCard(
            label="Month's Expenses",
            value=fin["operating_expenses"] + fin["cogs"],
            formatted_value=f"₹{(fin['operating_expenses'] + fin['cogs']):,.2f}",
            is_positive=False,
            subtitle="Operating + COGS"
        ),
        month_net_profit=MetricCard(
            label="Month's Net Profit",
            value=fin["net_profit"],
            formatted_value=f"₹{fin['net_profit']:,.2f}",
            trend_percentage=fin["net_profit_margin_pct"],
            is_positive=fin["net_profit"] >= 0,
            subtitle=f"{fin['net_profit_margin_pct']:.1f}% net margin"
        ),
        outstanding_debt=MetricCard(
            label="Recorded Debt",
            value=fin["total_debt_outstanding"],
            formatted_value=f"₹{fin['total_debt_outstanding']:,.2f}",
            is_positive=fin["total_debt_outstanding"] == 0,
            subtitle="Total borrowing"
        ),
        inventory_value=MetricCard(
            label="Inventory Value",
            value=fin["inventory_valuation"],
            formatted_value=f"₹{fin['inventory_valuation']:,.2f}",
            is_positive=True,
            subtitle="Available stock cost"
        ),
        recent_transactions=[TransactionResponse.model_validate(t) for t in recent_t],
        low_stock_alerts=[ProductResponse(**p) for p in low_stocks],
        upcoming_festivals=[FestivalEventResponse.model_validate(f) for f in upcoming_f],
        health_score=fin["financial_health_score"],
        quick_tips=quick_tips
    )
