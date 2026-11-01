import csv
import io
from datetime import date
from decimal import Decimal
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_business
from app.models.entities import User, Business, Transaction, Product, InventoryMovement
from app.schemas.all_schemas import (
    TransactionCreate, TransactionUpdate, TransactionResponse, TransactionListResponse
)

router = APIRouter(prefix="/transactions", tags=["Khata Book / Bookkeeping"])

VALID_TRANSACTION_TYPES = [
    "sale",
    "operating_expense",
    "inventory_purchase",
    "supplier_payment",
    "customer_payment_received",
    "debt_received",
    "debt_repayment",
    "other_adjustment"
]

@router.get("", response_model=TransactionListResponse)
def get_transactions(
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category: Optional[str] = None,
    transaction_type: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20
):
    # Ensure page and page_size are integers even if FastAPI Query object is passed
    if not isinstance(page, int):
        page = 1
    if not isinstance(page_size, int):
        page_size = 20
    query = db.query(Transaction).filter(Transaction.business_id == business.id)

    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if category:
        query = query.filter(Transaction.category.ilike(f"%{category}%"))
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Transaction.description.ilike(search_fmt),
                Transaction.counterparty.ilike(search_fmt),
                Transaction.category.ilike(search_fmt)
            )
        )

    total = query.count()

    # Calculate total income and expense for the filter
    all_filtered = query.all()
    total_income = sum(float(t.amount) for t in all_filtered if t.transaction_type in ["sale", "customer_payment_received", "debt_received"])
    total_expense = sum(float(t.amount) for t in all_filtered if t.transaction_type in ["operating_expense", "inventory_purchase", "supplier_payment", "debt_repayment"])

    # Paginate
    items = query.order_by(Transaction.date.desc(), Transaction.created_at.desc())\
                 .offset((page - 1) * page_size)\
                 .limit(page_size)\
                 .all()

    return TransactionListResponse(
        items=[TransactionResponse.model_validate(t) for t in items],
        total=total,
        page=page,
        page_size=page_size,
        total_income=total_income,
        total_expense=total_expense
    )

@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    current_user: User = Depends(get_current_user),
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    if payload.transaction_type not in VALID_TRANSACTION_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transaction type. Must be one of: {', '.join(VALID_TRANSACTION_TYPES)}"
        )

    t = Transaction(
        business_id=business.id,
        user_id=current_user.id,
        transaction_type=payload.transaction_type,
        amount=Decimal(str(payload.amount)),
        date=payload.date,
        category=payload.category,
        description=payload.description,
        payment_method=payload.payment_method,
        counterparty=payload.counterparty,
        receipt_doc_id=payload.receipt_doc_id
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return t

@router.get("/export/csv")
def export_transactions_csv(
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    query = db.query(Transaction).filter(Transaction.business_id == business.id)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    transactions = query.order_by(Transaction.date.asc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Transaction ID", "Date", "Type", "Category", "Description", 
        "Amount (INR)", "Payment Method", "Counterparty"
    ])
    for t in transactions:
        writer.writerow([
            t.id,
            t.date.isoformat(),
            t.transaction_type,
            t.category,
            t.description,
            float(t.amount),
            t.payment_method,
            t.counterparty or ""
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=gramvikas_transactions_{date.today().isoformat()}.csv"}
    )

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction_detail(
    transaction_id: str,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    t = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.business_id == business.id
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    return t

@router.patch("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: str,
    payload: TransactionUpdate,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    t = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.business_id == business.id
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    for field, val in payload.model_dump(exclude_unset=True).items():
        if field == "amount" and val is not None:
            setattr(t, field, Decimal(str(val)))
        else:
            setattr(t, field, val)

    db.commit()
    db.refresh(t)
    return t

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: str,
    business: Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    t = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.business_id == business.id
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    db.delete(t)
    db.commit()
    return None
