import { useState } from "react";
import { useLocation } from "wouter";
import { Pencil, Check, ChevronRight, ChevronDown, X, Plus, ChevronDown as DropIcon } from "lucide-react";

const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

const NAVY = "#0b2a4a";
const BORDER = "#e6e9ef";
const DIVIDER = "#eef2f7";
const MUTED = "#5b6b7a";
const TEXT = "#122033";

type Rating = "Critical" | "Major" | "Limited";
type BlockVariant = "risk" | "issue" | "reg";
type Relevancy = "High" | "Medium" | "Low";

interface AEEntry { label: string; relevancy: Relevancy; }

interface EventRow {
  reference: string;
  rating: Rating;
  source: string;
  taggedAE: string[];
  additionalAE: AEEntry[];
  rationale: string;
  expanded?: boolean;
}

interface EventBlock {
  variant: BlockVariant;
  title: string;
  summary: string;
  rows: EventRow[];
}

const RELEVANCY_BG: Record<Relevancy, string> = { High: "#166534", Medium: "#1f5ea8", Low: "#92400e" };

const AE_OPTIONS = [
  "AE‑1010 Trade Execution Platform",
  "AE‑1023 Payments Processing Platform",
  "AE‑1101 Client Onboarding",
  "AE‑1205 Reconciliation Engine",
  "AE‑2001 Treasury Management",
  "AE‑2044 Identity and Access Management",
  "AE‑2110 AML Monitoring",
  "AE‑2210 Issue Management",
  "AE‑2340 Fraud Detection",
  "AE‑3001 Enterprise Risk Platform",
  "AE‑3301 Financial Controls Oversight",
  "AE‑4001 Regulatory Reporting",
  "AE‑4102 Regulatory Reporting",
  "AE‑4210 Data Governance",
  "AE‑5099 Records Management",
  "AE‑5200 IT Security Operations",
];

const BLOCKS: EventBlock[] = [
  {
    variant: "risk",
    title: "Internal Risk Event",
    summary:
      "A major system outage and fraud incident exposed weaknesses in technology resilience and regional controls during peak processing periods.",
    rows: [
      {
        reference: "ISSUE 778901",
        rating: "Critical",
        source: "Risk Management Forum, Q1\nQuarterly Notes.docx",
        taggedAE: ["AE‑1023 Payments Processing Platform", "AE‑2044 Identity and Access Management"],
        additionalAE: [{ label: "AE‑3301 Financial Controls Oversight", relevancy: "High" }],
        rationale:
          "Weaknesses in access provisioning may impact downstream financial controls and oversight processes beyond the primary application.",
        expanded: false,
      },
    ],
  },
  {
    variant: "issue",
    title: "Known Issue",
    summary:
      "Multiple ORAC issues remain unresolved with extended remediation timelines, reflecting weak ownership and reliance on manual processes.",
    rows: [
      {
        reference: "ISSUE 781220",
        rating: "Major",
        source: "Ops Risk Committee\nMeeting Pack.pdf",
        taggedAE: ["AE‑2210 Issue Management"],
        additionalAE: [{ label: "AE‑3301 Financial Controls Oversight", relevancy: "High" }],
        rationale:
          "Delayed remediation increases the likelihood of control failures and audit findings across dependent processes.",
        expanded: false,
      },
    ],
  },
  {
    variant: "reg",
    title: "Regulatory Exam or Inquiry",
    summary:
      "Regulatory attention on data retention and evidence management highlighted gaps in current compliance readiness.",
    rows: [
      {
        reference: "ILS 5678",
        rating: "Limited",
        source: "Risk Management Forum, Q1\nMeeting Pack.pdf",
        taggedAE: ["AE‑4102 Regulatory Reporting"],
        additionalAE: [{ label: "AE‑5099 Records Management", relevancy: "High" }],
        rationale:
          "Evidence retention controls are shared across multiple compliance and reporting processes.",
        expanded: false,
      },
    ],
  },
];

const BG: Record<BlockVariant, string> = {
  risk: "#e8f1fb",
  issue: "#fef3c7",
  reg: "#f3e8ff",
};

const RATING_COLOR: Record<Rating, string> = {
  Critical: "#b42318",
  Major: "#b54708",
  Limited: "#1f5ea8",
};

export default function Step4Analyze() {
  const [, setLocation] = useLocation();
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openAEDropdown, setOpenAEDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const [blocksData, setBlocksData] = useState<EventBlock[]>(
    BLOCKS.map(b => ({ ...b, rows: b.rows.map(r => ({ ...r, additionalAE: r.additionalAE.map(a => ({ ...a })) })) }))
  );

  const updateBlockSummary = (blockIdx: number, text: string) =>
    setBlocksData(prev => prev.map((b, i) => i === blockIdx ? { ...b, summary: text } : b));

  const updateRationale = (blockIdx: number, rowIdx: number, text: string) =>
    setBlocksData(prev => prev.map((b, i) => i === blockIdx
      ? { ...b, rows: b.rows.map((r, j) => j === rowIdx ? { ...r, rationale: text } : r) }
      : b
    ));

  const toggleExpand = (blockIdx: number, rowIdx: number) =>
    setBlocksData(prev => prev.map((b, i) => i === blockIdx
      ? { ...b, rows: b.rows.map((r, j) => j === rowIdx ? { ...r, expanded: !r.expanded } : r) }
      : b
    ));

  const removeTaggedAE = (blockIdx: number, rowIdx: number, aeIdx: number) =>
    setBlocksData(prev => prev.map((b, i) => i === blockIdx
      ? { ...b, rows: b.rows.map((r, j) => j === rowIdx ? { ...r, taggedAE: r.taggedAE.filter((_, k) => k !== aeIdx) } : r) }
      : b
    ));

  const removeAdditionalAE = (blockIdx: number, rowIdx: number, aeIdx: number) =>
    setBlocksData(prev => prev.map((b, i) => i === blockIdx
      ? { ...b, rows: b.rows.map((r, j) => j === rowIdx ? { ...r, additionalAE: r.additionalAE.filter((_, k) => k !== aeIdx) } : r) }
      : b
    ));

  const addAdditionalAE = (blockIdx: number, rowIdx: number, label: string) => {
    setBlocksData(prev => prev.map((b, i) => i === blockIdx
      ? { ...b, rows: b.rows.map((r, j) => j === rowIdx
          ? { ...r, additionalAE: r.additionalAE.some(a => a.label === label) ? r.additionalAE : [...r.additionalAE, { label, relevancy: "High" as Relevancy }] }
          : r
        ) }
      : b
    ));
    setOpenAEDropdown(null);
  };

  const dropdownKey = (blockIdx: number, rowIdx: number) => `${blockIdx}-${rowIdx}`;

  const handleNext = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const sessionId = sessionStorage.getItem("session_id") || "";
      const fetchData = (() => { try { return JSON.parse(sessionStorage.getItem("fetch_data_result") || "null"); } catch { return null; } })();

      const step4Analysis = blocksData.map(b => ({
        title: b.title,
        summary: b.summary,
        variant: b.variant,
        rows: b.rows.map(r => ({
          reference: r.reference,
          rating: r.rating,
          source: r.source,
          taggedAE: r.taggedAE.join(", "),
          additionalAE: r.additionalAE.map(a => a.label).join(", "),
          rationale: r.rationale,
        })),
      }));

      sessionStorage.setItem("step4_analysis", JSON.stringify(step4Analysis));

      if (sessionId && fetchData) {
        const res = await fetch(`${API_BASE}/api/v1/database/fetch-executive-summary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, fetch_data: fetchData, step4_analysis: step4Analysis }),
        });
        if (res.ok) {
          const result = await res.json();
          sessionStorage.setItem("exec_summary_result", JSON.stringify(result));
        }
      }
    } catch {
      // Navigate regardless
    } finally {
      setSubmitting(false);
      setLocation("/step-5");
    }
  };

  const selectedPm   = sessionStorage.getItem("selectedDomain") || "";
  const selectedBml  = sessionStorage.getItem("selectedBml")    || "";
  const selectedTeam = sessionStorage.getItem("selectedTeam")   || "";
  const scopeItems = [
    selectedPm   ? { k: "PM:", v: selectedPm }                   : null,
    selectedTeam ? { k: "Responsible Team:", v: selectedTeam }    : null,
    selectedBml  ? { k: "BML:", v: selectedBml }                  : null,
  ].filter(Boolean) as { k: string; v: string }[];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "10px 18px", fontSize: 12.5, color: MUTED, fontWeight: 600 }}>
        <span style={{ color: TEXT, fontWeight: 900 }}>Home</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: TEXT, fontWeight: 900 }}>Documents to Insights</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: TEXT, fontWeight: 900 }}>Step 4.</span>{" "}Analyze Events and Impact
      </div>

      {/* Scope bar */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(11,42,74,0.15)", background: "rgba(11,42,74,0.08)", color: NAVY, fontSize: 12, fontWeight: 900, whiteSpace: "nowrap" }}>
          Monitoring Scope
        </div>
        {scopeItems.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {scopeItems.map(({ k, v }) => (
              <div key={k} style={{ display: "flex", gap: 8, alignItems: "baseline", padding: "6px 10px", borderRadius: 10, background: "#f7f9fd", border: "1px solid #eef2f7", fontSize: 12.5, whiteSpace: "nowrap" }}>
                <span style={{ color: MUTED, fontWeight: 700 }}>{k}</span>
                <span style={{ color: TEXT, fontWeight: 900 }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div style={{ padding: 18, flex: 1 }}>
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: "0 6px 18px rgba(16,24,40,0.08)", padding: 18, maxWidth: 1100 }}>

          {/* Title + Edit toggle */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: TEXT }}>Analyze Events and Impact</h1>
            <button
              data-testid="button-edit-toggle"
              onClick={() => { setEditMode(e => !e); setOpenAEDropdown(null); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                fontSize: 12.5, fontWeight: 900, whiteSpace: "nowrap", flexShrink: 0,
                border: editMode ? "1px solid rgba(31,122,63,0.3)" : "1px solid rgba(31,94,168,0.3)",
                background: editMode ? "rgba(31,122,63,0.07)" : "rgba(31,94,168,0.07)",
                color: editMode ? "#1f7a3f" : "#1f5ea8",
                transition: "all 140ms ease",
              }}
            >
              {editMode ? <><Check size={13} /><span>Save</span></> : <><Pencil size={13} /><span>Edit</span></>}
            </button>
          </div>
          <p style={{ fontSize: 12.8, color: MUTED, margin: "0 0 20px", lineHeight: 1.5 }}>
            Review and refine events organized by event type.{" "}
            {editMode
              ? <span style={{ color: "#1f5ea8", fontWeight: 700 }}>Editing enabled — modify summaries, tag AEs, and update rationale.</span>
              : <span>Click <strong>Edit</strong> to modify content.</span>
            }
          </p>

          {blocksData.map((block, blockIdx) => (
            <div key={block.title} style={{ background: BG[block.variant], borderRadius: 12, padding: 14, marginBottom: 26 }}>

              {/* Block header */}
              <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 6, color: TEXT }}>{block.title}</div>

              {/* Editable summary */}
              <div
                contentEditable={editMode}
                suppressContentEditableWarning
                style={{
                  fontSize: 13, lineHeight: 1.5, marginBottom: 12, color: TEXT,
                  outline: "none", borderRadius: 6, padding: "2px 4px",
                  cursor: editMode ? "text" : "default",
                  border: editMode ? "1px dashed #bfdbfe" : "1px dashed transparent",
                  background: editMode ? "rgba(255,255,255,0.6)" : "transparent",
                }}
                onFocus={e => { if (editMode) { (e.currentTarget as HTMLElement).style.outline = "2px solid #bfdbfe"; (e.currentTarget as HTMLElement).style.background = "#eff6ff"; } }}
                onBlur={e => {
                  (e.currentTarget as HTMLElement).style.outline = "none";
                  (e.currentTarget as HTMLElement).style.background = editMode ? "rgba(255,255,255,0.6)" : "transparent";
                  updateBlockSummary(blockIdx, e.currentTarget.innerText);
                }}
              >
                {block.summary}
              </div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {block.rows.map((row, rowIdx) => {
                  const dk = dropdownKey(blockIdx, rowIdx);
                  const isDropOpen = openAEDropdown === dk;
                  const usedLabels = row.additionalAE.map(a => a.label);
                  const availableOptions = AE_OPTIONS.filter(opt => !usedLabels.includes(opt));

                  return (
                    <div
                      key={rowIdx}
                      data-testid={`card-event-${block.variant}-${rowIdx}`}
                      style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden", transition: "all 140ms" }}
                    >
                      {/* Card header */}
                      <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 900, color: TEXT, marginBottom: 6 }}>{row.reference}</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 6, background: "#f1f5f9", border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 700, color: RATING_COLOR[row.rating] }}>
                              Rating: {row.rating}
                            </span>
                            <span style={{ padding: "2px 8px", borderRadius: 6, background: "#f1f5f9", border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 700, color: MUTED }}>
                              Source: {row.source.split("\n")[0]}
                            </span>
                          </div>
                        </div>
                        <button
                          data-testid={`button-expand-${block.variant}-${rowIdx}`}
                          onClick={() => toggleExpand(blockIdx, rowIdx)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 7, cursor: "pointer", border: "1px solid #e2e8f0", background: "#f8fafc", color: MUTED, fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}
                        >
                          {row.expanded ? <><ChevronDown size={14} /><span>Collapse</span></> : <><ChevronRight size={14} /><span>Expand</span></>}
                        </button>
                      </div>

                      {/* Expanded detail panel */}
                      {row.expanded && (
                        <div style={{ borderTop: `1px solid ${DIVIDER}`, background: "#fafbfd" }}>

                          {/* Detail grid — Source + Tagged AEs */}
                          <div style={{ padding: "14px 18px 0" }}>
                            {/* Source */}
                            <div style={{ display: "grid", gridTemplateColumns: "210px 1fr", gap: 10, marginBottom: 12, alignItems: "start" }}>
                              <span style={{ fontSize: 12.5, fontWeight: 900, color: MUTED, paddingTop: 2 }}>Source (Meeting / Document)</span>
                              <span style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.6 }}>
                                {row.source.split("\n").map((l, j) => <div key={j}>{l}</div>)}
                              </span>
                            </div>

                            {/* Auditable Entities Tagged in Assure */}
                            <div style={{ display: "grid", gridTemplateColumns: "210px 1fr", gap: 10, marginBottom: 12, alignItems: "start" }}>
                              <span style={{ fontSize: 12.5, fontWeight: 900, color: MUTED, paddingTop: 2 }}>Auditable Entities Tagged in Assure</span>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {row.taggedAE.map((ae, j) => (
                                  <div key={j} style={{ display: "inline-flex", alignItems: "center", gap: 6, width: "fit-content", padding: "2px 8px", borderRadius: 6, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>{ae}</span>
                                    {editMode && (
                                      <button
                                        onClick={() => removeTaggedAE(blockIdx, rowIdx, j)}
                                        style={{ display: "inline-flex", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#6b7280", lineHeight: 1 }}
                                        title="Remove"
                                      >
                                        <X size={11} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Audit Universe Mapping */}
                          <div style={{ margin: "4px 18px 14px", paddingTop: 14, borderTop: `1px solid ${DIVIDER}` }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: TEXT, marginBottom: 2 }}>Audit Universe Mapping</div>
                            <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>Additional Impacted Auditable Entities</div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

                              {/* Left — AE rows + Tag button */}
                              <div>
                                {/* Column headers */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 8, marginBottom: 8 }}>
                                  <div style={{ fontSize: 11, fontWeight: 900, color: MUTED, letterSpacing: "0.04em" }}>ADDITIONAL IMPACTED AUDITABLE ENTITIES</div>
                                  <div style={{ fontSize: 11, fontWeight: 900, color: MUTED, letterSpacing: "0.04em" }}>RELEVANCY</div>
                                </div>

                                {/* AE rows */}
                                {row.additionalAE.map((ae, j) => (
                                  <div key={j} style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", fontSize: 12.5, fontWeight: 700, color: TEXT }}>
                                      <span style={{ flex: 1 }}>{ae.label}</span>
                                      {editMode && (
                                        <button
                                          onClick={() => removeAdditionalAE(blockIdx, rowIdx, j)}
                                          style={{ display: "inline-flex", background: "none", border: "none", cursor: "pointer", padding: 0, color: MUTED, lineHeight: 1 }}
                                          title="Remove"
                                        >
                                          <X size={13} />
                                        </button>
                                      )}
                                    </div>
                                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "6px 10px", borderRadius: 8, background: RELEVANCY_BG[ae.relevancy], color: "#fff", fontSize: 12.5, fontWeight: 900 }}>
                                      {ae.relevancy}
                                    </div>
                                  </div>
                                ))}

                                {/* Tag Additional AE button + dropdown — always visible */}
                                <div style={{ position: "relative", marginTop: 4 }}>
                                  <button
                                    data-testid={`button-tag-ae-${block.variant}-${rowIdx}`}
                                    onClick={e => {
                                      if (isDropOpen) { setOpenAEDropdown(null); return; }
                                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                      setDropdownPos({ top: rect.bottom + 4, left: rect.left });
                                      setOpenAEDropdown(dk);
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

                                  {isDropOpen && (
                                    <>
                                      <div onClick={() => setOpenAEDropdown(null)} style={{ position: "fixed", inset: 0, zIndex: 9998 }} />
                                      <div style={{
                                        position: "fixed", zIndex: 9999,
                                        top: dropdownPos.top, left: dropdownPos.left,
                                        background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10,
                                        boxShadow: "0 8px 24px rgba(16,24,40,0.12)",
                                        minWidth: 300, maxHeight: 260, overflowY: "auto",
                                      }}>
                                        <div style={{ padding: "8px 10px 4px", fontSize: 11, fontWeight: 900, color: MUTED, letterSpacing: "0.04em", borderBottom: `1px solid ${BORDER}` }}>
                                          SELECT AUDITABLE ENTITY
                                        </div>
                                        {availableOptions.length === 0 ? (
                                          <div style={{ padding: "10px 12px", fontSize: 12.5, color: MUTED }}>All AEs already tagged.</div>
                                        ) : (
                                          availableOptions.map(opt => (
                                            <button
                                              key={opt}
                                              onClick={() => addAdditionalAE(blockIdx, rowIdx, opt)}
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
                                          ))
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Right — Impact Rationale (editable in edit mode) */}
                              <div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                  <div style={{ fontSize: 11, fontWeight: 900, color: MUTED, letterSpacing: "0.04em", textTransform: "uppercase" }}>Impact Rationale</div>
                                </div>
                                <div
                                  contentEditable={editMode}
                                  suppressContentEditableWarning
                                  style={{
                                    fontSize: 12.5, color: TEXT, lineHeight: 1.6,
                                    padding: "10px 12px", borderRadius: 8,
                                    border: editMode ? "1px dashed #bfdbfe" : `1px solid ${BORDER}`,
                                    background: editMode ? "rgba(239,246,255,0.7)" : "#fff",
                                    outline: "none",
                                    cursor: editMode ? "text" : "default",
                                    minHeight: 60,
                                  }}
                                  onFocus={e => { if (editMode) { (e.currentTarget as HTMLElement).style.outline = "2px solid #bfdbfe"; (e.currentTarget as HTMLElement).style.background = "#eff6ff"; } }}
                                  onBlur={e => {
                                    (e.currentTarget as HTMLElement).style.outline = "none";
                                    (e.currentTarget as HTMLElement).style.background = editMode ? "rgba(239,246,255,0.7)" : "#fff";
                                    updateRationale(blockIdx, rowIdx, e.currentTarget.innerText);
                                  }}
                                >
                                  {row.rationale}
                                </div>
                                {editMode && (
                                  <div style={{ fontSize: 11, color: "#1d4ed8", marginTop: 4, fontWeight: 700 }}>
                                    Click to edit rationale
                                  </div>
                                )}
                              </div>

                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
            <button
              data-testid="button-back"
              onClick={() => setLocation("/step-3")}
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #d6deea", background: "#fff", fontWeight: 900, cursor: "pointer", minWidth: 120, fontSize: 13 }}
            >
              Back
            </button>
            <button
              data-testid="button-next"
              onClick={handleNext}
              disabled={submitting}
              style={{
                padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)",
                background: submitting ? "#3a5a78" : NAVY, color: "#fff", fontWeight: 900,
                cursor: submitting ? "not-allowed" : "pointer", minWidth: 120, fontSize: 13,
                display: "inline-flex", alignItems: "center", gap: 7, transition: "background 0.2s",
              }}
            >
              {submitting ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.9s linear infinite", flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Generating…
                </>
              ) : "Next"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
