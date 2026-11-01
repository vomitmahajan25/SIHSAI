from datetime import date
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.entities import FestivalEvent
from app.schemas.all_schemas import FestivalEventCreate

SEED_FESTIVALS = [
    {
        "name": "Diwali & Dhanteras",
        "date": date(2026, 11, 8),
        "region": "National",
        "category": "Religious & Cultural",
        "suggested_preparation": "Peak consumer spending of the entire year. Procure sweets, dry fruits, decorative lights, pooja essentials, and gift items 3 weeks early before wholesaler rates spike by 15%. Offer festival bundle discounts.",
        "inventory_notes": "Increase inventory of gift items, packaging materials, and staples by 40-50%. Ensure cash buffer for emergency restocks.",
        "is_user_event": False
    },
    {
        "name": "Eid-ul-Fitr",
        "date": date(2026, 3, 20),
        "region": "National",
        "category": "Religious",
        "suggested_preparation": "Surge in dry fruits, dates, vermicelli (sewai), dairy, fine apparel, and footwear. Prepare fresh inventory 10 days before Chaand Raat.",
        "inventory_notes": "Stock high quality dry fruits and sewai in sealed moisture-proof packaging.",
        "is_user_event": False
    },
    {
        "name": "Ganesh Chaturthi",
        "date": date(2026, 9, 14),
        "region": "Maharashtra & Western India",
        "category": "Cultural & Religious",
        "suggested_preparation": "Huge demand for modak ingredients, coconut, jaggery, flowers, incense, pooja thalis, and festive packaging. High evening footfall in market areas.",
        "inventory_notes": "Pre-order jaggery and coconut in bulk 7 days before festival.",
        "is_user_event": False
    },
    {
        "name": "Makar Sankranti & Pongal",
        "date": date(2026, 1, 14),
        "region": "National (Harvest)",
        "category": "Harvest Festival",
        "suggested_preparation": "Celebrates agricultural harvest. Farmers and rural laborers receive seasonal crop payouts. High demand for sesame (til), jaggery, kites, fresh grains, and sugarcane.",
        "inventory_notes": "Stock til-gul and sweets early.",
        "is_user_event": False
    },
    {
        "name": "Raksha Bandhan",
        "date": date(2026, 8, 28),
        "region": "National",
        "category": "Cultural",
        "suggested_preparation": "Rapid 3-day sales burst. High demand for rakhis, sweets boxes, chocolates, and greeting cards. Fast counter turnover.",
        "inventory_notes": "Keep pre-packed sweet boxes and assorted rakhi cards visible at the front counter.",
        "is_user_event": False
    },
    {
        "name": "Durga Puja & Navratri",
        "date": date(2026, 10, 11),
        "region": "National / Eastern India",
        "category": "Religious & Cultural",
        "suggested_preparation": "Nine days of fasting food demand (sabudana, kuttu atta, sendha namak, fruits) followed by grand festive feast shopping and new clothing.",
        "inventory_notes": "Procure fasting staples in advance. Keep evening snacks readily available near pandal routes.",
        "is_user_event": False
    },
    {
        "name": "Holi",
        "date": date(2026, 3, 4),
        "region": "National",
        "category": "Cultural & Spring",
        "suggested_preparation": "Demand for herbal/organic colors (gulal), pichkaris, sweets (gujiya ingredients), mawa/khoya, and cold refreshments like thandai.",
        "inventory_notes": "Stock organic colors with skin-safe certification label to attract family buyers.",
        "is_user_event": False
    }
]

class FestivalService:
    @staticmethod
    def seed_initial_festivals(db: Session):
        count = db.query(FestivalEvent).filter(FestivalEvent.is_user_event == False).count()
        if count == 0:
            for item in SEED_FESTIVALS:
                fe = FestivalEvent(
                    name=item["name"],
                    date=item["date"],
                    region=item["region"],
                    category=item["category"],
                    suggested_preparation=item["suggested_preparation"],
                    inventory_notes=item["inventory_notes"],
                    is_user_event=False,
                    user_id=None
                )
                db.add(fe)
            db.commit()

    @staticmethod
    def get_events(db: Session, user_id: Optional[str] = None) -> List[FestivalEvent]:
        # Return national/regional events + user's custom events
        FestivalService.seed_initial_festivals(db)
        query = db.query(FestivalEvent).filter(
            (FestivalEvent.is_user_event == False) | (FestivalEvent.user_id == user_id)
        ).order_by(FestivalEvent.date.asc())
        return query.all()

    @staticmethod
    def create_custom_event(db: Session, user_id: str, data: FestivalEventCreate) -> FestivalEvent:
        event = FestivalEvent(
            name=data.name,
            date=data.date,
            region=data.region,
            category=data.category,
            suggested_preparation=data.suggested_preparation,
            inventory_notes=data.inventory_notes,
            is_user_event=True,
            user_id=user_id
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event
