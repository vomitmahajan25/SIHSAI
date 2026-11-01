# GramVikas AI — REST API Documentation

Base URL: `/api/v1`

---

## 1. Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register new user & profile | No |
| `POST` | `/auth/login` | Authenticate user & receive JWT token | No |
| `GET` | `/auth/me` | Retrieve active authenticated session | Yes (Bearer) |

---

## 2. Profile & Onboarding (`/profile`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/profile` | Get current user's profile | Yes |
| `PUT` | `/profile` | Update personal profile attributes | Yes |
| `POST` | `/profile/onboarding` | 3-step onboarding saving personal, business, and financial baseline atomically | Yes |

---

## 3. Business Management (`/business`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/business` | Get current business details | Yes |
| `POST` | `/business` | Create initial business profile | Yes |
| `PUT` | `/business` | Update business attributes & assumptions | Yes |

---

## 4. Khata Book / Bookkeeping (`/transactions`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/transactions` | List paginated transactions with filters (`start_date`, `end_date`, `category`, `transaction_type`, `search`) | Yes |
| `POST` | `/transactions` | Record new transaction (sale, expense, purchase, loan, repayment) | Yes |
| `GET` | `/transactions/{id}` | Get transaction details | Yes |
| `PATCH` | `/transactions/{id}` | Edit transaction | Yes |
| `DELETE` | `/transactions/{id}` | Delete transaction | Yes |
| `GET` | `/transactions/export/csv` | Download filtered transaction records as CSV | Yes |

---

## 5. Financial Health Engine (`/finance`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/finance/summary` | Complete calculation response (Revenue, COGS, Net Margin, Runway, Health Score) | Yes |
| `GET` | `/finance/cash-flow` | Breakdown of cash inflows vs cash outflows | Yes |
| `GET` | `/finance/profit-loss` | Formal Profit & Loss statement breakdown | Yes |
| `GET` | `/finance/break-even` | Monthly break-even turnover & daily sales required | Yes |
| `GET` | `/finance/trend` | 6-month historical trend for Recharts visualization | Yes |
| `GET` | `/finance/export/pdf` | Generate and download certified PDF financial health statement | Yes |

---

## 6. Inventory Management (`/inventory`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/inventory` | List all active products with stock levels, margins, and low-stock warnings | Yes |
| `POST` | `/inventory` | Create new product | Yes |
| `PATCH` | `/inventory/{id}` | Update product pricing or threshold | Yes |
| `DELETE` | `/inventory/{id}` | Archive product | Yes |
| `POST` | `/inventory/{id}/movements` | Record stock received, sold, or damaged (prevents negative inventory) | Yes |
| `GET` | `/inventory/{id}/movements` | Stock movement history log | Yes |

---

## 7. AI Business Advisor (`/advisor`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/advisor/chat` | Send question to AI advisor; returns contextual answer, structured action items, verified references, and fallback mode flag | Yes |
| `GET` | `/advisor/conversations` | List user conversation threads | Yes |
| `GET` | `/advisor/conversations/{id}` | Fetch message history of specific thread | Yes |

---

## 8. Government Schemes & Loans (`/schemes`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/schemes` | List verified central & state government programmes | No |
| `GET` | `/schemes/{id}` | Get scheme detail, documents required, and official portal URL | No |
| `POST` | `/schemes/eligibility-check` | Guided questionnaire returning preliminary relevance match | No |

---

## 9. Digital Vault (`/documents`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/documents` | List user's encrypted documents & receipts | Yes |
| `POST` | `/documents/upload` | Secure multipart file upload with MIME type and size checks | Yes |
| `GET` | `/documents/{id}/download` | Stream authorized file download | Yes |
| `DELETE` | `/documents/{id}` | Delete document file and metadata | Yes |

---

## 10. Business Plan Generator (`/business-plans`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/business-plans` | List saved business plans | Yes |
| `POST` | `/business-plans` | Synthesize bank-ready 12-section business plan | Yes |
| `GET` | `/business-plans/{id}` | View 12-section business plan details | Yes |
| `GET` | `/business-plans/{id}/pdf` | Download formal PDF business plan | Yes |

---

## 11. Festival Calendar (`/festivals`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/festivals` | List national and regional festivals with business preparation advice | Yes |
| `POST` | `/festivals` | Add custom business event / local haat reminder | Yes |

---

## 12. Dashboard (`/dashboard`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/dashboard/summary` | Aggregated dashboard KPI payload (today's sales/expenses/profit, month's totals, health score, low stock, festivals) | Yes |
