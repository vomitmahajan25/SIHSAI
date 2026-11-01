from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_business
from app.models.entities import User, Business, Product, InventoryMovement
from app.services.inventory_service import InventoryService
from app.schemas.all_schemas import (
    ProductCreate, ProductUpdate, ProductResponse, InventoryMovementCreate, InventoryMovementResponse
)

router = APIRouter(prefix="/inventory", tags=["Inventory Management"])

@router.get("", response_model=List[ProductResponse])
def get_inventory(business: Business = Depends(get_current_business), db: Session = Depends(get_db)):
    return InventoryService.get_products(db, business.id)

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    current_user: User = Depends(get_current_user),
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    prod = InventoryService.create_product(db, business.id, current_user.id, payload)
    prods = InventoryService.get_products(db, business.id)
    for p in prods:
        if p["id"] == prod.id:
            return p
    return ProductResponse.model_validate(prod)

@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    payload: ProductUpdate,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(
        Product.id == product_id,
        Product.business_id == business.id
    ).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found.")

    for field, val in payload.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(prod, field, val)

    db.commit()
    db.refresh(prod)
    
    prods = InventoryService.get_products(db, business.id, include_archived=True)
    for p in prods:
        if p["id"] == prod.id:
            return p
    return ProductResponse.model_validate(prod)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: str,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(
        Product.id == product_id,
        Product.business_id == business.id
    ).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found.")

    prod.is_archived = True
    db.commit()
    return None

@router.post("/{product_id}/movements", response_model=InventoryMovementResponse)
def record_movement(
    product_id: str,
    payload: InventoryMovementCreate,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    mov = InventoryService.record_movement(db, business.id, product_id, payload)
    return mov

@router.get("/{product_id}/movements", response_model=List[InventoryMovementResponse])
def get_movements(
    product_id: str,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    movs = db.query(InventoryMovement).filter(
        InventoryMovement.product_id == product_id,
        InventoryMovement.business_id == business.id
    ).order_by(InventoryMovement.created_at.desc()).all()
    return movs
