import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import User, Conversation, ChatMessage
from app.services.ai_advisor import AIAdvisorService
from app.schemas.all_schemas import (
    ChatRequest, ChatResponse, ConversationResponse, MessageResponse, SourceReference, ActionItem
)

router = APIRouter(prefix="/advisor", tags=["AI Business Advisor"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_advisor(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = await AIAdvisorService.get_advice(
        db=db,
        user_id=current_user.id,
        message=payload.message,
        conversation_id=payload.conversation_id
    )
    return ChatResponse(**result)

@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    convs = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).all()

    results = []
    for c in convs:
        msgs = []
        for m in c.messages:
            sources = []
            if m.sources_json:
                try:
                    raw = json.loads(m.sources_json)
                    sources = [SourceReference(**s) for s in raw]
                except Exception:
                    pass
            actions = []
            if m.actions_json:
                try:
                    raw = json.loads(m.actions_json)
                    actions = [ActionItem(**a) for a in raw]
                except Exception:
                    pass
            msgs.append(MessageResponse(
                id=m.id,
                conversation_id=m.conversation_id,
                sender=m.sender,
                content=m.content,
                sources=sources,
                suggested_actions=actions,
                created_at=m.created_at
            ))
        results.append(ConversationResponse(
            id=c.id,
            title=c.title,
            created_at=c.created_at,
            updated_at=c.updated_at,
            messages=msgs
        ))
    return results

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation_detail(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    c = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    msgs = []
    for m in c.messages:
        sources = []
        if m.sources_json:
            try:
                raw = json.loads(m.sources_json)
                sources = [SourceReference(**s) for s in raw]
            except Exception:
                pass
        actions = []
        if m.actions_json:
            try:
                raw = json.loads(m.actions_json)
                actions = [ActionItem(**a) for a in raw]
            except Exception:
                pass
        msgs.append(MessageResponse(
            id=m.id,
            conversation_id=m.conversation_id,
            sender=m.sender,
            content=m.content,
            sources=sources,
            suggested_actions=actions,
            created_at=m.created_at
        ))

    return ConversationResponse(
        id=c.id,
        title=c.title,
        created_at=c.created_at,
        updated_at=c.updated_at,
        messages=msgs
    )
