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

// ── Main page ────────────────────────────────────────────────────────────────
export default function Step2Extract() {
  const [, setLocation] = useLocation();
  const [displayProgress, setDisplayProgress] = useState(0);

  const extractResult: ExtractResult | null = (() => {
    try { return JSON.parse(sessionStorage.getItem("extract_result") || "null"); } catch { return null; }
  })();

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
          {extractResult?.results?.length && extractResult.results[0].categories ? (
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
              onClick={() => setLocation("/step-3")}
              style={{
                background: "#1e3a6a", color: "#fff",
                border: "none", borderRadius: 6,
                padding: "9px 24px", fontWeight: 700, fontSize: 13,
                cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
