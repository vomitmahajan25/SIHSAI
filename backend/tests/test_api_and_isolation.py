from datetime import date
from decimal import Decimal
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi import HTTPException
from app.core.database import Base
from app.models.entities import User, Profile, Business, Transaction, Product
from app.api.v1.auth import register, login
from app.api.v1.profiles import complete_onboarding
from app.api.v1.transactions import create_transaction, get_transactions, delete_transaction
from app.services.scheme_service import SchemeService
from app.services.inventory_service import InventoryService
from app.schemas.all_schemas import (
    UserRegister, UserLogin, OnboardingPayload, TransactionCreate,
    ProductCreate, InventoryMovementCreate
)

@pytest.fixture
def test_db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_user_registration_and_login(test_db):
    # 1. Register User 1
    reg_payload = UserRegister(
        email="ramesh@gramvikas.in",
        password="Password123!",
        full_name="Ramesh Kumar",
        preferred_language="Hindi",
        district="Solapur",
        state="Maharashtra",
        pin_code="413001"
    )
    token_res = register(reg_payload, test_db)
    assert token_res.access_token is not None
    assert token_res.email == "ramesh@gramvikas.in"
    assert token_res.is_onboarded is False

    # 2. Login
    login_res = login(UserLogin(email="ramesh@gramvikas.in", password="Password123!"), test_db)
    assert login_res.access_token is not None
    assert login_res.user_id == token_res.user_id

    # 3. Duplicate email rejection
    with pytest.raises(HTTPException) as exc:
        register(reg_payload, test_db)
    assert exc.value.status_code == 400

def test_onboarding_and_transaction_isolation(test_db):
    # Register User 1
    u1 = register(UserRegister(
        email="owner1@gramvikas.in", password="Pass123!", full_name="User One",
        district="Pune", state="MH"
    ), test_db)
    user1_obj = test_db.query(User).filter(User.id == u1.user_id).first()

    # Complete Onboarding for User 1
    onboard_res = complete_onboarding(OnboardingPayload(
        full_name="User One",
        district="Pune",
        state="Maharashtra",
        business_name="One Store",
        business_category="Kirana",
        business_type="Shop",
        avg_daily_sales=4000.0,
        avg_daily_expenses=800.0,
        working_capital=25000.0
    ), current_user=user1_obj, db=test_db)
    biz1_id = onboard_res["business"].id
    biz1_obj = test_db.query(Business).filter(Business.id == biz1_id).first()

    # Create Transaction for User 1
    t1 = create_transaction(
        TransactionCreate(
            transaction_type="sale",
            amount=1500.0,
            date=date.today(),
            category="Daily Groceries",
            description="Morning sales"
        ),
        current_user=user1_obj,
        business=biz1_obj,
        db=test_db
    )
    assert t1.id is not None
    assert float(t1.amount) == 1500.0

    # Register User 2
    u2 = register(UserRegister(
        email="owner2@gramvikas.in", password="Pass456!", full_name="User Two",
        district="Nagpur", state="MH"
    ), test_db)
    user2_obj = test_db.query(User).filter(User.id == u2.user_id).first()

    onboard_res2 = complete_onboarding(OnboardingPayload(
        full_name="User Two",
        district="Nagpur",
        state="Maharashtra",
        business_name="Two Store",
        business_category="Dairy",
        business_type="Shop"
    ), current_user=user2_obj, db=test_db)
    biz2_obj = test_db.query(Business).filter(Business.id == onboard_res2["business"].id).first()

    # Query transactions for User 2 -> Must be empty! User 2 CANNOT see User 1's transaction
    user2_trans = get_transactions(business=biz2_obj, db=test_db)
    assert user2_trans.total == 0
    assert len(user2_trans.items) == 0

    # Query transactions for User 1 -> Must contain exactly 1 transaction
    user1_trans = get_transactions(business=biz1_obj, db=test_db)
    assert user1_trans.total == 1
    assert user1_trans.items[0].id == t1.id

def test_inventory_negative_stock_prevention(test_db):
    prod = InventoryService.create_product(
        test_db,
        business_id="biz_1",
        user_id="user_1",
        data=ProductCreate(
            name="Basmati Rice 5kg",
            category="Grains",
            purchase_cost=400.0,
            selling_price=480.0,
            current_stock=5.0,
            min_stock_threshold=2.0
        )
    )
    assert float(prod.current_stock) == 5.0

    # Deduct 3 units (valid)
    mov1 = InventoryService.record_movement(
        test_db, "biz_1", prod.id,
        InventoryMovementCreate(movement_type="sold", quantity=3.0)
    )
    assert float(prod.current_stock) == 2.0

    # Attempt to deduct 5 units (exceeds stock of 2, must fail)
    with pytest.raises(HTTPException) as exc_info:
        InventoryService.record_movement(
            test_db, "biz_1", prod.id,
            InventoryMovementCreate(movement_type="sold", quantity=5.0)
        )
    assert exc_info.value.status_code == 400
    assert "Insufficient inventory" in exc_info.value.detail

def test_scheme_eligibility():
    matches = SchemeService.evaluate_eligibility(
        business_category="Street Vending",
        business_type="Street Vendor / Food Cart",
        annual_turnover=180000.0,
        experience_years=2.0
    )
    svanidhi = next((m for m in matches if m.scheme_id == "pm-svanidhi"), None)
    assert svanidhi is not None
    assert svanidhi.status == "Potentially relevant"

    matches_artisan = SchemeService.evaluate_eligibility(
        business_category="Carpentry / Woodcraft",
        business_type="Home-based Workshop",
        annual_turnover=120000.0,
        experience_years=5.0
    )
    vishwakarma = next((m for m in matches_artisan if m.scheme_id == "pm-vishwakarma"), None)
    assert vishwakarma is not None
    assert vishwakarma.status == "Potentially relevant"
