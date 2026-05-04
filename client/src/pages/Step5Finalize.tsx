import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronRight, ChevronDown, FileText, Send } from "lucide-react";

const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

const NAVY = "#0b2a4a";
const BORDER = "#e6e9ef";
const MUTED = "#5b6b7a";
const TEXT = "#122033";
const DIVIDER = "#eef2f7";

const TABS = [
  { key: "events", label: "Internal Risk Events" },
  { key: "issues", label: "Known Issues" },
  { key: "reg",    label: "Regulatory Exams" },
];

/* ─── Donut chart ─────────────────────────────────────── */
interface Slice { label: string; value: number; color: string; }

function DonutChart({ slices, label }: { slices: Slice[]; label: string }) {
  const total = slices.reduce((s, r) => s + r.value, 0);
  const R = 52; const cx = 70; const cy = 70; const stroke = 18;
  const circumference = 2 * Math.PI * R;
  let offset = 0;
  const segments = slices.map(s => {
    const pct = s.value / total;
    const dash = pct * circumference;
    const seg = { ...s, dash, offset, pct };
    offset += dash;
    return seg;
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={140} height={140}>
        {segments.map((seg, i) => (
          <circle
            key={i} cx={cx} cy={cy} r={R} fill="none"
            stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-seg.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={9} fill={MUTED} fontWeight={700}>{label}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={18} fill={TEXT} fontWeight={900}>{total}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {slices.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ color: TEXT, fontWeight: 700, minWidth: 60 }}>{s.label}</span>
            <span style={{ color: MUTED, fontWeight: 900 }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Register row ─────────────────────────────────────── */
interface RegRow {
  id: string; title: string; rating: string; status: string;
  source: string; assureAE: string; additionalAE: string;
  rationale: string; expanded: boolean;
}

const REGISTER_ROWS: RegRow[] = [
  {
    id: "r1", title: "ISSUE 778901", rating: "Critical", status: "Open",
    source: "Risk Management Forum, Q1 — Quarterly Notes.docx",
    assureAE: "AE‑1023 Payments Processing Platform, AE‑2044 Identity and Access Management",
    additionalAE: "AE‑3301 Financial Controls Oversight",
    rationale: "Weaknesses in access provisioning may impact downstream financial controls and oversight processes beyond the primary application.",
    expanded: false,
  },
  {
    id: "r2", title: "ISSUE 781220", rating: "Major", status: "Overdue",
    source: "Ops Risk Committee — Meeting Pack.pdf",
    assureAE: "AE‑2210 Issue Management",
    additionalAE: "AE‑3301 Financial Controls Oversight",
    rationale: "Delayed remediation increases the likelihood of control failures and audit findings across dependent processes.",
    expanded: false,
  },
  {
    id: "r3", title: "ILS 5678", rating: "Limited", status: "Open",
    source: "Risk Management Forum, Q1 — Meeting Pack.pdf",
    assureAE: "AE‑4102 Regulatory Reporting",
    additionalAE: "AE‑5099 Records Management",
    rationale: "Evidence retention controls are shared across multiple compliance and reporting processes.",
    expanded: false,
  },
];

const RATING_COLOR: Record<string, string> = { Critical: "#b42318", Major: "#b54708", Limited: "#1f5ea8", High: "#b54708", Medium: "#1f5ea8", Low: "#1f7a3f" };
const STATUS_COLOR: Record<string, string>  = { Overdue: "#b42318", Open: "#1f5ea8", Closed: "#1f7a3f", Scheduled: "#6d28d9" };

const SNAPSHOT_RISKS = [
  "Concentration of control execution risk across critical operational processes, indicating sustained exposure requiring continued monitoring focus.",
  "Governance and oversight challenges linked to delayed remediation and evolving ownership models, impacting accountability for control effectiveness.",
  "Reliance on manual and compensating controls across impacted areas, increasing execution risk and reducing control sustainability.",
  "Technology-enabled processes emerging as a recurring risk domain, reflecting heightened sensitivity to control design and resilience.",
  "Cross-functional impacts observed where one event creates downstream pressure on reporting, reconciliation, and oversight processes.",
];

const MEETINGS = [
  { title: "Risk Management Forum, Q1", meta: "Risk Governance Forum • March 2026", desc: "Reviewed operational risk events, remediation progress, regulatory matters, and technology and governance topics impacting core control environments." },
  { title: "Operations Risk Committee", meta: "Committee Session • February 2026", desc: "Focused on execution challenges, remediation ownership, and issue aging across key operational and support processes." },
  { title: "Technology Governance Forum", meta: "Governance Forum • January 2026", desc: "Discussed system resilience, incident response effectiveness, and governance implications of ongoing transformation initiatives." },
];

const DOCS = ["Quarterly Notes.docx", "Risk Management Forum Pack.pdf", "Ops Risk Committee Minutes.docx", "Technology Governance Deck.pptx"];

const ratingSlices: Slice[] = [
  { label: "Critical", value: 1, color: "#b42318" },
  { label: "Major",    value: 1, color: "#b54708" },
  { label: "Limited",  value: 1, color: "#1f5ea8" },
];
const statusSlices: Slice[] = [
  { label: "Open",    value: 2, color: "#1f5ea8" },
  { label: "Overdue", value: 1, color: "#b54708" },
];

export default function Step5Finalize() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab]       = useState("events");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [rows, setRows]                 = useState<RegRow[]>(REGISTER_ROWS);
  const [meetingsOpen, setMeetingsOpen] = useState(false);
  const [publishing, setPublishing]     = useState(false);
  const [exporting,  setExporting]      = useState(false);

  const toggleRow   = (id: string) => setRows(prev => prev.map(r => r.id === id ? { ...r, expanded: !r.expanded } : r));
  const expandAll   = () => setRows(prev => prev.map(r => ({ ...r, expanded: true  })));
  const collapseAll = () => setRows(prev => prev.map(r => ({ ...r, expanded: false })));

  const handlePublish = async () => {
    if (publishing) return;
    setPublishing(true);
    try {
      const sessionId   = sessionStorage.getItem("session_id") || "";
      const fetchData   = (() => { try { return JSON.parse(sessionStorage.getItem("fetch_data_result") || "null"); } catch { return null; } })();
      const step4       = (() => { try { return JSON.parse(sessionStorage.getItem("step4_analysis")    || "null"); } catch { return null; } })();
      const execSummary = (() => { try { return JSON.parse(sessionStorage.getItem("exec_summary_result") || "null"); } catch { return null; } })();

      const res = await fetch(`${API_BASE}/api/v1/report/publish-cm-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, fetch_data: fetchData || {}, step4_analysis: step4 || [], exec_summary: execSummary || {} }),
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem("publish_result", JSON.stringify(data));
      }
    } catch { } finally {
      setPublishing(false);
      setLocation("/domain-home");
    }
  };

  const handleExportPDF = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const sessionId   = sessionStorage.getItem("session_id") || "";
      const fetchData   = (() => { try { return JSON.parse(sessionStorage.getItem("fetch_data_result") || "null"); } catch { return null; } })();
      const step4       = (() => { try { return JSON.parse(sessionStorage.getItem("step4_analysis")    || "null"); } catch { return null; } })();
      const execSummary = (() => { try { return JSON.parse(sessionStorage.getItem("exec_summary_result") || "null"); } catch { return null; } })();

      const res = await fetch(`${API_BASE}/api/v1/report/download-cm-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, fetch_data: fetchData || {}, step4_analysis: step4 || [], exec_summary: execSummary || {} }),
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem("download_report_result", JSON.stringify(data));
      }
    } catch { } finally {
      setExporting(false);
    }
  };

  const BtnStyle = (primary?: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "7px 13px", borderRadius: 8, cursor: "pointer", fontSize: 12.5, fontWeight: 900,
    border: primary ? "none" : `1px solid ${BORDER}`,
    background: primary ? NAVY : "#fff",
    color: primary ? "#fff" : TEXT,
    whiteSpace: "nowrap",
  });

  const Spinner = ({ light }: { light?: boolean }) => (
    <span style={{
      width: 12, height: 12, borderRadius: "50%",
      border: light ? "2px solid rgba(255,255,255,0.35)" : "2px solid rgba(0,0,0,0.15)",
      borderTopColor: light ? "#fff" : NAVY,
      animation: "spin 0.7s linear infinite",
      display: "inline-block", flexShrink: 0,
    }} />
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "10px 18px", fontSize: 12.5, color: MUTED, fontWeight: 600 }}>
        <span style={{ color: TEXT, fontWeight: 900 }}>Home</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: TEXT, fontWeight: 900 }}>Documents to Insights</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: TEXT, fontWeight: 900 }}>Step 5.</span>{" "}Finalize Outcome
      </div>

      {/* Tab bar + export / publish */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "0 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ display: "flex" }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              data-testid={`tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "12px 16px", fontSize: 13, fontWeight: 900, cursor: "pointer",
                border: "none", borderBottom: activeTab === tab.key ? `2px solid ${NAVY}` : "2px solid transparent",
                background: "transparent", color: activeTab === tab.key ? NAVY : MUTED, transition: "all 120ms",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, paddingBlock: 8 }}>
          <button
            data-testid="button-export-pdf-header"
            disabled={exporting}
            onClick={handleExportPDF}
            style={{ ...BtnStyle(), opacity: exporting ? 0.75 : 1, cursor: exporting ? "not-allowed" : "pointer", minWidth: 110 }}
          >
            {exporting ? <><Spinner /> Exporting…</> : <><FileText size={13} /> Export to PDF</>}
          </button>
          <button
            data-testid="button-publish-header"
            disabled={publishing}
            onClick={handlePublish}
            style={{ ...BtnStyle(true), opacity: publishing ? 0.8 : 1, cursor: publishing ? "not-allowed" : "pointer", minWidth: 100 }}
          >
            {publishing ? <><Spinner light /> Publishing…</> : <><Send size={13} /> Publish</>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ padding: 18, flex: 1 }}>

        {/* Title */}
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 900, color: TEXT }}>Step 5. Finalize Outcome</h1>
          <p style={{ margin: 0, fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>
            This page consolidates finalized outputs from the Documents to Insights workflow. The Executive Snapshot provides leadership-ready insights. The Event Register is collapsed by default for focused review and can be expanded for full details.
          </p>
        </div>

        {/* Note banner */}
        <div style={{ fontSize: 12, color: MUTED, fontStyle: "italic", marginBottom: 18, textAlign: "right" }}>
          Executive summary reflects analyzed events from the current monitoring cycle.
        </div>

        {/* Executive Snapshot card */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 16, boxShadow: "0 6px 18px rgba(16,24,40,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: TEXT }}>Executive Snapshot</div>
            <div style={{ fontSize: 12, color: MUTED, fontStyle: "italic" }}>Synthesized insights across the current monitoring cycle.</div>
          </div>

          {/* Key Risk Areas */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 900, color: TEXT, marginBottom: 8 }}>Key Risk Areas and Themes</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {SNAPSHOT_RISKS.map((r, i) => (
                <li key={i} style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 6, color: TEXT }}>{r}</li>
              ))}
            </ul>
            <div style={{ fontSize: 12, color: MUTED, fontStyle: "italic", marginTop: 6 }}>
              Themes reflect patterns across all analyzed events, not a restatement of individual event descriptions.
            </div>
          </div>

          <div style={{ height: 1, background: DIVIDER, margin: "14px 0" }} />

          {/* Emerging Risks */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 900, color: TEXT, marginBottom: 8 }}>Emerging Risks</div>
            <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.6 }}>
              Early signals point to increased regulatory scrutiny related to data governance and evidence retention, which may translate into heightened compliance pressure over future monitoring cycles.
            </div>
            <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.6, marginTop: 8 }}>
              Recurrent organizational change themes suggest potential downstream impacts to control ownership, stability, and handoff effectiveness during transition periods.
            </div>
          </div>

          <div style={{ height: 1, background: DIVIDER, margin: "14px 0" }} />

          {/* Audit Universe */}
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 900, color: TEXT, marginBottom: 8 }}>Audit Universe Exposure and Coverage Perspective</div>
            <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.6, marginBottom: 8 }}>
              Observed impacts are concentrated within a defined subset of the audit universe, indicating focused rather than isolated exposure. Certain auditable entities appear across multiple risk themes, suggesting interconnected drivers that warrant sustained continuous monitoring attention.
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {[
                "Repeated exposure in entities supporting control execution, oversight, and reporting.",
                "Downstream impact risk where operational failures influence financial and regulatory processes.",
                "Current coverage is sufficient to support monitoring objectives, with targeted follow-up expected in selected areas.",
              ].map((item, i) => (
                <li key={i} style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 4, color: TEXT }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Distribution Snapshot card */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 16, boxShadow: "0 6px 18px rgba(16,24,40,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: TEXT }}>Distribution Snapshot</div>
            <div style={{ fontSize: 12, color: MUTED, fontStyle: "italic" }}>Event severity and status breakdown.</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#f8fafc", fontSize: 12.5, fontWeight: 900, color: TEXT }}>
              Analyzed events: 3
              <ChevronDown size={13} style={{ color: MUTED }} />
            </div>
            <div style={{ fontSize: 12, color: MUTED }}>Scope: Documents to Insights events</div>
          </div>

          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            <DonutChart slices={ratingSlices} label="By rating" />
            <DonutChart slices={statusSlices} label="By status" />
          </div>

          <div style={{ fontSize: 11.5, color: MUTED, fontStyle: "italic", marginTop: 14 }}>
            Charts display events from the current monitoring cycle. Full details are available in the Event Register below.
          </div>
        </div>

        {/* Meeting and Forum Summary card */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 16, boxShadow: "0 6px 18px rgba(16,24,40,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: TEXT }}>Meeting and Forum Summary</div>
            <div style={{ fontSize: 12, color: MUTED, fontStyle: "italic" }}>Source meetings reviewed in this cycle.</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: meetingsOpen ? 14 : 0 }}>
            <button
              data-testid="button-meetings-toggle"
              onClick={() => setMeetingsOpen(o => !o)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13, fontWeight: 900, color: NAVY }}
            >
              {meetingsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {meetingsOpen ? "Collapse" : "Expand"} Meeting Summary
            </button>
          </div>

          {meetingsOpen && (
            <div>
              {MEETINGS.map((m, i) => (
                <div key={i} style={{ marginBottom: i < MEETINGS.length - 1 ? 16 : 8, paddingBottom: i < MEETINGS.length - 1 ? 16 : 0, borderBottom: i < MEETINGS.length - 1 ? `1px solid ${DIVIDER}` : "none" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 900, color: TEXT }}>{m.title}</div>
                  <div style={{ fontSize: 12.5, color: MUTED, margin: "3px 0 6px" }}>{m.meta}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: TEXT }}>{m.desc}</div>
                </div>
              ))}
              <div style={{ marginTop: 12, borderTop: `1px solid ${DIVIDER}`, paddingTop: 12 }}>
                <div style={{ fontSize: 12.5, fontWeight: 900, color: MUTED, marginBottom: 6 }}>Source documents</div>
                {DOCS.map((d, i) => (
                  <div key={i} style={{ fontSize: 12.5, color: TEXT, marginBottom: 4 }}>• {d}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Event Register card */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 20, boxShadow: "0 6px 18px rgba(16,24,40,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: TEXT }}>Event Register</div>
            <div style={{ fontSize: 12, color: MUTED, fontStyle: "italic" }}>Default collapsed for clean review, expand for full details.</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <button
              data-testid="button-register-toggle"
              onClick={() => setRegisterOpen(o => !o)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13, fontWeight: 900, color: NAVY }}
            >
              {registerOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {registerOpen ? "Collapse" : "Expand"} Event Register
            </button>
            {registerOpen && (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={expandAll}   style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${BORDER}`, background: "#f8fafc", cursor: "pointer", fontSize: 12, fontWeight: 900, color: MUTED }}>Expand all</button>
                <button onClick={collapseAll} style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${BORDER}`, background: "#f8fafc", cursor: "pointer", fontSize: 12, fontWeight: 900, color: MUTED }}>Collapse all</button>
              </div>
            )}
          </div>

          <div style={{ fontSize: 12.5, color: MUTED, marginBottom: registerOpen ? 14 : 0 }}>
            Includes full event details, Assure tagged auditable entities, additional impacted auditable entities, and final impact rationale.
          </div>

          {registerOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {rows.map(row => (
                <div key={row.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
                  <div
                    style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", cursor: "pointer", background: row.expanded ? "#f8fafd" : "#fff" }}
                    onClick={() => toggleRow(row.id)}
                  >
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 900, color: TEXT, marginBottom: 5 }}>{row.title}</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ padding: "2px 8px", borderRadius: 6, background: "#f1f5f9", border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 700, color: RATING_COLOR[row.rating] ?? TEXT }}>
                          Rating: {row.rating}
                        </span>
                        <span style={{ padding: "2px 8px", borderRadius: 6, background: "#f1f5f9", border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 700, color: STATUS_COLOR[row.status] ?? TEXT }}>
                          Status: {row.status}
                        </span>
                      </div>
                    </div>
                    <button style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 7, border: `1px solid ${BORDER}`, background: "#f8fafc", color: MUTED, cursor: "pointer" }}>
                      {row.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  </div>
                  {row.expanded && (
                    <div style={{ borderTop: `1px solid ${DIVIDER}`, background: "#fafbfd", padding: "12px 16px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 8 }}>
                        {([
                          ["Source", row.source],
                          ["Assure Tagged AE(s)", row.assureAE],
                          ["Additional Impacted AE(s)", row.additionalAE],
                          ["Impact Rationale", row.rationale],
                        ] as [string, string][]).map(([k, v]) => (
                          <>
                            <span key={`k${k}`} style={{ fontSize: 12.5, fontWeight: 900, color: MUTED }}>{k}</span>
                            <span key={`v${k}`} style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>{v}</span>
                          </>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <button
            data-testid="button-back"
            onClick={() => setLocation("/step-4")}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #d6deea", background: "#fff", fontWeight: 900, cursor: "pointer", fontSize: 13, minWidth: 100 }}
          >
            Back
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              data-testid="button-export-pdf-footer"
              disabled={exporting}
              onClick={handleExportPDF}
              style={{ ...BtnStyle(), opacity: exporting ? 0.75 : 1, cursor: exporting ? "not-allowed" : "pointer", minWidth: 110 }}
            >
              {exporting ? <><Spinner /> Exporting…</> : <><FileText size={13} /> Export to PDF</>}
            </button>
            <button
              data-testid="button-publish-footer"
              disabled={publishing}
              onClick={handlePublish}
              style={{ ...BtnStyle(true), opacity: publishing ? 0.8 : 1, cursor: publishing ? "not-allowed" : "pointer", minWidth: 100 }}
            >
              {publishing ? <><Spinner light /> Publishing…</> : <><Send size={13} /> Publish</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
