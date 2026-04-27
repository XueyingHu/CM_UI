from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import uuid
import secrets

app = FastAPI(title="CM AI Solution - BAM Authentication API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (replace with DB in production)
active_sessions: dict[str, dict] = {}

# Mock user store (replace with BAM LDAP/AD integration in production)
MOCK_USERS = {
    "sarah.johnson": {
        "password": "password123",
        "full_name": "Sarah Johnson",
        "role": "Portfolio Manager",
        "email": "sarah.johnson@bank.com",
        "department": "Markets & Technology",
    },
    "david.lee": {
        "password": "password123",
        "full_name": "David Lee",
        "role": "Portfolio Manager",
        "email": "david.lee@bank.com",
        "department": "Retail Banking",
    },
    "john.smith": {
        "password": "password123",
        "full_name": "John Smith",
        "role": "Business Monitoring Lead",
        "email": "john.smith@bank.com",
        "department": "Markets & Technology",
    },
    "admin": {
        "password": "admin",
        "full_name": "System Administrator",
        "role": "Admin",
        "email": "admin@bank.com",
        "department": "IT",
    },
}


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    session_id: str
    username: str
    full_name: str
    role: str
    email: str
    department: str
    expires_at: str
    message: str


class LogoutRequest(BaseModel):
    session_id: str


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "CM AI Solution Auth API", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/api/v1/auth/login", response_model=LoginResponse)
def login(req: LoginRequest):
    user = MOCK_USERS.get(req.username.lower().strip())

    if not user or user["password"] != req.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password. Please check your BAM credentials.",
        )

    session_id = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(hours=8)

    active_sessions[session_id] = {
        "username": req.username,
        "full_name": user["full_name"],
        "role": user["role"],
        "email": user["email"],
        "department": user["department"],
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    return LoginResponse(
        session_id=session_id,
        username=req.username,
        full_name=user["full_name"],
        role=user["role"],
        email=user["email"],
        department=user["department"],
        expires_at=expires_at.isoformat(),
        message="Login successful",
    )


@app.post("/api/v1/auth/logout")
def logout(req: LogoutRequest):
    if req.session_id in active_sessions:
        del active_sessions[req.session_id]
        return {"message": "Logged out successfully"}
    return {"message": "Session not found or already expired"}


@app.get("/api/v1/auth/session/{session_id}")
def validate_session(session_id: str):
    session = active_sessions.get(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session not found or expired",
        )

    expires_at = datetime.fromisoformat(session["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        del active_sessions[session_id]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please log in again.",
        )

    return {"valid": True, **session}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
