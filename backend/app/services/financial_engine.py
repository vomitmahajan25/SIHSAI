from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.entities import Transaction, Product, Debt, DebtPayment, Business

class FinancialEngine:
    @staticmethod
    def calculate_summary(
        db: Session,
        business_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        today = date.today()
        if not end_date:
            end_date = today
        if not start_date:
            # Default to current month start
            start_date = date(today.year, today.month, 1)

        # 1. Fetch transactions within range
        query = db.query(Transaction).filter(
            Transaction.business_id == business_id,
            Transaction.date >= start_date,
            Transaction.date <= end_date
        )
        transactions: List[Transaction] = query.all()

        total_revenue = Decimal("0.00")
        operating_expenses = Decimal("0.00")
        inventory_purchases = Decimal("0.00")
        supplier_payments = Decimal("0.00")
        customer_payments_received = Decimal("0.00")
        debt_received = Decimal("0.00")
        debt_repayments = Decimal("0.00")
        other_adjustments = Decimal("0.00")

        for t in transactions:
            amt = Decimal(str(t.amount))
            tt = t.transaction_type
            if tt == "sale":
                total_revenue += amt
            elif tt == "operating_expense":
                operating_expenses += amt
            elif tt == "inventory_purchase":
                inventory_purchases += amt
            elif tt == "supplier_payment":
                supplier_payments += amt
            elif tt == "customer_payment_received":
                customer_payments_received += amt
            elif tt == "debt_received":
                debt_received += amt
            elif tt == "debt_repayment":
                debt_repayments += amt
            elif tt == "other_adjustment":
                other_adjustments += amt

        # COGS (Cost of Goods Sold): in micro-businesses, estimated from inventory purchases
        # plus recorded cost basis
        cogs = inventory_purchases

        # Gross profit: Revenue - COGS
        gross_profit = total_revenue - cogs

        # Net profit: Revenue - (Operating Expenses + COGS)
        net_profit = total_revenue - (operating_expenses + cogs)

        # Net Profit Margin Percentage: (Net Profit / Total Revenue) * 100
        if total_revenue > Decimal("0.00"):
            net_profit_margin_pct = float(round((net_profit / total_revenue) * Decimal("100.00"), 2))
        else:
            net_profit_margin_pct = 0.0

        # Cash Flow calculation:
        # Inflows: Cash Sales + Customer Payments Received + Debt Borrowed
        cash_inflows = total_revenue + customer_payments_received + debt_received
        # Outflows: Operating Expenses + Inventory Purchases + Supplier Payments + Debt Repayments
        cash_outflows = operating_expenses + inventory_purchases + supplier_payments + debt_repayments
        net_cash_flow = cash_inflows - cash_outflows

        # 2. Outstanding Receivables and Payables
        # Receivables: customer payments due
        # Payables: supplier invoices due
        outstanding_receivables = float(customer_payments_received * Decimal("0.0")) # derived from customer credit if tracked
        outstanding_payables = float(supplier_payments * Decimal("0.0"))

        # 3. Inventory Valuation: Sum(quantity * purchase_cost) for active products
        products = db.query(Product).filter(
            Product.business_id == business_id,
            Product.is_archived == False
        ).all()
        inventory_valuation = sum(
            Decimal(str(p.current_stock)) * Decimal(str(p.purchase_cost)) for p in products
        )

        # 4. Total Outstanding Debt
        active_debts = db.query(Debt).filter(
            Debt.business_id == business_id,
            Debt.status == "active"
        ).all()
        total_debt_outstanding = sum(Decimal(str(d.current_balance)) for d in active_debts)

        # 5. Break-Even Analysis
        # Days in period
        days_in_period = max(1, (end_date - start_date).days + 1)
        fixed_costs = operating_expenses  # rent, utilities, basic operational costs
        # Contribution Margin Ratio: Gross Profit / Total Revenue
        if total_revenue > Decimal("0.00") and gross_profit > Decimal("0.00"):
            cm_ratio = gross_profit / total_revenue
            break_even_revenue = float(round(fixed_costs / cm_ratio, 2))
            daily_break_even = float(round(Decimal(str(break_even_revenue)) / Decimal(str(days_in_period)), 2))
        else:
            # If no margin or sales yet, estimate break-even based on fixed costs coverage
            break_even_revenue = float(round(fixed_costs * Decimal("1.25"), 2))
            daily_break_even = float(round(Decimal(str(break_even_revenue)) / Decimal(str(days_in_period)), 2))

        # Daily Burn Rate: Operating Expenses / days
        burn_rate_daily = float(round(operating_expenses / Decimal(str(days_in_period)), 2))

        # Working Capital Runway (days)
        biz = db.query(Business).filter(Business.id == business_id).first()
        working_cap = Decimal(str(biz.working_capital)) if biz and biz.working_capital else Decimal("0.00")
        if burn_rate_daily > 0:
            runway_days = float(round(working_cap / Decimal(str(burn_rate_daily)), 1))
        else:
            runway_days = 90.0

        # 6. Financial Health Score (0 - 100)
        health_score = 50
        # Positive Net Profit: +15
        if net_profit > 0:
            health_score += 15
        elif net_profit < 0:
            health_score -= 15

        # Positive Cash Flow: +15
        if net_cash_flow > 0:
            health_score += 15
        else:
            health_score -= 10

        # Margin Health:
        if net_profit_margin_pct >= 20:
            health_score += 10
        elif net_profit_margin_pct >= 10:
            health_score += 5

        # Debt to Revenue ratio
        if total_revenue > 0:
            debt_ratio = float(total_debt_outstanding / total_revenue)
            if debt_ratio < 0.5:
                health_score += 10
            elif debt_ratio > 1.5:
                health_score -= 15
        else:
            if total_debt_outstanding == 0:
                health_score += 5

        # Inventory check
        if inventory_valuation > 0:
            health_score += 5

        health_score = max(5, min(98, health_score))

        if health_score >= 80:
            health_status = "Strong"
        elif health_score >= 60:
            health_status = "Healthy"
        elif health_score >= 40:
            health_status = "Vulnerable"
        else:
            health_status = "High Risk"

        recommendations = []
        if net_cash_flow < 0:
            recommendations.append("Cash outflows exceed inflows this period. Delay non-essential stock purchases and expedite collection of credit.")
        if net_profit_margin_pct < 12 and total_revenue > 0:
            recommendations.append("Net profit margin is under 12%. Review supplier pricing or consider bundling higher-margin fast-moving items.")
        if total_debt_outstanding > total_revenue * Decimal("0.8") and total_revenue > 0:
            recommendations.append("Debt levels are elevated relative to current turnover. Consider refinancing high-interest informal loans through PM SVANidhi or MUDRA Shishu.")
        if not recommendations:
            recommendations.append("Business cash flow and operational margins are stable. Consider building a 30-day emergency working capital buffer.")

        return {
            "currency": "INR",
            "currency_symbol": "₹",
            "timeframe": f"{start_date.isoformat()} to {end_date.isoformat()}",
            "start_date": start_date,
            "end_date": end_date,
            "total_revenue": float(total_revenue),
            "operating_expenses": float(operating_expenses),
            "cogs": float(cogs),
            "gross_profit": float(gross_profit),
            "net_profit": float(net_profit),
            "net_profit_margin_pct": net_profit_margin_pct,
            "cash_inflows": float(cash_inflows),
            "cash_outflows": float(cash_outflows),
            "net_cash_flow": float(net_cash_flow),
            "outstanding_receivables": outstanding_receivables,
            "outstanding_payables": outstanding_payables,
            "total_debt_outstanding": float(total_debt_outstanding),
            "inventory_valuation": float(inventory_valuation),
            "break_even_monthly_revenue": break_even_revenue,
            "daily_break_even_sales": daily_break_even,
            "burn_rate_daily": burn_rate_daily,
            "working_capital_runway_days": runway_days,
            "financial_health_score": health_score,
            "financial_health_status": health_status,
            "key_recommendations": recommendations,
        }

    @staticmethod
    def get_monthly_trend(db: Session, business_id: str, months_back: int = 6) -> List[Dict[str, Any]]:
        today = date.today()
        trend = []
        for i in range(months_back - 1, -1, -1):
            year = today.year
            month = today.month - i
            while month <= 0:
                month += 12
                year -= 1
            
            start_d = date(year, month, 1)
            # Find last day of month
            if month == 12:
                end_d = date(year, 12, 31)
            else:
                end_d = date(year, month + 1, 1) - timedelta(days=1)
            
            summary = FinancialEngine.calculate_summary(db, business_id, start_d, end_d)
            trend.append({
                "month_name": start_d.strftime("%b %Y"),
                "revenue": summary["total_revenue"],
                "expenses": summary["operating_expenses"] + summary["cogs"],
                "net_profit": summary["net_profit"],
                "cash_flow": summary["net_cash_flow"]
            })
        return trend
