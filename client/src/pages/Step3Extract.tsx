import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const FILES = [
  {
    filename: "Ops Risk Summary.docx",
    events: [
      { label: "Internal Risk Event", found: true },
      { label: "External Risk Event", found: false },
      { label: "Other Internal Adverse Event", found: true },
      { label: "Known Issue", found: true },
      { label: "Management Risk Tolerance and Governance", found: false },
      { label: "Business Ownership Change", found: false },
      { label: "Significant Organization Change", found: false },
      { label: "Regulatory Exam or Inquiry", found: true },
      { label: "Other", found: true },
    ],
  },
  {
    filename: "Incident Report.pdf",
    events: [
      { label: "Internal Risk Event", found: true },
      { label: "External Risk Event", found: true },
      { label: "Other Internal Adverse Event", found: false },
      { label: "Known Issue", found: true },
      { label: "Management Risk Tolerance and Governance", found: true },
      { label: "Business Ownership Change", found: false },
      { label: "Significant Organization Change", found: false },
      { label: "Regulatory Exam or Inquiry", found: false },
      { label: "Other", found: false },
    ],
  },
  {
    filename: "Ops Workflow.vsdx",
    events: [
      { label: "Internal Risk Event", found: false },
      { label: "External Risk Event", found: false },
      { label: "Other Internal Adverse Event", found: false },
      { label: "Known Issue", found: false },
      { label: "Management Risk Tolerance and Governance", found: true },
      { label: "Business Ownership Change", found: true },
      { label: "Significant Organization Change", found: true },
      { label: "Regulatory Exam or Inquiry", found: false },
      { label: "Other", found: false },
    ],
  },
];

const FOUND_COLOR = "#1f7a3f";
const NOT_FOUND_COLOR = "#d92d20";

export default function Step3Extract() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);
  const [page, setPage] = useState(1);
  const totalPages = FILES.length;
  const file = FILES[page - 1];

  const selectedPm = sessionStorage.getItem("selectedDomain") || "";
  const selectedBml = sessionStorage.getItem("selectedBml") || "";
  const selectedTeam = sessionStorage.getItem("selectedTeam") || "";

  useEffect(() => {
    const t = setTimeout(() => setProgress(75), 400);
    return () => clearTimeout(t);
  }, []);

  const scopeItems = [
    selectedPm ? { k: "PM:", v: selectedPm } : null,
    selectedTeam ? { k: "Responsible Team:", v: selectedTeam } : null,
    selectedBml ? { k: "BML:", v: selectedBml } : null,
  ].filter(Boolean) as { k: string; v: string }[];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>

      {/* Breadcrumb bar */}
      <div style={{
        background: "#ffffff", borderBottom: "1px solid #e6e9ef",
        padding: "10px 18px", fontSize: 12.5, color: "#5b6b7a", fontWeight: 600,
      }}>
        <span style={{ color: "#122033", fontWeight: 900 }}>Home</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: "#122033", fontWeight: 900 }}>Documents to Insights</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: "#122033", fontWeight: 900 }}>Step 2.</span> Extract Key Events
      </div>

      {/* Monitoring scope bar */}
      <div style={{
        background: "linear-gradient(180deg,#ffffff 0%,#fbfcfe 100%)",
        borderBottom: "1px solid #e6e9ef",
        padding: "10px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 14, flexWrap: "wrap",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 10px", borderRadius: 999,
          border: "1px solid rgba(11,42,74,0.15)",
          background: "rgba(11,42,74,0.08)",
          color: "#0b2a4a", fontSize: 12, fontWeight: 900, whiteSpace: "nowrap",
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
                <span style={{ color: "#5b6b7a", fontWeight: 700 }}>{k}</span>
                <span style={{ color: "#122033", fontWeight: 900 }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ padding: "18px", flex: 1 }}>
        <div style={{
          background: "#ffffff", border: "1px solid #e6e9ef", borderRadius: 12,
          boxShadow: "0 6px 18px rgba(16,24,40,0.08)", padding: 16, maxWidth: 980,
        }}>
          {/* Card header */}
          <h1 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 900, color: "#122033" }}>
            Step 2. Extract Key Events
          </h1>
          <div style={{ fontSize: 12.5, color: "#5b6b7a", fontWeight: 600, marginBottom: 8 }}>
            Extracting key information from documents…
          </div>

          {/* Progress bar */}
          <div style={{
            height: 14, borderRadius: 999, background: "#eef2f7",
            border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 20,
          }}>
            <div style={{
              height: "100%", width: `${progress}%`,
              background: "linear-gradient(90deg,#1f5ea8,#2a6acb)",
              transition: "width 0.8s ease",
            }} />
          </div>

          {/* File block */}
          <div style={{ marginBottom: 18 }}>
            <div style={{
              fontSize: 13, fontWeight: 900, color: "#fff",
              background: "#0b2a4a", borderRadius: "10px 10px 0 0",
              padding: "10px 14px", marginBottom: 0,
            }}>
              {file.filename}
            </div>
            <div style={{ border: "1px solid #e6e9ef", borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden" }}>
              {file.events.map((ev, i) => (
                <div
                  key={i}
                  data-testid={`event-row-${i}`}
                  style={{
                    display: "flex", gap: 10, alignItems: "center",
                    padding: "10px 12px",
                    borderTop: i === 0 ? "none" : "1px solid #eef2f7",
                    background: "#fff",
                  }}
                >
                  <div style={{ width: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {ev.found ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5L13 4.5" stroke={FOUND_COLOR} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 2l10 10M12 2L2 12" stroke={NOT_FOUND_COLOR} strokeWidth="2.2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ fontSize: 12.8 }}>
                    {ev.found ? (
                      <span style={{ color: "#1a2e44", fontWeight: 600 }}>{ev.label}</span>
                    ) : (
                      <span style={{ color: NOT_FOUND_COLOR, fontWeight: 900 }}>{ev.label} — Not Found</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            gap: 10, margin: "16px 0",
          }}>
            {[
              { label: "«", action: () => setPage(1) },
              { label: "‹", action: () => setPage(p => Math.max(1, p - 1)) },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                disabled={page === 1}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  border: "1px solid #e3e9f2", background: "#fff",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  opacity: page === 1 ? 0.4 : 1,
                  fontWeight: 700, fontSize: 13, display: "grid", placeItems: "center",
                }}
              >
                {label}
              </button>
            ))}
            <span style={{ fontSize: 12.5, fontWeight: 900, color: "#122033" }}>
              Page {page} of {totalPages}
            </span>
            {[
              { label: "›", action: () => setPage(p => Math.min(totalPages, p + 1)) },
              { label: "»", action: () => setPage(totalPages) },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                disabled={page === totalPages}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  border: "1px solid #e3e9f2", background: "#fff",
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  opacity: page === totalPages ? 0.4 : 1,
                  fontWeight: 700, fontSize: 13, display: "grid", placeItems: "center",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginTop: 16, paddingTop: 14, borderTop: "1px solid #e6e9ef",
          }}>
            <button
              data-testid="button-back"
              onClick={() => setLocation("/step-2")}
              style={{
                background: "#fff", color: "#122033", fontWeight: 900, fontSize: 13,
                border: "1px solid #d6deea", borderRadius: 10, padding: "10px 18px", cursor: "pointer",
              }}
            >
              Back
            </button>
            <button
              data-testid="button-next"
              onClick={() => setLocation("/step-4")}
              style={{
                background: "#0b2a4a", color: "#fff", fontWeight: 900, fontSize: 13,
                border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, padding: "10px 18px", cursor: "pointer", minWidth: 80,
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
