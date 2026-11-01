export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  preferred_language: string;
  district: string;
  state: string;
  pin_code?: string;
  preferred_currency: string;
  phone_number?: string;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_category: string;
  business_type: string;
  experience_years: number;
  locality?: string;
  market_area?: string;
  num_employees: number;
  operating_days: string;
  main_products?: string;
  avg_daily_sales: number;
  avg_daily_expenses: number;
  inventory_investment: number;
  outstanding_debt: number;
  working_capital: number;
  supplier_terms?: string;
  business_goals?: string;
  created_at: string;
  updated_at: string;
}

export type TransactionType =
  | 'sale'
  | 'operating_expense'
  | 'inventory_purchase'
  | 'supplier_payment'
  | 'customer_payment_received'
  | 'debt_received'
  | 'debt_repayment'
  | 'other_adjustment';

export interface Transaction {
  id: string;
  business_id: string;
  user_id: string;
  transaction_type: TransactionType;
  amount: number;
  date: string;
  category: string;
  description: string;
  payment_method: string;
  counterparty?: string;
  receipt_doc_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
  total_income: number;
  total_expense: number;
}

export interface MetricCard {
  label: string;
  value: number;
  formatted_value: string;
  trend_percentage?: number;
  is_positive: boolean;
  subtitle?: string;
}

export interface Product {
  id: string;
  business_id: string;
  user_id: string;
  name: string;
  sku?: string;
  category: string;
  purchase_cost: number;
  selling_price: number;
  current_stock: number;
  min_stock_threshold: number;
  supplier_details?: string;
  is_archived: boolean;
  estimated_gross_margin_pct?: number;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  business_id: string;
  movement_type: string;
  quantity: number;
  unit_cost?: number;
  notes?: string;
  created_at: string;
}

export interface FestivalEvent {
  id: string;
  name: string;
  date: string;
  region: string;
  category: string;
  suggested_preparation: string;
  inventory_notes?: string;
  is_user_event: boolean;
}

export interface DashboardSummary {
  user_name: string;
  business_name: string;
  locality: string;
  today_sales: MetricCard;
  today_expenses: MetricCard;
  estimated_daily_profit: MetricCard;
  month_revenue: MetricCard;
  month_expenses: MetricCard;
  month_net_profit: MetricCard;
  outstanding_debt: MetricCard;
  inventory_value: MetricCard;
  recent_transactions: Transaction[];
  low_stock_alerts: Product[];
  upcoming_festivals: FestivalEvent[];
  health_score: number;
  quick_tips: string[];
}

export interface FinancialSummary {
  currency: string;
  currency_symbol: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  total_revenue: number;
  operating_expenses: number;
  cogs: number;
  gross_profit: number;
  net_profit: number;
  net_profit_margin_pct: number;
  cash_inflows: number;
  cash_outflows: number;
  net_cash_flow: number;
  outstanding_receivables: number;
  outstanding_payables: number;
  total_debt_outstanding: number;
  inventory_valuation: number;
  break_even_monthly_revenue?: number;
  daily_break_even_sales?: number;
  burn_rate_daily: number;
  working_capital_runway_days?: number;
  financial_health_score: number;
  financial_health_status: string;
  key_recommendations: string[];
}

export interface ActionItem {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  category: string;
}

export interface SourceReference {
  title: string;
  url?: string;
  verification_date?: string;
  source_type: string;
}

export interface ChatMessage {
  id?: string;
  sender: 'user' | 'assistant';
  content: string;
  sources?: SourceReference[];
  suggested_actions?: ActionItem[];
  created_at?: string;
}

export interface Scheme {
  id: string;
  scheme_name: string;
  issuing_authority: string;
  intended_beneficiaries: string;
  business_categories: string;
  official_url: string;
  eligibility_conditions: string;
  required_documents: string;
  application_procedure: string;
  max_loan_subsidy_info?: string;
  last_verified_date: string;
}

export interface SchemeEligibilityMatch {
  scheme_id: string;
  scheme_name: string;
  issuing_authority: string;
  official_url: string;
  status: string;
  relevance_reasons: string[];
  missing_criteria_or_next_steps: string[];
  max_benefit?: string;
}

export interface MarketObservation {
  id: string;
  user_id: string;
  business_id: string;
  state: string;
  district: string;
  city_village: string;
  locality: string;
  category: string;
  competitor_name?: string;
  observed_product: string;
  observed_price?: number;
  supplier_name?: string;
  supplier_details?: string;
  customer_segment_notes?: string;
  notes?: string;
  created_at: string;
}

export interface MarketInsights {
  locality: string;
  district: string;
  state: string;
  category: string;
  overview: string;
  potential_customer_segments: string[];
  competitor_observations: string[];
  supplier_discovery_tips: string[];
  product_demand_hypotheses: string[];
  seasonal_opportunities: string[];
  business_risks: string[];
  suggested_actions: string[];
  data_source_label: string;
}

export interface VaultDocument {
  id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  category: string;
  linked_transaction_id?: string;
  notes?: string;
  download_url: string;
  created_at: string;
}

export interface BusinessPlanSection {
  section_number: number;
  title: string;
  content: string;
  key_metrics?: Record<string, any>;
}

export interface BusinessPlan {
  id: string;
  user_id: string;
  business_id: string;
  title: string;
  plan_data: {
    business_name: string;
    entrepreneur_name: string;
    locality: string;
    date_generated: string;
    target_funding_inr: number;
    sections: BusinessPlanSection[];
  };
  created_at: string;
  updated_at: string;
}
