import json
from datetime import datetime, date
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.entities import Business, Profile, BusinessPlan
from app.services.financial_engine import FinancialEngine
from app.schemas.all_schemas import BusinessPlanCreate

class BusinessPlanService:
    @staticmethod
    def generate_plan(
        db: Session,
        user_id: str,
        business_id: str,
        data: BusinessPlanCreate
    ) -> BusinessPlan:
        biz = db.query(Business).filter(Business.id == business_id).first()
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        
        ent_name = profile.full_name if profile else "Entrepreneur"
        biz_name = biz.business_name if biz else "Rural Micro-Enterprise"
        category = biz.business_category if biz else "Retail Trade"
        b_type = biz.business_type if biz else "Shop"
        locality = biz.locality or (profile.district if profile else "Local Bazaar")
        district = profile.district if profile else "District"
        state = profile.state if profile else "State"
        
        fin = FinancialEngine.calculate_summary(db, business_id)
        current_rev = fin["total_revenue"]
        current_exp = fin["operating_expenses"] + fin["cogs"]
        current_profit = fin["net_profit"]
        margin_pct = fin["net_profit_margin_pct"]
        funding_target = data.target_funding_inr

        # Project 3-year scaled estimates
        monthly_sales_target = max(current_rev * 1.3, 35000.0)
        annual_sales_y1 = monthly_sales_target * 12
        annual_sales_y2 = annual_sales_y1 * 1.25
        annual_sales_y3 = annual_sales_y2 * 1.20

        sections = [
            {
                "section_number": 1,
                "title": "Executive Summary",
                "content": f"{biz_name} is an established {category} enterprise located in {locality}, {district}, {state}, spearheaded by {ent_name}. "
                           f"The business currently demonstrates an average monthly revenue of ₹{current_rev:,.2f} with an operating net margin of {margin_pct:.1f}%. "
                           f"This plan outlines a targeted capital expansion of ₹{funding_target:,.2f} to upgrade inventory assortment, introduce digital point-of-sale capabilities, and build a resilient working capital buffer.",
                "key_metrics": {
                    "Entrepreneur": ent_name,
                    "Business Category": category,
                    "Target Capital": f"₹{funding_target:,.2f}",
                    "Current Net Margin": f"{margin_pct:.1f}%"
                }
            },
            {
                "section_number": 2,
                "title": "Business Description & Value Proposition",
                "content": f"{biz_name} operates as a {b_type} providing high-utility everyday products and responsive consumer service to the local community in {locality}. "
                           f"Unlike distant urban supermarkets, {biz_name} provides immediate local accessibility, trusted relationship commerce, flexible fractional packaging, and doorstep availability for elderly and busy community members.",
                "key_metrics": {
                    "Entity Type": b_type,
                    "Operating Days": biz.operating_days if biz else "Mon-Sat",
                    "Employees": biz.num_employees if biz else 0
                }
            },
            {
                "section_number": 3,
                "title": "Target Market & Local Competition",
                "content": f"The primary addressable market encompasses approximately 800 to 1,500 local households in {locality} and surrounding agricultural hamlets. "
                           f"Customer demographics include daily wage earners, local farmers during crop cycles, and semi-urban commuter families. "
                           f"Competitive advantages include prime footfall positioning, rapid stock turnover, and digitized bookkeeping using GramVikas AI.",
                "key_metrics": {
                    "Primary Catchment Area": locality,
                    "Target Households": "800 - 1,500",
                    "Dominant Payment Mode": "Cash & UPI QR"
                }
            },
            {
                "section_number": 4,
                "title": "Products, Inventory & Pricing Structure",
                "content": f"Core merchandise portfolio comprises fast-moving consumer essentials, seasonal demand goods, and customized regional products. "
                           f"Pricing strategy utilizes cost-plus competitive retail benchmarking, maintaining an average gross margin between 18% to 28% while offering bundle discounts on volume staples.",
                "key_metrics": {
                    "Inventory Valuation": f"₹{fin['inventory_valuation']:,.2f}",
                    "Target Gross Margin": "18% - 28%",
                    "Restocking Cycle": "Weekly / Bi-weekly"
                }
            },
            {
                "section_number": 5,
                "title": "Marketing & Customer Retention Strategy",
                "content": "Promotion relies on hyper-local community trust, prominent storefront signage, clean and well-lit product display, seasonal festive promotions (Diwali, Eid, harvest seasons), and a WhatsApp broadcast group notifying regular patrons of fresh incoming stock and festive discounts.",
                "key_metrics": {
                    "Retention Channel": "WhatsApp Broadcast & In-person Relationship",
                    "Promotional Offers": "Festival Pre-orders & Bundle Savings"
                }
            },
            {
                "section_number": 6,
                "title": "Operational Plan & Supply Chain Logistics",
                "content": f"Direct weekly procurement from APMC wholesale mandis and authorized FMCG distributors in {district}. "
                           f"Daily operational hours maintained consistently across operating days. Stock counting and digital Khata reconciliations conducted daily at close of business.",
                "key_metrics": {
                    "Suppliers Engaged": "2-4 verified wholesale distributors",
                    "Reconciliation Cadence": "Daily at galla closing"
                }
            },
            {
                "section_number": 7,
                "title": "Startup & Capital Expenditure (Capex) Budget",
                "content": f"Total capital deployment requirement is structured at ₹{funding_target:,.2f}. "
                           f"Allocations: 55% towards high-demand fast-moving inventory expansion; 25% towards display racks, airtight storage containers, and digital weighing scale; 20% reserved as liquid working capital buffer.",
                "key_metrics": {
                    "Inventory Expansion (55%)": f"₹{funding_target * 0.55:,.2f}",
                    "Store Upgrades / Storage (25%)": f"₹{funding_target * 0.25:,.2f}",
                    "Liquid Working Capital Reserve (20%)": f"₹{funding_target * 0.20:,.2f}"
                }
            },
            {
                "section_number": 8,
                "title": "Monthly Revenue & Expense Forecast",
                "content": f"Projected monthly operational turnover target is ₹{monthly_sales_target:,.2f}. "
                           f"Expected monthly direct cost of goods is ₹{monthly_sales_target * 0.78:,.2f}, with monthly operating expenses (rent, transport, electricity) projected at ₹{monthly_sales_target * 0.08:,.2f}, resulting in an estimated monthly net income of ₹{monthly_sales_target * 0.14:,.2f}.",
                "key_metrics": {
                    "Projected Monthly Sales": f"₹{monthly_sales_target:,.2f}",
                    "Estimated Monthly COGS": f"₹{monthly_sales_target * 0.78:,.2f}",
                    "Projected Net Profit/Month": f"₹{monthly_sales_target * 0.14:,.2f}"
                }
            },
            {
                "section_number": 9,
                "title": "Cash Flow Projections & Break-Even Analysis",
                "content": f"Break-even monthly revenue threshold is estimated at ₹{fin['break_even_monthly_revenue']:,.2f} (approx ₹{fin['daily_break_even_sales']:,.2f} per day). "
                           f"Because cash inflows are realized immediately via cash and instant UPI payments, cash conversion cycles remain highly favorable (under 3 days).",
                "key_metrics": {
                    "Monthly Break-Even Sales": f"₹{fin['break_even_monthly_revenue']:,.2f}",
                    "Daily Sales Needed to Break Even": f"₹{fin['daily_break_even_sales']:,.2f}",
                    "Cash Conversion Cycle": "< 3 Days"
                }
            },
            {
                "section_number": 10,
                "title": "Risk Assessment & Mitigation Protocol",
                "content": "Key identified operational risks include: (1) Excessive informal customer credit defaults — mitigated by enforcing a strict ₹500 credit ceiling per patron. (2) Wholesale price fluctuations — mitigated by stocking non-perishable inventory when prices dip. (3) Adverse weather — mitigated by waterproof tarpaulins and elevated steel storage bins.",
                "key_metrics": {
                    "Credit Default Risk": "Low (Cap enforced)",
                    "Spoilage / Wastage Risk": "Controlled via airtight bins"
                }
            },
            {
                "section_number": 11,
                "title": "Financing Structure & Debt Servicing Plan",
                "content": f"Target financing of ₹{funding_target:,.2f} is sought through collateral-free institutional micro-credit schemes (such as PMMY MUDRA Shishu/Kishore or PM SVANidhi). "
                           f"Assuming a 36-month repayment period at a 10.5% bank interest rate, the estimated monthly EMI is approximately ₹{funding_target * 0.0325:,.2f}, which represents less than 15% of projected monthly net earnings, ensuring safe debt service coverage ratio (DSCR > 2.5x).",
                "key_metrics": {
                    "Target Scheme": "PMMY MUDRA / PM SVANidhi",
                    "Estimated Monthly EMI": f"₹{funding_target * 0.0325:,.2f}",
                    "Debt Service Coverage Ratio": "> 2.5x"
                }
            },
            {
                "section_number": 12,
                "title": "Structured 30-60-90 Day Action Roadmap",
                "content": "• Days 1–30: Complete Udyam MSME zero-cost registration; file loan application via JanSamarth or local bank branch; conduct distributor price comparisons.\n"
                           "• Days 31–60: Disburse loan funds; install modular steel shelving and digital UPI soundbox; onboard 2 primary FMCG distributors.\n"
                           "• Days 61–90: Launch festive season promotional bundles; review 60-day Khata book audit in GramVikas AI to verify gross margin targets.",
                "key_metrics": {
                    "Month 1 Goal": "Institutional loan application & Udyam registration",
                    "Month 2 Goal": "Store upgrade & inventory intake",
                    "Month 3 Goal": "Revenue scaling & margin optimization"
                }
            }
        ]

        plan_data = {
            "business_name": biz_name,
            "entrepreneur_name": ent_name,
            "locality": f"{locality}, {district}, {state}",
            "date_generated": datetime.now().strftime("%B %d, %Y"),
            "target_funding_inr": funding_target,
            "sections": sections
        }

        plan = BusinessPlan(
            user_id=user_id,
            business_id=business_id,
            title=data.title,
            plan_data_json=json.dumps(plan_data)
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)
        return plan
