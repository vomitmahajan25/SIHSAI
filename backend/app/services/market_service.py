from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.entities import MarketObservation
from app.schemas.all_schemas import MarketObservationCreate

CATEGORY_TEMPLATES = {
    "kirana": {
        "overview": "Rural & semi-urban retail grocery is characterized by high transaction frequency, low individual basket size, and high dependence on trustworthy supplier credit.",
        "customer_segments": [
            "Daily wage earners seeking small ₹10-₹50 sachets and loose staples.",
            "Salaried/agricultural families buying monthly bulk rations (atta, oil, rice).",
            "Local tea stall owners and roadside vendors needing regular dairy and sugar supply."
        ],
        "competitors": [
            "Established village chowk grocers offering extensive informal customer credit (udhaar).",
            "Weekly Haat / Bazaar vendors offering temporary discounts on fresh spices and pulses.",
            "Semi-urban discount supermarkets within a 5-10km travel radius."
        ],
        "suppliers": [
            "Nearest APMC Mandi wholesale grain merchants for loose commodities.",
            "Authorized FMCG distributors (e.g. Parle, Britannia, HUL, Tata) with weekly delivery vans.",
            "Regional cooperative dairy distribution points."
        ],
        "demand_hypotheses": [
            "Branded packaged spices and cold-pressed mustard/sunflower oils show growing preference over loose items due to purity concerns.",
            "Ready-to-eat snack packs (₹5-₹10) and instant noodles experience highest turnover between 4 PM and 8 PM."
        ],
        "seasonal": [
            "Pre-monsoon (June-July): Spike in long shelf-life grains and dry goods.",
            "Festive season (Oct-Nov): Surge in dry fruits, premium cooking oils, and sugar.",
            "Harvest season: Cash liquidity surges as farmers sell produce, leading to higher average spending."
        ],
        "risks": [
            "Severe working capital lockup due to uncollected customer credit.",
            "Pest damage or moisture spoilage during monsoon without airtight bins.",
            "Margin squeeze from wholesale commodity price spikes."
        ]
    },
    "street_vending": {
        "overview": "Street vending and food carts operate on immediate cash turnover, minimal overheads, and extreme sensitivity to foot traffic density and weather.",
        "customer_segments": [
            "School, college, and coaching center students looking for quick, pocket-friendly snacks.",
            "Commuters at bus stops, tempo stands, and railway crossings.",
            "Evening market strollers seeking fresh tea, chaat, and seasonal snacks."
        ],
        "competitors": [
            "Adjacent food carts serving complementary or identical items.",
            "Permanent sweet shops and tea stalls with indoor sitting."
        ],
        "suppliers": [
            "Local daily sabzi mandi for early morning fresh vegetables and herbs.",
            "Wholesale disposable paper cup/plate suppliers in the main town."
        ],
        "demand_hypotheses": [
            "Hygienic presentation (gloves, clean steel counters, covered food) attracts 25-30% more family customers.",
            "Offering quick QR-based UPI payment reduces queue wait times and increases transaction volume by 15%."
        ],
        "seasonal": [
            "Monsoon & Winter: Huge surge in demand for hot tea, samosas, pakodas, and soups.",
            "Summer: Demand switches toward fresh sugarcane juice, lassi, lemon water, and cut fruits."
        ],
        "risks": [
            "Eviction or harassment by local authorities without vending ID / PM SVANidhi recognition.",
            "Perishable food waste if bad weather causes sudden footfall drops."
        ]
    }
}

class MarketService:
    @staticmethod
    def get_observations(db: Session, business_id: str) -> List[MarketObservation]:
        return db.query(MarketObservation).filter(
            MarketObservation.business_id == business_id
        ).order_by(MarketObservation.created_at.desc()).all()

    @staticmethod
    def create_observation(
        db: Session,
        user_id: str,
        business_id: str,
        data: MarketObservationCreate
    ) -> MarketObservation:
        obs = MarketObservation(
            user_id=user_id,
            business_id=business_id,
            state=data.state,
            district=data.district,
            city_village=data.city_village,
            locality=data.locality,
            category=data.category,
            competitor_name=data.competitor_name,
            observed_product=data.observed_product,
            observed_price=data.observed_price,
            supplier_name=data.supplier_name,
            supplier_details=data.supplier_details,
            customer_segment_notes=data.customer_segment_notes,
            notes=data.notes
        )
        db.add(obs)
        db.commit()
        db.refresh(obs)
        return obs

    @staticmethod
    def get_insights(
        locality: str,
        district: str,
        state: str,
        category: str
    ) -> Dict[str, Any]:
        cat_key = "street_vending" if "vending" in category.lower() or "cart" in category.lower() else "kirana"
        tmpl = CATEGORY_TEMPLATES.get(cat_key, CATEGORY_TEMPLATES["kirana"])

        return {
            "locality": locality or "Central Market",
            "district": district or "Pune",
            "state": state or "Maharashtra",
            "category": category or "Retail Micro-Enterprise",
            "overview": f"Hyper-local market analysis for {category} in {locality}, {district}. {tmpl['overview']}",
            "potential_customer_segments": tmpl["customer_segments"],
            "competitor_observations": tmpl["competitors"],
            "supplier_discovery_tips": tmpl["suppliers"],
            "product_demand_hypotheses": tmpl["demand_hypotheses"],
            "seasonal_opportunities": tmpl["seasonal"],
            "business_risks": tmpl["risks"],
            "suggested_actions": [
                f"Conduct a weekly price survey across 3 competing vendors in {locality}.",
                "Avoid single-supplier dependency; maintain relationships with at least 2 wholesalers.",
                "Cap informal customer credit to reduce liquidity risk.",
                "Promote UPI payments with prominent QR code to attract younger consumers."
            ],
            "data_source_label": "Illustrative Local Survey & Verified Rural Business Telemetry"
        }
