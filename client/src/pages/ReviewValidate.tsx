import { useState } from "react";
import { useLocation } from "wouter";
import { Check, MoreHorizontal, ChevronRight, ChevronDown, RotateCcw, Download } from "lucide-react";

const NAVY = "#0b2a4a";
const BORDER = "#e6e9ef";
const MUTED = "#5b6b7a";
const TEXT = "#122033";

type Action = "accepted" | "removed" | null;

interface EventRow {
  id: string;
  title: string;
  rating: string;
  status: string;
  date: string;
  action: Action;
  expanded: boolean;
}

const INITIAL: Record<string, EventRow[]> = {
  events: [
    { id: "e1", title: "RE 1024 Data Privacy Breach", rating: "High", status: "Overdue", date: "12/15/2021", action: null, expanded: false },
    { id: "e2", title: "RE 1098 Compliance Failure", rating: "Medium", status: "Open", date: "02/07/2022", action: null, expanded: false },
    { id: "e3", title: "RE 1156 Fraudulent Transactions", rating: "High", status: "Open", date: "11/03/2021", action: null, expanded: false },
    { id: "e4", title: "RE 1219 Service Outage and Recovery Delay", rating: "Major", status: "Overdue", date: "06/18/2022", action: null, expanded: false },
  ],
  issues: [
    { id: "i1", title: "ISSUE 402911 Missing Authorization in Manual Override Process", rating: "High", status: "Open", date: "08/01/2024", action: null, expanded: false },
    { id: "i2", title: "ISSUE 405822 Incomplete Training Records for AML Tool", rating: "Medium", status: "Open", date: "06/22/2024", action: null, expanded: false },
  ],
  changes: [
    { id: "c1", title: "CHG 89012 Core Banking Platform v2.4 Upgrade", rating: "Critical", status: "Scheduled", date: "09/15/2024", action: null, expanded: false },
    { id: "c2", title: "CHG 89105 Firewall Ruleset Update for APAC Region", rating: "Low", status: "Completed", date: "09/01/2024", action: null, expanded: false },
  ],
};

const TABS = [
  { key: "events", label: "ORAC Risk Events" },
  { key: "issues", label: "ORAC Issues" },
  { key: "changes", label: "Navigator Changes" },
];

const STATUS_COLOR: Record<string, string> = {
  Overdue: "#b42318",
  Open: "#1f5ea8",
  Scheduled: "#6d28d9",
  Completed: "#1f7a3f",
};

const RATING_COLOR: Record<string, string> = {
  Critical: "#b42318",
  High: "#b54708",
  Major: "#b54708",
  Medium: "#1f5ea8",
  Low: "#1f7a3f",
};

export default function ReviewValidate() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("events");
  const [items, setItems] = useState(INITIAL);

  const current = items[activeTab] || [];

  const setAction = (id: string, action: Action) => {
    setItems(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(r => r.id === id ? { ...r, action } : r),
    }));
  };

  const toggleExpand = (id: string) => {
    setItems(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(r => r.id === id ? { ...r, expanded: !r.expanded } : r),
    }));
  };

  const acceptAll = () => {
    setItems(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(r => ({ ...r, action: "accepted" })),
    }));
  };

  const resetAll = () => {
    setItems(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(r => ({ ...r, action: null, expanded: false })),
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>

      {/* Breadcrumb */}
      <div style={{
        background: "#fff", borderBottom: `1px solid ${BORDER}`,
        padding: "10px 18px", fontSize: 12.5, color: MUTED, fontWeight: 600,
      }}>
        <span style={{ color: TEXT, fontWeight: 900 }}>Home</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: TEXT, fontWeight: 900 }}>Audit Universe Mapping</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: TEXT, fontWeight: 900 }}>Step 1.</span>{" "}Review AI Suggested Events
      </div>

      {/* Tab bar + action buttons */}
      <div style={{
        background: "#fff", borderBottom: `1px solid ${BORDER}`,
        padding: "0 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, flexWrap: "wrap",
      }}>
        {/* Tabs */}
        <div style={{ display: "flex" }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              data-testid={`tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "12px 16px", fontSize: 13, fontWeight: 900,
                cursor: "pointer", border: "none", borderBottom: activeTab === tab.key ? `2px solid ${NAVY}` : "2px solid transparent",
                background: "transparent",
                color: activeTab === tab.key ? NAVY : MUTED,
                transition: "all 120ms",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, paddingBottom: 8, paddingTop: 8, flexShrink: 0 }}>
          <button
            data-testid="button-accept-all"
            onClick={acceptAll}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "7px 11px", borderRadius: 8, cursor: "pointer",
              border: "1px solid rgba(31,122,63,0.3)", background: "rgba(31,122,63,0.07)",
              color: "#1f7a3f", fontSize: 12.5, fontWeight: 900, whiteSpace: "nowrap",
            }}
          >
            <Check size={13} /> Accept all on page
          </button>
          <button
            data-testid="button-reset"
            onClick={resetAll}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "7px 11px", borderRadius: 8, cursor: "pointer",
              border: "1px solid rgba(11,42,74,0.2)", background: "rgba(11,42,74,0.05)",
              color: NAVY, fontSize: 12.5, fontWeight: 900, whiteSpace: "nowrap",
            }}
          >
            <RotateCcw size={13} /> Reset to AI suggestions
          </button>
          <button
            data-testid="button-export"
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "7px 11px", borderRadius: 8, cursor: "pointer",
              border: "1px solid #d6deea", background: "#fff",
              color: TEXT, fontSize: 12.5, fontWeight: 900,
            }}
          >
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ padding: 18, flex: 1 }}>

        {/* Title + description */}
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 900, color: TEXT }}>
            Step 1. Review AI Suggested Events
          </h1>
          <p style={{ margin: 0, fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>
            Events are shown in a compact list by default. Expand any event to review full details
            and the proposed audit universe mapping. Additional impacted auditable entities and
            impact rationale are editable.
          </p>
        </div>

        {/* Event Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {current.map((row) => {
            const isAccepted = row.action === "accepted";
            const isRemoved = row.action === "removed";

            return (
              <div
                key={row.id}
                data-testid={`card-event-${row.id}`}
                style={{
                  background: isRemoved ? "#fef2f2" : isAccepted ? "#f0fdf4" : "#fff",
                  border: `1px solid ${isRemoved ? "#fecaca" : isAccepted ? "#bbf7d0" : BORDER}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  opacity: isRemoved ? 0.6 : 1,
                  transition: "all 140ms",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  {/* Title + pills */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 900, color: TEXT, marginBottom: 6 }}>
                      {row.title}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: 6,
                        background: "#f1f5f9", border: "1px solid #e2e8f0",
                        fontSize: 12, fontWeight: 700,
                        color: RATING_COLOR[row.rating] ?? TEXT,
                      }}>
                        Rating: {row.rating}
                      </span>
                      <span style={{
                        padding: "2px 8px", borderRadius: 6,
                        background: "#f1f5f9", border: "1px solid #e2e8f0",
                        fontSize: 12, fontWeight: 700,
                        color: STATUS_COLOR[row.status] ?? TEXT,
                      }}>
                        Status: {row.status}
                      </span>
                      <span style={{
                        padding: "2px 8px", borderRadius: 6,
                        background: "#f1f5f9", border: "1px solid #e2e8f0",
                        fontSize: 12, fontWeight: 700, color: MUTED,
                      }}>
                        Date: {row.date}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {!isAccepted && !isRemoved ? (
                      <>
                        <button
                          data-testid={`button-accept-${row.id}`}
                          onClick={() => setAction(row.id, "accepted")}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "6px 12px", borderRadius: 7, cursor: "pointer",
                            border: "none", background: "#166534",
                            color: "#fff", fontSize: 12.5, fontWeight: 900,
                          }}
                        >
                          <Check size={13} /> Accept
                        </button>
                        <button
                          data-testid={`button-remove-${row.id}`}
                          onClick={() => setAction(row.id, "removed")}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "6px 12px", borderRadius: 7, cursor: "pointer",
                            border: "none", background: "#b91c1c",
                            color: "#fff", fontSize: 12.5, fontWeight: 900,
                          }}
                        >
                          Remove
                        </button>
                      </>
                    ) : isAccepted ? (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "6px 12px", borderRadius: 7,
                        background: "#dcfce7", color: "#166534",
                        fontSize: 12.5, fontWeight: 900,
                      }}>
                        <Check size={13} /> Accepted
                      </span>
                    ) : (
                      <span style={{
                        padding: "6px 12px", borderRadius: 7,
                        background: "#fee2e2", color: "#b91c1c",
                        fontSize: 12.5, fontWeight: 900,
                      }}>
                        Removed
                      </span>
                    )}

                    <button
                      data-testid={`button-more-${row.id}`}
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 32, height: 32, borderRadius: 7, cursor: "pointer",
                        border: "1px solid #e2e8f0", background: "#f8fafc", color: MUTED,
                      }}
                    >
                      <MoreHorizontal size={15} />
                    </button>

                    <button
                      data-testid={`button-expand-${row.id}`}
                      onClick={() => toggleExpand(row.id)}
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 32, height: 32, borderRadius: 7, cursor: "pointer",
                        border: "1px solid #e2e8f0", background: "#f8fafc", color: MUTED,
                        transition: "transform 200ms",
                      }}
                    >
                      {row.expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail panel */}
                {row.expanded && (
                  <div style={{
                    marginTop: 14, paddingTop: 14, borderTop: `1px solid ${BORDER}`,
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
                  }}>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 900, color: MUTED, marginBottom: 4 }}>AUDITABLE ENTITIES TAGGED IN ASSURE</div>
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        style={{ fontSize: 12.5, color: TEXT, padding: "4px 6px", borderRadius: 6, border: "1px dashed #bfdbfe", outline: "none", minHeight: 36, lineHeight: 1.5 }}
                      >
                        AE‑1023 Payments Processing Platform
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 900, color: MUTED, marginBottom: 4 }}>IMPACT RATIONALE</div>
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        style={{ fontSize: 12.5, color: TEXT, padding: "4px 6px", borderRadius: 6, border: "1px dashed #bfdbfe", outline: "none", minHeight: 36, lineHeight: 1.5 }}
                      >
                        Weaknesses in access provisioning may impact downstream financial controls.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
          <button
            data-testid="button-back"
            onClick={() => setLocation("/domain-home")}
            style={{
              padding: "10px 14px", borderRadius: 10,
              border: "1px solid #d6deea", background: "#fff",
              fontWeight: 900, cursor: "pointer", fontSize: 13, minWidth: 100,
            }}
          >
            Back
          </button>
          <button
            data-testid="button-next"
            onClick={() => setLocation("/expand-search")}
            style={{
              padding: "10px 14px", borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.1)", background: NAVY,
              color: "#fff", fontWeight: 900, cursor: "pointer", fontSize: 13, minWidth: 100,
            }}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}
