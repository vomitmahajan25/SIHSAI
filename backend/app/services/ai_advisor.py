import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.entities import User, Profile, Business, Conversation, ChatMessage
from app.services.financial_engine import FinancialEngine
from app.services.scheme_service import SchemeService
from app.schemas.all_schemas import ActionItem, SourceReference

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_TEMPLATE = """
You are GramVikas AI — an expert, practical, empathetic hyper-local business advisory assistant designed specifically for Indian rural and semi-urban micro-entrepreneurs, kirana shop owners, street vendors, artisans, and small traders.

Your personality:
- Respectful, encouraging, culturally aware, and crystal clear.
- Avoid heavy financial jargon; explain terms like "Gross Margin", "Working Capital", or "Cash Flow" using everyday Indian business metaphors (e.g. "Galla / Cash Drawer", "Khata", "Mal khareedi").
- Always use Indian currency (₹) and numbering format (Lakhs, Crores).

Context regarding this entrepreneur:
- Entrepreneur Name: {user_name}
- Business Name: {business_name}
- Business Category: {business_category}
- Business Type: {business_type}
- Locality / Market Area: {locality}, {district}, {state}
- Reported Working Capital: ₹{working_capital:,.2f}
- Outstanding Recorded Debt: ₹{outstanding_debt:,.2f}

Current Financial Performance Snapshot (from confirmed backend records):
- Current Month Revenue: ₹{month_revenue:,.2f}
- Current Month Expenses: ₹{month_expenses:,.2f}
- Net Profit: ₹{net_profit:,.2f}
- Net Profit Margin: {net_margin_pct:.1f}%
- Net Cash Flow: ₹{net_cash_flow:,.2f}
- Estimated Inventory Value: ₹{inventory_value:,.2f}

Critical Ground Rules:
1. NEVER guarantee loan approvals, profit increases, or government subsidies.
2. For government schemes, reference official portals (such as PM SVANidhi, PMMY MUDRA, PM Vishwakarma, JanSamarth).
3. Warn against predatory high-interest moneylenders (who often charge 5-10% monthly / 60-120% APR) and suggest formal bank micro-loans.
4. Keep advice concise, practical, and broken into clear steps that can be taken today or this week.
5. If recommending a legal, tax, or formal registration step, advise consulting a local bank branch manager, Common Service Centre (CSC) VLE, or Chartered Accountant.
"""

class AIAdvisorService:
    @staticmethod
    def get_or_create_conversation(db: Session, user_id: str, conversation_id: Optional[str] = None) -> Conversation:
        if conversation_id:
            conv = db.query(Conversation).filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            ).first()
            if conv:
                return conv
        
        # Create a new conversation
        new_conv = Conversation(
            user_id=user_id,
            title="GramVikas Business Advisory"
        )
        db.add(new_conv)
        db.commit()
        db.refresh(new_conv)
        return new_conv

    @staticmethod
    def _build_context(db: Session, user_id: str) -> Dict[str, Any]:
        user = db.query(User).filter(User.id == user_id).first()
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        biz = db.query(Business).filter(Business.user_id == user_id).first()
        
        user_name = profile.full_name if profile else "Entrepreneur"
        business_name = biz.business_name if biz else "My Business"
        business_category = biz.business_category if biz else "Retail / Kirana"
        business_type = biz.business_type if biz else "Shop"
        locality = biz.locality if biz and biz.locality else (profile.district if profile else "Local Market")
        district = profile.district if profile else "District"
        state = profile.state if profile else "State"
        working_capital = float(biz.working_capital) if biz and biz.working_capital else 0.0
        outstanding_debt = float(biz.outstanding_debt) if biz and biz.outstanding_debt else 0.0

        fin_summary = {}
        if biz:
            fin_summary = FinancialEngine.calculate_summary(db, biz.id)

        return {
            "user_name": user_name,
            "business_name": business_name,
            "business_category": business_category,
            "business_type": business_type,
            "locality": locality,
            "district": district,
            "state": state,
            "working_capital": working_capital,
            "outstanding_debt": outstanding_debt,
            "month_revenue": fin_summary.get("total_revenue", 0.0),
            "month_expenses": fin_summary.get("operating_expenses", 0.0) + fin_summary.get("cogs", 0.0),
            "net_profit": fin_summary.get("net_profit", 0.0),
            "net_margin_pct": fin_summary.get("net_profit_margin_pct", 0.0),
            "net_cash_flow": fin_summary.get("net_cash_flow", 0.0),
            "inventory_value": fin_summary.get("inventory_valuation", 0.0),
        }

    @staticmethod
    def _generate_fallback_response(user_query: str, ctx: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deterministic, rule-based expert rural advisory fallback
        when external LLM API key is missing or service is offline.
        """
        q = user_query.lower()
        biz_name = ctx["business_name"]
        rev = ctx["month_revenue"]
        profit = ctx["net_profit"]
        margin = ctx["net_margin_pct"]
        cf = ctx["net_cash_flow"]
        debt = ctx["outstanding_debt"]

        sources = [
            SourceReference(
                title="GramVikas Bookkeeping & Financial Records",
                url=None,
                verification_date="Today",
                source_type="User Verified Records"
            )
        ]
        actions = []

        if "profit" in q or "margin" in q or "kamai" in q or "munafa" in q:
            msg = (
                f"Based on your recorded Khata entries for {biz_name}:\n\n"
                f"• Recorded Revenue this month: ₹{rev:,.2f}\n"
                f"• Net Profit after expenses: ₹{profit:,.2f}\n"
                f"• Net Profit Margin: {margin:.1f}%\n\n"
                f"Interpretation: For every ₹100 of goods sold, you keep approximately ₹{margin:.1f} after paying for stock and daily costs. "
                f"To expand your net margin, focus on items that turnover quickly with minimal storage risk."
            )
            actions = [
                ActionItem(
                    title="Audit Slow-Moving Stock",
                    description="Identify items on your shelf for more than 30 days and avoid reordering until cleared.",
                    impact="Medium",
                    category="Inventory"
                ),
                ActionItem(
                    title="Negotiate 2% Cash Discount with Wholesaler",
                    description="Ask your main distributor for an upfront discount if paying with instant UPI rather than delayed credit.",
                    impact="High",
                    category="Pricing"
                )
            ]

        elif "loan" in q or "debt" in q or "scheme" in q or "karz" in q or "yojana" in q or "mudra" in q or "svanidhi" in q:
            msg = (
                f"When considering financing for {biz_name}:\n\n"
                f"1. **Never resort to informal moneylenders**: They charge 5% to 10% per month (60% to 120% per year), which rapidly drains all your daily profit into interest payments.\n"
                f"2. **PM SVANidhi**: If you operate street vending or cart sales, you can access an initial ₹10,000 collateral-free working capital loan with a 7% interest subsidy from the Central Government.\n"
                f"3. **PMMY MUDRA Shishu**: For micro shops, provides up to ₹50,000 with zero collateral and repayment over 3 to 5 years at normal bank rates (~9-12% APR).\n\n"
                f"Your current recorded outstanding debt is ₹{debt:,.2f}. Before taking any new loan, ensure your monthly net profit can comfortably cover the expected EMI."
            )
            sources.append(
                SourceReference(
                    title="Official Pradhan Mantri MUDRA Yojana Portal",
                    url="https://www.mudra.org.in/",
                    verification_date="2026-09-01",
                    source_type="Government Scheme"
                )
            )
            sources.append(
                SourceReference(
                    title="PM SVANidhi Portal (MoHUA)",
                    url="https://pmsvanidhi.mohua.gov.in/",
                    verification_date="2026-08-15",
                    source_type="Government Scheme"
                )
            )
            actions = [
                ActionItem(
                    title="Check JanSamarth Portal",
                    description="Visit jansamarth.in to check eligibility for MUDRA or SVANidhi directly through your bank.",
                    impact="High",
                    category="Scheme"
                ),
                ActionItem(
                    title="Calculate Monthly EMI Capacity",
                    description="Ensure total monthly debt repayments do not exceed 25% of your average net monthly profit.",
                    impact="High",
                    category="Cash Flow"
                )
            ]

        elif "expense" in q or "cost" in q or "kharch" in q or "reduce" in q:
            msg = (
                f"To optimize expenses for {biz_name}:\n\n"
                f"1. **Bulk purchase fast-moving staples**: Pool orders with neighboring shopkeepers to unlock wholesale tier pricing from mandi distributors.\n"
                f"2. **Curtail unrecorded credit ('Udhaari')**: Uncollected customer credit is the #1 cause of cash flow failure in rural businesses. Set a strict ₹500 cap per customer.\n"
                f"3. **Track electricity and transport**: Combine weekly restocking trips into a single shared logistics trip."
            )
            actions = [
                ActionItem(
                    title="Set a Credit Limit (Udhaar Cap)",
                    description="Restrict customer credit to 7 days maximum and send friendly reminder notices.",
                    impact="High",
                    category="Cash Flow"
                )
            ]

        elif "festival" in q or "season" in q or "diwali" in q or "eid" in q or "stock" in q:
            msg = (
                f"Festival and seasonal demand advisory for {ctx['locality']}:\n\n"
                f"1. **Pre-book stock 15-20 days early**: Wholesalers hike prices by 10-15% in the final 5 days before major festivals.\n"
                f"2. **Limit perishable overstocking**: Only increase stock of non-perishable goods (packaged sweets, decorative items, dry goods) by 40-50%.\n"
                f"3. **Keep cash reserves**: Maintain at least 15 days of operational buffer so you aren't forced into panic borrowing if post-festival sales cool down."
            )
            actions = [
                ActionItem(
                    title="Festival Pre-Stocking List",
                    description="Draft product requirements for the upcoming festive season and confirm delivery dates with suppliers.",
                    impact="High",
                    category="Inventory"
                )
            ]

        else:
            msg = (
                f"Hello {ctx['user_name']}! As your business advisor for {biz_name}:\n\n"
                f"• Current Monthly Revenue: ₹{rev:,.2f}\n"
                f"• Net Profit: ₹{profit:,.2f} ({margin:.1f}% margin)\n"
                f"• Cash Flow: ₹{cf:,.2f}\n\n"
                f"I can help you analyze your profit margins, prepare for seasonal festivals, choose eligible government micro-schemes (like MUDRA or PM SVANidhi), or plan safe inventory replenishment. "
                f"What specific area of your business would you like to review today?"
            )
            actions = [
                ActionItem(
                    title="Review Khata Book Entries",
                    description="Ensure all cash and UPI sales from today are recorded to keep your health score accurate.",
                    impact="Medium",
                    category="Cash Flow"
                ),
                ActionItem(
                    title="Explore Government Schemes",
                    description="Run a 2-minute scheme eligibility check in the Schemes tab.",
                    impact="High",
                    category="Scheme"
                )
            ]

        return {
            "message": msg,
            "sources": sources,
            "suggested_actions": actions,
            "is_fallback_mode": True,
            "disclaimer": "Advisory generated via GramVikas Deterministic Business Rules Engine. Fallback mode active (external AI LLM key not configured or unreachable). Figures are estimates based solely on your recorded entries; not official credit or legal advice."
        }

    @staticmethod
    async def get_advice(db: Session, user_id: str, message: str, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        conv = AIAdvisorService.get_or_create_conversation(db, user_id, conversation_id)
        ctx = AIAdvisorService._build_context(db, user_id)

        # 1. Store User Message
        user_msg = ChatMessage(
            conversation_id=conv.id,
            sender="user",
            content=message
        )
        db.add(user_msg)
        db.commit()

        # 2. Check if external Gemini API is configured
        api_key = settings.GEMINI_API_KEY.strip()
        assistant_text = ""
        is_fallback = False
        sources: List[SourceReference] = []
        actions: List[ActionItem] = []
        disclaimer = "GramVikas AI advisory is for informational guidance based on your business records. Not a guarantee of credit approval or financial return."

        if api_key:
            try:
                # Call Google Gemini API
                system_instruction = SYSTEM_PROMPT_TEMPLATE.format(**ctx)
                gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={api_key}"
                
                payload = {
                    "contents": [
                        {
                            "role": "user",
                            "parts": [
                                {"text": f"System Context:\n{system_instruction}\n\nUser Question:\n{message}"}
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.4,
                        "maxOutputTokens": 800,
                    }
                }

                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(gemini_url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            assistant_text = candidates[0]["content"]["parts"][0]["text"]
                            sources = [
                                SourceReference(
                                    title="Verified Rural Micro-Enterprise Intelligence & User Records",
                                    url=None,
                                    verification_date="Live",
                                    source_type="Personalized AI Advisory"
                                )
                            ]
                            actions = [
                                ActionItem(
                                    title="Take Immediate Action",
                                    description="Review the specific recommendations above with your daily sales log.",
                                    impact="High",
                                    category="Cash Flow"
                                )
                            ]
                    else:
                        logger.warning(f"Gemini API returned error {resp.status_code}: {resp.text}")
                        is_fallback = True
            except Exception as e:
                logger.error(f"Error calling Gemini API: {e}")
                is_fallback = True
        else:
            is_fallback = True

        if is_fallback or not assistant_text:
            fallback_res = AIAdvisorService._generate_fallback_response(message, ctx)
            assistant_text = fallback_res["message"]
            sources = fallback_res["sources"]
            actions = fallback_res["actions"]
            is_fallback = True
            disclaimer = fallback_res["disclaimer"]

        # 3. Store Assistant Message in DB
        assistant_msg = ChatMessage(
            conversation_id=conv.id,
            sender="assistant",
            content=assistant_text,
            sources_json=json.dumps([s.model_dump() for s in sources]),
            actions_json=json.dumps([a.model_dump() for a in actions])
        )
        db.add(assistant_msg)
        db.commit()

        return {
            "conversation_id": conv.id,
            "message": assistant_text,
            "sources": sources,
            "suggested_actions": actions,
            "is_fallback_mode": is_fallback,
            "disclaimer": disclaimer
        }
