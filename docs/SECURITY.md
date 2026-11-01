# GramVikas AI — Security & Privacy Architecture

---

## 1. Authentication & Session Management
- **Passwords**: Hashed with bcrypt using 12 salt rounds. Plaintext passwords are never stored or logged.
- **Tokens**: Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 (`HS256`).
- **Session Expiry**: Default 7-day expiration with automatic 401 client interception and redirection.

## 2. Server-Side Authorization & User Data Isolation
- Every query accessing user-owned resources (`transactions`, `products`, `debts`, `documents`, `conversations`, `business_plans`) enforces foreign key constraints on `business_id` and `user_id`.
- Verified in automated tests: User B cannot retrieve, update, or delete User A's transactions or files.

## 3. Financial Calculation Integrity
- Client-side data is never trusted for financial summaries or health scores.
- Double-entry principles: Loan borrowings are tracked as cash inflows on the cash flow statement, never as business sales revenue.
- COGS and operating expenses are separated so margins accurately reflect unit economics.

## 4. Digital Vault File Safety
- Enforces strict MIME type whitelisting (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`).
- Enforces a 10MB maximum file size limit.
- Files are saved with randomly generated UUID filenames to prevent path traversal (`../`) and file overwrite attacks.
- Downloads are routed through authenticated endpoints (`/api/v1/documents/{id}/download`).

## 5. AI Advisor Boundaries & Safe Prompts
- User records are injected strictly within authorized session context.
- System prompt instructs the model never to guarantee loan approvals, subsidies, or speculative profits.
- Model references official government portals for all scheme criteria.
- When external LLM APIs are unreachable or unconfigured, the system transparently indicates fallback mode and runs deterministic rules.
