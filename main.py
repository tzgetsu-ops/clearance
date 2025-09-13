from fastapi import FastAPI
from fastapi.responses import JSONResponse
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
import os
from sqlmodel import Session, select
from starlette.middleware.cors import CORSMiddleware

from src.config import settings
from src.database import create_db_and_tables, engine
from src.routers import admin, clearance, devices, students, token, users
from src.models import (
    User,
    UserCreate,
    Role,
    Student,
    ClearanceStatus,
    ClearanceDepartment,
    Department,
    RFIDTag,
    TagLink,
    StudentCreate
)
from src.crud.tag_linking import link_tag
from src.crud.students import create_student, get_student_by_matric_no

initial_students_data = [
    {
        "matric_no": "20191648",
        "full_name": "Adebayo Esther Oladmide",
        "email": "estheroladmide2016@gmail.com",
        "department": "Engineering",
        "password": "student123",
        "tag_id": None,
    },
    {
        "matric_no": "20191663",
        "full_name": "Emmauel praise",
        "email": "emmauelpo.19@student.funaab.edu.ng",
        "department": "Engineering",
        "password": "student123",
        "tag_id": None,
    },
    {
        "matric_no": "20191649",
        "full_name": "Adekoya Testimony",
        "email": "adekoyato.19@student.funaab.edu.ng",
        "department": "Engineering",
        "password": "student123",
        "tag_id": "TAG_01",
    },
    {
        "matric_no": "20191647",
        "full_name": "Adedayo Adeyemi Adebayo",
        "email": "adebayoadedayo23@gmail.com",
        "department": "Engineering",
        "password": "student123",
        "tag_id": "D6FC3F05",
    },
    {
        "matric_no": "20191646",
        "full_name": "Abolade Lawal",
        "email": "aboladela.19@student.funaab.edu.ng",
        "department": "Engineering",
        "password": "student123",
        "tag_id": "FB031202",
    },
    {
        "matric_no": "20191656",
        "full_name": "Aro Emmanuel",
        "email": "user@example.com",
        "department": "Engineering",
        "password": "student123",
        "tag_id": "A69B3E05",
    },
]


def create_initial_admin(session: Session):
    admin_user = session.exec(
        select(User).where(User.username == settings.initial_admin_username)
    ).first()

    if not admin_user:
        print("Initial admin user not found, creating one...")
        hashed_password = settings.PWD_CONTEXT.hash(
            settings.initial_admin_password)
        initial_admin = User(
            username=settings.initial_admin_username,
            full_name="System Administrator",
            email=settings.initial_admin_email,
            hashed_password=hashed_password,
            role=Role.ADMIN,
        )
        session.add(initial_admin)
        session.commit()
        print("Initial admin user created successfully.")
    else:
        print("Initial admin user already exists.")


def seed_initial_students(session: Session):
    print("Checking for initial student data...")
    for student_data in initial_students_data:
        matric_no = student_data["matric_no"]
        existing_student = get_student_by_matric_no(session, matric_no)

        if not existing_student:
            print(f"Creating student with matriculation number: {matric_no}")

            student_create_data = StudentCreate(
                matric_no=student_data["matric_no"],
                full_name=student_data["full_name"],
                email=student_data["email"],
                department=Department(student_data["department"]),
                password=student_data["password"]
            )

            try:
                new_student = create_student(session, student_create_data)
                print(f"Successfully created student {matric_no}")

                if student_data.get("tag_id"):
                    tag_link_data = TagLink(
                        tag_id=student_data["tag_id"],
                        matric_no=matric_no
                    )
                    linked_tag = link_tag(session, tag_link_data)
                    if linked_tag:
                        print(
                            f"Successfully linked RFID tag {student_data['tag_id']} to student {matric_no}")
                    else:
                        print(
                            f"Failed to link RFID tag {student_data['tag_id']} to student {matric_no}")

            except Exception as e:
                print(f"Error creating student {matric_no}: {str(e)}")

        else:
            print(
                f"Student with matriculation number {matric_no} already exists.")

            if student_data.get("tag_id"):
                existing_tag = session.exec(
                    select(RFIDTag).where(
                        RFIDTag.tag_id == student_data["tag_id"],
                        RFIDTag.student_id == existing_student.id
                    )
                ).first()

                if not existing_tag:
                    tag_link_data = TagLink(
                        tag_id=student_data["tag_id"],
                        matric_no=matric_no
                    )
                    linked_tag = link_tag(session, tag_link_data)
                    if linked_tag:
                        print(
                            f"Successfully linked RFID tag {student_data['tag_id']} to existing student {matric_no}")
                    else:
                        print(
                            f"Failed to link RFID tag {student_data['tag_id']} to existing student {matric_no}")
                else:
                    print(
                        f"RFID tag {student_data['tag_id']} already linked to student {matric_no}")

    print("Initial student data check complete.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    print("Initializing database...")
    create_db_and_tables()

    with Session(engine) as session:
        create_initial_admin(session)
        seed_initial_students(session)

    yield
    print("Shutting down...")

app = FastAPI(
    title="Undergraduate Clearance System API",
    description="A comprehensive API for managing student clearance processes with RFID authentication.",
    version="2.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Including API routers...")
app.include_router(admin.router)
app.include_router(clearance.router)
app.include_router(devices.router)
app.include_router(students.router)
app.include_router(token.router)
app.include_router(users.router)
print("All API routers included.")


@app.get("/", summary="Root Endpoint", tags=["System"])
async def read_root():
    return {"message": "Welcome to the Undergraduate Clearance System API. See /docs for details."}


@app.get("/health", summary="Health Check", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": app.version,
    }

if __name__ == "__main__":
    print("Starting Uvicorn server for development...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
