from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.security import get_current_user
from backend.app.database import get_db
from backend.app.models.user_profile import UserProfile
from backend.app.schemas.profile import UserProfileCreate

router = APIRouter(
    prefix="/profile",
    tags=["User Profile"]
)


@router.get("/")
def get_profile(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        user_id = int(current_user)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid user authentication")

    profile = db.query(UserProfile).filter(
        UserProfile.user_id == user_id
    ).first()

    if not profile:
        return {
            "message": "Profile not created yet"
        }

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "age": profile.age,
        "gender": profile.gender,
        "height": profile.height,
        "weight": profile.weight,
        "activity_level": profile.activity_level,
        "health_goal": profile.health_goal
    }


@router.post("/")
def create_or_update_profile(
    profile_data: UserProfileCreate,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        user_id = int(current_user)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid user authentication")

    profile = db.query(UserProfile).filter(
        UserProfile.user_id == user_id
    ).first()

    if profile:
        profile.age = profile_data.age
        profile.gender = profile_data.gender
        profile.height = profile_data.height
        profile.weight = profile_data.weight
        profile.activity_level = profile_data.activity_level
        profile.health_goal = profile_data.health_goal
    else:
        profile = UserProfile(
            user_id=user_id,
            age=profile_data.age,
            gender=profile_data.gender,
            height=profile_data.height,
            weight=profile_data.weight,
            activity_level=profile_data.activity_level,
            health_goal=profile_data.health_goal
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)

    return {
        "message": "Profile saved successfully",
        "profile": {
            "id": profile.id,
            "user_id": profile.user_id,
            "age": profile.age,
            "gender": profile.gender,
            "height": profile.height,
            "weight": profile.weight,
            "activity_level": profile.activity_level,
            "health_goal": profile.health_goal
        }
    }
