# GramVikas AI — Local Setup Guide

Follow this guide to run the full application locally.

---

## 1. Prerequisites

- **Node.js**: v18.17+ (v20+ recommended)
- **Python**: v3.11+ (Python 3.12+ supported)
- **Git**

---

## 2. Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv .venv
   .\.venv\Scripts\activate

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   # Copy example template
   cp .env.example .env
   ```
   *By default, `DATABASE_URL=sqlite:///./gramvikas.db` is configured for zero-setup local development.*
   *(Optional) If you have a Google AI Studio key, set `GEMINI_API_KEY=your_key`. Otherwise, the backend automatically runs in verified deterministic fallback mode.*

5. Run automated tests to verify your environment:
   ```bash
   pytest -v
   ```

6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - OpenAPI Swagger documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Health check endpoint: [http://localhost:8000/health](http://localhost:8000/health)

---

## 3. Frontend Setup (Next.js)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Ensure environment variables are set:
   ```bash
   cp .env.example .env.local
   ```
   *Points `NEXT_PUBLIC_API_BASE_URL` to `http://localhost:8000/api/v1`.*

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 4. Quick-Start Demo User

You can immediately sign in or test using the pre-seeded demo credentials:
- **Email:** `direct@gramvikas.in`
- **Password:** `Password123!`
*(Or click the "Fill Verified Demo Credentials" button on the login screen).*
