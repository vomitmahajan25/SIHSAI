# GramVikas AI (ग्रामविकास AI)
### AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant for Rural Micro-Entrepreneurs

**Smart India Hackathon 2026**  
**Problem Statement ID:** PS 10091  
**Project Category:** Software  
**Project Theme:** AI Financial Advisor  
**Team Name:** 6-ByTES  
**Team ID:** 178837  
**Tagline:** *Your Business. Your Growth.*

---

## 🌾 Project Vision & Problem Solved

Rural micro-entrepreneurs — including kirana shopkeepers, street vendors, small artisans, women-led home enterprises, and village service providers — represent the backbone of India's grassroots economy. Yet they face severe systemic hurdles:

1. **The Informal Moneylender Debt Trap**: Micro-vendors frequently borrow from local moneylenders at extortionate rates (5% to 10% per month / 60% to 120% APR), wiping out hard-earned profits.
2. **Absence of Digitized Bookkeeping**: Relying on loose paper notes leads to uncollected customer credit (*udhaari*), untracked shrinkage, and zero documented financial track record.
3. **Misconceptions Around Government Schemes**: Flagship central programmes like PM SVANidhi, PMMY MUDRA, and PM Vishwakarma remain underutilized due to confusing eligibility criteria and fear of paperwork.
4. **Supply Chain Fragility & Overstocking**: Inability to forecast festival demand (Diwali, Eid, seasonal harvests) results in either stockouts or expensive unsold inventory.

**GramVikas AI** solves this by providing a unified, accessible, mobile-first business co-pilot tailored to the Indian rural context. It combines strict accounting-grade financial calculations, verified government scheme matching, hyper-local market observations, and an intelligent AI business advisor.

---

## 🎨 Visual Design System

GramVikas AI features a welcoming, trustworthy Indian rural-business identity:

- **Primary Forest Green (`#102B25`)**: Main brand tone, desktop navigation, primary buttons.
- **Secondary Sage Green (`#287A50`)**: Action accents, positive financial indicators.
- **Fresh Lime Accent (`#D8F3A5`)**: Growth highlights, health score badges.
- **Main Canvas (`#F6F8F2`)**: Calming, high-contrast, clean backdrop.
- **Card Surface (`#FFFFFF`)**: Crisp, accessible cards with generous spacing.
- **Typography**: Inter sans-serif optimized for mobile and rural digital literacy.
- **Currency & Formats**: Indian Rupee (₹) formatting with Lakhs & Crores, Indian date formatting.

---

## 🚀 Key Modules & Implemented Features

1. **Intake & Entrepreneur Profiling**:
   - 3-step onboarding wizard collecting personal, business format, and initial financial baseline.
   - Profile completeness scoring and persistent database synchronization.

2. **Khata Book / Digital Bookkeeping**:
   - Record sales, operating expenses, inventory purchases, supplier payments, customer credit, and debt repayments.
   - Filtering by date range and category, search by counterparty/description.
   - One-click CSV export of transaction logs.

3. **Financial Health & Calculation Engine**:
   - Server-side Python calculation of Revenue, COGS, Gross Profit, Net Profit, and Net Margins.
   - Strict separation of Cash Flow vs Profit (loan disbursements do not artificially inflate revenue).
   - Break-Even Analysis: Calculates monthly turnover and daily sales required to cover fixed overheads.
   - Composite Financial Health Score (0-100) with status labels (*Strong, Healthy, Vulnerable, High Risk*).
   - Server-side certified PDF generation with ReportLab.

4. **AI Business Advisor (Chat Interface)**:
   - Personalized assistant connected to Google Gemini API (`gemini-1.5-flash`).
   - Injects user profile, locality, and confirmed monthly performance figures into system context.
   - **Deterministic Fallback Engine**: If external LLM API key is absent or unreachable, seamlessly engages a verified rules engine with transparent labeling.
   - Returns structured action items (High/Medium impact) and verified official portal references.

5. **Government Schemes & Institutional Financing**:
   - Searchable catalog of 7 verified central programmes:
     - **PM SVANidhi** (₹10k, ₹20k, ₹50k with 7% interest subsidy for street vendors).
     - **PMMY MUDRA** (Shishu, Kishore, Tarun collateral-free loans up to ₹10-20 Lakh).
     - **PM Vishwakarma** (₹15,000 toolkit grant + 5% loan for 18 artisan trades).
     - **PMEGP** (15% to 35% margin money capital subsidy for new micro-units).
     - **Stand-Up India** (₹10 Lakh to ₹1 Crore for women & SC/ST entrepreneurs).
     - **Udyam Registration** (Free official MSME certification).
   - Interactive guided eligibility questionnaire with clear disclaimers.

6. **Inventory & Stock Management**:
   - SKU, purchase cost, selling price, and gross margin percentage per item.
   - Stock movement logger (*received, sold, damaged, returned*).
   - Transaction safety that prevents negative inventory deductions.
   - Automatic low-stock visual alerts before items run out.

7. **Digital Vault (दस्तावेज़ तिजोरी)**:
   - Secure private storage for receipts, trade licenses, and identity documents.
   - MIME-type validation, 10MB size limits, and authenticated file streaming.

8. **Festival Calendar & Seasonal Demand Advisory**:
   - Verified national & regional festive dates (Diwali, Eid, Ganesh Chaturthi, Makar Sankranti, Rakhi, Holi).
   - Actionable stock procurement advice and custom event/haat day reminders.

9. **12-Section Micro-Enterprise Business Plan**:
   - Synthesizes bank-ready 3-year expansion proposals.
   - Executive summary, target market, capex budget, forecast, and 30-60-90 day roadmap.
   - Server-side PDF export ready to present to bank loan officers.

10. **Reports & Exports Hub**:
    - Certified Profit & Loss and Cash Flow statements.
    - Transaction history CSV and formal PDF exports.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Python 3.12+, FastAPI (ASGI), Pydantic v2, SQLAlchemy 2.x, Alembic, ReportLab, HTTPX |
| **Database** | PostgreSQL (Supabase / Render) for Production, SQLite with Foreign Keys for Local Dev |
| **AI / LLM** | Google Gemini API (`gemini-1.5-flash`) + Built-in Deterministic Rules Fallback Engine |
| **Testing** | Pytest, Pytest-Asyncio (100% pass on calculations, stock safety, and isolation) |

---

## ⚡ Quick Start (Local Development)

### 1. Clone Repository & Setup Backend
```bash
# In first terminal:
cd backend
python -m venv .venv

# Activate venv:
# Windows: .\.venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run automated test suite
pytest -v

# Start FastAPI server on port 8000
uvicorn app.main:app --reload --port 8000
```
- Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Start Frontend
```bash
# In second terminal:
cd frontend
npm install
npm run dev
```
- Application Web Interface: [http://localhost:3000](http://localhost:3000)

### 3. Demo Credentials (For Hackathon Judges)
- **Email:** `direct@gramvikas.in`
- **Password:** `Password123!`
*(Or click "Fill Verified Demo Credentials" on the login screen).*

---

## 🧪 Automated Testing & Verification

Automated test suite (`backend/tests/`) covers:
1. `test_financial_calculations`: Verifies Revenue, COGS, Gross Profit, Net Margin %, and Cash Flow distinction (confirming loan borrowings are not double-counted as sales revenue).
2. `test_user_registration_and_login`: Verifies bcrypt hashing, JWT issuance, and duplicate email prevention.
3. `test_onboarding_and_transaction_isolation`: Verifies that User B cannot access User A's transactions or business records.
4. `test_inventory_negative_stock_prevention`: Verifies transaction safety preventing negative stock.
5. `test_scheme_eligibility`: Verifies automated guided matching for PM SVANidhi and PM Vishwakarma.

All tests execute and pass cleanly:
```bash
======================= 5 passed in 3.68s =======================
```

---

## 📂 Project Structure

```
gramvikas-ai/
  frontend/
    app/
      (auth)/login, register, onboarding
      (dashboard)/overview, my-business, khata-book, financial-health,
                  advisor, market, schemes, inventory, vault, festivals,
                  business-plan, reports, settings
      layout.tsx, page.tsx, globals.css
    components/
      ui/ (Sidebar, Header, StatCard, Modal, Alert)
      charts/ (RevenueExpenseChart)
    lib/ (api.ts, auth.ts, formatters.ts)
    types/ (index.ts)
    package.json, tsconfig.json, tailwind.config.js
  backend/
    app/
      api/ (deps.py, v1/auth, profiles, businesses, transactions, finances,
                        inventory, advisor, market, schemes, documents,
                        business_plans, festivals, dashboard)
      core/ (config.py, database.py, security.py)
      models/ (entities.py)
      schemas/ (all_schemas.py)
      services/ (financial_engine.py, ai_advisor.py, scheme_service.py,
                 inventory_service.py, market_service.py, pdf_service.py,
                 festival_service.py, business_plan_service.py)
      main.py
    tests/ (test_financial_engine.py, test_api_and_isolation.py)
    alembic/ (env.py, versions/)
    requirements.txt, alembic.ini, .env.example
  docs/
    ARCHITECTURE.md
    SETUP.md
    API.md
    DEPLOYMENT.md
    SECURITY.md
  README.md
  .gitignore
```

---

## 🏆 Smart India Hackathon 2026 Details
- **Problem Statement ID:** PS 10091
- **Team Name:** 6-ByTES
- **Team ID:** 178837
- **Project Name:** GramVikas AI
- **Tagline:** Your Business. Your Growth.
