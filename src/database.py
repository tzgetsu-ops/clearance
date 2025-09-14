from sqlmodel import create_engine, Session, SQLModel
from sqlalchemy import text
from src.config import settings

# --- Database Engine Setup ---

# The database URL is constructed from the application settings.
# This makes it easy to switch between different database environments (e.g., dev, test, prod).
DATABASE_URL = settings.POSTGRES_URI
engine = create_engine(DATABASE_URL,)

# --- Database Migration Functions ---


def migrate_clearance_department_column():
    """
    Adds the clearance_department column to the user table if it doesn't exist.
    This handles the migration for the new department-based access control feature.
    """
    with Session(engine) as session:
        try:
            # Check if the column exists
            check_column_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'user' 
                AND column_name = 'clearance_department'
            """)

            # Use the underlying SQLAlchemy session for raw SQL
            result = session.connection().execute(check_column_query).fetchone()

            if not result:
                print("Adding clearance_department column to user table...")
                # Add the column if it doesn't exist
                add_column_query = text('''
                    ALTER TABLE "user" 
                    ADD COLUMN clearance_department VARCHAR
                ''')
                session.connection().execute(add_column_query)
                session.commit()
                print("Successfully added clearance_department column.")
            else:
                print("clearance_department column already exists.")

        except Exception as e:
            print(f"Error during clearance_department column migration: {e}")
            session.rollback()

# --- Database Initialization ---


def create_db_and_tables():
    """
    Creates all database tables defined by SQLModel metadata.
    This function is called once at application startup.
    """
    print("Initializing database...")
    SQLModel.metadata.create_all(engine)
    print("Database tables created successfully (if they didn't exist).")

    # Run any necessary migrations
    migrate_clearance_department_column()

# --- Database Session Management ---


def get_session():
    """
    A FastAPI dependency that provides a database session for each request.
    It ensures that the session is always closed after the request is finished,
    even if an error occurs.
    """
    with Session(engine) as session:
        try:
            yield session
        finally:
            session.close()
