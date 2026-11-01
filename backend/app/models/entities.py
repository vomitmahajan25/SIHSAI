import uuid
from datetime import datetime, timezone, date
from decimal import Decimal
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Numeric, Date, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)
    
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    business = relationship("Business", back_populates="user", uselist=False, cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="user", cascade="all, delete-orphan")
    debts = relationship("Debt", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    business_plans = relationship("BusinessPlan", back_populates="user", cascade="all, delete-orphan")
    market_observations = relationship("MarketObservation", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=False)
    preferred_language = Column(String(50), default="English", nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pin_code = Column(String(10), nullable=True)
    preferred_currency = Column(String(10), default="INR", nullable=False)
    phone_number = Column(String(20), nullable=True)
    is_onboarded = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)
    
    user = relationship("User", back_populates="profile")


class Business(Base):
    __tablename__ = "businesses"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    business_name = Column(String(200), nullable=False)
    business_category = Column(String(100), nullable=False)  # Kirana, Street Vending, Apparel, Agri-trade, Handicraft, etc.
    business_type = Column(String(100), nullable=False)      # Shop, Street Vending, Home-based, Service, Manufacturing, Other
    experience_years = Column(Numeric(4, 1), default=0.0)
    locality = Column(String(150), nullable=True)
    market_area = Column(String(150), nullable=True)
    num_employees = Column(Integer, default=0)
    operating_days = Column(String(100), default="Monday to Saturday")
    main_products = Column(Text, nullable=True)
    
    # Financial assumptions recorded during onboarding
    avg_daily_sales = Column(Numeric(12, 2), default=0.00)
    avg_daily_expenses = Column(Numeric(12, 2), default=0.00)
    inventory_investment = Column(Numeric(12, 2), default=0.00)
    outstanding_debt = Column(Numeric(12, 2), default=0.00)
    working_capital = Column(Numeric(12, 2), default=0.00)
    supplier_terms = Column(String(200), nullable=True)
    business_goals = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)
    
    user = relationship("User", back_populates="business")
    transactions = relationship("Transaction", back_populates="business", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="business", cascade="all, delete-orphan")
    debts = relationship("Debt", back_populates="business", cascade="all, delete-orphan")
    business_plans = relationship("BusinessPlan", back_populates="business", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Transaction types:
    # sale, operating_expense, inventory_purchase, supplier_payment, customer_payment_received, debt_received, debt_repayment, other_adjustment
    transaction_type = Column(String(50), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    date = Column(Date, nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True) # Inventory, Rent, Utilities, Labor, Raw Material, Direct Sale, etc.
    description = Column(String(500), nullable=False)
    payment_method = Column(String(50), default="Cash")       # Cash, UPI, Bank Transfer, Credit
    counterparty = Column(String(150), nullable=True)         # Customer name or Supplier name
    receipt_doc_id = Column(String(36), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)
    
    user = relationship("User", back_populates="transactions")
    business = relationship("Business", back_populates="transactions")

    __table_args__ = (
        Index("idx_trans_user_date", "user_id", "date"),
        Index("idx_trans_biz_date", "business_id", "date"),
    )


class Product(Base):
    __tablename__ = "products"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    sku = Column(String(50), nullable=True, index=True)
    category = Column(String(100), nullable=False)
    purchase_cost = Column(Numeric(10, 2), nullable=False)
    selling_price = Column(Numeric(10, 2), nullable=False)
    current_stock = Column(Numeric(10, 2), default=0.00, nullable=False)
    min_stock_threshold = Column(Numeric(10, 2), default=5.00, nullable=False)
    supplier_details = Column(String(255), nullable=True)
    is_archived = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)
    
    user = relationship("User", back_populates="products")
    business = relationship("Business", back_populates="products")
    movements = relationship("InventoryMovement", back_populates="product", cascade="all, delete-orphan")


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    movement_type = Column(String(50), nullable=False)  # received, sold, damaged, returned, manual_adjustment
    quantity = Column(Numeric(10, 2), nullable=False)
    unit_cost = Column(Numeric(10, 2), nullable=True)
    notes = Column(String(300), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    
    product = relationship("Product", back_populates="movements")


class Debt(Base):
    __tablename__ = "debts"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    lender_name = Column(String(150), nullable=False)
    lender_type = Column(String(50), default="informal")  # informal/moneylender, bank, mfi, friend_family, supplier
    principal_amount = Column(Numeric(12, 2), nullable=False)
    current_balance = Column(Numeric(12, 2), nullable=False)
    interest_rate_apr = Column(Numeric(5, 2), nullable=True)
    monthly_payment = Column(Numeric(10, 2), nullable=True)
    start_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=True)
    status = Column(String(50), default="active")  # active, paid_off, defaulted
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)
    
    user = relationship("User", back_populates="debts")
    business = relationship("Business", back_populates="debts")
    payments = relationship("DebtPayment", back_populates="debt", cascade="all, delete-orphan")


class DebtPayment(Base):
    __tablename__ = "debt_payments"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    debt_id = Column(String(36), ForeignKey("debts.id", ondelete="CASCADE"), nullable=False, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    payment_date = Column(Date, nullable=False)
    notes = Column(String(300), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    
    debt = relationship("Debt", back_populates="payments")


class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), default="New Advisory Conversation", nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)
    
    user = relationship("User", back_populates="conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String(20), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    sources_json = Column(Text, nullable=True)    # JSON string of referenced schemes/calculations
    actions_json = Column(Text, nullable=True)    # JSON string of suggested actionable steps
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    
    conversation = relationship("Conversation", back_populates="messages")


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    business_id = Column(String(36), nullable=True, index=True)
    filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    category = Column(String(50), default="receipt", nullable=False) # receipt, license, id_proof, loan_doc, other
    linked_transaction_id = Column(String(36), nullable=True)
    notes = Column(String(300), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    
    user = relationship("User", back_populates="documents")


class FestivalEvent(Base):
    __tablename__ = "festivals_and_events"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(150), nullable=False)
    date = Column(Date, nullable=False, index=True)
    region = Column(String(100), default="National", nullable=False) # National, Maharashtra, Uttar Pradesh, Bihar, etc.
    category = Column(String(100), nullable=False) # Religious, Harvest, Cultural, Seasonal
    suggested_preparation = Column(Text, nullable=False)
    inventory_notes = Column(Text, nullable=True)
    is_user_event = Column(Boolean, default=False, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)


class BusinessPlan(Base):
    __tablename__ = "business_plans"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    plan_data_json = Column(Text, nullable=False)  # JSON structure containing 12 sections
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)
    
    user = relationship("User", back_populates="business_plans")
    business = relationship("Business", back_populates="business_plans")


class SchemeCatalog(Base):
    __tablename__ = "scheme_catalog"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    scheme_name = Column(String(200), nullable=False, index=True)
    issuing_authority = Column(String(200), nullable=False)
    intended_beneficiaries = Column(String(255), nullable=False)
    business_categories = Column(String(255), nullable=False)
    official_url = Column(String(500), nullable=False)
    eligibility_conditions = Column(Text, nullable=False)
    required_documents = Column(Text, nullable=False)
    application_procedure = Column(Text, nullable=False)
    max_loan_subsidy_info = Column(String(255), nullable=True)
    last_verified_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)


class MarketObservation(Base):
    __tablename__ = "market_observations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    business_id = Column(String(36), nullable=False)
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    city_village = Column(String(100), nullable=False)
    locality = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    competitor_name = Column(String(150), nullable=True)
    observed_product = Column(String(150), nullable=False)
    observed_price = Column(Numeric(10, 2), nullable=True)
    supplier_name = Column(String(150), nullable=True)
    supplier_details = Column(String(255), nullable=True)
    customer_segment_notes = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    
    user = relationship("User", back_populates="market_observations")
