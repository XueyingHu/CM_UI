from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid

app = FastAPI(title="CM AI Solution API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory stores — replace with DB / Redis in production
# ---------------------------------------------------------------------------
active_sessions: dict[str, dict] = {}
scope_store: dict[str, dict] = {}   # session_id → scope record


# ---------------------------------------------------------------------------
# Mock user registry — replace with BAM LDAP/AD lookup in production
# ---------------------------------------------------------------------------
MOCK_USERS = {
    "system.user": {
        "full_name": "System User",
        "role": "System",
        "email": "system@bank.com",
        "department": "CM AI Platform",
    },
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


# ---------------------------------------------------------------------------
# Auditable Entity (AE) mock dataset
# In production this is a query against the 5 k-record AE table.
# Structure mirrors the real schema: ae_id, ae_name, pm, bml, team.
# ---------------------------------------------------------------------------
def _build_ae_table() -> list[dict]:
    rows = []
    catalog = [
        # (name_template, pm, bml, team)
        # --- Sarah Johnson portfolio ---
        ("Trading Systems",          "Sarah Johnson", "John Smith",    "Markets & Technology"),
        ("Ops Risk Controls",        "Sarah Johnson", "John Smith",    "Operations"),
        ("Market Data Services",     "Sarah Johnson", "Robert Taylor", "Markets & Technology"),
        ("Tech Infrastructure",      "Sarah Johnson", "Emily Chen",    "Markets & Technology"),
        ("Algo Trading Platform",    "Sarah Johnson", "John Smith",    "Markets & Technology"),
        ("Risk Engine",              "Sarah Johnson", "Robert Taylor", "Global Risk"),
        ("Settlement Systems",       "Sarah Johnson", "Emily Chen",    "Operations"),
        ("Prime Brokerage Ops",      "Sarah Johnson", "John Smith",    "Operations"),
        ("FX Trading Desk",          "Sarah Johnson", "Robert Taylor", "Markets & Technology"),
        ("Derivatives Clearing",     "Sarah Johnson", "John Smith",    "Markets & Technology"),
        ("Market Risk Reporting",    "Sarah Johnson", "Robert Taylor", "Global Risk"),
        ("Collateral Management",    "Sarah Johnson", "Emily Chen",    "Operations"),
        ("Trading Surveillance",     "Sarah Johnson", "John Smith",    "Compliance & Legal"),
        ("Execution Management",     "Sarah Johnson", "Robert Taylor", "Markets & Technology"),
        ("Pre-Trade Compliance",     "Sarah Johnson", "Priya Nair",    "Compliance & Legal"),
        # --- David Lee portfolio ---
        ("Consumer Lending",         "David Lee",     "Emily Chen",    "Retail Banking"),
        ("Deposit Operations",       "David Lee",     "Emily Chen",    "Retail Banking"),
        ("Branch Compliance",        "David Lee",     "Priya Nair",    "Compliance & Legal"),
        ("Mortgage Origination",     "David Lee",     "Emily Chen",    "Retail Banking"),
        ("Auto Loan Processing",     "David Lee",     "Emily Chen",    "Retail Banking"),
        ("Credit Card Operations",   "David Lee",     "Priya Nair",    "Compliance & Legal"),
        ("Digital Banking Platform", "David Lee",     "Emily Chen",    "Retail Banking"),
        ("Branch Network Mgmt",      "David Lee",     "Emily Chen",    "Retail Banking"),
        ("ATM & Cash Mgmt",          "David Lee",     "Carlos Mendez", "Operations"),
        ("Retail Fraud Prevention",  "David Lee",     "Priya Nair",    "Compliance & Legal"),
        ("Customer Onboarding",      "David Lee",     "Emily Chen",    "Retail Banking"),
        ("KYC & AML Compliance",     "David Lee",     "Priya Nair",    "Compliance & Legal"),
        ("Consumer Credit Risk",     "David Lee",     "Robert Taylor", "Global Risk"),
        ("Retail Analytics",         "David Lee",     "Emily Chen",    "Retail Banking"),
        ("Loan Servicing",           "David Lee",     "Emily Chen",    "Retail Banking"),
        # --- Maria Garcia portfolio ---
        ("Credit Derivatives",       "Maria Garcia",  "Robert Taylor", "Global Risk"),
        ("Counterparty Risk",        "Maria Garcia",  "Robert Taylor", "Global Risk"),
        ("Credit Portfolio Mgmt",    "Maria Garcia",  "Carlos Mendez", "Corporate Audit"),
        ("Stress Testing Framework", "Maria Garcia",  "Robert Taylor", "Global Risk"),
        ("Model Risk Management",    "Maria Garcia",  "Robert Taylor", "Global Risk"),
        ("Credit Risk Reporting",    "Maria Garcia",  "Carlos Mendez", "Corporate Audit"),
        ("Basel III Compliance",     "Maria Garcia",  "Priya Nair",    "Compliance & Legal"),
        ("CECL Implementation",      "Maria Garcia",  "Robert Taylor", "Global Risk"),
        ("Leveraged Finance Risk",   "Maria Garcia",  "Robert Taylor", "Global Risk"),
        ("Loan Loss Provisioning",   "Maria Garcia",  "Carlos Mendez", "Corporate Audit"),
        ("Counterparty Exposure",    "Maria Garcia",  "Robert Taylor", "Global Risk"),
        ("Credit Approval Process",  "Maria Garcia",  "Carlos Mendez", "Corporate Audit"),
        ("Portfolio Concentration",  "Maria Garcia",  "Robert Taylor", "Global Risk"),
        ("Risk Data Aggregation",    "Maria Garcia",  "Robert Taylor", "Global Risk"),
        ("Default Monitoring",       "Maria Garcia",  "Carlos Mendez", "Corporate Audit"),
        # --- James Okafor portfolio ---
        ("Fixed Income Trading",     "James Okafor",  "Carlos Mendez", "Markets & Technology"),
        ("Equity Research",          "James Okafor",  "Priya Nair",    "Global Risk"),
        ("Structured Products",      "James Okafor",  "Robert Taylor", "Global Risk"),
        ("Bond Portfolio Mgmt",      "James Okafor",  "Carlos Mendez", "Markets & Technology"),
        ("Interest Rate Risk",       "James Okafor",  "Robert Taylor", "Global Risk"),
        ("Securitisation Desk",      "James Okafor",  "Robert Taylor", "Global Risk"),
        ("Rates Trading",            "James Okafor",  "Carlos Mendez", "Markets & Technology"),
        ("Capital Markets Ops",      "James Okafor",  "Carlos Mendez", "Operations"),
        ("Equity Derivatives",       "James Okafor",  "Robert Taylor", "Markets & Technology"),
        ("Index & ETF Trading",      "James Okafor",  "Carlos Mendez", "Markets & Technology"),
        ("Prime Finance",            "James Okafor",  "Carlos Mendez", "Markets & Technology"),
        ("Securities Lending",       "James Okafor",  "Carlos Mendez", "Operations"),
        ("Research Compliance",      "James Okafor",  "Priya Nair",    "Compliance & Legal"),
        ("Repo & Funding",           "James Okafor",  "Carlos Mendez", "Markets & Technology"),
        ("Structured Credit",        "James Okafor",  "Robert Taylor", "Global Risk"),
        # --- Linda Park portfolio ---
        ("Wealth Management",        "Linda Park",    "Priya Nair",    "Retail Banking"),
        ("Private Banking",          "Linda Park",    "Emily Chen",    "Retail Banking"),
        ("Asset Management",         "Linda Park",    "Carlos Mendez", "Corporate Audit"),
        ("Trust Services",           "Linda Park",    "John Smith",    "Compliance & Legal"),
        ("Insurance Products",       "Linda Park",    "Priya Nair",    "Operations"),
        ("Investment Advisory",      "Linda Park",    "Priya Nair",    "Retail Banking"),
        ("Family Office Services",   "Linda Park",    "Carlos Mendez", "Corporate Audit"),
        ("Estate Planning",          "Linda Park",    "Priya Nair",    "Compliance & Legal"),
        ("Pension Fund Mgmt",        "Linda Park",    "Carlos Mendez", "Corporate Audit"),
        ("Portfolio Advisory",       "Linda Park",    "Priya Nair",    "Retail Banking"),
        ("Discretionary Mgmt",       "Linda Park",    "Emily Chen",    "Retail Banking"),
        ("Fund Administration",      "Linda Park",    "Carlos Mendez", "Corporate Audit"),
        ("Custody Services",         "Linda Park",    "John Smith",    "Operations"),
        ("Brokerage Services",       "Linda Park",    "Emily Chen",    "Retail Banking"),
        ("Charitable Giving",        "Linda Park",    "Priya Nair",    "Compliance & Legal"),
    ]
    for i, (name, pm, bml, team) in enumerate(catalog, start=1):
        rows.append({
            "ae_id": f"AE{10000 + i:05d}",
            "ae_name": name,
            "pm": pm,
            "bml": bml,
            "team": team,
        })
    return rows


AE_TABLE: list[dict] = _build_ae_table()


# ---------------------------------------------------------------------------
# Auth schemas
# ---------------------------------------------------------------------------
def name_to_username(display_name: str) -> str:
    parts = display_name.strip().lower().split()
    return f"{parts[0]}.{parts[-1]}" if len(parts) >= 2 else display_name.lower()


class LoginRequest(BaseModel):
    username: str
    password: str = "bam-sso-token"
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


# ---------------------------------------------------------------------------
# Scope schemas
# ---------------------------------------------------------------------------
class ScopeRequest(BaseModel):
    session_id: str
    pm: str
    bml: Optional[str] = None
    team: Optional[str] = None
    entity_count: int


class ScopeResponse(BaseModel):
    scope_id: str
    session_id: str
    pm: str
    bml: Optional[str]
    team: Optional[str]
    entity_count: int
    recorded_at: str


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "CM AI Solution API",
        "ae_table_size": len(AE_TABLE),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------
@app.post("/api/v1/auth/login", response_model=LoginResponse)
def login(req: LoginRequest):
    username = req.username.strip().lower()
    if not username and req.display_name:
        username = name_to_username(req.display_name)

    user = MOCK_USERS.get(username)
    if not user:
        if req.display_name:
            user = {
                "full_name": req.display_name,
                "role": "Authenticated User",
                "email": f"{username}@bank.com",
                "department": "Unknown",
            }
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="User not found in BAM directory.")

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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Session not found or expired.")
    expires_at = datetime.fromisoformat(session["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        del active_sessions[session_id]
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Session expired.")
    return {"valid": True, **session}


# ---------------------------------------------------------------------------
# Auditable Entities endpoint
# Server-side filtering — replaces frontend JS filter on the AE table.
# In production: query the real 5k-record AE table with these WHERE clauses.
# ---------------------------------------------------------------------------
@app.get("/api/v1/entities")
def get_entities(
    pm: Optional[str] = Query(None, description="Portfolio Manager name"),
    bml: Optional[str] = Query(None, description="Business Monitoring Lead name"),
    team: Optional[str] = Query(None, description="Responsible team name"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(200, ge=1, le=500, description="Records per page"),
):
    results = AE_TABLE
    if pm:
        results = [r for r in results if r["pm"] == pm]
    if bml:
        results = [r for r in results if r["bml"] == bml]
    if team:
        results = [r for r in results if r["team"] == team]

    total = len(results)
    start = (page - 1) * page_size
    end = start + page_size
    page_data = results[start:end]

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": max(1, -(-total // page_size)),  # ceiling division
        "entities": page_data,
    }


# ---------------------------------------------------------------------------
# Scope endpoints
# Records the PM/BML/team filters chosen by the user against their session_id
# so that AI modules can retrieve the scoped entity set by session.
# ---------------------------------------------------------------------------
@app.post("/api/v1/scope", response_model=ScopeResponse)
def record_scope(req: ScopeRequest):
    if req.session_id not in active_sessions:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid or expired session.")
    scope_id = str(uuid.uuid4())
    recorded_at = datetime.now(timezone.utc).isoformat()
    scope_store[req.session_id] = {
        "scope_id": scope_id,
        "session_id": req.session_id,
        "pm": req.pm,
        "bml": req.bml,
        "team": req.team,
        "entity_count": req.entity_count,
        "recorded_at": recorded_at,
    }
    # Also annotate the session so downstream services see it immediately
    active_sessions[req.session_id]["scope"] = {
        "pm": req.pm,
        "bml": req.bml,
        "team": req.team,
        "entity_count": req.entity_count,
        "scope_id": scope_id,
    }
    return ScopeResponse(
        scope_id=scope_id,
        session_id=req.session_id,
        pm=req.pm,
        bml=req.bml,
        team=req.team,
        entity_count=req.entity_count,
        recorded_at=recorded_at,
    )


@app.get("/api/v1/scope/{session_id}")
def get_scope(session_id: str):
    scope = scope_store.get(session_id)
    if not scope:
        raise HTTPException(status_code=404,
                            detail="No scope recorded for this session.")
    return scope


# ---------------------------------------------------------------------------
# Document Extraction
# ---------------------------------------------------------------------------

class ExtractDocumentItem(BaseModel):
    name: str
    type: str
    size: str

class ExtractRequest(BaseModel):
    session_id: str
    documents: list[ExtractDocumentItem]

class ExtractDocumentResult(BaseModel):
    filename: str
    status: str
    confidence: float
    items_found: int

class ExtractResponse(BaseModel):
    job_id: str
    documents_processed: int
    total_documents: int
    overall_confidence: float
    results: list[ExtractDocumentResult]

# Per-document confidence/items for the three default documents
_DOC_PROFILES: dict[str, dict] = {
    "ops risk summary.docx": {"confidence": 0.91, "items_found": 7},
    "incident report.pdf":   {"confidence": 0.97, "items_found": 4},
    "ops workflow.vsdx":     {"confidence": 0.88, "items_found": 3},
}

@app.post("/api/v1/documents/extract", response_model=ExtractResponse)
def extract_documents(req: ExtractRequest):
    if req.session_id not in active_sessions:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")

    results: list[ExtractDocumentResult] = []
    for doc in req.documents:
        profile = _DOC_PROFILES.get(doc.name.lower(), {"confidence": 0.85, "items_found": 2})
        results.append(ExtractDocumentResult(
            filename=doc.name,
            status="success",
            confidence=profile["confidence"],
            items_found=profile["items_found"],
        ))

    total = len(results)
    overall = round(sum(r.confidence for r in results) / total, 4) if total else 0.0

    return ExtractResponse(
        job_id=str(uuid.uuid4()),
        documents_processed=total,
        total_documents=total,
        overall_confidence=overall,
        results=results,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
