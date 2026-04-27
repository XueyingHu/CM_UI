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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
