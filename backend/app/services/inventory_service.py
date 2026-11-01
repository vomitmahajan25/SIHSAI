from typing import List, Optional, Dict, Any
from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.entities import Product, InventoryMovement
from app.schemas.all_schemas import ProductCreate, ProductUpdate, InventoryMovementCreate

class InventoryService:
    @staticmethod
    def get_products(db: Session, business_id: str, include_archived: bool = False) -> List[Dict[str, Any]]:
        query = db.query(Product).filter(Product.business_id == business_id)
        if not include_archived:
            query = query.filter(Product.is_archived == False)
        products = query.order_by(Product.name.asc()).all()

        results = []
        for p in products:
            cost = float(p.purchase_cost)
            price = float(p.selling_price)
            stock = float(p.current_stock)
            min_thresh = float(p.min_stock_threshold)
            
            # Margin %: ((price - cost) / price) * 100
            margin = None
            if price > 0:
                margin = round(((price - cost) / price) * 100.0, 1)

            results.append({
                "id": p.id,
                "business_id": p.business_id,
                "user_id": p.user_id,
                "name": p.name,
                "sku": p.sku,
                "category": p.category,
                "purchase_cost": cost,
                "selling_price": price,
                "current_stock": stock,
                "min_stock_threshold": min_thresh,
                "supplier_details": p.supplier_details,
                "is_archived": p.is_archived,
                "estimated_gross_margin_pct": margin,
                "is_low_stock": stock <= min_thresh,
                "created_at": p.created_at,
                "updated_at": p.updated_at
            })
        return results

    @staticmethod
    def create_product(db: Session, business_id: str, user_id: str, data: ProductCreate) -> Product:
        # Check SKU uniqueness if provided
        if data.sku:
            existing = db.query(Product).filter(
                Product.business_id == business_id,
                Product.sku == data.sku
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="A product with this SKU already exists.")

        product = Product(
            business_id=business_id,
            user_id=user_id,
            name=data.name,
            sku=data.sku,
            category=data.category,
            purchase_cost=Decimal(str(data.purchase_cost)),
            selling_price=Decimal(str(data.selling_price)),
            current_stock=Decimal(str(data.current_stock)),
            min_stock_threshold=Decimal(str(data.min_stock_threshold)),
            supplier_details=data.supplier_details
        )
        db.add(product)
        db.commit()
        db.refresh(product)

        # Record initial movement if initial stock > 0
        if data.current_stock > 0:
            movement = InventoryMovement(
                product_id=product.id,
                business_id=business_id,
                movement_type="received",
                quantity=Decimal(str(data.current_stock)),
                unit_cost=Decimal(str(data.purchase_cost)),
                notes="Initial stock entry"
            )
            db.add(movement)
            db.commit()

        return product

    @staticmethod
    def record_movement(
        db: Session,
        business_id: str,
        product_id: str,
        data: InventoryMovementCreate
    ) -> InventoryMovement:
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.business_id == business_id
        ).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found.")

        qty = Decimal(str(data.quantity))
        curr_stock = Decimal(str(product.current_stock))
        mtype = data.movement_type.lower()

        if mtype in ["sold", "damaged", "shrinkage"]:
            if curr_stock < qty:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient inventory. Current stock is {curr_stock}, cannot deduct {qty}."
                )
            product.current_stock = curr_stock - qty
        elif mtype in ["received", "returned"]:
            product.current_stock = curr_stock + qty
        elif mtype == "manual_adjustment":
            # For adjustment, quantity represents the new accurate counted stock
            product.current_stock = qty

        movement = InventoryMovement(
            product_id=product.id,
            business_id=business_id,
            movement_type=data.movement_type,
            quantity=qty,
            unit_cost=Decimal(str(data.unit_cost)) if data.unit_cost is not None else product.purchase_cost,
            notes=data.notes
        )
        db.add(movement)
        db.commit()
        db.refresh(movement)
        return movement
