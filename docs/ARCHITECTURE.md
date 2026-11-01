# GramVikas AI — System Architecture

**Project Statement ID:** PS 10091  
**Project Category:** Software  
**Theme:** AI Financial Advisor  
**Team:** 6-ByTES (Team ID: 178837)  
**Tagline:** Your Business. Your Growth.

---

## 1. Architectural Overview

GramVikas AI is architected as an accessible, high-performance full-stack web application tailored for rural micro-entrepreneurs, street vendors, kirana shop owners, and small artisans across India.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|                                                                                   |
|  Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS + Recharts       |
|  - Mobile-First Layout (Responsive to 360px viewport)                             |
|  - Multilingual Architecture (English, Hindi, Marathi)                            |
|  - Low-Bandwidth Optimizations (87.4 kB base bundle, SVG graphs, SVG icons)       |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / JSON REST API
                                           v
+-----------------------------------------------------------------------------------+
|                                 BACKEND API LAYER                                 |
|                                                                                   |
|  FastAPI (ASGI) on Python 3.12+                                                   |
|  - Bearer JWT Security Middleware & Route Guards                                  |
|  - Pydantic v2 Request & Response Validation Schemas                              |
|  - High-precision Decimal Monetary Operations                                     |
+--------------------+---------------------+--------------------+-------------------+
                     |                     |                    |
                     v                     v                    v
+--------------------+---+   +-------------+----+   +-----------+-------------------+
| FINANCIAL ENGINE       |   | AI ADVISOR ENGINE|   | SCHEME & MARKET ENGINE        |
| - Double-entry logic   |   | - Gemini API     |   | - 7 Verified Central Schemes  |
| - Net profit & margins |   | - Deterministic  |   | - Eligibility Questionnaire   |
| - Cash flow separation |   |   Rule Fallback  |   | - Hyper-Local Observations    |
| - Break-even analysis  |   | - Context Injection| - Festival Season Calendars     |
+--------------------+---+   +-------------+----+   +-----------+-------------------+
                     |                     |                    |
                     +---------------------+--------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                                PERSISTENCE LAYER                                  |
|                                                                                   |
|  SQLAlchemy 2.x ORM + Alembic Database Migrations                                 |
|  - PostgreSQL / Supabase in Production with Row-Level Security                    |
|  - SQLite (with PRAGMA foreign_keys=ON) for Zero-Setup Local Development          |
|  - Encrypted Digital Vault File Storage with Short-Lived Signed URLs              |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Service Components

### 2.1 Financial Calculation Engine (`financial_engine.py`)
- **Revenue**: Sum of confirmed recorded sales (`sale`, `customer_payment_received`).
- **COGS**: Cost of Goods Sold derived from inventory purchases.
- **Operating Expenses**: Segregated from capital and loan repayments (rent, utilities, logistics, labor).
- **Gross Profit**: $\text{Revenue} - \text{COGS}$.
- **Net Profit**: $\text{Revenue} - (\text{Operating Expenses} + \text{COGS})$.
- **Cash Flow vs. Profit**:
  - Inflows: Cash Sales + Customer Payments + Debt Received.
  - Outflows: Operating Expenses + Inventory Purchases + Supplier Payments + Debt Repayments.
  - $\text{Net Cash Flow} = \text{Inflows} - \text{Outflows}$.
- **Break-Even Point**:
  $$\text{Break-Even Monthly Sales} = \frac{\text{Fixed Operating Costs}}{\text{Contribution Margin Ratio}}$$
- **Burn Rate & Runway**: Tracks days of operational runway based on available liquid working capital.

### 2.2 AI Advisor Engine (`ai_advisor.py`)
- **Provider Abstraction**: Interacts with Google Gemini (`gemini-1.5-flash`).
- **Automatic Fallback Mode**: If external LLM API key is absent or unreachable, seamlessly engages the deterministic rural business rules engine.
- **Personalized Context Injection**: Injects authenticated entrepreneur profile, locality, and confirmed monthly performance figures into prompt context without exposing one user's data to another.
- **Safety Boundaries**: Strictly disclaims guarantees on loan sanctions or speculative business growth.

### 2.3 Verified Scheme Discovery (`scheme_service.py`)
- Curated catalog of verified programmes (PM SVANidhi, PMMY MUDRA Shishu/Kishore/Tarun, PM Vishwakarma, PMEGP, Stand-Up India, Udyam Registration).
- Guided questionnaire assessing turnover, sector, gender, and social category with preliminary eligibility indicators.

### 2.4 Document & Vault Service (`documents.py` & `pdf_service.py`)
- Secure private object storage with MIME type checking, size enforcement (10MB limit), and authenticated download endpoints.
- Server-side PDF generation using ReportLab for 12-section business plans and financial health statements.
