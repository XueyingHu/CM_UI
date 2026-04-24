import { useLocation } from "wouter";

const NAVY = "#0b2a4a";
const BORDER = "#e6e9ef";
const MUTED = "#5b6b7a";
const TEXT = "#122033";

type Rating = "Critical" | "Major" | "Limited";
type BlockVariant = "risk" | "issue" | "reg";

interface EventRow {
  reference: string;
  rating: Rating;
  source: string;
  taggedAE: string[];
  additionalAE: string[];
  rationale: string;
}

interface EventBlock {
  variant: BlockVariant;
  title: string;
  summary: string;
  rows: EventRow[];
}

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
        additionalAE: ["AE‑3301 Financial Controls Oversight"],
        rationale:
          "Weaknesses in access provisioning may impact downstream financial controls and oversight processes beyond the primary application.",
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
        additionalAE: ["AE‑3301 Financial Controls Oversight"],
        rationale:
          "Delayed remediation increases the likelihood of control failures and audit findings across dependent processes.",
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
        additionalAE: ["AE‑5099 Records Management"],
        rationale:
          "Evidence retention controls are shared across multiple compliance and reporting processes.",
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

const TH: React.CSSProperties = {
  padding: "10px", background: "#f7f9fd",
  fontWeight: 900, fontSize: 12.5, color: "#334155",
  textAlign: "left", borderBottom: "1px solid #eef2f7",
};
const TD: React.CSSProperties = {
  padding: 10, fontSize: 12.5, borderTop: "1px solid #eef2f7",
  verticalAlign: "top", color: TEXT,
};

export default function Step4Analyze() {
  const [, setLocation] = useLocation();

  const selectedPm = sessionStorage.getItem("selectedDomain") || "";
  const selectedBml = sessionStorage.getItem("selectedBml") || "";
  const selectedTeam = sessionStorage.getItem("selectedTeam") || "";
  const scopeItems = [
    selectedPm ? { k: "PM:", v: selectedPm } : null,
    selectedTeam ? { k: "Responsible Team:", v: selectedTeam } : null,
    selectedBml ? { k: "BML:", v: selectedBml } : null,
  ].filter(Boolean) as { k: string; v: string }[];

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
        <span style={{ color: TEXT, fontWeight: 900 }}>Step 4.</span>{" "}Analyze Events and Impact
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
      <div style={{ padding: 18, flex: 1 }}>
        <div style={{
          background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12,
          boxShadow: "0 6px 18px rgba(16,24,40,0.08)", padding: 18, maxWidth: 1100,
        }}>
          <h1 style={{ margin: "0", fontSize: 16, fontWeight: 900, color: TEXT }}>
            Analyze Events and Impact
          </h1>
          <p style={{ fontSize: 12.8, color: MUTED, margin: "6px 0 20px", lineHeight: 1.5 }}>
            Review and refine events organized by event type. All content below is editable.
          </p>

          {BLOCKS.map((block) => (
            <div key={block.title} style={{
              background: BG[block.variant],
              borderRadius: 12, padding: 14, marginBottom: 26,
            }}>
              <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 6, color: TEXT }}>
                {block.title}
              </div>

              <div
                contentEditable
                suppressContentEditableWarning
                style={{
                  fontSize: 13, lineHeight: 1.5, marginBottom: 10,
                  color: TEXT, outline: "none", borderRadius: 6, padding: "2px 4px",
                }}
                onFocus={e => { (e.currentTarget as HTMLElement).style.outline = "2px solid #bfdbfe"; (e.currentTarget as HTMLElement).style.background = "#eff6ff"; }}
                onBlur={e => { (e.currentTarget as HTMLElement).style.outline = "none"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {block.summary}
              </div>

              <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      {["Reference", "Rating", "Source (Meeting / Document)", "Auditable Entities Tagged in Assure", "Additional Impacted Auditable Entities", "Impact Rationale"].map(h => (
                        <th key={h} style={TH}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, i) => (
                      <tr key={i}>
                        <td style={TD}>{row.reference}</td>
                        <td style={TD}>
                          <span style={{ fontWeight: 900, color: RATING_COLOR[row.rating] }}>{row.rating}</span>
                        </td>
                        <td style={TD}>
                          {row.source.split("\n").map((line, j) => (
                            <div key={j}>{line}</div>
                          ))}
                        </td>
                        <td
                          contentEditable
                          suppressContentEditableWarning
                          style={{ ...TD, outline: "none", borderRadius: 6, minWidth: 180 }}
                          onFocus={e => { (e.currentTarget as HTMLElement).style.outline = "2px solid #bfdbfe"; (e.currentTarget as HTMLElement).style.background = "#eff6ff"; }}
                          onBlur={e => { (e.currentTarget as HTMLElement).style.outline = "none"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          {row.taggedAE.map((ae, j) => (
                            <div key={j} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 260 }}>{ae}</div>
                          ))}
                        </td>
                        <td
                          contentEditable
                          suppressContentEditableWarning
                          style={{ ...TD, outline: "none", borderRadius: 6, minWidth: 180 }}
                          onFocus={e => { (e.currentTarget as HTMLElement).style.outline = "2px solid #bfdbfe"; (e.currentTarget as HTMLElement).style.background = "#eff6ff"; }}
                          onBlur={e => { (e.currentTarget as HTMLElement).style.outline = "none"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          {row.additionalAE.map((ae, j) => (
                            <div key={j} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 260 }}>{ae}</div>
                          ))}
                        </td>
                        <td
                          contentEditable
                          suppressContentEditableWarning
                          style={{ ...TD, outline: "none", borderRadius: 6, minWidth: 200 }}
                          onFocus={e => { (e.currentTarget as HTMLElement).style.outline = "2px solid #bfdbfe"; (e.currentTarget as HTMLElement).style.background = "#eff6ff"; }}
                          onBlur={e => { (e.currentTarget as HTMLElement).style.outline = "none"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          {row.rationale}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 12 }}>
            <button
              data-testid="button-back"
              onClick={() => setLocation("/step-3")}
              style={{
                padding: "10px 14px", borderRadius: 10, border: "1px solid #d6deea",
                background: "#fff", fontWeight: 900, cursor: "pointer", minWidth: 120, fontSize: 13,
              }}
            >
              Back
            </button>
            <button
              data-testid="button-next"
              onClick={() => setLocation("/step-5")}
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
