import os
import uuid
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_business
from app.models.entities import User, Business, Document
from app.schemas.all_schemas import DocumentResponse

router = APIRouter(prefix="/documents", tags=["Digital Vault"])

@router.get("", response_model=List[DocumentResponse])
def get_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).all()
    results = []
    for d in docs:
        results.append(DocumentResponse(
            id=d.id,
            filename=d.filename,
            file_size=d.file_size,
            mime_type=d.mime_type,
            category=d.category,
            linked_transaction_id=d.linked_transaction_id,
            notes=d.notes,
            download_url=f"/api/v1/documents/{d.id}/download",
            created_at=d.created_at
        ))
    return results

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form("receipt"),
    linked_transaction_id: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    business: Optional[Business] = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    # Validate MIME type
    if file.content_type not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Allowed types: PDF, JPEG, PNG, WEBP."
        )

    # Read content to check file size safely
    content = await file.read()
    file_size = len(content)
    if file_size > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_BYTES // (1024*1024)}MB."
        )

    # Generate secure stored filename
    ext = Path(file.filename or "upload").suffix.lower()
    stored_name = f"{uuid.uuid4()}{ext}"
    dest_path = Path(settings.UPLOAD_DIR) / stored_name

    with open(dest_path, "wb") as f:
        f.write(content)

    doc = Document(
        user_id=current_user.id,
        business_id=business.id if business else None,
        filename=file.filename or "uploaded_document",
        stored_filename=stored_name,
        file_path=str(dest_path),
        file_size=file_size,
        mime_type=file.content_type,
        category=category,
        linked_transaction_id=linked_transaction_id,
        notes=notes
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return DocumentResponse(
        id=doc.id,
        filename=doc.filename,
        file_size=doc.file_size,
        mime_type=doc.mime_type,
        category=doc.category,
        linked_transaction_id=doc.linked_transaction_id,
        notes=doc.notes,
        download_url=f"/api/v1/documents/{doc.id}/download",
        created_at=doc.created_at
    )

@router.get("/{document_id}/download")
def download_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Stored file could not be located.")

    return FileResponse(
        path=doc.file_path,
        media_type=doc.mime_type,
        filename=doc.filename
    )

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return None
