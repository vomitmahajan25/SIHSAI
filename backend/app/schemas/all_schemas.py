from typing import Optional, List, Any, Dict
from datetime import datetime, date
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field

# ----------------- AUTH & USER -----------------
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    preferred_language: str = "English"
    district: str = "Pune"
    state: str = "Maharashtra"
    pin_code: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    is_onboarded: bool

class UserResponse(BaseModel):
    id: str
    email: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

# ----------------- PROFILE -----------------
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    preferred_language: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    preferred_currency: Optional[str] = "INR"
    phone_number: Optional[str] = None
    is_onboarded: Optional[bool] = None

class ProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    preferred_language: str
    district: str
    state: str
    pin_code: Optional[str] = None
    preferred_currency: str
    phone_number: Optional[str] = None
    is_onboarded: bool
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# ----------------- BUSINESS -----------------
class BusinessCreate(BaseModel):
    business_name: str
    business_category: str
    business_type: str
    experience_years: float = 0.0
    locality: Optional[str] = None
    market_area: Optional[str] = None
    num_employees: int = 0
    operating_days: str = "Monday to Saturday"
    main_products: Optional[str] = None
    avg_daily_sales: float = 0.0
    avg_daily_expenses: float = 0.0
    inventory_investment: float = 0.0
    outstanding_debt: float = 0.0
    working_capital: float = 0.0
    supplier_terms: Optional[str] = None
    business_goals: Optional[str] = None

class BusinessUpdate(BaseModel):
    business_name: Optional[str] = None
    business_category: Optional[str] = None
    business_type: Optional[str] = None
    experience_years: Optional[float] = None
    locality: Optional[str] = None
    market_area: Optional[str] = None
    num_employees: Optional[int] = None
    operating_days: Optional[str] = None
    main_products: Optional[str] = None
    avg_daily_sales: Optional[float] = None
    avg_daily_expenses: Optional[float] = None
    inventory_investment: Optional[float] = None
    outstanding_debt: Optional[float] = None
    working_capital: Optional[float] = None
    supplier_terms: Optional[str] = None
    business_goals: Optional[str] = None

class BusinessResponse(BaseModel):
    id: str
    user_id: str
    business_name: str
    business_category: str
    business_type: str
    experience_years: float
    locality: Optional[str] = None
    market_area: Optional[str] = None
    num_employees: int
    operating_days: str
    main_products: Optional[str] = None
    avg_daily_sales: float
    avg_daily_expenses: float
    inventory_investment: float
    outstanding_debt: float
    working_capital: float
    supplier_terms: Optional[str] = None
    business_goals: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# ----------------- ONBOARDING -----------------
class OnboardingPayload(BaseModel):
    # Personal
    full_name: str
    preferred_language: str = "English"
    district: str
    state: str
    pin_code: Optional[str] = None
    phone_number: Optional[str] = None
    
    # Business
    business_name: str
    business_category: str
    business_type: str
    experience_years: float = 0.0
    locality: Optional[str] = None
    market_area: Optional[str] = None
    num_employees: int = 0
    operating_days: str = "Monday to Saturday"
    main_products: Optional[str] = None
    
    # Financial
    avg_daily_sales: float = 0.0
    avg_daily_expenses: float = 0.0
    inventory_investment: float = 0.0
    outstanding_debt: float = 0.0
    working_capital: float = 0.0
    supplier_terms: Optional[str] = None
    business_goals: Optional[str] = None

# ----------------- TRANSACTIONS -----------------
class TransactionCreate(BaseModel):
    transaction_type: str # sale, operating_expense, inventory_purchase, supplier_payment, customer_payment_received, debt_received, debt_repayment, other_adjustment
    amount: float = Field(..., gt=0)
    date: date
    category: str
    description: str
    payment_method: str = "Cash"
    counterparty: Optional[str] = None
    receipt_doc_id: Optional[str] = None

class TransactionUpdate(BaseModel):
    transaction_type: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    date: Optional[date] = None
    category: Optional[str] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None
    counterparty: Optional[str] = None
    receipt_doc_id: Optional[str] = None

class TransactionResponse(BaseModel):
    id: str
    business_id: str
    user_id: str
    transaction_type: str
    amount: float
    date: date
    category: str
    description: str
    payment_method: str
    counterparty: Optional[str] = None
    receipt_doc_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class TransactionListResponse(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_income: float
    total_expense: float

# ----------------- FINANCIAL ENGINE -----------------
class FinancialMetricPeriod(BaseModel):
    period: str
    revenue: float
    operating_expenses: float
    cogs: float
    gross_profit: float
    net_profit: float
    net_margin_percentage: float
    cash_inflow: float
    cash_outflow: float
    net_cash_flow: float

class FinancialSummaryResponse(BaseModel):
    currency: str = "INR"
    currency_symbol: str = "₹"
    timeframe: str
    start_date: date
    end_date: date
    
    # Core calculations
    total_revenue: float
    operating_expenses: float
    cogs: float
    gross_profit: float
    net_profit: float
    net_profit_margin_pct: float
    
    # Cash flow
    cash_inflows: float
    cash_outflows: float
    net_cash_flow: float
    
    # Balance sheet snapshot
    outstanding_receivables: float
    outstanding_payables: float
    total_debt_outstanding: float
    inventory_valuation: float
    
    # Break-even & Health
    break_even_monthly_revenue: Optional[float] = None
    daily_break_even_sales: Optional[float] = None
    burn_rate_daily: float
    working_capital_runway_days: Optional[float] = None
    financial_health_score: int # 0 to 100
    financial_health_status: str # Strong, Healthy, Vulnerable, High Risk
    key_recommendations: List[str]

# ----------------- INVENTORY -----------------
class ProductCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    category: str
    purchase_cost: float = Field(..., ge=0)
    selling_price: float = Field(..., ge=0)
    current_stock: float = Field(0.0, ge=0)
    min_stock_threshold: float = Field(5.0, ge=0)
    supplier_details: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    purchase_cost: Optional[float] = Field(None, ge=0)
    selling_price: Optional[float] = Field(None, ge=0)
    current_stock: Optional[float] = Field(None, ge=0)
    min_stock_threshold: Optional[float] = Field(None, ge=0)
    supplier_details: Optional[str] = None
    is_archived: Optional[bool] = None

class ProductResponse(BaseModel):
    id: str
    business_id: str
    user_id: str
    name: str
    sku: Optional[str] = None
    category: str
    purchase_cost: float
    selling_price: float
    current_stock: float
    min_stock_threshold: float
    supplier_details: Optional[str] = None
    is_archived: bool
    estimated_gross_margin_pct: Optional[float] = None
    is_low_stock: bool
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class InventoryMovementCreate(BaseModel):
    movement_type: str # received, sold, damaged, returned, manual_adjustment
    quantity: float = Field(..., gt=0)
    unit_cost: Optional[float] = None
    notes: Optional[str] = None

class InventoryMovementResponse(BaseModel):
    id: str
    product_id: str
    business_id: str
    movement_type: str
    quantity: float
    unit_cost: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# ----------------- DEBT -----------------
class DebtCreate(BaseModel):
    lender_name: str
    lender_type: str = "informal" # informal, bank, mfi, friend_family, supplier
    principal_amount: float = Field(..., gt=0)
    current_balance: float = Field(..., ge=0)
    interest_rate_apr: Optional[float] = None
    monthly_payment: Optional[float] = None
    start_date: date
    due_date: Optional[date] = None
    notes: Optional[str] = None

class DebtResponse(BaseModel):
    id: str
    business_id: str
    user_id: str
    lender_name: str
    lender_type: str
    principal_amount: float
    current_balance: float
    interest_rate_apr: Optional[float] = None
    monthly_payment: Optional[float] = None
    start_date: date
    due_date: Optional[date] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# ----------------- AI ADVISOR -----------------
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: Optional[str] = None

class ActionItem(BaseModel):
    title: str
    description: str
    impact: str # High, Medium, Low
    category: str # Cash Flow, Inventory, Scheme, Pricing

class SourceReference(BaseModel):
    title: str
    url: Optional[str] = None
    verification_date: Optional[str] = None
    source_type: str # Government Scheme, Verified Business Principle, User Financial Records

class ChatResponse(BaseModel):
    conversation_id: str
    message: str
    sources: List[SourceReference] = []
    suggested_actions: List[ActionItem] = []
    is_fallback_mode: bool = False
    disclaimer: str

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    sources: List[SourceReference] = []
    suggested_actions: List[ActionItem] = []
    created_at: datetime
    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []
    class Config:
        from_attributes = True

# ----------------- SCHEMES -----------------
class SchemeResponse(BaseModel):
    id: str
    scheme_name: str
    issuing_authority: str
    intended_beneficiaries: str
    business_categories: str
    official_url: str
    eligibility_conditions: str
    required_documents: str
    application_procedure: str
    max_loan_subsidy_info: Optional[str] = None
    last_verified_date: date
    class Config:
        from_attributes = True

class SchemeEligibilityRequest(BaseModel):
    business_category: str
    business_type: str
    annual_turnover: float
    experience_years: float
    has_udyam_registration: bool = False
    gender: Optional[str] = "All"
    social_category: Optional[str] = "General" # General, OBC, SC, ST, Minority

class SchemeEligibilityMatch(BaseModel):
    scheme_id: str
    scheme_name: str
    issuing_authority: str
    official_url: str
    status: str # Potentially relevant, More information required, Appears unlikely based on provided information
    relevance_reasons: List[str]
    missing_criteria_or_next_steps: List[str]
    max_benefit: Optional[str] = None

class SchemeEligibilityResponse(BaseModel):
    matches: List[SchemeEligibilityMatch]
    disclaimer: str

# ----------------- MARKET -----------------
class MarketObservationCreate(BaseModel):
    state: str
    district: str
    city_village: str
    locality: str
    category: str
    competitor_name: Optional[str] = None
    observed_product: str
    observed_price: Optional[float] = None
    supplier_name: Optional[str] = None
    supplier_details: Optional[str] = None
    customer_segment_notes: Optional[str] = None
    notes: Optional[str] = None

class MarketObservationResponse(BaseModel):
    id: str
    user_id: str
    business_id: str
    state: str
    district: str
    city_village: str
    locality: str
    category: str
    competitor_name: Optional[str] = None
    observed_product: str
    observed_price: Optional[float] = None
    supplier_name: Optional[str] = None
    supplier_details: Optional[str] = None
    customer_segment_notes: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class MarketInsightsResponse(BaseModel):
    locality: str
    district: str
    state: str
    category: str
    overview: str
    potential_customer_segments: List[str]
    competitor_observations: List[str]
    supplier_discovery_tips: List[str]
    product_demand_hypotheses: List[str]
    seasonal_opportunities: List[str]
    business_risks: List[str]
    suggested_actions: List[str]
    data_source_label: str # Illustrative Local Survey & Verified Rural Business Telemetry

# ----------------- DOCUMENTS -----------------
class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_size: int
    mime_type: str
    category: str
    linked_transaction_id: Optional[str] = None
    notes: Optional[str] = None
    download_url: str
    created_at: datetime
    class Config:
        from_attributes = True

# ----------------- BUSINESS PLAN -----------------
class BusinessPlanSection(BaseModel):
    section_number: int
    title: str
    content: str
    key_metrics: Optional[Dict[str, Any]] = None

class BusinessPlanData(BaseModel):
    business_name: str
    entrepreneur_name: str
    locality: str
    date_generated: str
    sections: List[BusinessPlanSection]

class BusinessPlanCreate(BaseModel):
    title: str = "GramVikas 3-Year Micro-Enterprise Growth Plan"
    target_funding_inr: float = 50000.0
    expansion_vision: str = "Expand inventory, purchase modern display rack, and obtain working capital line."

class BusinessPlanResponse(BaseModel):
    id: str
    user_id: str
    business_id: str
    title: str
    plan_data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# ----------------- FESTIVAL CALENDAR -----------------
class FestivalEventCreate(BaseModel):
    name: str
    date: date
    region: str = "National"
    category: str
    suggested_preparation: str
    inventory_notes: Optional[str] = None

class FestivalEventResponse(BaseModel):
    id: str
    name: str
    date: date
    region: str
    category: str
    suggested_preparation: str
    inventory_notes: Optional[str] = None
    is_user_event: bool
    class Config:
        from_attributes = True

# ----------------- DASHBOARD SUMMARY -----------------
class MetricCard(BaseModel):
    label: str
    value: float
    formatted_value: str
    trend_percentage: Optional[float] = None
    is_positive: bool = True
    subtitle: Optional[str] = None

class DashboardSummaryResponse(BaseModel):
    user_name: str
    business_name: str
    locality: str
    today_sales: MetricCard
    today_expenses: MetricCard
    estimated_daily_profit: MetricCard
    month_revenue: MetricCard
    month_expenses: MetricCard
    month_net_profit: MetricCard
    outstanding_debt: MetricCard
    inventory_value: MetricCard
    recent_transactions: List[TransactionResponse]
    low_stock_alerts: List[ProductResponse]
    upcoming_festivals: List[FestivalEventResponse]
    health_score: int
    quick_tips: List[str]
