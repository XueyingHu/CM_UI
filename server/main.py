from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import uuid

app = FastAPI(title="CM AI Solution - BAM Authentication API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store — replace with Redis/DB in production
active_sessions: dict[str, dict] = {}

# Stub user registry — replace with BAM LDAP/AD directory lookup in production
# Username convention: firstname.lastname (derived from display name)
MOCK_USERS = {
    # System / page-load session — used before a PM is selected
    "system.user": {
        "full_name": "System User",
        "role": "System",
        "email": "system@bank.com",
        "department": "CM AI Platform",
    },
    # Portfolio Managers
    "sarah.johnson": {
        "full_name": "Sarah Johnson",
        "role": "Portfolio Manager",
        "email": "sarah.johnson@bank.com",
        "department": "Markets & Technology",
    },
    "david.lee": {
        "full_name": "David Lee",
        "role": "Portfolio Manager",
        "email": "david.lee@bank.com",
        "department": "Retail Banking",
    },
    "maria.garcia": {
        "full_name": "Maria Garcia",
        "role": "Portfolio Manager",
        "email": "maria.garcia@bank.com",
        "department": "Global Risk",
    },
    "james.okafor": {
        "full_name": "James Okafor",
        "role": "Portfolio Manager",
        "email": "james.okafor@bank.com",
        "department": "Markets & Technology",
    },
    "linda.park": {
        "full_name": "Linda Park",
        "role": "Portfolio Manager",
        "email": "linda.park@bank.com",
        "department": "Retail Banking",
    },
    # Business Monitoring Leads
    "john.smith": {
        "full_name": "John Smith",
        "role": "Business Monitoring Lead",
        "email": "john.smith@bank.com",
        "department": "Markets & Technology",
    },
    "emily.chen": {
        "full_name": "Emily Chen",
        "role": "Business Monitoring Lead",
        "email": "emily.chen@bank.com",
        "department": "Retail Banking",
    },
    "robert.taylor": {
        "full_name": "Robert Taylor",
        "role": "Business Monitoring Lead",
        "email": "robert.taylor@bank.com",
        "department": "Global Risk",
    },
    "priya.nair": {
        "full_name": "Priya Nair",
        "role": "Business Monitoring Lead",
        "email": "priya.nair@bank.com",
        "department": "Compliance & Legal",
    },
    "carlos.mendez": {
        "full_name": "Carlos Mendez",
        "role": "Business Monitoring Lead",
        "email": "carlos.mendez@bank.com",
        "department": "Corporate Audit",
    },
}


def name_to_username(display_name: str) -> str:
    """Convert 'First Last' → 'first.last' for BAM username lookup."""
    parts = display_name.strip().lower().split()
    return f"{parts[0]}.{parts[-1]}" if len(parts) >= 2 else display_name.lower()


class LoginRequest(BaseModel):
    username: str
    # In the stub, password is not validated — BAM SSO handles real auth.
    # Kept in the schema for future integration parity.
    password: str = "bam-sso-token"
    # Optional: caller can pass the raw display name and we derive the username
    display_name: str = ""


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
    return {
        "status": "ok",
        "service": "CM AI Solution Auth API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/api/v1/auth/login", response_model=LoginResponse)
def login(req: LoginRequest):
    # Resolve username — prefer explicit username, fall back to display_name conversion
    username = req.username.strip().lower()
    if not username and req.display_name:
        username = name_to_username(req.display_name)

    user = MOCK_USERS.get(username)

    # Stub behaviour: if user not found in registry, create an ad-hoc session
    # using whatever info was provided (graceful degradation for unknown users).
    if not user:
        if req.display_name:
            user = {
                "full_name": req.display_name,
                "role": "Authenticated User",
                "email": f"{username}@bank.com",
                "department": "Unknown",
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found in BAM directory.",
            )

    session_id = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(hours=8)

    active_sessions[session_id] = {
        "username": username,
        "full_name": user["full_name"],
        "role": user["role"],
        "email": user["email"],
        "department": user["department"],
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    return LoginResponse(
        session_id=session_id,
        username=username,
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
            detail="Session not found or expired.",
        )
    expires_at = datetime.fromisoformat(session["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        del active_sessions[session_id]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please refresh your scope selection.",
        )
    return {"valid": True, **session}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
