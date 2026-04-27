import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Check, X, ChevronDown, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const NAVY = "#0b2a4a";
const BORDER = "#e6e9ef";
const MUTED = "#5b6b7a";
const TEXT = "#122033";

// ── Category display config ──────────────────────────────────────────────────
const CATEGORIES: { key: string; label: string }[] = [
  { key: "risk_events",           label: "Risk Events" },
  { key: "orac_issues",           label: "ORAC Issues" },
  { key: "key_risk_indicators",   label: "Key Risk Indicators" },
  { key: "key_staff_org_change",  label: "Key Staff / Org Change" },
  { key: "business_process_change", label: "Business Process Change" },
  { key: "critical_change_program", label: "Critical Change Program" },
  { key: "macro_external_event",  label: "Macro External Event" },
  { key: "regulatory_exam_inquiry", label: "Regulatory Exam / Inquiry" },
  { key: "other_notable_items",   label: "Other Notable Items" },
];

// ── Types ────────────────────────────────────────────────────────────────────
interface ExtractedItem {
  id: string;
  title: string;
  description: string;
  rating?: string;
  phase?: string;
  go_live?: string;
  threshold?: string;
  current?: string;
}

interface DocResult {
  filename: string;
  status: string;
  confidence: number;
  items_found: number;
  categories: Record<string, ExtractedItem[] | null>;
}

interface ExtractResult {
  job_id: string;
  documents_processed: number;
  total_documents: number;
  overall_confidence: number;
  progress: number;
  results: DocResult[];
}

// ── Rating badge ──────────────────────────────────────────────────────────────
const RATING_COLOR: Record<string, string> = {
  Critical: "#b42318",
  Major: "#b54708",
  Limited: "#1f5ea8",
};

function RatingBadge({ rating }: { rating: string }) {
  const color = RATING_COLOR[rating] ?? "#4a5568";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 900,
      border: `1px solid ${color}30`,
      background: `${color}0d`,
      color,
      whiteSpace: "nowrap",
    }}>
      {rating}
    </span>
  );
}

// ── Extracted item detail card ────────────────────────────────────────────────
function ItemCard({ item }: { item: ExtractedItem }) {
  return (
    <div style={{
      background: "#f9fbff",
      border: "1px solid #dce8f8",
      borderRadius: 8,
      padding: "10px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11.5, fontWeight: 900, color: "#1f5ea8", fontFamily: "monospace" }}>
          {item.id}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 900, color: TEXT }}>
          {item.title}
        </span>
        {item.rating && <RatingBadge rating={item.rating} />}
        {item.phase && (
          <span style={{ fontSize: 11, fontWeight: 700, color: MUTED }}>
            Phase: {item.phase}
          </span>
        )}
        {item.go_live && (
          <span style={{ fontSize: 11, fontWeight: 700, color: MUTED }}>
            Go-live: {item.go_live}
          </span>
        )}
        {item.threshold && (
          <span style={{ fontSize: 11, fontWeight: 700, color: "#b54708" }}>
            Threshold: {item.threshold} / Current: {item.current}
          </span>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
        {item.description}
      </p>
    </div>
  );
}

// ── Category row ──────────────────────────────────────────────────────────────
function CategoryRow({ label, items, filename }: {
  label: string;
  items: ExtractedItem[] | null;
  filename: string;
}) {
  const [open, setOpen] = useState(false);
  const found = items !== null && items.length > 0;

  return (
    <div style={{ borderBottom: `1px solid #eef2f7` }}>
      {/* Row */}
      <div
        onClick={() => found && setOpen(o => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          cursor: found ? "pointer" : "default",
          background: "#fff",
          userSelect: "none",
        }}
      >
        {/* Check / Cross */}
        <div style={{
          width: 22, height: 22, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {found ? (
            <Check size={17} color="#2c7a3f" strokeWidth={3} />
          ) : (
            <X size={17} color="#c93b3b" strokeWidth={3} />
          )}
        </div>

        {/* Label + source */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{label}</span>
          <span style={{
            fontSize: 13, fontStyle: "italic", fontWeight: 600,
            color: found ? "#1e3a6a" : "#c93b3b",
            marginLeft: 4,
          }}>
            {found ? `(${filename})` : "Not Found"}
          </span>
        </div>

        {/* Expand chevron */}
        {found && (
          <div style={{ color: MUTED, flexShrink: 0 }}>
            {open
              ? <ChevronDown size={15} />
              : <ChevronRight size={15} />}
          </div>
        )}
      </div>

      {/* Expanded items */}
      {found && open && (
        <div style={{
          padding: "0 14px 12px 46px",
          display: "flex", flexDirection: "column", gap: 8,
          background: "#fff",
        }}>
          {items!.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Dummy fallback data (shown when no API result is stored yet) ─────────────
const DUMMY_RESULT: ExtractResult = {
  job_id: "demo-job",
  documents_processed: 3,
  total_documents: 3,
  overall_confidence: 0.92,
  progress: 75,
  results: [
    {
      filename: "Ops Risk Summary.docx",
      status: "success",
      confidence: 0.91,
      items_found: 4,
      categories: {
        risk_events: [
          { id: "RE-102345", title: "System outage impacting payments", description: "Critical payment processing failure affecting settlement workflows across retail channels.", rating: "Critical" },
          { id: "RE-104118", title: "Processing delays due to vendor capacity", description: "Third-party vendor unable to meet SLA commitments, causing batch processing backlogs.", rating: "Major" },
        ],
        orac_issues: [
          { id: "ISS-778901", title: "Access control gaps in core platform", description: "Privileged access review identified unreconciled entitlements in the payment gateway admin console.", rating: "Major" },
          { id: "ISS-781220", title: "Incomplete evidence retention for reconciliations", description: "Daily reconciliation logs not archived beyond 30 days, falling short of 90-day policy requirement.", rating: "Limited" },
        ],
        key_risk_indicators: null,
        key_staff_org_change: null,
        business_process_change: null,
        critical_change_program: [
          { id: "CHG-445612", title: "Payments platform upgrade", description: "Major version upgrade to the core payments engine to support ISO 20022 messaging standards.", phase: "Execution", go_live: "2026-09-15" },
          { id: "CHG-447908", title: "Risk controls monitoring automation rollout", description: "Automated continuous monitoring controls deployed across Tier-1 risk processes.", phase: "Design", go_live: "2026-07-30" },
        ],
        macro_external_event: null,
        regulatory_exam_inquiry: null,
        other_notable_items: null,
      },
    },
    {
      filename: "Incident Report.pdf",
      status: "success",
      confidence: 0.97,
      items_found: 5,
      categories: {
        risk_events: [
          { id: "RE-109022", title: "Data integrity failure in reporting pipeline", description: "Downstream regulatory reports contained stale data due to an ETL pipeline failure over a 48-hour window.", rating: "Critical" },
        ],
        orac_issues: [
          { id: "ISS-790034", title: "Manual override procedure not documented", description: "Operations team applied an undocumented manual override during the incident; no formal runbook exists.", rating: "Major" },
        ],
        key_risk_indicators: [
          { id: "KRI-3301", title: "Data pipeline failure rate", description: "Percentage of nightly ETL jobs failing to complete within the SLA window — breached threshold of 5%.", threshold: "5%", current: "18%" },
        ],
        key_staff_org_change: null,
        business_process_change: null,
        critical_change_program: [
          { id: "CHG-451100", title: "Core banking system refresh", description: "Full replacement of the legacy core banking ledger to support real-time settlement and reporting.", phase: "Planning", go_live: "2026-12-01" },
        ],
        macro_external_event: null,
        regulatory_exam_inquiry: [
          { id: "REG-2026-04", title: "Q1 Regulatory data quality review", description: "Regulator requested evidence of data lineage and reconciliation controls following the reporting discrepancy." },
        ],
        other_notable_items: null,
      },
    },
    {
      filename: "Ops Workflow.vsdx",
      status: "success",
      confidence: 0.88,
      items_found: 2,
      categories: {
        risk_events: null,
        orac_issues: null,
        key_risk_indicators: null,
        key_staff_org_change: [
          { id: "ORG-2026-01", title: "New Operations Lead appointed", description: "Business ownership of the reconciliation workflow transferred to a newly onboarded Ops Lead effective Q1 2026." },
          { id: "ORG-2026-02", title: "Ops team restructure Q1", description: "Reconciliation team split into two squads; reporting lines updated in org chart v3.2." },
        ],
        business_process_change: [
          { id: "BPC-887", title: "Workflow automation for ops reconciliation", description: "End-to-end reconciliation workflow redesigned to incorporate RPA tooling, reducing manual touch-points by 60%.", phase: "Discovery", go_live: "2027-01-15" },
        ],
        critical_change_program: null,
        macro_external_event: null,
        regulatory_exam_inquiry: null,
        other_notable_items: null,
      },
    },
  ],
};

const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

// ── Main page ────────────────────────────────────────────────────────────────
export default function Step2Extract() {
  const [, setLocation] = useLocation();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [fetching, setFetching] = useState(false);

  const stored: ExtractResult | null = (() => {
    try { return JSON.parse(sessionStorage.getItem("extract_result") || "null"); } catch { return null; }
  })();

  // Use stored API result if it has categories; otherwise show dummy data
  const extractResult: ExtractResult =
    stored?.results?.[0]?.categories ? stored : DUMMY_RESULT;

  const handleNext = async () => {
    if (fetching) return;
    setFetching(true);
    try {
      // Collect IDs for the three categories that go to the database fetch
      const riskIds: string[] = [];
      const issueIds: string[] = [];
      const changeIds: string[] = [];

      for (const doc of extractResult.results) {
        for (const item of doc.categories["risk_events"] ?? [])
          riskIds.push(item.id);
        for (const item of doc.categories["orac_issues"] ?? [])
          issueIds.push(item.id);
        for (const item of doc.categories["critical_change_program"] ?? [])
          changeIds.push(item.id);
      }

      const sessionId = sessionStorage.getItem("session_id") || "";
      const res = await fetch(`${API_BASE}/api/v1/database/fetch-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          risk_event_ids: riskIds,
          orac_issue_ids: issueIds,
          change_program_ids: changeIds,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem("fetch_data_result", JSON.stringify(data));
      }
    } catch {
      // Navigate regardless — Step 3 has its own static data as fallback
    } finally {
      setFetching(false);
      setLocation("/step-3");
    }
  };

  const targetProgress = extractResult?.progress ?? 75;

  // Animate progress bar on mount
  useEffect(() => {
    const t = setTimeout(() => setDisplayProgress(targetProgress), 400);
    return () => clearTimeout(t);
  }, [targetProgress]);

  const selectedPm   = sessionStorage.getItem("selectedDomain") || "";
  const selectedBml  = sessionStorage.getItem("selectedBml") || "";
  const selectedTeam = sessionStorage.getItem("selectedTeam") || "";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>

      {/* Breadcrumb */}
      <div style={{
        background: "#fff", borderBottom: `1px solid ${BORDER}`,
        padding: "10px 18px", fontSize: 12.5, color: MUTED, fontWeight: 600,
      }}>
        <span style={{ color: TEXT, fontWeight: 900 }}>Home</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: TEXT, fontWeight: 900 }}>Documents to Insights</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: TEXT, fontWeight: 900 }}>Step 2.</span>&nbsp;Extract Key Events
      </div>

      {/* Scope bar */}
      <div style={{
        background: "#fff", borderBottom: `1px solid ${BORDER}`,
        padding: "10px 18px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 14, flexWrap: "wrap",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 10px", borderRadius: 999,
          border: "1px solid rgba(11,42,74,0.15)", background: "rgba(11,42,74,0.08)",
          color: NAVY, fontSize: 12, fontWeight: 900, whiteSpace: "nowrap",
        }}>
          Monitoring Scope
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {[
            selectedPm   ? { k: "PM:",   v: selectedPm   } : null,
            selectedBml  ? { k: "BML:",  v: selectedBml  } : null,
            selectedTeam ? { k: "Team:", v: selectedTeam } : null,
          ].filter(Boolean).map(({ k, v }) => (
            <div key={k} style={{
              display: "flex", gap: 8, alignItems: "baseline",
              padding: "6px 10px", borderRadius: 10,
              background: "#f7f9fd", border: "1px solid #eef2f7",
              fontSize: 12.5, whiteSpace: "nowrap",
            }}>
              <span style={{ color: MUTED, fontWeight: 700 }}>{k}</span>
              <span style={{ color: TEXT, fontWeight: 900 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ padding: "16px 18px 24px", flex: 1 }}>
        <div style={{
          background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12,
          boxShadow: "0 6px 18px rgba(16,24,40,0.08)", padding: 16, maxWidth: 1000,
        }}>

          {/* Card header */}
          <h1 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 900, color: TEXT }}>
            Step 2. Extract Key Events
          </h1>
          <p style={{ margin: "0 0 18px", fontSize: 12.8, color: MUTED, lineHeight: 1.4 }}>
            Extracting key information from documents. Click any found category to view extracted details.
          </p>

          {/* Progress bar */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: TEXT, fontWeight: 700, marginBottom: 10 }}>
              Extracting key information from documents…
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, maxWidth: 600 }}>
              <div style={{ flex: 1 }}>
                <Progress
                  value={displayProgress}
                  className="h-5 rounded-none border border-[#c5cdd4] bg-[#f4f6f8] [&>div]:bg-[#2c4b7e] [&>div]:transition-all [&>div]:duration-700"
                />
              </div>
              <span style={{ fontWeight: 900, fontSize: 14, color: TEXT, minWidth: 40 }}>
                {displayProgress}%
              </span>
            </div>
          </div>

          {/* Per-document sections */}
          {extractResult.results.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {extractResult.results.map((doc) => (
                <div key={doc.filename}>
                  <h2 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 900, color: "#1e3a6a" }}>
                    {doc.filename}
                  </h2>
                  <div style={{
                    border: "1px solid #c5cdd4", borderRadius: 6,
                    background: "#fff", overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(16,24,40,0.05)",
                  }}>
                    {CATEGORIES.map((cat, i) => (
                      <div key={cat.key} style={{ borderBottom: i === CATEGORIES.length - 1 ? "none" : undefined }}>
                        <CategoryRow
                          label={cat.label}
                          items={doc.categories?.[cat.key] ?? null}
                          filename={doc.filename}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Fallback when navigated directly without going through Step 1
            <div style={{
              padding: "28px 16px", textAlign: "center",
              border: "1px dashed #c5cdd4", borderRadius: 8, color: MUTED, fontSize: 13,
            }}>
              No extraction data available. Please go back to Step 1 and upload documents first.
            </div>
          )}

          {/* Footer */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: 24, paddingTop: 14, borderTop: `1px solid ${BORDER}`,
          }}>
            <button
              data-testid="button-back"
              onClick={() => setLocation("/step-1")}
              style={{
                background: "#fff", color: TEXT,
                border: "1px solid #c5cdd4", borderRadius: 6,
                padding: "9px 24px", fontWeight: 700, fontSize: 13,
                cursor: "pointer",
              }}
            >
              Back
            </button>
            <button
              data-testid="button-continue"
              onClick={handleNext}
              disabled={fetching}
              style={{
                background: fetching ? "#3a5a78" : "#1e3a6a", color: "#fff",
                border: "none", borderRadius: 6,
                padding: "9px 24px", fontWeight: 700, fontSize: 13,
                cursor: fetching ? "not-allowed" : "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
                transition: "background 0.2s",
              }}
            >
              {fetching ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    style={{ animation: "spin 0.9s linear infinite", flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Fetching…
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={15} />
                </>
              )}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>

        </div>
      </div>
    </div>
  );
}
