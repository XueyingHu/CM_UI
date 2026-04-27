import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronDown, ChevronRight } from "lucide-react";

const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

const NAVY = "#0b2a4a";
const BORDER = "#e6e9ef";
const MUTED = "#5b6b7a";
const TEXT = "#122033";
const DIVIDER = "#eef2f7";

const TH: React.CSSProperties = {
  padding: "10px", background: "#f7f9fd",
  fontWeight: 900, fontSize: 12.5, color: "#334155",
  textAlign: "left", borderBottom: "1px solid #eef2f7",
};
const TD: React.CSSProperties = {
  padding: 10, fontSize: 12.5, borderTop: "1px solid #eef2f7",
  verticalAlign: "top", color: TEXT,
};

const MEETINGS = [
  {
    title: "Risk Management Forum, Q1",
    meta: "Risk Governance Forum • March 2026",
    desc: "Reviewed operational risk events, remediation progress, regulatory matters, and technology and governance topics impacting core control environments.",
  },
  {
    title: "Operations Risk Committee",
    meta: "Committee Session • February 2026",
    desc: "Focused on execution challenges, remediation ownership, and issue aging across key operational and support processes.",
  },
  {
    title: "Technology Governance Forum",
    meta: "Governance Forum • January 2026",
    desc: "Discussed system resilience, incident response effectiveness, and governance implications of ongoing transformation initiatives.",
  },
];

const DOCS = [
  "Quarterly Notes.docx",
  "Risk Management Forum Pack.pdf",
  "Ops Risk Committee Minutes.docx",
  "Technology Governance Deck.pptx",
];

const SNAPSHOT_RISKS = [
  "Concentration of control execution risk across critical operational processes, indicating sustained exposure requiring continued monitoring focus.",
  "Governance and oversight challenges linked to delayed remediation and evolving ownership models, impacting accountability for control effectiveness.",
  "Reliance on manual and compensating controls across impacted areas, increasing execution risk and reducing control sustainability.",
  "Technology enabled processes emerging as a recurring risk domain, reflecting heightened sensitivity to control design and resilience.",
];

const EVENT_REGISTER = [
  {
    reference: "ISSUE 778901",
    source: "Risk Management Forum, Q1",
    existing: "AE‑1023 Payments Processing Platform",
    toUpload: "AE‑3301 Financial Controls Oversight",
    rationale: "Weaknesses in access provisioning may impact downstream financial controls and oversight processes.",
  },
];

export default function Step5Finalize() {
  const [, setLocation] = useLocation();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (publishing) return;
    setPublishing(true);
    try {
      const sessionId = sessionStorage.getItem("session_id") || "";
      const fetchData = (() => {
        try { return JSON.parse(sessionStorage.getItem("fetch_data_result") || "null"); } catch { return null; }
      })();
      const step4Analysis = (() => {
        try { return JSON.parse(sessionStorage.getItem("step4_analysis") || "null"); } catch { return null; }
      })();
      const execSummary = (() => {
        try { return JSON.parse(sessionStorage.getItem("exec_summary_result") || "null"); } catch { return null; }
      })();

      const res = await fetch(`${API_BASE}/api/v1/report/publish-cm-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          fetch_data: fetchData || {},
          step4_analysis: step4Analysis || [],
          exec_summary: execSummary || {},
        }),
      });

      if (res.ok) {
        const report = await res.json();
        // Download the published report as a JSON file
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        a.href = url;
        a.download = `cm-report-${today}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch {
      // Navigate regardless
    } finally {
      setPublishing(false);
      setLocation("/domain-home");
    }
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const sessionId = sessionStorage.getItem("session_id") || "";
      const fetchData = (() => {
        try { return JSON.parse(sessionStorage.getItem("fetch_data_result") || "null"); } catch { return null; }
      })();
      const step4Analysis = (() => {
        try { return JSON.parse(sessionStorage.getItem("step4_analysis") || "null"); } catch { return null; }
      })();
      const execSummary = (() => {
        try { return JSON.parse(sessionStorage.getItem("exec_summary_result") || "null"); } catch { return null; }
      })();

      const res = await fetch(`${API_BASE}/api/v1/report/download-cm-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          fetch_data: fetchData || {},
          step4_analysis: step4Analysis || [],
          exec_summary: execSummary || {},
        }),
      });

      if (res.ok) {
        const report = await res.json();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        a.href = url;
        a.download = `cm-report-${today}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch {
      // Silent fail — report download is best-effort
    } finally {
      setExporting(false);
    }
  };

  const selectedPm = sessionStorage.getItem("selectedDomain") || "";
  const selectedBml = sessionStorage.getItem("selectedBml") || "";
  const selectedTeam = sessionStorage.getItem("selectedTeam") || "";
  const scopeItems = [
    selectedPm ? { k: "PM:", v: selectedPm } : null,
    selectedTeam ? { k: "Responsible Team:", v: selectedTeam } : null,
    selectedBml ? { k: "BML:", v: selectedBml } : null,
  ].filter(Boolean) as { k: string; v: string }[];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", paddingBottom: 80 }}>

      {/* Breadcrumb */}
      <div style={{
        background: "#fff", borderBottom: `1px solid ${BORDER}`,
        padding: "10px 18px", fontSize: 12.5, color: MUTED, fontWeight: 600,
      }}>
        <span style={{ color: TEXT, fontWeight: 900 }}>Home</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: TEXT, fontWeight: 900 }}>Documents to Insights</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: TEXT, fontWeight: 900 }}>Step 5.</span>{" "}Finalize Outcome
      </div>

      {/* Scope bar */}
      <div style={{
        background: "#fff", borderBottom: `1px solid ${BORDER}`,
        padding: "10px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 14, flexWrap: "wrap",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 10px", borderRadius: 999,
          border: "1px solid rgba(11,42,74,0.15)",
          background: "rgba(11,42,74,0.08)",
          color: NAVY, fontSize: 12, fontWeight: 900, whiteSpace: "nowrap",
        }}>
          Monitoring Scope
        </div>
        {scopeItems.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {scopeItems.map(({ k, v }) => (
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
        )}
      </div>

      {/* Main */}
      <div style={{ padding: 18, flex: 1, maxWidth: 960, width: "100%" }}>

        {/* ── Section 1: Meeting and Forum Summary ── */}
        <div style={{ marginBottom: 30 }}>
          <div style={{
            padding: "9px 14px", borderRadius: 10,
            fontSize: 14, fontWeight: 900, marginBottom: 12,
            background: "#e8f1fb",
          }}>
            Meeting and Forum Summary
          </div>
          <div style={{
            background: "#fff", border: `1px solid ${BORDER}`,
            borderRadius: 12, padding: 16,
            boxShadow: "0 6px 18px rgba(16,24,40,0.08)",
          }}>
            {MEETINGS.map((m, i) => (
              <div key={i} style={{ marginBottom: i < MEETINGS.length - 1 ? 18 : 10 }}>
                <div style={{ fontSize: 13.5, fontWeight: 900 }}>{m.title}</div>
                <div style={{ fontSize: 12.5, color: MUTED, margin: "3px 0 6px" }}>{m.meta}</div>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>{m.desc}</div>
              </div>
            ))}
            <div style={{ marginTop: 12, fontSize: 12.5, color: MUTED }}>
              {DOCS.map((d, i) => (
                <div key={i} style={{ marginBottom: 4 }}>• {d}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 2: Executive Snapshot ── */}
        <div style={{ marginBottom: 30 }}>
          <div style={{
            padding: "9px 14px", borderRadius: 10,
            fontSize: 14, fontWeight: 900, marginBottom: 12,
            background: "#ecfdf3",
          }}>
            Executive Snapshot
          </div>
          <div style={{
            background: "#fff", border: `1px solid ${BORDER}`,
            borderRadius: 12, padding: 16,
            boxShadow: "0 6px 18px rgba(16,24,40,0.08)",
          }}>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13.5, fontWeight: 900, marginBottom: 6 }}>Key Risk Areas and Themes</div>
              <ul style={{ paddingLeft: 18, margin: "0" }}>
                {SNAPSHOT_RISKS.map((r, i) => (
                  <li key={i} style={{ marginBottom: 8, fontSize: 13, lineHeight: 1.55 }}>{r}</li>
                ))}
              </ul>
            </div>

            <div style={{ height: 1, background: DIVIDER, margin: "18px 0" }} />

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13.5, fontWeight: 900, marginBottom: 6 }}>Emerging Risks</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                Early signals point to increased regulatory scrutiny related to data governance
                and evidence retention, which may translate into heightened compliance pressure
                over future monitoring cycles. Recurrent organizational change themes suggest
                potential downstream impacts to control ownership, stability, and handoff
                effectiveness during transition periods.
              </div>
            </div>

            <div style={{ height: 1, background: DIVIDER, margin: "18px 0" }} />

            <div>
              <div style={{ fontSize: 13.5, fontWeight: 900, marginBottom: 6 }}>Audit Universe Impact and Coverage</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                Observed impacts are concentrated within a defined subset of the audit universe,
                indicating focused rather than isolated exposure. Certain auditable entities
                appear across multiple risk themes, suggesting interconnected drivers that
                warrant sustained continuous monitoring attention. Current coverage is
                sufficient to support monitoring objectives, with targeted follow up expected
                in selected areas.
              </div>
            </div>

          </div>
        </div>

        {/* ── Section 3: Event Register ── */}
        <div style={{ marginBottom: 30 }}>
          <div style={{
            padding: "9px 14px", borderRadius: 10,
            fontSize: 14, fontWeight: 900, marginBottom: 12,
            background: "#fef3c7",
          }}>
            Event Register
          </div>
          <div style={{
            background: "#fff", border: `1px solid ${BORDER}`,
            borderRadius: 12, padding: 16,
            boxShadow: "0 6px 18px rgba(16,24,40,0.08)",
          }}>
            <button
              data-testid="button-register-toggle"
              onClick={() => setRegisterOpen(o => !o)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 900, color: "#92400e",
                padding: 0, marginBottom: registerOpen ? 14 : 0,
              }}
            >
              {registerOpen
                ? <><ChevronDown size={14} /> Collapse Event Register</>
                : <><ChevronRight size={14} /> Expand Event Register</>
              }
            </button>

            {registerOpen && (
              <div>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 900, marginBottom: 8 }}>Internal Risk Event</div>
                  <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                      <thead>
                        <tr>
                          {["Reference", "Source", "Existing Assure Tagging (AE)", "Tagging to be uploaded to Assure (AE)", "Impact Rationale"].map(h => (
                            <th key={h} style={TH}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {EVENT_REGISTER.map((row, i) => (
                          <tr key={i}>
                            <td style={TD}>{row.reference}</td>
                            <td style={TD}>{row.source}</td>
                            <td style={TD}>{row.existing}</td>
                            <td style={TD}>{row.toUpload}</td>
                            <td style={TD}>{row.rationale}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Action Bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#fff", borderTop: `1px solid ${BORDER}`,
        padding: "12px 18px", zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <button
            data-testid="button-back"
            onClick={() => setLocation("/step-4")}
            style={{
              padding: "10px 14px", borderRadius: 10,
              border: "1px solid #d6deea", background: "#fff",
              fontWeight: 900, cursor: "pointer", fontSize: 13,
              minWidth: 100,
            }}
          >
            Back
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              data-testid="button-export"
              onClick={handleExport}
              disabled={exporting}
              style={{
                padding: "10px 14px", borderRadius: 10,
                border: "1px solid #d6deea",
                background: exporting ? "#f0f4f8" : "#fff",
                fontWeight: 900,
                cursor: exporting ? "not-allowed" : "pointer",
                fontSize: 13, minWidth: 100,
                display: "inline-flex", alignItems: "center", gap: 7,
                transition: "background 0.2s",
              }}
            >
              {exporting ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    style={{ animation: "spin 0.9s linear infinite", flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(11,42,74,0.2)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke={NAVY} strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Exporting…
                </>
              ) : "Export"}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <button
              data-testid="button-publish"
              onClick={handlePublish}
              disabled={publishing}
              style={{
                padding: "10px 14px", borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.1)",
                background: publishing ? "#3a5a78" : NAVY,
                color: "#fff", fontWeight: 900,
                cursor: publishing ? "not-allowed" : "pointer",
                fontSize: 13, minWidth: 100,
                display: "inline-flex", alignItems: "center", gap: 7,
                transition: "background 0.2s",
              }}
            >
              {publishing ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    style={{ animation: "spin 0.9s linear infinite", flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Publishing…
                </>
              ) : "Publish"}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
