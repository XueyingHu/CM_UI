import { useState } from "react";
import { useLocation } from "wouter";

const NAVY = "#0b2a4a";
const SUCCESS = "#1f7a3f";
const WARNING = "#b54708";
const BORDER = "#e6e9ef";
const MUTED = "#5b6b7a";
const TEXT = "#122033";

type Rating = "Critical" | "Major" | "Limited";

interface RiskEvent {
  id: string; name: string; rating: Rating; status: string; lastUpdated: string; source: string;
}
interface Issue {
  id: string; summary: string; rating: Rating; status: string; remediationDate: string; source: string;
}
interface Change {
  id: string; description: string; rating: Rating; phase: string; goLive: string; source: string;
}
interface NotFoundItem {
  item: string; expectedSystem: string; rating: Rating; docSource: string;
}

const PAGES: Array<{
  riskEvents: RiskEvent[];
  issues: Issue[];
  changes: Change[];
  notFound: NotFoundItem[];
}> = [
  {
    riskEvents: [
      { id: "RE-102345", name: "System outage impacting payments", rating: "Critical", status: "Open", lastUpdated: "2026-03-18", source: "ORAC Risk Events" },
      { id: "RE-104118", name: "Processing delays due to vendor capacity", rating: "Major", status: "Monitoring", lastUpdated: "2026-03-22", source: "ORAC Risk Events" },
    ],
    issues: [
      { id: "ISS-778901", summary: "Access control gaps in core platform", rating: "Major", status: "In Progress", remediationDate: "2026-06-30", source: "ORAC Issues" },
      { id: "ISS-781220", summary: "Incomplete evidence retention for reconciliations", rating: "Limited", status: "Open", remediationDate: "2026-05-15", source: "ORAC Issues" },
    ],
    changes: [
      { id: "CHG-445612", description: "Payments platform upgrade", rating: "Major", phase: "Execution", goLive: "2026-09-15", source: "Navigator" },
      { id: "CHG-447908", description: "Risk controls monitoring automation rollout", rating: "Limited", phase: "Design", goLive: "2026-07-30", source: "Navigator" },
    ],
    notFound: [
      { item: "Internal Risk Event, third party processing delay", expectedSystem: "ORAC Risk Events", rating: "Major", docSource: "Quarterly Notes.docx" },
      { item: "Known Issue, legacy reconciliation workaround", expectedSystem: "ORAC Issues", rating: "Limited", docSource: "Meeting Pack.pdf" },
      { item: "Change, minor release referenced as CHG 44 5612", expectedSystem: "Navigator", rating: "Limited", docSource: "Meeting Minutes.docx" },
    ],
  },
  {
    riskEvents: [
      { id: "RE-109022", name: "Data integrity failure in reporting pipeline", rating: "Critical", status: "Open", lastUpdated: "2026-04-01", source: "ORAC Risk Events" },
    ],
    issues: [
      { id: "ISS-790034", summary: "Manual override procedure not documented", rating: "Major", status: "Open", remediationDate: "2026-07-01", source: "ORAC Issues" },
    ],
    changes: [
      { id: "CHG-451100", description: "Core banking system refresh", rating: "Major", phase: "Planning", goLive: "2026-12-01", source: "Navigator" },
    ],
    notFound: [
      { item: "Regulatory Exam, Q4 review findings", expectedSystem: "ORAC Issues", rating: "Major", docSource: "Ops Risk Summary.docx" },
    ],
  },
];

function RatingBadge({ rating }: { rating: Rating }) {
  const styles: Record<Rating, { border: string; bg: string; color: string }> = {
    Critical: { border: "rgba(180,35,24,0.25)", bg: "rgba(180,35,24,0.06)", color: "#b42318" },
    Major: { border: "rgba(181,71,8,0.30)", bg: "rgba(181,71,8,0.08)", color: "#b54708" },
    Limited: { border: "rgba(31,94,168,0.25)", bg: "rgba(31,94,168,0.08)", color: "#1f5ea8" },
  };
  const s = styles[rating];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "3px 8px", borderRadius: 999, fontWeight: 900, fontSize: 11.5,
      border: `1px solid ${s.border}`, background: s.bg, color: s.color, whiteSpace: "nowrap",
    }}>
      {rating}
    </span>
  );
}

const TH_STYLE: React.CSSProperties = {
  padding: "10px 12px", background: "#f7f9fd", fontWeight: 900, fontSize: 12.5,
  color: "#334155", textAlign: "left", borderBottom: "1px solid #eef2f7",
};
const TD_STYLE: React.CSSProperties = {
  padding: "10px 12px", fontSize: 12.5, borderBottom: "1px solid #eef2f7",
  color: TEXT, textAlign: "left", verticalAlign: "top",
};
const TD_LAST: React.CSSProperties = { ...TD_STYLE, borderBottom: "none" };

function tableWrap(children: React.ReactNode) {
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        {children}
      </table>
    </div>
  );
}

export default function Step3Validate() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const totalPages = PAGES.length;
  const data = PAGES[page - 1];

  const selectedPm = sessionStorage.getItem("selectedDomain") || "";
  const selectedBml = sessionStorage.getItem("selectedBml") || "";
  const selectedTeam = sessionStorage.getItem("selectedTeam") || "";

  const scopeItems = [
    selectedPm ? { k: "PM:", v: selectedPm } : null,
    selectedTeam ? { k: "Responsible Team:", v: selectedTeam } : null,
    selectedBml ? { k: "BML:", v: selectedBml } : null,
  ].filter(Boolean) as { k: string; v: string }[];

  const pagerBtn = (label: React.ReactNode, action: () => void, disabled: boolean, testId: string) => (
    <button
      data-testid={testId}
      onClick={action}
      disabled={disabled}
      style={{
        width: 28, height: 28, borderRadius: 8,
        border: "1px solid #e3e9f2", background: "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        display: "grid", placeItems: "center",
      }}
    >
      {label}
    </button>
  );

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
        <span style={{ color: TEXT, fontWeight: 900 }}>Step 3.</span>{" "}Validate with Source Systems
      </div>

      {/* Monitoring scope bar */}
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
      <div style={{ padding: 18, flex: 1 }}>
        <div style={{
          background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12,
          boxShadow: "0 6px 18px rgba(16,24,40,0.08)", padding: 16, maxWidth: 1100,
        }}>

          {/* Card header row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 900, color: TEXT }}>
                Step 3. Validate with Source Systems
              </h1>
              <p style={{ margin: "0 0 10px", fontSize: 12.8, color: MUTED, lineHeight: 1.4 }}>
                Items identified from documents are validated against authoritative source systems.
                The information below reflects the latest confirmed records.
                This step is read only and shows only current, canonical records.
              </p>
            </div>

            {/* In-card pager */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginTop: 2, userSelect: "none" }}>
              {pagerBtn(
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16" aria-hidden="true"><path d="M18 6 12 12l6 6" stroke="#2b3c50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 6 6 12l6 6" stroke="#2b3c50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                () => setPage(1), page === 1, "pager-first"
              )}
              {pagerBtn(
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16" aria-hidden="true"><path d="M15 18 9 12l6-6" stroke="#2b3c50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                () => setPage(p => Math.max(1, p - 1)), page === 1, "pager-prev"
              )}
              <span style={{ fontSize: 12.5, fontWeight: 900, color: "#2b3c50", minWidth: 92, textAlign: "center" }}>
                Page {page} of {totalPages}
              </span>
              {pagerBtn(
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="#2b3c50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                () => setPage(p => Math.min(totalPages, p + 1)), page === totalPages, "pager-next"
              )}
              {pagerBtn(
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16" aria-hidden="true"><path d="M6 6l6 6-6 6" stroke="#2b3c50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 6l6 6-6 6" stroke="#2b3c50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                () => setPage(totalPages), page === totalPages, "pager-last"
              )}
            </div>
          </div>

          {/* ORAC Risk Events */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 13.5, fontWeight: 900, color: "#1c2f45", marginBottom: 8 }}>ORAC Risk Events</div>
            {tableWrap(
              <>
                <thead>
                  <tr>
                    {["Event ID", "Event Name", "Rating", "Current Status", "Last Updated", "Source System"].map(h => (
                      <th key={h} style={TH_STYLE}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.riskEvents.map((r, i) => {
                    const isLast = i === data.riskEvents.length - 1;
                    const td = isLast ? TD_LAST : TD_STYLE;
                    return (
                      <tr key={r.id}>
                        <td style={td}>{r.id}</td>
                        <td style={td}>{r.name}</td>
                        <td style={td}><RatingBadge rating={r.rating} /></td>
                        <td style={{ ...td, fontWeight: 900, color: SUCCESS }}>{r.status}</td>
                        <td style={td}>{r.lastUpdated}</td>
                        <td style={td}>{r.source}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </>
            )}
          </div>

          {/* ORAC Issues */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 13.5, fontWeight: 900, color: "#1c2f45", marginBottom: 8 }}>ORAC Issues</div>
            {tableWrap(
              <>
                <thead>
                  <tr>
                    {["Issue ID", "Issue Summary", "Rating", "Status", "Target Remediation Date", "Source System"].map(h => (
                      <th key={h} style={TH_STYLE}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.issues.map((iss, i) => {
                    const isLast = i === data.issues.length - 1;
                    const td = isLast ? TD_LAST : TD_STYLE;
                    return (
                      <tr key={iss.id}>
                        <td style={td}>{iss.id}</td>
                        <td style={td}>{iss.summary}</td>
                        <td style={td}><RatingBadge rating={iss.rating} /></td>
                        <td style={{ ...td, fontWeight: 900, color: SUCCESS }}>{iss.status}</td>
                        <td style={td}>{iss.remediationDate}</td>
                        <td style={td}>{iss.source}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </>
            )}
          </div>

          {/* Navigator Changes */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 13.5, fontWeight: 900, color: "#1c2f45", marginBottom: 8 }}>Navigator Changes</div>
            {tableWrap(
              <>
                <thead>
                  <tr>
                    {["Change ID", "Change Description", "Rating", "Current Phase", "Target Go Live", "Source System"].map(h => (
                      <th key={h} style={TH_STYLE}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.changes.map((c, i) => {
                    const isLast = i === data.changes.length - 1;
                    const td = isLast ? TD_LAST : TD_STYLE;
                    return (
                      <tr key={c.id}>
                        <td style={td}>{c.id}</td>
                        <td style={td}>{c.description}</td>
                        <td style={td}><RatingBadge rating={c.rating} /></td>
                        <td style={{ ...td, fontWeight: 900, color: SUCCESS }}>{c.phase}</td>
                        <td style={td}>{c.goLive}</td>
                        <td style={td}>{c.source}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </>
            )}
          </div>

          {/* Not Found callout */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 13.5, fontWeight: 900, color: "#1c2f45", marginBottom: 8 }}>
              Items Identified in Documents but Not Found in Source Systems
            </div>
            <div style={{
              border: "1px solid #fed7aa", background: "#fff6ed",
              borderRadius: 12, padding: 12,
            }}>
              <p style={{ fontSize: 12.5, color: "#7c2d12", margin: "0 0 10px", lineHeight: 1.35, fontWeight: 700 }}>
                These items were extracted from documents, but no current matching record was found in ORAC or Navigator.
                The list below is retained for traceability and follow up.
              </p>
              <div style={{
                border: "1px solid rgba(124,45,18,0.15)", borderRadius: 10,
                overflow: "hidden", background: "#fff",
              }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      {["Extracted Item", "Expected System", "Rating", "Document Source", "Validation Result"].map(h => (
                        <th key={h} style={{
                          padding: "10px 12px", textAlign: "left",
                          background: "rgba(181,71,8,0.08)", fontWeight: 900,
                          fontSize: 12.5, color: "#7c2d12",
                          borderBottom: "1px solid #eef2f7",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.notFound.map((nf, i) => {
                      const isLast = i === data.notFound.length - 1;
                      const td: React.CSSProperties = {
                        padding: "10px 12px", fontSize: 12.5,
                        borderBottom: isLast ? "none" : "1px solid #eef2f7",
                        verticalAlign: "top",
                      };
                      return (
                        <tr key={i}>
                          <td style={td}>{nf.item}</td>
                          <td style={td}>{nf.expectedSystem}</td>
                          <td style={td}><RatingBadge rating={nf.rating} /></td>
                          <td style={td}>{nf.docSource}</td>
                          <td style={td}>
                            <strong style={{ color: WARNING }}>No matching record found</strong>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 10, fontSize: 12.5, color: "#7c2d12", lineHeight: 1.4 }}>
                Possible reasons include misspelled or incomplete IDs, alias naming differences between documents and
                source systems, timing delays in system updates, or references to discussions that were not formally
                registered in ORAC or Navigator.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginTop: 18, gap: 12,
          }}>
            <button
              data-testid="button-back"
              onClick={() => setLocation("/step-2")}
              style={{
                padding: "10px 14px", borderRadius: 10, border: "1px solid #d6deea",
                background: "#fff", fontWeight: 900, cursor: "pointer", minWidth: 120, fontSize: 13,
              }}
            >
              Back
            </button>
            <button
              data-testid="button-next"
              onClick={() => setLocation("/step-4")}
              style={{
                padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)",
                background: NAVY, color: "#fff", fontWeight: 900, cursor: "pointer", minWidth: 120, fontSize: 13,
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
