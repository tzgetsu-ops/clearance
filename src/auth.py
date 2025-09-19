from fastapi import Depends, HTTPException, status, Security, Request
from fastapi.security import APIKeyHeader, OAuth2PasswordBearer, HTTPBearer
from jose import JWTError, jwt
from sqlmodel import Session, select
from typing import List, Optional, Union
from datetime import datetime, timedelta

from src.config import settings
from src.database import get_session
from src.crud import users as user_crud
from src.crud import devices as device_crud
from src.models import User, Role, Device
from src.crud.utils import verify_password, hash_password

# --- Configuration ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
api_key_header = APIKeyHeader(name="x-api-key", auto_error=True)

# --- JWT Token Functions ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# --- User Authentication ---
def authenticate_user(db: Session, username: str, password: str):
    """Authenticate user by username and password."""
    user = user_crud.get_user_by_username(db, username=username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

# --- Dependency for API Key Authentication ---

# def get_api_key(
#     key: str = Depends(api_key_header), db: Session = Depends(get_session)
# ) -> Device:
#     """
#     Dependency to validate the API key from the x-api-key header.
#     Ensures the device is registered in the database.
#     """
#     db_device = device_crud.get_device_by_api_key(db, api_key=key)
#     if not db_device:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid or missing API Key",
#         )
#     return db_device


# --- Dependency for User Authentication and Authorization ---
def get_current_active_user(required_roles: List[Role]|None = None):
    def dependency(
        token: str = Depends(oauth2_scheme), db: Session = Depends(get_session)
    ) -> User:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            username: str|None = payload.get("sub")
            if username is None:
                raise credentials_exception
        except JWTError:
            raise credentials_exception

        user = user_crud.get_user_by_username(db, username=username)
        if user is None:
            raise credentials_exception

        # Check for roles if required
        if required_roles:
            is_authorized = any(role == user.role for role in required_roles)
            if not is_authorized:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="The user does not have adequate privileges",
                )
        return user

    return dependency

async def get_api_key(api_key: str = Security(api_key_header), db: Session = Depends(get_session)):
    """Validate device API key."""
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required"
        )
    
    device = device_crud.get_device_by_api_key(db, api_key=api_key)
    if not device or not device.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or inactive API key"
        )
    
    return api_key


# --- Flexible Authentication Dependency (JWT or API Key) ---
class AuthenticatedEntity:
    """Represents either a User (JWT auth) or Device (API key auth)"""
    def __init__(self, user: Optional[User] = None, device: Optional[Device] = None, api_key: Optional[str] = None):
        self.user = user
        self.device = device
        self.api_key = api_key
        
    @property
    def is_user(self) -> bool:
        return self.user is not None
        
    @property
    def is_device(self) -> bool:
        return self.device is not None
        
    def has_role(self, required_roles: List[Role]) -> bool:
        """Check if user has required role (devices always return True for admin operations)"""
        if self.is_device:
            return True  # Devices with valid API keys can perform admin operations
        if self.is_user and self.user:
            return any(role == self.user.role for role in required_roles)
        return False


def get_current_user_or_device(required_roles: List[Role] | None = None):
    """
    Flexible authentication that accepts either JWT token or API key.
    Useful for endpoints that need to work with both web users and devices.
    """
    def dependency(
        request: Request,
        db: Session = Depends(get_session)
    ) -> AuthenticatedEntity:
        
        # Check for API key first (x-api-key header)
        api_key = request.headers.get("x-api-key")
        if api_key:
            device = device_crud.get_device_by_api_key(db, api_key=api_key)
            if device and device.is_active:
                return AuthenticatedEntity(device=device, api_key=api_key)
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or inactive API key"
                )
        
        # Check for JWT token (Authorization: Bearer)
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(
                    token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
                )
                username: str | None = payload.get("sub")
                if username is None:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Could not validate credentials"
                    )
                
                user = user_crud.get_user_by_username(db, username=username)
                if user is None:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="User not found"
                    )
                
                # Check for roles if required
                entity = AuthenticatedEntity(user=user)
                if required_roles and not entity.has_role(required_roles):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="The user does not have adequate privileges"
                    )
                
                return entity
                
            except JWTError:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials"
                )
        
        # No valid authentication found
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required (provide JWT token or API key)"
        )
    
    return dependency
