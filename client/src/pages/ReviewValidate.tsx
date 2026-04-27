import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Check, ChevronRight, ChevronDown, RotateCcw, Download, X, Pencil, Plus, ChevronDown as DropIcon } from "lucide-react";

const NAVY = "#0b2a4a";
const BORDER = "#e6e9ef";
const MUTED = "#5b6b7a";
const TEXT = "#122033";
const DIVIDER = "#eef2f7";

type Action = "accepted" | "removed" | null;

interface AERow { label: string; relevancy: "High" | "Medium" | "Low"; }

interface EventDetail {
  description: string;
  rootCause: string;
  impact: string;
  businessUnit: string;
  region: string;
  taggedAE: string;
  aeRows: AERow[];
  rationale: string[];
}

interface EventRow {
  id: string;
  title: string;
  rating: string;
  status: string;
  date: string;
  action: Action;
  expanded: boolean;
  detail: EventDetail;
}

const RELEVANCY_BG: Record<string, string> = { High: "#166534", Medium: "#1f5ea8", Low: "#92400e" };

const DETAIL_BASE: EventDetail = {
  description: "Unauthorized access to customer data.",
  rootCause: "Weak access controls.",
  impact: "Potential financial loss and regulatory fines.",
  businessUnit: "Technology",
  region: "North America",
  taggedAE: "AE 1023 Payments Processing Platform",
  aeRows: [
    { label: "AE1 title", relevancy: "High" },
    { label: "AE 2 title", relevancy: "High" },
  ],
  rationale: [
    "Matching in related standards, service, verticals (AE1, AE2).",
    "All contain shared dependencies (AE1, AE2, AE3).",
    "AE2 has cross-functional impact across multiple business units.",
    "AE3 has indirect relationship through shared technology stack and common data sources.",
  ],
};

const makeDetail = (overrides: Partial<EventDetail> = {}): EventDetail => ({ ...DETAIL_BASE, ...overrides });

const INITIAL: Record<string, EventRow[]> = {
  events: [
    { id: "e1", title: "RE 1024 Data Privacy Breach", rating: "High", status: "Overdue", date: "12/15/2021", action: null, expanded: false, detail: makeDetail() },
    { id: "e2", title: "RE 1098 Compliance Failure", rating: "Medium", status: "Open", date: "02/07/2022", action: null, expanded: false, detail: makeDetail({ description: "Control gaps in compliance reporting process.", rootCause: "Lack of automated validation.", impact: "Regulatory penalties and reputational risk.", businessUnit: "Compliance", region: "EMEA" }) },
    { id: "e3", title: "RE 1156 Fraudulent Transactions", rating: "High", status: "Open", date: "11/03/2021", action: null, expanded: false, detail: makeDetail({ description: "Series of unauthorised transactions detected.", rootCause: "Insufficient fraud detection controls.", impact: "Financial loss and customer trust impact.", businessUnit: "Operations", region: "APAC" }) },
    { id: "e4", title: "RE 1219 Service Outage and Recovery Delay", rating: "Major", status: "Overdue", date: "06/18/2022", action: null, expanded: false, detail: makeDetail({ description: "Critical system unavailability during peak hours.", rootCause: "Infrastructure failure and delayed escalation.", impact: "Operational disruption and SLA breach.", businessUnit: "Technology", region: "Global" }) },
  ],
  issues: [
    { id: "i1", title: "ISSUE 402911 Missing Authorization in Manual Override Process", rating: "High", status: "Open", date: "08/01/2024", action: null, expanded: false, detail: makeDetail({ description: "Manual overrides executed without adequate approval.", rootCause: "Process design gap.", impact: "Increased risk of unauthorized changes.", businessUnit: "Operations", region: "North America" }) },
    { id: "i2", title: "ISSUE 405822 Incomplete Training Records for AML Tool", rating: "Medium", status: "Open", date: "06/22/2024", action: null, expanded: false, detail: makeDetail({ description: "Staff training records for AML tool not fully maintained.", rootCause: "Tracking system not integrated.", impact: "Compliance exposure and audit risk.", businessUnit: "Compliance", region: "EMEA" }) },
  ],
  changes: [
    { id: "c1", title: "CHG 89012 Core Banking Platform v2.4 Upgrade", rating: "Critical", status: "Scheduled", date: "09/15/2024", action: null, expanded: false, detail: makeDetail({ description: "Major version upgrade to core banking platform.", rootCause: "End of vendor support for v2.3.", impact: "Potential service disruption during cutover.", businessUnit: "Technology", region: "Global" }) },
    { id: "c2", title: "CHG 89105 Firewall Ruleset Update for APAC Region", rating: "Low", status: "Completed", date: "09/01/2024", action: null, expanded: false, detail: makeDetail({ description: "Updated firewall rules to align with new security standards.", rootCause: "Policy refresh cycle.", impact: "Minimal — completed successfully.", businessUnit: "Security", region: "APAC" }) },
  ],
};

const TABS = [
  { key: "events", label: "ORAC Risk Events" },
  { key: "issues", label: "ORAC Issues" },
  { key: "changes", label: "Navigator Changes" },
];

const STATUS_COLOR: Record<string, string> = { Overdue: "#b42318", Open: "#1f5ea8", Scheduled: "#6d28d9", Completed: "#1f7a3f" };
const RATING_COLOR: Record<string, string> = { Critical: "#b42318", High: "#b54708", Major: "#b54708", Medium: "#1f5ea8", Low: "#1f7a3f" };

// ── sessionStorage persistence ─────────────────────────────────────────────
const RV_KEY = "review_validate_state";

function rvLoad(): Record<string, EventRow[]> | null {
  try {
    const raw = sessionStorage.getItem(RV_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function rvSave(items: Record<string, EventRow[]>) {
  try {
    sessionStorage.setItem(RV_KEY, JSON.stringify(items));
    // Accepted rows available for downstream
    const accepted = {
      events:  items["events"]?.filter(r => r.action === "accepted") ?? [],
      issues:  items["issues"]?.filter(r => r.action === "accepted") ?? [],
      changes: items["changes"]?.filter(r => r.action === "accepted") ?? [],
    };
    sessionStorage.setItem("review_validate_accepted", JSON.stringify(accepted));
  } catch { /* ignore quota errors */ }
}

// ── Component ──────────────────────────────────────────────────────────────
export default function ReviewValidate() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("events");
  const [items, setItems] = useState<Record<string, EventRow[]>>(() => rvLoad() ?? INITIAL);
  const [editingRationale, setEditingRationale] = useState<string | null>(null);
  const [openAEDropdown, setOpenAEDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Persist on every change
  useEffect(() => { rvSave(items); }, [items]);

  const current = items[activeTab] || [];

  const updateRow = (id: string, patch: Partial<EventRow>) =>
    setItems(prev => ({ ...prev, [activeTab]: prev[activeTab].map(r => r.id === id ? { ...r, ...patch } : r) }));

  const setAction = (id: string, action: Action) => updateRow(id, { action });
  const toggleExpand = (id: string) => updateRow(id, { expanded: !current.find(r => r.id === id)?.expanded });

  const removeAE = (id: string, idx: number) => {
    const row = current.find(r => r.id === id)!;
    updateRow(id, { detail: { ...row.detail, aeRows: row.detail.aeRows.filter((_, i) => i !== idx) } });
  };

  const addAE = (id: string, label: string) => {
    const row = current.find(r => r.id === id)!;
    if (row.detail.aeRows.some(ae => ae.label === label)) return;
    updateRow(id, { detail: { ...row.detail, aeRows: [...row.detail.aeRows, { label, relevancy: "High" }] } });
    setOpenAEDropdown(null);
  };

  const AE_OPTIONS = [
    "AE‑1010 Trade Execution Platform",
    "AE‑1101 Client Onboarding",
    "AE‑1205 Reconciliation Engine",
    "AE‑2001 Treasury Management",
    "AE‑2110 AML Monitoring",
    "AE‑2340 Fraud Detection",
    "AE‑3001 Enterprise Risk Platform",
    "AE‑3301 Financial Controls Oversight",
    "AE‑4001 Regulatory Reporting",
    "AE‑4210 Data Governance",
    "AE‑5099 Records Management",
    "AE‑5200 IT Security Operations",
  ];

  const acceptAll = () => setItems(prev => ({ ...prev, [activeTab]: prev[activeTab].map(r => ({ ...r, action: "accepted" as Action })) }));
  const resetAll = () => setItems(prev => ({ ...prev, [activeTab]: prev[activeTab].map(r => ({ ...r, action: null, expanded: false })) }));

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "10px 18px", fontSize: 12.5, color: MUTED, fontWeight: 600 }}>
        <span style={{ color: TEXT, fontWeight: 900 }}>Home</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: TEXT, fontWeight: 900 }}>Audit Universe Mapping</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: TEXT, fontWeight: 900 }}>Step 1.</span>{" "}Review AI Suggested Events
      </div>

      {/* Tab bar + action buttons */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "0 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex" }}>
          {TABS.map(tab => {
            const accepted = items[tab.key]?.filter(r => r.action === "accepted").length ?? 0;
            return (
              <button key={tab.key} data-testid={`tab-${tab.key}`} onClick={() => setActiveTab(tab.key)} style={{ padding: "12px 16px", fontSize: 13, fontWeight: 900, cursor: "pointer", border: "none", borderBottom: activeTab === tab.key ? `2px solid ${NAVY}` : "2px solid transparent", background: "transparent", color: activeTab === tab.key ? NAVY : MUTED, transition: "all 120ms", display: "inline-flex", alignItems: "center", gap: 6 }}>
                {tab.label}
                {accepted > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9, background: "#166534", color: "#fff", fontSize: 10.5, fontWeight: 900 }}>
                    {accepted}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, paddingBlock: 8, flexShrink: 0 }}>
          <button data-testid="button-accept-all" onClick={acceptAll} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 8, cursor: "pointer", border: "1px solid rgba(31,122,63,0.3)", background: "rgba(31,122,63,0.07)", color: "#1f7a3f", fontSize: 12.5, fontWeight: 900, whiteSpace: "nowrap" }}>
            <Check size={13} /> Accept all on page
          </button>
          <button data-testid="button-reset" onClick={resetAll} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 8, cursor: "pointer", border: "1px solid rgba(11,42,74,0.2)", background: "rgba(11,42,74,0.05)", color: NAVY, fontSize: 12.5, fontWeight: 900, whiteSpace: "nowrap" }}>
            <RotateCcw size={13} /> Reset to AI suggestions
          </button>
          <button data-testid="button-export" style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 8, cursor: "pointer", border: "1px solid #d6deea", background: "#fff", color: TEXT, fontSize: 12.5, fontWeight: 900 }}>
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ padding: 18, flex: 1 }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 900, color: TEXT }}>Step 1. Review AI Suggested Events</h1>
          <p style={{ margin: "0 0 10px", fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>
            Events are shown in a compact list by default. Expand any event to review full details and the proposed audit universe mapping. Additional impacted auditable entities and impact rationale are editable.
          </p>

          {/* Cross-tab selection summary */}
          {(() => {
            const totalAccepted = TABS.reduce((n, t) => n + (items[t.key]?.filter(r => r.action === "accepted").length ?? 0), 0);
            const totalRemoved  = TABS.reduce((n, t) => n + (items[t.key]?.filter(r => r.action === "removed").length ?? 0), 0);
            const totalAll      = TABS.reduce((n, t) => n + (items[t.key]?.length ?? 0), 0);
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: totalAccepted > 0 ? "#f0fdf4" : "#f8fafc", border: `1px solid ${totalAccepted > 0 ? "#bbf7d0" : "#eef2f7"}`, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12.5, fontWeight: 900, color: MUTED }}>Selection across all tabs:</span>
                <span style={{ padding: "2px 9px", borderRadius: 6, background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 900 }}>
                  {totalAccepted} accepted
                </span>
                {totalRemoved > 0 && (
                  <span style={{ padding: "2px 9px", borderRadius: 6, background: "#fee2e2", color: "#b91c1c", fontSize: 12, fontWeight: 900 }}>
                    {totalRemoved} removed
                  </span>
                )}
                <span style={{ padding: "2px 9px", borderRadius: 6, background: "#f1f5f9", color: MUTED, fontSize: 12, fontWeight: 700 }}>
                  {totalAll - totalAccepted - totalRemoved} pending
                </span>
              </div>
            );
          })()}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {current.map(row => {
            const isAccepted = row.action === "accepted";
            const isRemoved = row.action === "removed";
            const isEditingRationale = editingRationale === row.id;

            return (
              <div
                key={row.id}
                data-testid={`card-event-${row.id}`}
                style={{ background: isRemoved ? "#fef2f2" : isAccepted ? "#f0fdf4" : "#fff", border: `1px solid ${isRemoved ? "#fecaca" : isAccepted ? "#bbf7d0" : BORDER}`, borderRadius: 10, opacity: isRemoved ? 0.7 : 1, overflow: "hidden", transition: "all 140ms" }}
              >
                {/* Card header row */}
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
                        <button data-testid={`button-accept-${row.id}`} onClick={() => setAction(row.id, "accepted")} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 7, cursor: "pointer", border: "none", background: "#166534", color: "#fff", fontSize: 12.5, fontWeight: 900 }}>
                          <Check size={13} /> Accept
                        </button>
                        <button data-testid={`button-remove-${row.id}`} onClick={() => setAction(row.id, "removed")} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 7, cursor: "pointer", border: "none", background: "#b91c1c", color: "#fff", fontSize: 12.5, fontWeight: 900 }}>
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
                    <button data-testid={`button-expand-${row.id}`} onClick={() => toggleExpand(row.id)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 7, cursor: "pointer", border: "1px solid #e2e8f0", background: "#f8fafc", color: MUTED }}>
                      {row.expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </button>
                  </div>
                </div>

                {/* ── Expanded detail panel ── */}
                {row.expanded && (
                  <div style={{ borderTop: `1px solid ${DIVIDER}`, background: "#fafbfd" }}>

                    {/* Event detail grid */}
                    <div style={{ padding: "14px 18px 0" }}>
                      {[
                        { label: "Description", value: row.detail.description },
                        { label: "Root Cause", value: row.detail.rootCause },
                        { label: "Impact", value: row.detail.impact },
                        { label: "Business Unit", value: row.detail.businessUnit },
                        { label: "Region", value: row.detail.region },
                        { label: "Tagged AE(s) in Assure", value: row.detail.taggedAE },
                      ].map(field => (
                        <div key={field.label} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8, marginBottom: 10, alignItems: "baseline" }}>
                          <span style={{ fontSize: 12.5, fontWeight: 900, color: MUTED }}>{field.label}</span>
                          <span style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>{field.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* New Audit Universe Mapping */}
                    <div style={{ margin: "14px 18px 0", paddingTop: 14, borderTop: `1px solid ${DIVIDER}` }}>
                      <div style={{ fontSize: 13.5, fontWeight: 900, color: TEXT, marginBottom: 2 }}>New Audit Universe Mapping</div>
                      <div style={{ fontSize: 12, color: MUTED, marginBottom: 14 }}>Potential Relevant AE(s)</div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

                        {/* Left: AE rows */}
                        <div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 8, marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 900, color: MUTED, letterSpacing: "0.04em" }}>POTENTIAL RELEVANT AE(S)</div>
                            <div style={{ fontSize: 11, fontWeight: 900, color: MUTED, letterSpacing: "0.04em" }}>RELEVANCY</div>
                          </div>
                          {row.detail.aeRows.map((ae, idx) => (
                            <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", fontSize: 12.5, fontWeight: 700, color: TEXT }}>
                                <span style={{ flex: 1 }}>{ae.label}</span>
                                <button onClick={() => removeAE(row.id, idx)} style={{ display: "inline-flex", background: "none", border: "none", cursor: "pointer", padding: 0, color: MUTED }}>
                                  <X size={13} />
                                </button>
                              </div>
                              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "6px 10px", borderRadius: 8, background: RELEVANCY_BG[ae.relevancy], color: "#fff", fontSize: 12.5, fontWeight: 900 }}>
                                {ae.relevancy}
                              </div>
                            </div>
                          ))}

                          {/* Tag Additional AE button + dropdown */}
                          <div style={{ position: "relative", marginTop: 4 }}>
                            <button
                              data-testid={`button-tag-ae-${row.id}`}
                              onClick={(e) => {
                                if (openAEDropdown === row.id) { setOpenAEDropdown(null); return; }
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                setDropdownPos({ top: rect.bottom + 4, left: rect.left });
                                setOpenAEDropdown(row.id);
                              }}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                                border: "1px dashed #94a3b8", background: "#f8fafc",
                                color: NAVY, fontSize: 12.5, fontWeight: 900,
                              }}
                            >
                              <Plus size={13} /> Tag Additional AE
                              <DropIcon size={12} style={{ marginLeft: 2, opacity: 0.6 }} />
                            </button>

                            {openAEDropdown === row.id && (
                              <>
                              <div onClick={() => setOpenAEDropdown(null)} style={{ position: "fixed", inset: 0, zIndex: 9998 }} />
                              <div style={{
                                position: "fixed", zIndex: 9999,
                                top: dropdownPos.top, left: dropdownPos.left,
                                background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10,
                                boxShadow: "0 8px 24px rgba(16,24,40,0.12)",
                                minWidth: 280, maxHeight: 240, overflowY: "auto",
                              }}>
                                <div style={{ padding: "8px 10px 4px", fontSize: 11, fontWeight: 900, color: MUTED, letterSpacing: "0.04em" }}>
                                  SELECT AUDITABLE ENTITY
                                </div>
                                {AE_OPTIONS.filter(opt => !row.detail.aeRows.some(ae => ae.label === opt)).map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => addAE(row.id, opt)}
                                    style={{
                                      display: "block", width: "100%", textAlign: "left",
                                      padding: "8px 12px", border: "none", background: "none",
                                      cursor: "pointer", fontSize: 12.5, color: TEXT, fontWeight: 600,
                                      borderBottom: `1px solid ${BORDER}`,
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}
                                  >
                                    {opt}
                                  </button>
                                ))}
                                {AE_OPTIONS.filter(opt => !row.detail.aeRows.some(ae => ae.label === opt)).length === 0 && (
                                  <div style={{ padding: "10px 12px", fontSize: 12.5, color: MUTED }}>All AEs already tagged.</div>
                                )}
                              </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Right: Rationale */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 900, color: MUTED, letterSpacing: "0.04em" }}>RATIONALE</div>
                            <button
                              onClick={() => setEditingRationale(isEditingRationale ? null : row.id)}
                              style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 6, border: `1px solid ${BORDER}`, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 900, color: TEXT }}
                            >
                              <Pencil size={11} /> Edit
                            </button>
                          </div>
                          <div style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", fontSize: 12.5, color: TEXT, lineHeight: 1.6 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: MUTED }}>Rationale for high relevancy:</div>
                            {isEditingRationale ? (
                              <div
                                contentEditable
                                suppressContentEditableWarning
                                style={{ outline: "none", minHeight: 60 }}
                                onFocus={e => { (e.currentTarget as HTMLElement).style.outline = "2px solid #bfdbfe"; }}
                                onBlur={e => { (e.currentTarget as HTMLElement).style.outline = "none"; }}
                              >
                                {row.detail.rationale.map((r, i) => <div key={i}>– {r}</div>)}
                              </div>
                            ) : (
                              <ul style={{ margin: 0, paddingLeft: 16 }}>
                                {row.detail.rationale.map((r, i) => <li key={i} style={{ marginBottom: 4 }}>– {r}</li>)}
                              </ul>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>

                    <div style={{ height: 16 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
          <button data-testid="button-back" onClick={() => setLocation("/domain-home")} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #d6deea", background: "#fff", fontWeight: 900, cursor: "pointer", fontSize: 13, minWidth: 100 }}>
            Back
          </button>
          <button data-testid="button-next" onClick={() => setLocation("/expand-search")} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)", background: NAVY, color: "#fff", fontWeight: 900, cursor: "pointer", fontSize: 13, minWidth: 100 }}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
