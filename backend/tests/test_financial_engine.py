from datetime import date, timedelta
from decimal import Decimal
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.entities import User, Profile, Business, Transaction, Product, Debt
from app.services.financial_engine import FinancialEngine

@pytest.fixture
def db_session():
    # In-memory SQLite for testing
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_financial_calculations(db_session):
    # 1. Create User and Business
    user = User(email="test@gramvikas.in", hashed_password="hashed_pwd")
    db_session.add(user)
    db_session.commit()

    biz = Business(
        user_id=user.id,
        business_name="Maa Laxmi Kirana",
        business_category="Kirana Store",
        business_type="Shop",
        working_capital=Decimal("15000.00")
    )
    db_session.add(biz)
    db_session.commit()

    today = date.today()

    # 2. Add Transactions:
    # Sale: ₹12,000
    db_session.add(Transaction(
        business_id=biz.id,
        user_id=user.id,
        transaction_type="sale",
        amount=Decimal("12000.00"),
        date=today,
        category="Direct Sales",
        description="Daily counter cash and UPI"
    ))

    # Another Sale: ₹3,000
    db_session.add(Transaction(
        business_id=biz.id,
        user_id=user.id,
        transaction_type="sale",
        amount=Decimal("3000.00"),
        date=today,
        category="Direct Sales",
        description="Evening sales"
    ))

    # Inventory Purchase (COGS): ₹8,000
    db_session.add(Transaction(
        business_id=biz.id,
        user_id=user.id,
        transaction_type="inventory_purchase",
        amount=Decimal("8000.00"),
        date=today,
        category="Grains & Oil",
        description="Wholesale mandi procurement"
    ))

    # Operating Expense (Rent): ₹1,500
    db_session.add(Transaction(
        business_id=biz.id,
        user_id=user.id,
        transaction_type="operating_expense",
        amount=Decimal("1500.00"),
        date=today,
        category="Rent",
        description="Shop rent portion"
    ))

    # Debt Borrowed (Not revenue! Cash Inflow only): ₹10,000
    db_session.add(Transaction(
        business_id=biz.id,
        user_id=user.id,
        transaction_type="debt_received",
        amount=Decimal("10000.00"),
        date=today,
        category="MUDRA Loan Disbursed",
        description="Bank loan credit"
    ))

    # Debt Repayment (Cash Outflow): ₹1,000
    db_session.add(Transaction(
        business_id=biz.id,
        user_id=user.id,
        transaction_type="debt_repayment",
        amount=Decimal("1000.00"),
        date=today,
        category="EMI Payment",
        description="Monthly loan installment"
    ))

    # Add Product in inventory: 20 units @ ₹100 cost
    db_session.add(Product(
        business_id=biz.id,
        user_id=user.id,
        name="Chana Dal 1kg",
        category="Pulses",
        purchase_cost=Decimal("100.00"),
        selling_price=Decimal("125.00"),
        current_stock=Decimal("20.00"),
        min_stock_threshold=Decimal("5.00")
    ))

    db_session.commit()

    # 3. Calculate Summary
    start_d = today - timedelta(days=5)
    end_d = today
    summary = FinancialEngine.calculate_summary(db_session, biz.id, start_d, end_d)

    # 4. Verify Accounting Formulas
    # Total Revenue must be 12000 + 3000 = 15000 (Debt of 10000 is NOT revenue!)
    assert summary["total_revenue"] == 15000.0, f"Expected 15000 revenue, got {summary['total_revenue']}"

    # COGS = 8000
    assert summary["cogs"] == 8000.0

    # Gross Profit = Revenue (15000) - COGS (8000) = 7000
    assert summary["gross_profit"] == 7000.0

    # Operating Expenses = 1500
    assert summary["operating_expenses"] == 1500.0

    # Net Profit = Revenue (15000) - (COGS 8000 + Operating Expenses 1500) = 5500
    assert summary["net_profit"] == 5500.0

    # Net Margin % = (5500 / 15000) * 100 = 36.67%
    assert abs(summary["net_profit_margin_pct"] - 36.67) < 0.1

    # Cash Inflows = 15000 (sales) + 10000 (debt received) = 25000
    assert summary["cash_inflows"] == 25000.0

    # Cash Outflows = 1500 (expenses) + 8000 (purchases) + 1000 (debt repayment) = 10500
    assert summary["cash_outflows"] == 10500.0

    # Net Cash Flow = 25000 - 10500 = 14500
    assert summary["net_cash_flow"] == 14500.0

    # Inventory Valuation = 20 * 100 = 2000
    assert summary["inventory_valuation"] == 2000.0

    # Health score must be positive
    assert summary["financial_health_score"] > 60
    assert summary["financial_health_status"] in ["Healthy", "Strong"]
