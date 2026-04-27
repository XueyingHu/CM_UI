import { useLocation } from "wouter";

const NAVY = "#0b2a4a";
const BORDER = "#e6e9ef";
const MUTED = "#5b6b7a";
const TEXT = "#122033";

interface ExtractResult {
  documents_processed: number;
  total_documents: number;
  overall_confidence: number;
  results: {
    filename: string;
    status: string;
    confidence: number;
    items_found: number;
  }[];
}

// Per-document extracted items that match what Step 3 validates
const EXTRACTED: Array<{
  filename: string;
  events: {
    type: string;
    description: string;
    rating: "Critical" | "Major" | "Limited";
  }[];
}> = [
  {
    filename: "Ops Risk Summary.docx",
    events: [
      {
        type: "Risk Event",
        description: "System outage impacting payments",
        rating: "Critical",
      },
      {
        type: "Risk Event",
        description: "Processing delays due to vendor capacity",
        rating: "Major",
      },
      {
        type: "Issue",
        description: "Access control gaps in core platform",
        rating: "Major",
      },
      {
        type: "Issue",
        description: "Incomplete evidence retention for reconciliations",
        rating: "Limited",
      },
      {
        type: "Change",
        description: "Payments platform upgrade",
        rating: "Major",
      },
      {
        type: "Change",
        description: "Risk controls monitoring automation rollout",
        rating: "Limited",
      },
      {
        type: "Unmatched",
        description: "Internal Risk Event, third party processing delay",
        rating: "Major",
      },
      {
        type: "Unmatched",
        description: "Known Issue, legacy reconciliation workaround",
        rating: "Limited",
      },
    ],
  },
  {
    filename: "Incident Report.pdf",
    events: [
      {
        type: "Risk Event",
        description: "Data integrity failure in reporting pipeline",
        rating: "Critical",
      },
      {
        type: "Issue",
        description: "Manual override procedure not documented",
        rating: "Major",
      },
      {
        type: "Change",
        description: "Core banking system refresh",
        rating: "Major",
      },
      {
        type: "Unmatched",
        description: "Regulatory Exam, Q4 review findings",
        rating: "Major",
      },
    ],
  },
  {
    filename: "Ops Workflow.vsdx",
    events: [
      {
        type: "Change",
        description: "Workflow automation for ops reconciliation",
        rating: "Limited",
      },
      {
        type: "Unmatched",
        description: "Significant Organization Change, team restructure Q1",
        rating: "Major",
      },
      {
        type: "Unmatched",
        description: "Business Ownership Change, new ops lead",
        rating: "Limited",
      },
    ],
  },
];

type Rating = "Critical" | "Major" | "Limited";
type EventType = "Risk Event" | "Issue" | "Change" | "Unmatched";

const TYPE_STYLES: Record<
  EventType,
  { bg: string; border: string; color: string; label: string }
> = {
  "Risk Event": {
    bg: "rgba(180,35,24,0.06)",
    border: "rgba(180,35,24,0.22)",
    color: "#b42318",
    label: "Risk Event",
  },
  Issue: {
    bg: "rgba(181,71,8,0.07)",
    border: "rgba(181,71,8,0.25)",
    color: "#b54708",
    label: "Issue",
  },
  Change: {
    bg: "rgba(31,94,168,0.07)",
    border: "rgba(31,94,168,0.22)",
    color: "#1f5ea8",
    label: "Change",
  },
  Unmatched: {
    bg: "rgba(90,90,90,0.06)",
    border: "rgba(90,90,90,0.20)",
    color: "#4a5568",
    label: "Needs Validation",
  },
};

const RATING_STYLES: Record<Rating, { color: string }> = {
  Critical: { color: "#b42318" },
  Major: { color: "#b54708" },
  Limited: { color: "#1f5ea8" },
};

function TypeBadge({ type }: { type: EventType }) {
  const s = TYPE_STYLES[type];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 8px",
        borderRadius: 999,
        fontSize: 11.5,
        fontWeight: 900,
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

export default function Step2Extract() {
  const [, setLocation] = useLocation();

  const extractResult: ExtractResult | null = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("extract_result") || "null");
    } catch {
      return null;
    }
  })();

  const selectedPm = sessionStorage.getItem("selectedDomain") || "";
  const selectedBml = sessionStorage.getItem("selectedBml") || "";
  const selectedTeam = sessionStorage.getItem("selectedTeam") || "";

  const confPct = extractResult
    ? Math.round(extractResult.overall_confidence * 100)
    : null;
  const barColor =
    confPct != null
      ? confPct >= 90
        ? "#1f7a3f"
        : confPct >= 75
          ? "#b54708"
          : "#b42318"
      : "#1f5ea8";
  const barBg =
    confPct != null
      ? confPct >= 90
        ? "rgba(31,122,63,0.10)"
        : confPct >= 75
          ? "rgba(181,71,8,0.10)"
          : "rgba(180,35,24,0.10)"
      : "rgba(31,94,168,0.10)";

  const totalItems = EXTRACTED.reduce((s, d) => s + d.events.length, 0);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          background: "#fff",
          borderBottom: `1px solid ${BORDER}`,
          padding: "10px 18px",
          fontSize: 12.5,
          color: MUTED,
          fontWeight: 600,
        }}
      >
        <span style={{ color: TEXT, fontWeight: 900 }}>Home</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: TEXT, fontWeight: 900 }}>
          Documents to Insights
        </span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: TEXT, fontWeight: 900 }}>Step 2.</span>
        &nbsp;Extract Key Events
      </div>

      {/* Scope bar */}
      <div
        style={{
          background: "#fff",
          borderBottom: `1px solid ${BORDER}`,
          padding: "10px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(11,42,74,0.15)",
            background: "rgba(11,42,74,0.08)",
            color: NAVY,
            fontSize: 12,
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          Monitoring Scope
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {[
            selectedPm ? { k: "PM:", v: selectedPm } : null,
            selectedBml ? { k: "BML:", v: selectedBml } : null,
            selectedTeam ? { k: "Team:", v: selectedTeam } : null,
          ]
            .filter(Boolean)
            .map(({ k, v }) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "baseline",
                  padding: "6px 10px",
                  borderRadius: 10,
                  background: "#f7f9fd",
                  border: "1px solid #eef2f7",
                  fontSize: 12.5,
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: MUTED, fontWeight: 700 }}>{k}</span>
                <span style={{ color: TEXT, fontWeight: 900 }}>{v}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ padding: 18, flex: 1 }}>
        <div
          style={{
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            boxShadow: "0 6px 18px rgba(16,24,40,0.08)",
            padding: 16,
            maxWidth: 1100,
          }}
        >
          {/* Card header */}
          <div style={{ marginBottom: 14 }}>
            <h1
              style={{
                margin: "0 0 5px",
                fontSize: 16,
                fontWeight: 900,
                color: TEXT,
              }}
            >
              Step 2. Extract Key Events
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 12.8,
                color: MUTED,
                lineHeight: 1.4,
              }}
            >
              The AI has identified the following events, issues, and changes
              from your uploaded documents. Items marked "Needs Validation" were
              referenced in the documents but could not be matched to a known
              source system.
            </p>
          </div>

          {/* Extraction summary banner */}
          {extractResult && (
            <div
              style={{
                marginBottom: 18,
                padding: "14px 16px",
                borderRadius: 12,
                border: "1px solid #dbe8f5",
                background: "linear-gradient(180deg,#f5f9ff 0%,#eef4fd 100%)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="#1f5ea8"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#1f5ea8"
                      strokeWidth="1.8"
                    />
                  </svg>
                  <span style={{ fontWeight: 900, fontSize: 13, color: TEXT }}>
                    Extraction complete —&nbsp;
                    <span style={{ color: "#1f5ea8" }}>
                      {extractResult.documents_processed} of{" "}
                      {extractResult.total_documents} document
                      {extractResult.total_documents !== 1 ? "s" : ""}{" "}
                      processed,&nbsp;
                      {totalItems} items identified
                    </span>
                  </span>
                </div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 900,
                    border: `1px solid ${barColor}30`,
                    background: barBg,
                    color: barColor,
                  }}
                >
                  {confPct}% overall confidence
                </span>
              </div>
              {/* Progress bar */}
              <div
                style={{
                  height: 7,
                  borderRadius: 999,
                  background: "#d9e5f3",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 999,
                    width: `${Math.round((extractResult.documents_processed / extractResult.total_documents) * 100)}%`,
                    background: barColor,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              {/* Per-doc chips */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                {extractResult.results.map((r) => (
                  <div
                    key={r.filename}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: "#fff",
                      border: "1px solid #dbe3ee",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#334155",
                    }}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M10 2H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V5L10 2Z"
                        stroke="#1f5ea8"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 2v3h3"
                        stroke="#1f5ea8"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {r.filename}
                    <span style={{ color: "#5b6b7a", fontWeight: 600 }}>·</span>
                    <span
                      style={{
                        color: r.confidence >= 0.9 ? "#1f7a3f" : "#b54708",
                        fontWeight: 900,
                      }}
                    >
                      {Math.round(r.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-document extracted items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {EXTRACTED.map((doc) => (
              <div key={doc.filename}>
                {/* Doc label */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 10,
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: "#f0f4fa",
                    border: "1px solid #d6e0f0",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6L9 2Z"
                      stroke="#1f5ea8"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 2v4h4"
                      stroke="#1f5ea8"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 900,
                      color: "#1f5ea8",
                    }}
                  >
                    {doc.filename}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>
                    — {doc.events.length} item
                    {doc.events.length !== 1 ? "s" : ""} identified
                  </span>
                </div>

                {/* Items table */}
                <div
                  style={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 12.5,
                    }}
                  >
                    <thead>
                      <tr>
                        {["Type", "Description", "Rating"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "9px 12px",
                              background: "#f7f9fd",
                              fontWeight: 900,
                              fontSize: 12.5,
                              color: "#334155",
                              textAlign: "left",
                              borderBottom: "1px solid #eef2f7",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {doc.events.map((ev, i) => {
                        const isLast = i === doc.events.length - 1;
                        const td: React.CSSProperties = {
                          padding: "10px 12px",
                          fontSize: 12.5,
                          textAlign: "left",
                          verticalAlign: "middle",
                          color: TEXT,
                          borderBottom: isLast ? "none" : `1px solid #eef2f7`,
                        };
                        return (
                          <tr
                            key={i}
                            style={{
                              background:
                                ev.type === "Unmatched"
                                  ? "rgba(248,248,248,0.7)"
                                  : "#fff",
                            }}
                          >
                            <td style={{ ...td, whiteSpace: "nowrap" }}>
                              <TypeBadge type={ev.type as EventType} />
                            </td>
                            <td
                              style={{
                                ...td,
                                color:
                                  ev.type === "Unmatched" ? "#5b6b7a" : TEXT,
                                fontStyle:
                                  ev.type === "Unmatched" ? "italic" : "normal",
                              }}
                            >
                              {ev.description}
                            </td>
                            <td
                              style={{
                                ...td,
                                whiteSpace: "nowrap",
                                fontWeight: 900,
                                color: RATING_STYLES[ev.rating].color,
                              }}
                            >
                              {ev.rating}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 20,
              paddingTop: 14,
              borderTop: `1px solid ${BORDER}`,
            }}
          >
            <button
              data-testid="button-back"
              onClick={() => setLocation("/step-1")}
              style={{
                background: "#fff",
                color: TEXT,
                border: "1px solid #d6deea",
                borderRadius: 10,
                padding: "10px 18px",
                fontWeight: 900,
                fontSize: 13,
                cursor: "pointer",
                minWidth: 100,
              }}
            >
              Back
            </button>
            <button
              data-testid="button-continue"
              onClick={() => setLocation("/step-3")}
              style={{
                background: NAVY,
                color: "#fff",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 10,
                padding: "10px 18px",
                fontWeight: 900,
                fontSize: 13,
                cursor: "pointer",
                minWidth: 200,
              }}
            >
              Continue to Validate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
