from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.security import get_current_user
from backend.app.database import get_db
from backend.app.models.user import User


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
def get_my_profile(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Find the logged-in user in the database
    user = db.query(User).filter(
        User.id == int(current_user)
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at
    }