#!/usr/bin/env python3
"""
Migration script to fix student usernames.

This script fixes the bug where student usernames were set to full_name 
instead of matric_no, which prevents the /me/clearance endpoint from working.
"""

from src.database import get_session
from src.models import User, Student, Role
from sqlmodel import select


def fix_student_usernames():
    """
    Fix student usernames to use matric_no instead of full_name.
    This allows the /students/me/clearance endpoint to work properly.
    """
    session = next(get_session())

    try:
        # Get all student users
        student_users = list(session.exec(
            select(User).where(User.role == Role.STUDENT)).all())
        print(f"Found {len(student_users)} student users")

        # Get all students
        students = list(session.exec(select(Student)).all())
        print(f"Found {len(students)} student records")

        # Create a mapping of full_name to matric_no
        name_to_matric = {
            student.full_name: student.matric_no for student in students}

        fixed_count = 0
        for user in student_users:
            # If username is currently a full name (not matric_no), fix it
            if user.username in name_to_matric:
                old_username = user.username
                new_username = name_to_matric[user.username]

                print(f"Fixing user: '{old_username}' -> '{new_username}'")
                user.username = new_username
                session.add(user)
                fixed_count += 1

        if fixed_count > 0:
            session.commit()
            print(f"Successfully fixed {fixed_count} student usernames")
        else:
            print("No student usernames needed fixing")

    except Exception as e:
        session.rollback()
        print(f"Error fixing usernames: {e}")
    finally:
        session.close()


if __name__ == "__main__":
    fix_student_usernames()
