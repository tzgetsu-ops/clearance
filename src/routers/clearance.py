from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from src.database import get_session
from src.auth import get_current_active_user
from src.models import User, Role, ClearanceStatus, ClearanceUpdate, ClearanceStatusRead, Student
from src.crud import clearance as clearance_crud
from src.crud import students as student_crud

router = APIRouter(
    prefix="/clearance",
    tags=["Clearance"],
    dependencies=[Depends(get_current_active_user(
        required_roles=[Role.STAFF, Role.ADMIN]))],
)


@router.put("/update", response_model=ClearanceStatusRead)
def update_student_clearance_status(
    clearance_update: ClearanceUpdate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user(
        required_roles=[Role.STAFF, Role.ADMIN]))
):
    """
    Endpoint for staff to update a student's clearance status.

    **Department-based Access Control:**
    - **ADMIN users** can update clearance status for any department
    - **STAFF users** can only update clearance status for their assigned clearance department

    **Important:** Staff members must have their `clearance_department` field set to the 
    administrative department they manage (e.g., Library, Bursary, Student Affairs).
    This is different from their academic `department` field.

    **Example:**
    - A staff member with `clearance_department = "Library"` can only approve/reject 
      Library clearance requests
    - An admin can update any department's clearance status
    """

    # Department-based access control for staff
    if current_user.role == Role.STAFF:
        # Staff must have a clearance department assigned
        if not current_user.clearance_department:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Staff user must have a clearance department assigned. Contact your administrator."
            )

        # Staff can only update clearance for their assigned department
        if current_user.clearance_department != clearance_update.department:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. You can only update clearance status for {current_user.clearance_department.value} department. "
                f"You attempted to update {clearance_update.department.value} department."
            )

    # Admin users can update any department (no additional checks needed)

    updated_status = clearance_crud.update_clearance_status(
        db, clearance_update)

    if not updated_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No clearance record found for student {clearance_update.matric_no} in department {clearance_update.department}"
        )

    return updated_status


@router.get("/students/{student_id}/summary")
def get_student_clearance_summary(
    student_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user())
):
    """Get comprehensive clearance summary for a student."""
    student = student_crud.get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check permissions (admin/staff can view any, students only their own)
    if current_user.role == Role.STUDENT:
        student_user = student_crud.get_student_by_matric_no(
            db, current_user.username)
        if not student_user or student_user.id != student_id:
            raise HTTPException(status_code=403, detail="Access denied")

    # Calculate clearance status
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
        "student_id": student.id,
        "matric_no": student.matric_no,
        "full_name": student.full_name,
        "is_fully_cleared": is_fully_cleared,
        "clearance_percentage": (approved_count / total_departments * 100) if total_departments > 0 else 0,
        "overall_status": overall_status,
        "approved_count": approved_count,
        "total_departments": total_departments,
        "department_statuses": [
            {
                "department": status.department.value,
                "status": status.status.value,
                "remarks": status.remarks,
                "id": status.id
            }
            for status in student.clearance_statuses
        ],
        "remaining_departments": [
            status.department.value for status in student.clearance_statuses
            if status.status.value != "approved"
        ]
    }


@router.get("/students/cleared")
def get_cleared_students(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user(
        required_roles=[Role.ADMIN, Role.STAFF]))
):
    """Get all students who have completed their clearance."""
    all_students = student_crud.get_all_students(db)
    cleared_students = []

    for student in all_students:
        if student.clearance_statuses:
            approved_count = sum(
                1 for status in student.clearance_statuses
                if status.status.value == "approved"
            )
            total_departments = len(student.clearance_statuses)
            if approved_count == total_departments and total_departments > 0:
                cleared_students.append({
                    "id": student.id,
                    "matric_no": student.matric_no,
                    "full_name": student.full_name,
                    "department": student.department.value,
                    "total_departments": total_departments,
                    "approved_count": approved_count
                })

    return cleared_students


@router.get("/statistics")
def get_clearance_statistics(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user(
        required_roles=[Role.ADMIN, Role.STAFF]))
):
    """Get overall clearance statistics."""
    all_students = student_crud.get_all_students(db)

    stats = {
        "total_students": len(all_students),
        "fully_cleared": 0,
        "partially_cleared": 0,
        "pending": 0,
        "rejected": 0,
        "not_started": 0
    }

    for student in all_students:
        if not student.clearance_statuses:
            stats["not_started"] += 1
            continue

        approved_count = sum(
            1 for status in student.clearance_statuses
            if status.status.value == "approved"
        )
        total_departments = len(student.clearance_statuses)
        has_rejection = any(status.status.value ==
                            "rejected" for status in student.clearance_statuses)

        if has_rejection:
            stats["rejected"] += 1
        elif approved_count == total_departments:
            stats["fully_cleared"] += 1
        elif approved_count > 0:
            stats["partially_cleared"] += 1
        else:
            stats["pending"] += 1

    return stats
