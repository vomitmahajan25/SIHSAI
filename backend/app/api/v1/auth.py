from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.entities import User, Profile, Business
from app.schemas.all_schemas import UserRegister, UserLogin, Token, UserResponse, ProfileResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Create User
    new_user = User(
        email=payload.email.lower(),
        hashed_password=get_password_hash(payload.password),
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create initial Profile
    profile = Profile(
        user_id=new_user.id,
        full_name=payload.full_name,
        preferred_language=payload.preferred_language,
        district=payload.district,
        state=payload.state,
        pin_code=payload.pin_code,
        preferred_currency="INR",
        is_onboarded=False
    )
    db.add(profile)
    db.commit()

    token_str = create_access_token(new_user.id)
    return Token(
        access_token=token_str,
        user_id=new_user.id,
        email=new_user.email,
        full_name=profile.full_name,
        is_onboarded=profile.is_onboarded
    )

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    full_name = profile.full_name if profile else "Entrepreneur"
    is_onboarded = profile.is_onboarded if profile else False

    token_str = create_access_token(user.id)
    return Token(
        access_token=token_str,
        user_id=user.id,
        email=user.email,
        full_name=full_name,
        is_onboarded=is_onboarded
    )

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    biz = db.query(Business).filter(Business.user_id == current_user.id).first()
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "full_name": profile.full_name if profile else "",
        "preferred_language": profile.preferred_language if profile else "English",
        "district": profile.district if profile else "",
        "state": profile.state if profile else "",
        "is_onboarded": profile.is_onboarded if profile else False,
        "business_id": biz.id if biz else None,
        "business_name": biz.business_name if biz else None,
    }
