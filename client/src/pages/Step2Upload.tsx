import { useState, useRef } from "react";
import { useLocation } from "wouter";

interface DocItem {
  id: string;
  name: string;
  type: string;
  status: string;
  size: string;
}

function FileIcon() {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 10,
      background: "#eef4ff", border: "1px solid #d9e6ff",
      display: "grid", placeItems: "center", flexShrink: 0,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6Z" stroke="#0b2a4a" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M14 2v6h6" stroke="#0b2a4a" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

const DEFAULT_DOCS: DocItem[] = [
  { id: "1", name: "Ops Risk Summary.docx", type: "Word", status: "Readable", size: "1.8 MB" },
  { id: "2", name: "Incident Report.pdf", type: "PDF", status: "Readable", size: "917 KB" },
  { id: "3", name: "Ops Workflow.vsdx", type: "Visio", status: "Readable", size: "1.3 MB" },
];

let nextId = 4;

export default function Step2Upload() {
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocItem[]>(DEFAULT_DOCS);

  const selectedPm = sessionStorage.getItem("selectedDomain") || "";
  const selectedBml = sessionStorage.getItem("selectedBml") || "";
  const selectedTeam = sessionStorage.getItem("selectedTeam") || "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newDocs = Array.from(e.target.files).map(file => {
        const sizeKB = file.size / 1024;
        const sizeStr = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;
        let type = "Document";
        if (file.name.toLowerCase().endsWith(".pdf")) type = "PDF";
        else if (file.name.toLowerCase().endsWith(".doc") || file.name.toLowerCase().endsWith(".docx")) type = "Word";
        else if (file.name.toLowerCase().endsWith(".ppt") || file.name.toLowerCase().endsWith(".pptx")) type = "PowerPoint";
        else if (file.type.startsWith("image/")) type = "Image";
        return { id: String(nextId++), name: file.name, type, status: "Readable", size: sizeStr };
      });
      setDocuments(prev => [...prev, ...newDocs]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>

      {/* Breadcrumb bar */}
      <div style={{
        background: "#ffffff",
        borderBottom: "1px solid #e6e9ef",
        padding: "10px 18px",
        fontSize: 12.5,
        color: "#5b6b7a",
        fontWeight: 600,
      }}>
        <span style={{ color: "#122033", fontWeight: 900 }}>Home</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: "#122033", fontWeight: 900 }}>Documents to Insights</span>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: "#122033", fontWeight: 900 }}>Step 1.</span> Upload Documents
      </div>

      {/* Monitoring scope bar */}
      <div style={{
        background: "linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%)",
        borderBottom: "1px solid #e6e9ef",
        padding: "10px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "7px 10px", borderRadius: 999,
          border: "1px solid rgba(11,42,74,0.15)",
          background: "rgba(11,42,74,0.08)",
          color: "#0b2a4a", fontSize: 12, fontWeight: 900, whiteSpace: "nowrap",
        }}>
          Monitoring Scope
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {[
            selectedPm ? { k: "PM:", v: selectedPm } : null,
            selectedBml ? { k: "BML:", v: selectedBml } : null,
            selectedTeam ? { k: "Team:", v: selectedTeam } : null,
          ].filter(Boolean).map(({ k, v }) => (
            <div key={k} style={{
              display: "flex", gap: 8, alignItems: "baseline",
              padding: "6px 10px", borderRadius: 10,
              background: "#f7f9fd", border: "1px solid #eef2f7",
              fontSize: 12.5, whiteSpace: "nowrap",
            }}>
              <span style={{ color: "#5b6b7a", fontWeight: 900 }}>{k}</span>
              <span style={{ color: "#122033", fontWeight: 900 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ padding: "16px 18px 24px", flex: 1 }}>
        <div style={{
          background: "#ffffff",
          border: "1px solid #e6e9ef",
          borderRadius: 12,
          boxShadow: "0 6px 18px rgba(16,24,40,0.08)",
          padding: 16,
          maxWidth: 980,
        }}>
          {/* Card header */}
          <div style={{ marginBottom: 12 }}>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 900, letterSpacing: 0.2, color: "#122033" }}>
              Step 1. Upload Documents
            </h1>
            <p style={{ color: "#5b6b7a", fontSize: 12.5, marginTop: 6, fontWeight: 600, lineHeight: 1.35 }}>
              Upload meeting materials, reports, or other supporting documents to serve as source evidence for analysis.
            </p>
          </div>

          {/* Upload box */}
          <div style={{
            border: "1px dashed #cfd8e6",
            background: "linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%)",
            borderRadius: 12, padding: "26px 14px",
            display: "flex", flexDirection: "column", gap: 10,
            alignItems: "center", justifyContent: "center",
            textAlign: "center", marginBottom: 14,
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#2b3c50" }}>
              Do you have documents to upload?
            </div>
            <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
            <button
              data-testid="button-upload"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: "#0b2a4a", color: "#fff",
                border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10,
                padding: "10px 18px", fontWeight: 900, fontSize: 13,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, minWidth: 120,
              }}
            >
              Upload Files
            </button>
          </div>

          {/* Uploaded documents */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900, fontSize: 14, color: "#213547" }}>
              Uploaded Documents Review
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.9 }}>
                <path d="M9 18l6-6-6-6" stroke="#2a4a6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ color: "#5b6b7a", fontSize: 12.5, fontWeight: 600 }}>{documents.length} file{documents.length !== 1 ? "s" : ""}</span>
          </div>

          {documents.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9aa5b4", padding: "12px 4px" }}>No documents uploaded yet.</p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  data-testid={`doc-row-${doc.id}`}
                  style={{
                    display: "grid", gridTemplateColumns: "34px 1fr auto",
                    gap: 12, alignItems: "center",
                    padding: "12px 12px",
                    borderRadius: 12,
                    background: "#ffffff",
                    border: "1px solid #e9eef5",
                    boxShadow: "0 2px 10px rgba(16,24,40,0.04)",
                  }}
                >
                  <FileIcon />
                  <div style={{ minWidth: 0, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, color: "#243447" }}>
                    <span style={{ fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 460, fontSize: 13 }}>
                      {doc.name}
                    </span>
                    <div style={{ width: 1, height: 14, background: "#dbe3ee", opacity: 0.9 }} />
                    <span style={{ fontSize: 12.5, color: "#3a5168", fontWeight: 800 }}>{doc.type}</span>
                    <div style={{ width: 1, height: 14, background: "#dbe3ee", opacity: 0.9 }} />
                    <span style={{ fontSize: 12.5, color: "#3a5168", fontWeight: 800 }}>{doc.status}</span>
                    <div style={{ width: 1, height: 14, background: "#dbe3ee", opacity: 0.9 }} />
                    <span style={{ fontSize: 12.5, color: "#3a5168", fontWeight: 800 }}>{doc.size}</span>
                  </div>
                  <button
                    data-testid={`button-remove-${doc.id}`}
                    onClick={() => setDocuments(documents.filter(d => d.id !== doc.id))}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      fontWeight: 900, fontSize: 12.5, color: "#d92d20",
                      padding: "7px 10px", borderRadius: 10,
                      border: "1px solid rgba(217,45,32,0.18)",
                      background: "rgba(217,45,32,0.06)",
                      cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6 6 18M6 6l12 12" stroke="#d92d20" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1px solid #e6e9ef" }}>
            <button
              data-testid="button-back"
              onClick={() => setLocation("/domain-home")}
              style={{
                background: "#fff", color: "#122033",
                border: "1px solid #d6deea", borderRadius: 10,
                padding: "10px 18px", fontWeight: 900, fontSize: 13,
                cursor: "pointer", minWidth: 100,
              }}
            >
              Back
            </button>
            <button
              data-testid="button-confirm"
              onClick={() => setLocation("/step-3")}
              style={{
                background: "#0b2a4a", color: "#fff",
                border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10,
                padding: "10px 18px", fontWeight: 900, fontSize: 13,
                cursor: "pointer", minWidth: 160,
              }}
            >
              Confirm and Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
