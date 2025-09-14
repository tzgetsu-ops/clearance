from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, SQLModel

from src.auth import get_current_active_user
from src.database import get_session
from src.models import StudentReadWithClearance, User, Role
from src.crud import students as student_crud


class StudentLookupRequest(SQLModel):
    matric_no: str


router = APIRouter(
    prefix="/students",
    tags=["Students"],
    dependencies=[Depends(get_current_active_user)]
)


@router.post("/lookup", response_model=StudentReadWithClearance)
def lookup_student_by_matric_no(
    request: StudentLookupRequest,
    db: Session = Depends(get_session)
):
    """
    Endpoint for a logged-in user to retrieve a student's profile
    and clearance information by providing their matriculation number.
    """
    student = student_crud.get_student_by_matric_no(
        db=db, matric_no=request.matric_no)

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student with the provided matriculation number not found."
        )

    return student


@router.get("/me/clearance")
def get_my_clearance_status(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user())
):
    """
    Endpoint for students to view their own clearance status.
    Only accessible by users with STUDENT role using their matriculation number as username.
    """
    # Only students can access this endpoint
    if current_user.role != Role.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only accessible to students"
        )

    # Find student by matric number (username for students)
    student = student_crud.get_student_by_matric_no(db, current_user.username)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student record not found for current user"
        )

    # Calculate clearance summary
    approved_count = sum(
        1 for status in student.clearance_statuses
        if status.status.value == "approved"
    )
    total_departments = len(student.clearance_statuses)
    is_fully_cleared = approved_count == total_departments and total_departments > 0

    # Determine overall status
    if not student.clearance_statuses:
        overall_status = "not_started"
    elif any(status.status.value == "rejected" for status in student.clearance_statuses):
        overall_status = "rejected"
    elif is_fully_cleared:
        overall_status = "fully_cleared"
    elif approved_count > 0:
        overall_status = "partially_cleared"
    else:
        overall_status = "pending"

    return {
        "student_info": {
            "id": student.id,
            "matric_no": student.matric_no,
            "full_name": student.full_name,
            "email": student.email,
            "department": student.department.value
        },
        "clearance_summary": {
            "is_fully_cleared": is_fully_cleared,
            "clearance_percentage": (approved_count / total_departments * 100) if total_departments > 0 else 0,
            "overall_status": overall_status,
            "approved_count": approved_count,
            "total_departments": total_departments
        },
        "department_statuses": [
            {
                "department": status.department.value,
                "status": status.status.value,
                "remarks": status.remarks,
                "id": status.id
            }
            for status in student.clearance_statuses
        ],
        "next_steps": [
            status.department.value for status in student.clearance_statuses
            if status.status.value == "pending"
        ]
    }
