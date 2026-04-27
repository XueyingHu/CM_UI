from fastapi import FastAPI, HTTPException, Query, status
from fastapi.responses import JSONResponse
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

# ---------------------------------------------------------------------------
# Rich per-category mock extraction data
# ---------------------------------------------------------------------------

_DOC_EXTRACTIONS: dict[str, dict] = {
    "ops risk summary.docx": {
        "confidence": 0.91,
        "progress": 75,
        "categories": {
            "risk_events": [
                {"id": "RE-102345", "title": "System outage impacting payments",
                 "description": "Critical payment processing failure affecting settlement workflows across retail channels.", "rating": "Critical"},
                {"id": "RE-104118", "title": "Processing delays due to vendor capacity",
                 "description": "Third-party vendor unable to meet SLA commitments, causing batch processing backlogs.", "rating": "Major"},
            ],
            "orac_issues": [
                {"id": "ISS-778901", "title": "Access control gaps in core platform",
                 "description": "Privileged access review identified unreconciled entitlements in the payment gateway admin console.", "rating": "Major"},
                {"id": "ISS-781220", "title": "Incomplete evidence retention for reconciliations",
                 "description": "Daily reconciliation logs not archived beyond 30 days, falling short of 90-day policy requirement.", "rating": "Limited"},
            ],
            "key_risk_indicators": None,
            "key_staff_org_change": None,
            "business_process_change": None,
            "critical_change_program": [
                {"id": "CHG-445612", "title": "Payments platform upgrade",
                 "description": "Major version upgrade to the core payments engine to support ISO 20022 messaging standards.", "phase": "Execution", "go_live": "2026-09-15"},
                {"id": "CHG-447908", "title": "Risk controls monitoring automation rollout",
                 "description": "Automated continuous monitoring controls deployed across Tier-1 risk processes.", "phase": "Design", "go_live": "2026-07-30"},
            ],
            "macro_external_event": None,
            "regulatory_exam_inquiry": None,
            "other_notable_items": None,
        },
    },
    "incident report.pdf": {
        "confidence": 0.97,
        "progress": 75,
        "categories": {
            "risk_events": [
                {"id": "RE-109022", "title": "Data integrity failure in reporting pipeline",
                 "description": "Downstream regulatory reports contained stale data due to an ETL pipeline failure over a 48-hour window.", "rating": "Critical"},
            ],
            "orac_issues": [
                {"id": "ISS-790034", "title": "Manual override procedure not documented",
                 "description": "Operations team applied an undocumented manual override during the incident; no formal runbook exists.", "rating": "Major"},
            ],
            "key_risk_indicators": [
                {"id": "KRI-3301", "title": "Data pipeline failure rate",
                 "description": "Percentage of nightly ETL jobs failing to complete within SLA window — breached threshold of 5%.", "threshold": "5%", "current": "18%"},
            ],
            "key_staff_org_change": None,
            "business_process_change": None,
            "critical_change_program": [
                {"id": "CHG-451100", "title": "Core banking system refresh",
                 "description": "Full replacement of the legacy core banking ledger to support real-time settlement and reporting.", "phase": "Planning", "go_live": "2026-12-01"},
            ],
            "macro_external_event": None,
            "regulatory_exam_inquiry": [
                {"id": "REG-2026-04", "title": "Q1 Regulatory data quality review",
                 "description": "Regulator requested evidence of data lineage and reconciliation controls following the reporting discrepancy."},
            ],
            "other_notable_items": None,
        },
    },
    "ops workflow.vsdx": {
        "confidence": 0.88,
        "progress": 75,
        "categories": {
            "risk_events": None,
            "orac_issues": None,
            "key_risk_indicators": None,
            "key_staff_org_change": [
                {"id": "ORG-2026-01", "title": "New Operations Lead appointed",
                 "description": "Business ownership of the reconciliation workflow transferred to a newly onboarded Ops Lead effective Q1 2026."},
                {"id": "ORG-2026-02", "title": "Ops team restructure Q1",
                 "description": "Reconciliation team split into two squads; reporting lines updated in org chart v3.2."},
            ],
            "business_process_change": [
                {"id": "BPC-887", "title": "Workflow automation for ops reconciliation",
                 "description": "End-to-end reconciliation workflow redesigned to incorporate RPA tooling, reducing manual touch-points by 60%.", "phase": "Discovery", "go_live": "2027-01-15"},
            ],
            "critical_change_program": None,
            "macro_external_event": None,
            "regulatory_exam_inquiry": None,
            "other_notable_items": None,
        },
    },
}

_FALLBACK_EXTRACTION: dict = {
    "confidence": 0.85,
    "progress": 75,
    "categories": {k: None for k in [
        "risk_events", "orac_issues", "key_risk_indicators",
        "key_staff_org_change", "business_process_change", "critical_change_program",
        "macro_external_event", "regulatory_exam_inquiry", "other_notable_items",
    ]},
}

@app.post("/api/v1/documents/extract")
def extract_documents(req: ExtractRequest):
    if req.session_id not in active_sessions:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")

    results = []
    for doc in req.documents:
        profile = _DOC_EXTRACTIONS.get(doc.name.lower(), _FALLBACK_EXTRACTION)
        cats = profile["categories"]
        items_found = sum(1 for v in cats.values() if v is not None)
        results.append({
            "filename": doc.name,
            "status": "success",
            "confidence": profile["confidence"],
            "items_found": items_found,
            "categories": cats,
        })

    total = len(results)
    overall = round(sum(r["confidence"] for r in results) / total, 4) if total else 0.0
    progress = 75  # dummy extraction progress percentage

    return {
        "job_id": str(uuid.uuid4()),
        "documents_processed": total,
        "total_documents": total,
        "overall_confidence": overall,
        "progress": progress,
        "results": results,
    }


# ---------------------------------------------------------------------------
# Database Fetch — enriches extracted IDs with authoritative source records
# ---------------------------------------------------------------------------

class FetchDataRequest(BaseModel):
    session_id: str
    risk_event_ids: list[str] = []
    orac_issue_ids: list[str] = []
    change_program_ids: list[str] = []

# Dummy authoritative database records
_DB_RISK_EVENTS: dict[str, dict] = {
    "RE-102345": {"id": "RE-102345", "title": "System outage impacting payments",
                  "description": "Critical payment processing failure affecting settlement workflows across retail channels.",
                  "rating": "Critical", "status": "Open", "last_updated": "2026-03-18", "source": "ORAC Risk Events"},
    "RE-104118": {"id": "RE-104118", "title": "Processing delays due to vendor capacity",
                  "description": "Third-party vendor unable to meet SLA commitments, causing batch processing backlogs.",
                  "rating": "Major", "status": "Monitoring", "last_updated": "2026-03-22", "source": "ORAC Risk Events"},
    "RE-109022": {"id": "RE-109022", "title": "Data integrity failure in reporting pipeline",
                  "description": "Downstream regulatory reports contained stale data due to ETL pipeline failure over a 48-hour window.",
                  "rating": "Critical", "status": "Open", "last_updated": "2026-04-01", "source": "ORAC Risk Events"},
}

_DB_ORAC_ISSUES: dict[str, dict] = {
    "ISS-778901": {"id": "ISS-778901", "title": "Access control gaps in core platform",
                   "description": "Privileged access review identified unreconciled entitlements in the payment gateway admin console.",
                   "rating": "Major", "status": "In Progress", "remediation_date": "2026-06-30", "source": "ORAC Issues"},
    "ISS-781220": {"id": "ISS-781220", "title": "Incomplete evidence retention for reconciliations",
                   "description": "Daily reconciliation logs not archived beyond 30 days, falling short of 90-day policy requirement.",
                   "rating": "Limited", "status": "Open", "remediation_date": "2026-05-15", "source": "ORAC Issues"},
    "ISS-790034": {"id": "ISS-790034", "title": "Manual override procedure not documented",
                   "description": "Operations team applied undocumented manual override during the incident; no formal runbook exists.",
                   "rating": "Major", "status": "Open", "remediation_date": "2026-07-01", "source": "ORAC Issues"},
}

_DB_CHANGE_PROGRAMS: dict[str, dict] = {
    "CHG-445612": {"id": "CHG-445612", "title": "Payments platform upgrade",
                   "description": "Major version upgrade to the core payments engine to support ISO 20022 messaging standards.",
                   "rating": "Major", "phase": "Execution", "go_live": "2026-09-15", "source": "Navigator"},
    "CHG-447908": {"id": "CHG-447908", "title": "Risk controls monitoring automation rollout",
                   "description": "Automated continuous monitoring controls deployed across Tier-1 risk processes.",
                   "rating": "Limited", "phase": "Design", "go_live": "2026-07-30", "source": "Navigator"},
    "CHG-451100": {"id": "CHG-451100", "title": "Core banking system refresh",
                   "description": "Full replacement of the legacy core banking ledger to support real-time settlement and reporting.",
                   "rating": "Major", "phase": "Planning", "go_live": "2026-12-01", "source": "Navigator"},
    "CHG-460012": {"id": "CHG-460012", "title": "Workflow automation for ops reconciliation",
                   "description": "End-to-end reconciliation workflow redesigned to incorporate RPA tooling, reducing manual touch-points by 60%.",
                   "rating": "Limited", "phase": "Discovery", "go_live": "2027-01-15", "source": "Navigator"},
}

@app.post("/api/v1/database/fetch-data")
def fetch_data(req: FetchDataRequest):
    if req.session_id not in active_sessions:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")

    risk_events, orac_issues, change_programs, not_found = [], [], [], []

    for rid in req.risk_event_ids:
        rec = _DB_RISK_EVENTS.get(rid)
        if rec:
            risk_events.append(rec)
        else:
            not_found.append({"id": rid, "category": "risk_events", "reason": "ID not found in ORAC Risk Events"})

    for iid in req.orac_issue_ids:
        rec = _DB_ORAC_ISSUES.get(iid)
        if rec:
            orac_issues.append(rec)
        else:
            not_found.append({"id": iid, "category": "orac_issues", "reason": "ID not found in ORAC Issues"})

    for cid in req.change_program_ids:
        rec = _DB_CHANGE_PROGRAMS.get(cid)
        if rec:
            change_programs.append(rec)
        else:
            not_found.append({"id": cid, "category": "change_programs", "reason": "ID not found in Navigator"})

    return {
        "fetch_id": str(uuid.uuid4()),
        "session_id": req.session_id,
        "risk_events": risk_events,
        "orac_issues": orac_issues,
        "change_programs": change_programs,
        "not_found": not_found,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Synthesize / Process — AI synthesis of validated database records
# ---------------------------------------------------------------------------

class SynthesizeRequest(BaseModel):
    session_id: str
    fetch_data: dict  # the full fetch_data_result payload

@app.post("/api/v1/synthesize/process")
def synthesize_process(req: SynthesizeRequest):
    if req.session_id not in active_sessions:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")

    risk_events    = req.fetch_data.get("risk_events", [])
    orac_issues    = req.fetch_data.get("orac_issues", [])
    change_programs = req.fetch_data.get("change_programs", [])
    not_found      = req.fetch_data.get("not_found", [])

    # Count criticality
    critical_count = sum(1 for r in risk_events if r.get("rating") == "Critical")
    major_count    = sum(
        sum(1 for x in lst if x.get("rating") == "Major")
        for lst in [risk_events, orac_issues, change_programs]
    )

    overall_rating = "Critical" if critical_count > 0 else ("Major" if major_count > 0 else "Limited")

    return {
        "synthesis_id": str(uuid.uuid4()),
        "session_id": req.session_id,
        "overall_risk_rating": overall_rating,
        "processed_at": datetime.now(timezone.utc).isoformat(),
        "summary": (
            f"Analysis synthesized {len(risk_events)} risk event(s), {len(orac_issues)} ORAC issue(s), "
            f"and {len(change_programs)} change program(s). "
            f"{'Critical risk events were identified requiring immediate attention. ' if critical_count else ''}"
            f"{len(not_found)} item(s) from source documents could not be matched to authoritative records."
        ),
        "key_themes": [
            {"theme": "Payment Processing Resilience",
             "description": "Multiple risk events and changes relate to payment infrastructure stability and upgrade risk.",
             "rating": "Critical"},
            {"theme": "Access & Control Governance",
             "description": "Open issues around access control entitlements and manual override procedures indicate control gaps.",
             "rating": "Major"},
            {"theme": "Data Integrity & Reporting",
             "description": "ETL pipeline failures and reconciliation gaps pose risk to regulatory reporting accuracy.",
             "rating": "Major"},
            {"theme": "Change Programme Oversight",
             "description": f"{len(change_programs)} active change programme(s) require ongoing CM monitoring for go-live risk.",
             "rating": "Limited"},
        ],
        "recommendations": [
            "Prioritise closure of ISS-778901 (access control gaps) before the payments platform go-live.",
            "Establish formal runbook for manual override procedures to address ISS-790034.",
            "Increase monitoring frequency for the ETL pipeline referenced in RE-109022.",
            "Validate unmatched document references against ORAC and Navigator to ensure complete coverage.",
        ],
        "record_counts": {
            "risk_events": len(risk_events),
            "orac_issues": len(orac_issues),
            "change_programs": len(change_programs),
            "not_matched": len(not_found),
        },
    }


# ---------------------------------------------------------------------------
# Executive Summary — final narrative built from fetch data + step 4 analysis
# ---------------------------------------------------------------------------

class ExecSummaryRequest(BaseModel):
    session_id: str
    fetch_data: dict           # fetch_data_result from sessionStorage
    step4_analysis: list[dict] # current (possibly edited) block data from Step 4

@app.post("/api/v1/database/fetch-executive-summary")
def fetch_executive_summary(req: ExecSummaryRequest):
    if req.session_id not in active_sessions:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")

    risk_events     = req.fetch_data.get("risk_events", [])
    orac_issues     = req.fetch_data.get("orac_issues", [])
    change_programs = req.fetch_data.get("change_programs", [])
    not_found       = req.fetch_data.get("not_found", [])
    blocks          = req.step4_analysis

    critical_events  = [r for r in risk_events if r.get("rating") == "Critical"]
    major_issues     = [i for i in orac_issues  if i.get("rating") == "Major"]
    overall_rating   = "Critical" if critical_events else ("Major" if major_issues else "Limited")

    # Build per-block summaries from edited content
    block_summaries = [
        {"event_type": b.get("title", ""), "summary": b.get("summary", ""),
         "rating": b.get("rows", [{}])[0].get("rating", "Limited") if b.get("rows") else "Limited"}
        for b in blocks
    ]

    return {
        "exec_summary_id": str(uuid.uuid4()),
        "session_id": req.session_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "overall_risk_rating": overall_rating,
        "headline": (
            f"The monitoring period identified {len(risk_events)} risk event(s) and "
            f"{len(orac_issues)} open ORAC issue(s) across the monitored domain. "
            f"{'Critical-rated events require immediate escalation. ' if critical_events else ''}"
            f"{len(change_programs)} active change programme(s) represent additional execution risk."
        ),
        "monitoring_conclusion": (
            "Based on the evidence reviewed, the overall CM assessment is rated "
            f"<strong>{overall_rating}</strong>. "
            "The combination of open risk events and unresolved ORAC issues indicates that the control environment "
            "requires enhanced oversight during the current period."
        ),
        "event_summaries": block_summaries,
        "key_actions": [
            {"action": "Escalate critical risk events to Risk Committee within 5 business days",
             "owner": "1st Line Risk", "due": "2026-05-05", "priority": "Critical"},
            {"action": "Confirm remediation plans and owners for all Major-rated ORAC issues",
             "owner": "Issue Owners", "due": "2026-05-15", "priority": "Major"},
            {"action": "Review change programme go-live readiness for CHG-445612",
             "owner": "Change Manager", "due": "2026-06-01", "priority": "Major"},
            {"action": "Follow up on unmatched document references with ORAC/Navigator teams",
             "owner": "CM Team", "due": "2026-05-10", "priority": "Limited"},
        ],
        "statistics": {
            "risk_events": len(risk_events),
            "critical_events": len(critical_events),
            "orac_issues": len(orac_issues),
            "major_issues": len(major_issues),
            "change_programs": len(change_programs),
            "not_matched": len(not_found),
        },
    }


# ---------------------------------------------------------------------------
# fetch-executive-summary-module2
# Combines review_validate_accepted + expand_search_accepted (Audit Universe
# Mapping module) to produce a rich executive-summary payload.
# ---------------------------------------------------------------------------

class ExecSummaryModule2Request(BaseModel):
    session_id: str
    review_validate_accepted: dict = {}   # { events:[], issues:[], changes:[] }
    expand_search_accepted:   dict = {}   # { events:[], issues:[], changes:[] }

@app.post("/api/v1/database/fetch-executive-summary-module2")
def fetch_executive_summary_module2(req: ExecSummaryModule2Request):
    if req.session_id not in active_sessions:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")

    rv  = req.review_validate_accepted
    es  = req.expand_search_accepted

    # Flatten all accepted records across both sources
    all_events  = rv.get("events",  []) + es.get("events",  [])
    all_issues  = rv.get("issues",  []) + es.get("issues",  [])
    all_changes = rv.get("changes", []) + es.get("changes", [])

    total        = len(all_events) + len(all_issues) + len(all_changes)
    critical_cnt = sum(1 for r in all_events  if r.get("rating") == "Critical")
    critical_cnt += sum(1 for r in all_issues if r.get("rating") == "Critical")
    overdue_cnt  = sum(1 for r in all_events + all_issues if r.get("status") == "Overdue")

    overall_rating = "Critical" if critical_cnt > 0 else ("Major" if overdue_cnt > 0 else "Limited")

    # Build per-record finding summaries
    findings = []
    for r in all_events[:5]:
        findings.append({
            "source": "ORAC Risk Event",
            "id": r.get("id", ""),
            "title": r.get("title", ""),
            "rating": r.get("rating", "Medium"),
            "status": r.get("status", "Open"),
            "summary": (
                f"{r.get('title','Event')} was accepted into scope. "
                f"Root cause: {r.get('rootCause','Refer to source record.')} "
                f"Impact: {r.get('impact','Under assessment.')} "
                f"Business unit: {r.get('businessUnit','N/A')}. Region: {r.get('region','N/A')}."
            ),
        })
    for r in all_issues[:4]:
        findings.append({
            "source": "ORAC Issue",
            "id": r.get("id", ""),
            "title": r.get("title", ""),
            "rating": r.get("rating", "Medium"),
            "status": r.get("status", "Open"),
            "summary": (
                f"Issue {r.get('id','')} accepted. "
                f"{r.get('description','Refer to source record.')} "
                f"Region: {r.get('region','N/A')}. BU: {r.get('businessUnit','N/A')}."
            ),
        })
    for r in all_changes[:4]:
        findings.append({
            "source": "Navigator Change",
            "id": r.get("id", ""),
            "title": r.get("title", ""),
            "rating": r.get("rating", "Medium"),
            "status": r.get("status", "Scheduled"),
            "summary": (
                f"Change {r.get('id','')} accepted. "
                f"{r.get('description','Refer to source record.')} "
                f"Region: {r.get('region','N/A')}. BU: {r.get('businessUnit','N/A')}."
            ),
        })

    # Dummy narrative sections (augmented with live counts where possible)
    return {
        "exec_summary_id": str(uuid.uuid4()),
        "session_id": req.session_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "overall_risk_rating": overall_rating,
        "headline": (
            f"The audit universe mapping review identified {len(all_events)} risk event(s), "
            f"{len(all_issues)} open issue(s), and {len(all_changes)} change programme(s) "
            f"accepted for continuous monitoring scope. "
            f"{'Critical-rated items require immediate escalation. ' if critical_cnt else ''}"
            f"Total accepted records: {total}."
        ),
        "monitoring_conclusion": (
            f"Based on the accepted items from both the AI-suggested review and the expanded search, "
            f"the overall CM assessment for this module is rated <strong>{overall_rating}</strong>. "
            f"The control environment across the accepted auditable entities warrants "
            f"{'heightened oversight and prompt remediation of critical findings.' if overall_rating == 'Critical' else 'continued monitoring through the current period.'}"
        ),
        "findings": findings,
        "statistics": {
            "total_accepted": total,
            "risk_events_accepted": len(all_events),
            "issues_accepted": len(all_issues),
            "changes_accepted": len(all_changes),
            "critical_items": critical_cnt,
            "overdue_items": overdue_cnt,
            "from_review_validate": (
                len(rv.get("events",[])) + len(rv.get("issues",[])) + len(rv.get("changes",[]))
            ),
            "from_expand_search": (
                len(es.get("events",[])) + len(es.get("issues",[])) + len(es.get("changes",[]))
            ),
        },
        "key_actions": [
            {"action": "Escalate all Critical-rated accepted events to Risk Committee",
             "owner": "1st Line Risk", "due": "2026-05-05", "priority": "Critical"},
            {"action": "Confirm remediation timelines for Overdue items with issue owners",
             "owner": "Issue Owners", "due": "2026-05-15", "priority": "Major"},
            {"action": "Review change readiness for all accepted Scheduled changes",
             "owner": "Change Manager", "due": "2026-06-01", "priority": "Major"},
            {"action": "Distribute final audit universe mapping report to stakeholders",
             "owner": "CM Team", "due": "2026-05-20", "priority": "Limited"},
        ],
    }


# ---------------------------------------------------------------------------
# Report Download — generates the full CM report from step 3 + step 4 data
# ---------------------------------------------------------------------------

class DownloadReportRequest(BaseModel):
    session_id: str
    fetch_data: dict        # fetch_data_result (step 3 validated records)
    step4_analysis: list[dict] = []  # current (possibly edited) step 4 blocks
    exec_summary: dict = {}  # exec_summary_result if available

@app.post("/api/v1/report/download-cm-report")
def download_cm_report(req: DownloadReportRequest):
    if req.session_id not in active_sessions:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")

    risk_events     = req.fetch_data.get("risk_events", [])
    orac_issues     = req.fetch_data.get("orac_issues", [])
    change_programs = req.fetch_data.get("change_programs", [])
    not_found       = req.fetch_data.get("not_found", [])

    critical_events = [r for r in risk_events if r.get("rating") == "Critical"]
    major_issues    = [i for i in orac_issues  if i.get("rating") == "Major"]
    overall_rating  = req.exec_summary.get("overall_risk_rating") or (
        "Critical" if critical_events else ("Major" if major_issues else "Limited")
    )

    now = datetime.now(timezone.utc)

    report = {
        "report_id": str(uuid.uuid4()),
        "report_title": "Continuous Monitoring Report",
        "monitoring_period": "Q1 2026",
        "generated_at": now.isoformat(),
        "generated_by": active_sessions.get(req.session_id, {}).get("full_name", "system.user"),
        "overall_risk_rating": overall_rating,

        "executive_summary": {
            "headline": req.exec_summary.get("headline") or (
                f"The monitoring period identified {len(risk_events)} risk event(s) and "
                f"{len(orac_issues)} open ORAC issue(s) across the monitored domain."
            ),
            "conclusion": req.exec_summary.get("monitoring_conclusion") or (
                f"Overall CM assessment is rated {overall_rating}. "
                "Control environment requires enhanced oversight during the current period."
            ),
            "statistics": {
                "risk_events_total": len(risk_events),
                "critical_risk_events": len(critical_events),
                "orac_issues_total": len(orac_issues),
                "major_issues": len(major_issues),
                "change_programs": len(change_programs),
                "unmatched_references": len(not_found),
            },
        },

        "validated_records": {
            "risk_events": risk_events,
            "orac_issues": orac_issues,
            "change_programs": change_programs,
            "not_found": not_found,
        },

        "event_analysis": [
            {
                "event_type": b.get("title", ""),
                "summary": b.get("summary", ""),
                "rows": b.get("rows", []),
            }
            for b in req.step4_analysis
        ],

        "key_actions": req.exec_summary.get("key_actions") or [
            {"action": "Escalate critical risk events to Risk Committee within 5 business days",
             "owner": "1st Line Risk", "due": "2026-05-05", "priority": "Critical"},
            {"action": "Confirm remediation plans for all Major-rated ORAC issues",
             "owner": "Issue Owners", "due": "2026-05-15", "priority": "Major"},
            {"action": "Review change programme go-live readiness",
             "owner": "Change Manager", "due": "2026-06-01", "priority": "Major"},
        ],

        "source_documents": [
            "Risk Management Forum, Q1 — Quarterly Notes.docx",
            "Operations Risk Committee Meeting Pack.pdf",
            "Ops Risk Committee Minutes.docx",
            "Technology Governance Deck.pptx",
        ],

        "metadata": {
            "workflow": "Documents to Insights",
            "steps_completed": ["Upload", "Extract", "Validate", "Analyze", "Finalize"],
            "report_version": "1.0",
        },
    }

    return JSONResponse(content=report, headers={
        "Content-Disposition": f'attachment; filename="cm-report-{now.strftime("%Y%m%d")}.json"',
        "Content-Type": "application/json",
    })


# ---------------------------------------------------------------------------
# Publish CM Report — finalises and "publishes" the CM report
# ---------------------------------------------------------------------------

class PublishReportRequest(BaseModel):
    session_id: str
    fetch_data: dict = {}
    step4_analysis: list[dict] = []
    exec_summary: dict = {}

@app.post("/api/v1/report/publish-cm-report")
def publish_cm_report(req: PublishReportRequest):
    if req.session_id not in active_sessions:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")

    risk_events     = req.fetch_data.get("risk_events", [])
    orac_issues     = req.fetch_data.get("orac_issues", [])
    change_programs = req.fetch_data.get("change_programs", [])
    not_found       = req.fetch_data.get("not_found", [])

    critical_events = [r for r in risk_events if r.get("rating") == "Critical"]
    major_issues    = [i for i in orac_issues  if i.get("rating") == "Major"]
    overall_rating  = req.exec_summary.get("overall_risk_rating") or (
        "Critical" if critical_events else ("Major" if major_issues else "Limited")
    )

    now = datetime.now(timezone.utc)
    report_ref = f"CM-{now.strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"

    report = {
        "report_id": str(uuid.uuid4()),
        "report_ref": report_ref,
        "report_title": "Continuous Monitoring Report",
        "monitoring_period": "Q1 2026",
        "status": "Published",
        "published_at": now.isoformat(),
        "generated_by": active_sessions.get(req.session_id, {}).get("full_name", "system.user"),
        "overall_risk_rating": overall_rating,
        "executive_summary": {
            "headline": req.exec_summary.get("headline") or (
                f"The monitoring period identified {len(risk_events)} risk event(s) and "
                f"{len(orac_issues)} open ORAC issue(s) across the monitored domain."
            ),
            "conclusion": req.exec_summary.get("monitoring_conclusion") or (
                f"Overall CM assessment is rated {overall_rating}. "
                "Control environment requires enhanced oversight during the current period."
            ),
            "statistics": {
                "risk_events_total": len(risk_events),
                "critical_risk_events": len(critical_events),
                "orac_issues_total": len(orac_issues),
                "major_issues": len(major_issues),
                "change_programs": len(change_programs),
                "unmatched_references": len(not_found),
            },
        },
        "validated_records": {
            "risk_events": risk_events,
            "orac_issues": orac_issues,
            "change_programs": change_programs,
            "not_found": not_found,
        },
        "event_analysis": [
            {"event_type": b.get("title", ""), "summary": b.get("summary", ""), "rows": b.get("rows", [])}
            for b in req.step4_analysis
        ],
        "key_actions": req.exec_summary.get("key_actions") or [
            {"action": "Escalate critical risk events to Risk Committee within 5 business days",
             "owner": "1st Line Risk", "due": "2026-05-05", "priority": "Critical"},
            {"action": "Confirm remediation plans for all Major-rated ORAC issues",
             "owner": "Issue Owners", "due": "2026-05-15", "priority": "Major"},
            {"action": "Review change programme go-live readiness",
             "owner": "Change Manager", "due": "2026-06-01", "priority": "Major"},
        ],
        "source_documents": [
            "Risk Management Forum, Q1 — Quarterly Notes.docx",
            "Operations Risk Committee Meeting Pack.pdf",
            "Ops Risk Committee Minutes.docx",
            "Technology Governance Deck.pptx",
        ],
        "metadata": {
            "workflow": "Documents to Insights",
            "steps_completed": ["Upload", "Extract", "Validate", "Analyze", "Finalize"],
            "report_version": "1.0",
            "report_ref": report_ref,
        },
    }

    filename = f"cm-report-{now.strftime('%Y%m%d')}.json"
    return JSONResponse(content=report, headers={
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Content-Type": "application/json",
        "X-Report-Ref": report_ref,
    })


# ---------------------------------------------------------------------------
# Expanded Search — filtered search across ORAC risk events, issues, Navigator
# ---------------------------------------------------------------------------

class ExpandedSearchFilters(BaseModel):
    date_from: str = ""
    date_to: str = ""
    rating: str = "Any"
    status: str = "Any"
    region: str = "Any"
    business_unit: str = "Any"
    ai_text: str = ""

class ExpandedSearchRequest(BaseModel):
    session_id: str
    filters: ExpandedSearchFilters = ExpandedSearchFilters()

_EXPANDED_RISK_EVENTS = [
    {"id": "EVT-117502", "title": "EVENT 117502 System Failure Causing Delayed Payment Processing",
     "rating": "Major", "status": "Open", "date": "08/10/2024",
     "description": "Critical payment processing system experienced a 4-hour outage affecting settlement workflows and downstream reconciliation.",
     "root_cause": "Database deadlock during peak transaction window caused by insufficient connection pool configuration.",
     "impact": "Delayed settlement of approximately $2.4M in transactions; regulatory reporting window breached.",
     "business_unit": "Technology", "region": "North America",
     "tagged_ae": "AE-1023 Payments Processing Platform"},
    {"id": "EVT-118643", "title": "EVENT 118643 Recurring ACH Fraud Incidents Detected",
     "rating": "Critical", "status": "Open", "date": "07/25/2024",
     "description": "Automated clearing house fraud detection flagged 47 suspicious transactions over a 2-week period.",
     "root_cause": "Threshold-based fraud rules not updated to reflect new transaction velocity patterns.",
     "impact": "Potential financial exposure of $680K; customer trust risk and regulatory scrutiny.",
     "business_unit": "Operations", "region": "North America",
     "tagged_ae": "AE-2044 Identity and Access Management"},
    {"id": "EVT-119205", "title": "EVENT 119205 Third-party Outage Impacting Reconciliations",
     "rating": "Major", "status": "Open", "date": "08/02/2024",
     "description": "A key third-party data vendor experienced a 6-hour outage, preventing automated reconciliation runs.",
     "root_cause": "Vendor SLA breach; no secondary data feed configured for failover.",
     "impact": "Manual reconciliation required for 3 business days; increased operational risk and staff overtime.",
     "business_unit": "Finance", "region": "EMEA",
     "tagged_ae": "AE-3301 Financial Controls Oversight"},
    {"id": "EVT-120440", "title": "EVENT 120440 Unauthorised Data Access in Customer Portal",
     "rating": "Critical", "status": "Open", "date": "09/05/2024",
     "description": "Internal audit detected an access control gap allowing elevated read permissions on customer PII fields.",
     "root_cause": "Role-based access policy not enforced following a platform migration in Q1.",
     "impact": "Potential data privacy breach; notifiable under GDPR; legal and regulatory review initiated.",
     "business_unit": "Technology", "region": "EMEA",
     "tagged_ae": "AE-2044 Identity and Access Management"},
    {"id": "EVT-121008", "title": "EVENT 121008 IT Change Implemented Without Proper Approval",
     "rating": "Major", "status": "Open", "date": "09/18/2024",
     "description": "A production configuration change was deployed outside the approved change window without CAB sign-off.",
     "root_cause": "Developer bypassed change management controls using a break-glass account.",
     "impact": "Service degradation for 90 minutes; change management policy breach; disciplinary review in progress.",
     "business_unit": "Technology", "region": "Global",
     "tagged_ae": "AE-4102 Regulatory Reporting"},
]

_EXPANDED_ORAC_ISSUES = [
    {"id": "ISS-410293", "title": "ISSUE 410293 Data Privacy Compliance Gap in Customer Onboarding",
     "rating": "High", "status": "Open", "date": "08/15/2024",
     "description": "Customer onboarding workflow collects consent data without explicit opt-in for secondary processing, violating GDPR Article 7.",
     "root_cause": "Legacy onboarding form template not updated following 2023 data protection policy revision.",
     "impact": "Regulatory fine risk; potential customer complaints; remediation requires form redesign and data cleanse.",
     "business_unit": "Compliance", "region": "EMEA",
     "tagged_ae": "AE-5099 Records Management"},
    {"id": "ISS-412558", "title": "ISSUE 412558 Missing Sign-off on Q2 Financial Reconciliation",
     "rating": "Medium", "status": "Open", "date": "07/10/2024",
     "description": "End-of-quarter financial reconciliation sign-off was not completed within the required 5-day window.",
     "root_cause": "Process owner on extended leave; no documented backup approval authority assigned.",
     "impact": "Delayed financial close; audit finding raised; process documentation requires updating.",
     "business_unit": "Finance", "region": "North America",
     "tagged_ae": "AE-3301 Financial Controls Oversight"},
    {"id": "ISS-415002", "title": "ISSUE 415002 Segregation of Duties Violation in Payments Approvals",
     "rating": "High", "status": "Open", "date": "09/01/2024",
     "description": "Single individual has both initiation and approval rights on payment transactions exceeding the $50K threshold.",
     "root_cause": "Entitlement review did not flag combined role conflict; approval workflow misconfigured in the upgrade.",
     "impact": "Fraud risk; control effectiveness rated inadequate; immediate entitlement remediation required.",
     "business_unit": "Operations", "region": "North America",
     "tagged_ae": "AE-1023 Payments Processing Platform"},
    {"id": "ISS-416780", "title": "ISSUE 416780 Incomplete Vendor Risk Assessment for Critical Supplier",
     "rating": "Medium", "status": "Overdue", "date": "06/20/2024",
     "description": "Annual risk assessment for a Tier-1 technology vendor was not completed within the required assessment cycle.",
     "root_cause": "Vendor Risk team capacity constraints; assessment ownership gap following team restructure.",
     "impact": "Unvalidated third-party risk exposure; regulatory expectation breach; escalated to CPO.",
     "business_unit": "Security", "region": "Global",
     "tagged_ae": "AE-4102 Regulatory Reporting"},
]

_EXPANDED_NAVIGATOR_CHANGES = [
    {"id": "CHG-90221", "title": "CHG 90221 Migration to New Cloud Infrastructure Provider",
     "rating": "High", "status": "Scheduled", "date": "09/20/2024",
     "description": "Full lift-and-shift migration of on-premise batch processing workloads to a new cloud provider.",
     "root_cause": "Strategic decision to exit legacy data centre contract.",
     "impact": "Significant execution risk during migration window; 72-hour rollback plan required.",
     "business_unit": "Technology", "region": "Global",
     "tagged_ae": "AE-1023 Payments Processing Platform"},
    {"id": "CHG-91450", "title": "CHG 91450 Core Payments Engine Version Upgrade",
     "rating": "High", "status": "Scheduled", "date": "10/15/2024",
     "description": "Major version upgrade to the payments engine to support ISO 20022 message format.",
     "root_cause": "Regulatory mandate requiring ISO 20022 compliance by Q1 2025.",
     "impact": "Downstream system integration testing required; potential processing delays during cutover.",
     "business_unit": "Technology", "region": "North America",
     "tagged_ae": "AE-1023 Payments Processing Platform"},
    {"id": "CHG-92018", "title": "CHG 92018 Identity Provider Replacement Programme",
     "rating": "Major", "status": "Scheduled", "date": "11/01/2024",
     "description": "Replacement of legacy SSO identity provider with a modern cloud-native IAM platform.",
     "root_cause": "End-of-life announcement from current vendor; security vulnerability in legacy platform.",
     "impact": "User access disruption risk; MFA re-enrolment required for all 12,000 staff.",
     "business_unit": "Security", "region": "Global",
     "tagged_ae": "AE-2044 Identity and Access Management"},
    {"id": "CHG-93104", "title": "CHG 93104 Automated Reconciliation Workflow Deployment",
     "rating": "Medium", "status": "Completed", "date": "08/30/2024",
     "description": "RPA-based automated reconciliation deployed across 8 operational processes.",
     "root_cause": "Efficiency initiative to reduce manual reconciliation touch-points by 60%.",
     "impact": "Successfully completed; 2 minor defects resolved in UAT; post-implementation review pending.",
     "business_unit": "Operations", "region": "North America",
     "tagged_ae": "AE-3301 Financial Controls Oversight"},
]

def _matches_filters(record: dict, f: ExpandedSearchFilters) -> bool:
    if f.rating != "Any" and record.get("rating", "").lower() != f.rating.lower():
        return False
    if f.status != "Any" and record.get("status", "").lower() != f.status.lower():
        return False
    if f.region != "Any" and record.get("region", "").lower() != f.region.lower():
        return False
    if f.business_unit != "Any" and record.get("business_unit", "").lower() != f.business_unit.lower():
        return False
    if f.ai_text:
        needle = f.ai_text.lower()
        haystack = " ".join([
            record.get("title", ""), record.get("description", ""),
            record.get("root_cause", ""), record.get("impact", ""),
        ]).lower()
        if needle not in haystack:
            # Loose keyword match: check any word
            keywords = [w for w in needle.split() if len(w) > 3]
            if not any(kw in haystack for kw in keywords):
                return False
    return True

@app.post("/api/v1/database/fetch-expanded-search")
def fetch_expanded_search(req: ExpandedSearchRequest):
    if req.session_id not in active_sessions:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")

    f = req.filters
    risk_events      = [r for r in _EXPANDED_RISK_EVENTS      if _matches_filters(r, f)]
    orac_issues      = [r for r in _EXPANDED_ORAC_ISSUES      if _matches_filters(r, f)]
    navigator_changes= [r for r in _EXPANDED_NAVIGATOR_CHANGES if _matches_filters(r, f)]

    return {
        "search_id": str(uuid.uuid4()),
        "filters_applied": f.model_dump(),
        "total_count": len(risk_events) + len(orac_issues) + len(navigator_changes),
        "risk_events": risk_events,
        "orac_issues": orac_issues,
        "navigator_changes": navigator_changes,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
