import { useState } from "react";
import { useLocation } from "wouter";
import { Check, ChevronRight, ChevronDown, Download, X, MoreHorizontal, Plus } from "lucide-react";

const NAVY = "#0b2a4a";
const BORDER = "#e6e9ef";
const MUTED = "#5b6b7a";
const TEXT = "#122033";
const DIVIDER = "#eef2f7";

type Action = "accepted" | "removed" | null;

interface ResultRow {
  id: string;
  title: string;
  rating: string;
  status: string;
  date: string;
  action: Action;
  expanded: boolean;
}

const STATUS_COLOR: Record<string, string> = { Overdue: "#b42318", Open: "#1f5ea8", Scheduled: "#6d28d9", Completed: "#1f7a3f" };
const RATING_COLOR: Record<string, string> = { Critical: "#b42318", High: "#b54708", Major: "#b54708", Medium: "#1f5ea8", Low: "#1f7a3f" };

const TABS = [
  { key: "events", label: "ORAC Risk Events" },
  { key: "issues", label: "ORAC Issues" },
  { key: "changes", label: "Navigator Changes" },
];

const MOCK_RESULTS: Record<string, ResultRow[]> = {
  events: [
    { id: "r1", title: "EVENT 117502 System Failure Causing Delayed Payment Processing", rating: "Major", status: "Open", date: "08/10/2024", action: null, expanded: false },
    { id: "r2", title: "EVENT 118643 Recurring ACH Fraud Incidents Detected", rating: "Critical", status: "Open", date: "07/25/2024", action: null, expanded: false },
    { id: "r3", title: "EVENT 119205 Third-party Outage Impacting Reconciliations", rating: "Major", status: "Open", date: "08/02/2024", action: null, expanded: false },
  ],
  issues: [
    { id: "r4", title: "ISSUE 410293 Data Privacy Compliance Gap in Customer Onboarding", rating: "High", status: "Open", date: "08/15/2024", action: null, expanded: false },
    { id: "r5", title: "ISSUE 412558 Missing Sign-off on Q2 Financial Reconciliation", rating: "Medium", status: "Open", date: "07/10/2024", action: null, expanded: false },
  ],
  changes: [
    { id: "r6", title: "CHG 90221 Migration to New Cloud Infrastructure Provider", rating: "High", status: "Scheduled", date: "09/20/2024", action: null, expanded: false },
  ],
};

const SELECT_STYLE: React.CSSProperties = {
  padding: "7px 10px", borderRadius: 8, border: `1px solid ${BORDER}`,
  background: "#fff", fontSize: 12.5, color: TEXT, fontWeight: 600,
  width: "100%", appearance: "none", cursor: "pointer",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235b6b7a' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight: 28,
};

export default function ExpandSearch() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("events");
  const [dateFrom, setDateFrom] = useState("01/01/2022");
  const [dateTo, setDateTo] = useState("12/31/2022");
  const [rating, setRating] = useState("Any");
  const [status, setStatus] = useState("Any");
  const [region, setRegion] = useState("Any");
  const [businessUnit, setBusinessUnit] = useState("Any");
  const [aiText, setAiText] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState(MOCK_RESULTS);
  const [allCollapsed, setAllCollapsed] = useState(false);

  const currentResults = results[activeTab] || [];

  const handleSearch = () => setSearched(true);
  const handleClear = () => {
    setDateFrom(""); setDateTo(""); setRating("Any");
    setStatus("Any"); setRegion("Any"); setBusinessUnit("Any");
    setAiText(""); setSearched(false);
  };

  const setAction = (id: string, action: Action) => {
    setResults(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(r => r.id === id ? { ...r, action } : r),
    }));
  };

  const toggleExpand = (id: string) => {
    setResults(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(r => r.id === id ? { ...r, expanded: !r.expanded } : r),
    }));
  };

  const collapseAll = () => {
    setResults(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(r => ({ ...r, expanded: false })),
    }));
    setAllCollapsed(true);
  };

  const LabelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 900, color: MUTED, marginBottom: 5, display: "block" };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "10px 18px", fontSize: 12.5, color: MUTED, fontWeight: 600 }}>
        <span style={{ color: TEXT, fontWeight: 900 }}>Home</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: TEXT, fontWeight: 900 }}>Audit Universe Mapping</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: TEXT, fontWeight: 900 }}>Step 2.</span>{" "}Discover Additional Events (optional)
      </div>

      {/* Tab bar + Export */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "0 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ display: "flex" }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: "12px 16px", fontSize: 13, fontWeight: 900, cursor: "pointer", border: "none", borderBottom: activeTab === tab.key ? `2px solid ${NAVY}` : "2px solid transparent", background: "transparent", color: activeTab === tab.key ? NAVY : MUTED, transition: "all 120ms" }}>
              {tab.label}
            </button>
          ))}
        </div>
        <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 8, cursor: "pointer", border: `1px solid ${BORDER}`, background: "#fff", color: TEXT, fontSize: 12.5, fontWeight: 900, marginBlock: 8 }}>
          <Download size={13} /> Export
        </button>
      </div>

      {/* Main */}
      <div style={{ padding: 18, flex: 1 }}>

        {/* Title + description */}
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 900, color: TEXT }}>Step 2. Discover Additional Events (optional)</h1>
          <p style={{ margin: 0, fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>
            Use filters, AI search, or both. Leave either section blank if not needed, then select Search. Review results and accept only events that should be included. For accepted events, enter additional impacted auditable entities and impact rationale. Default is blank.
          </p>
        </div>

        {/* Search criteria card */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: "0 6px 18px rgba(16,24,40,0.08)" }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: TEXT, marginBottom: 3 }}>Search criteria</div>
          <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 14 }}>Filters and AI search can be used independently, or combined. If both are provided, results reflect both.</div>

          {/* Date row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={LabelStyle}>Date from</label>
              <input
                type="text" value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                placeholder="MM/DD/YYYY"
                style={{ ...SELECT_STYLE, backgroundImage: "none", paddingRight: 10 }}
              />
            </div>
            <div>
              <label style={LabelStyle}>Date to</label>
              <input
                type="text" value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                placeholder="MM/DD/YYYY"
                style={{ ...SELECT_STYLE, backgroundImage: "none", paddingRight: 10 }}
              />
            </div>
            <div>
              <label style={LabelStyle}>Rating</label>
              <select value={rating} onChange={e => setRating(e.target.value)} style={SELECT_STYLE}>
                {["Any", "Critical", "High", "Major", "Medium", "Low"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Filter row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label style={LabelStyle}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={SELECT_STYLE}>
                {["Any", "Open", "Overdue", "Closed", "Scheduled", "Completed"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={LabelStyle}>Region</label>
              <select value={region} onChange={e => setRegion(e.target.value)} style={SELECT_STYLE}>
                {["Any", "North America", "EMEA", "APAC", "Global"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={LabelStyle}>Business Unit</label>
              <select value={businessUnit} onChange={e => setBusinessUnit(e.target.value)} style={SELECT_STYLE}>
                {["Any", "Technology", "Compliance", "Operations", "Finance", "Security"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* AI search */}
          <div style={{ borderTop: `1px solid ${DIVIDER}`, paddingTop: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 900, color: TEXT, marginBottom: 3 }}>AI search (optional)</div>
            <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 10 }}>Describe what you are looking for in natural language. Leave blank to search using filters only.</div>
            <textarea
              value={aiText}
              onChange={e => setAiText(e.target.value)}
              placeholder="Example: Find open or overdue events related to access control weaknesses affecting customer data."
              rows={4}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}`,
                fontSize: 12.5, color: TEXT, resize: "vertical", outline: "none",
                fontFamily: "inherit", lineHeight: 1.5,
              }}
              onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = "#93c5fd"; }}
              onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <button
              onClick={handleClear}
              style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", cursor: "pointer", fontSize: 12.5, fontWeight: 900, color: TEXT }}
            >
              Clear all
            </button>
            <button
              onClick={handleSearch}
              style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: NAVY, color: "#fff", cursor: "pointer", fontSize: 12.5, fontWeight: 900 }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Search results */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16, boxShadow: "0 6px 18px rgba(16,24,40,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: TEXT }}>Search results</div>
            <button onClick={collapseAll} style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${BORDER}`, background: "#f8fafc", cursor: "pointer", fontSize: 12, fontWeight: 900, color: MUTED }}>
              Collapse all
            </button>
          </div>
          <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 14 }}>
            Expand an event to review details and enter audit universe mapping before accepting.
          </div>

          {!searched ? (
            <div style={{ padding: "28px 0", textAlign: "center", color: MUTED, fontSize: 13 }}>
              Run a search to see results here.
            </div>
          ) : currentResults.length === 0 ? (
            <div style={{ padding: "28px 0", textAlign: "center", color: MUTED, fontSize: 13 }}>
              No results found. Try adjusting your filters or AI search.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {currentResults.map(row => {
                const isAccepted = row.action === "accepted";
                const isRemoved = row.action === "removed";

                return (
                  <div key={row.id} style={{ background: isRemoved ? "#fef2f2" : isAccepted ? "#f0fdf4" : "#fff", border: `1px solid ${isRemoved ? "#fecaca" : isAccepted ? "#bbf7d0" : BORDER}`, borderRadius: 10, overflow: "hidden", opacity: isRemoved ? 0.7 : 1 }}>
                    {/* Card header */}
                    <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 900, color: TEXT, marginBottom: 6 }}>{row.title}</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {[
                            { label: `Rating: ${row.rating}`, color: RATING_COLOR[row.rating] ?? TEXT },
                            { label: `Status: ${row.status}`, color: STATUS_COLOR[row.status] ?? TEXT },
                            { label: `Date: ${row.date}`, color: MUTED },
                          ].map(pill => (
                            <span key={pill.label} style={{ padding: "2px 8px", borderRadius: 6, background: "#f1f5f9", border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 700, color: pill.color }}>
                              {pill.label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        {!isAccepted && !isRemoved ? (
                          <>
                            <button onClick={() => setAction(row.id, "accepted")} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 7, cursor: "pointer", border: "none", background: "#166534", color: "#fff", fontSize: 12.5, fontWeight: 900 }}>
                              <Check size={13} /> Accept
                            </button>
                            <button onClick={() => setAction(row.id, "removed")} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 7, cursor: "pointer", border: "none", background: "#b91c1c", color: "#fff", fontSize: 12.5, fontWeight: 900 }}>
                              Remove
                            </button>
                          </>
                        ) : isAccepted ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 7, background: "#dcfce7", color: "#166534", fontSize: 12.5, fontWeight: 900 }}>
                            <Check size={13} /> Accepted
                          </span>
                        ) : (
                          <span style={{ padding: "6px 12px", borderRadius: 7, background: "#fee2e2", color: "#b91c1c", fontSize: 12.5, fontWeight: 900 }}>Removed</span>
                        )}
                        <button onClick={() => toggleExpand(row.id)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 7, cursor: "pointer", border: "1px solid #e2e8f0", background: "#f8fafc", color: MUTED }}>
                          {row.expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {row.expanded && (
                      <div style={{ borderTop: `1px solid ${DIVIDER}`, background: "#fafbfd", padding: "14px 18px 16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8, marginBottom: 14 }}>
                          {[
                            ["Description", "Unauthorized access to customer data."],
                            ["Root Cause", "Weak access controls."],
                            ["Impact", "Potential financial loss and regulatory fines."],
                            ["Business Unit", "Technology"],
                            ["Region", "North America"],
                            ["Tagged AE(s)", "AE‑1023 Payments Processing Platform"],
                          ].map(([k, v]) => (
                            <>
                              <span key={`k-${k}`} style={{ fontSize: 12.5, fontWeight: 900, color: MUTED }}>{k}</span>
                              <span key={`v-${k}`} style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>{v}</span>
                            </>
                          ))}
                        </div>
                        <div style={{ borderTop: `1px solid ${DIVIDER}`, paddingTop: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 900, color: MUTED, marginBottom: 8 }}>ADDITIONAL IMPACTED AE(S)</div>
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            style={{ padding: "6px 10px", borderRadius: 8, border: "1px dashed #bfdbfe", fontSize: 12.5, color: TEXT, outline: "none", minHeight: 36, lineHeight: 1.5 }}
                            onFocus={e => { (e.currentTarget as HTMLElement).style.outline = "2px solid #bfdbfe"; }}
                            onBlur={e => { (e.currentTarget as HTMLElement).style.outline = "none"; }}
                          >
                            Click to enter additional AEs…
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
          <button onClick={() => setLocation("/review-validate")} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #d6deea", background: "#fff", fontWeight: 900, cursor: "pointer", fontSize: 13, minWidth: 100 }}>
            Back
          </button>
          <button onClick={() => setLocation("/insights-summary")} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)", background: NAVY, color: "#fff", fontWeight: 900, cursor: "pointer", fontSize: 13, minWidth: 100 }}>
            Next
          </button>
        </div>

      </div>
    </div>
  );
}
