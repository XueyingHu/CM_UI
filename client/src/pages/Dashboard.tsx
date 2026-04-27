import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, ChevronDown, ChevronUp, X, Check, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const API_BASE = "http://localhost:8000";

/**
 * Authenticate with BAM and store the session in sessionStorage.
 * Called on page load with a generic system identity so a session_id
 * exists before any PM / filter selection is made.
 */
async function authenticateWithBAM(username: string, displayName: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, display_name: displayName, password: "bam-sso-token" }),
    });
    if (!res.ok) return;
    const data = await res.json();
    sessionStorage.setItem("session_id", data.session_id);
    sessionStorage.setItem("user_full_name", data.full_name);
    sessionStorage.setItem("user_role", data.role);
    sessionStorage.setItem("user_email", data.email);
    sessionStorage.setItem("user_department", data.department);
    sessionStorage.setItem("session_expires_at", data.expires_at);
  } catch {
    // Auth service unavailable — proceed without session (offline / stub mode)
  }
}

const PORTFOLIO_MANAGERS = ["Sarah Johnson", "David Lee", "Maria Garcia", "James Okafor", "Linda Park"];
const BML_OPTIONS = ["John Smith", "Emily Chen", "Robert Taylor", "Priya Nair", "Carlos Mendez"];
const TEAM_OPTIONS = ["Markets & Technology", "Retail Banking", "Global Risk", "Corporate Audit", "Compliance & Legal", "Operations"];

interface SearchDropdownProps {
  placeholder: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  label?: string;
}

function SearchDropdown({ placeholder, options, value, onChange, required, label }: SearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      {label && (
        <div style={{ fontSize: 13, fontWeight: 900, color: "#1a2e44", marginBottom: 6 }}>
          {label} {required && <span style={{ fontWeight: 900, color: "#1a2e44" }}>(Required)</span>}
        </div>
      )}
      <div ref={ref} style={{ position: "relative" }}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            border: "1px solid #ccd5df", borderRadius: 6,
            background: "#fff", padding: "8px 10px", cursor: "text",
          }}
          onClick={() => { setOpen(true); setQuery(""); }}
        >
          <Search size={14} color="#6b7a8a" style={{ flexShrink: 0 }} />
          <input
            data-testid={`input-${placeholder.toLowerCase().replace(/\s+/g, "-")}`}
            type="text"
            placeholder={placeholder}
            value={open ? query : value}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => { setOpen(true); setQuery(""); }}
            style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, flex: 1, color: "#1a2e44", fontWeight: value && !open ? 700 : 400 }}
          />
          {value && !open && (
            <button
              onClick={e => { e.stopPropagation(); onChange(""); setQuery(""); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "#6b7a8a" }}
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown size={14} color="#6b7a8a" style={{ flexShrink: 0 }} />
        </div>
        {open && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
            background: "#fff", border: "1px solid #ccd5df", borderTop: "none",
            borderRadius: "0 0 6px 6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxHeight: 200, overflowY: "auto",
          }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "10px 14px", fontSize: 13, color: "#9aa5b4" }}>No results found</div>
            ) : filtered.map(opt => (
              <div
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); setQuery(""); }}
                style={{
                  padding: "9px 14px", fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  background: value === opt ? "#0b2a4a" : undefined,
                  color: value === opt ? "#fff" : "#1a2e44",
                  fontWeight: value === opt ? 700 : 400,
                }}
                onMouseEnter={e => { if (value !== opt) (e.currentTarget as HTMLElement).style.background = "#f3f7ff"; }}
                onMouseLeave={e => { if (value !== opt) (e.currentTarget as HTMLElement).style.background = ""; }}
              >
                {value === opt && <Check size={13} style={{ flexShrink: 0 }} />}
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface AppliedFilters {
  pm: string;
  bml: string;
  team: string;
}

interface AERecord {
  ae_id: string;
  ae_name: string;
  pm: string;
  bml: string;
  team: string;
}

interface EntitiesResponse {
  total: number;
  page: number;
  page_size: number;
  pages: number;
  entities: AERecord[];
}

export default function Dashboard() {
  const [, setLocation] = useLocation();

  // Dropdown selections (not yet applied)
  const [pm, setPm] = useState("");
  const [bml, setBml] = useState("");
  const [team, setTeam] = useState("");

  // Committed filters — drives the API query
  const [applied, setApplied] = useState<AppliedFilters | null>(null);
  const [listOpen, setListOpen] = useState(false);

  // Authenticate on page load — session_id established before any selection
  useEffect(() => {
    authenticateWithBAM("system.user", "System User");
  }, []);

  // Build query URL from applied filters
  const entityQueryUrl = applied
    ? (() => {
        const params = new URLSearchParams();
        if (applied.pm) params.set("pm", applied.pm);
        if (applied.bml) params.set("bml", applied.bml);
        if (applied.team) params.set("team", applied.team);
        params.set("page_size", "500"); // fetch up to 500 for display; paginate as needed
        return `${API_BASE}/api/v1/entities?${params.toString()}`;
      })()
    : null;

  // Fetch entities server-side whenever filters are applied
  const { data: entityData, isLoading: entitiesLoading } = useQuery<EntitiesResponse>({
    queryKey: ["entities", applied],
    queryFn: () => fetch(entityQueryUrl!).then(r => r.json()),
    enabled: !!entityQueryUrl,
  });

  const entities = entityData?.entities ?? [];
  const totalEntities = entityData?.total ?? 0;
  const scopeApplied = applied !== null;

  // POST scope to backend when user confirms — persists filters against session_id
  const scopeMutation = useMutation({
    mutationFn: async (entityCount: number) => {
      const sessionId = sessionStorage.getItem("session_id");
      if (!sessionId || !applied) return;
      await apiRequest("POST", `${API_BASE}/api/v1/scope`, {
        session_id: sessionId,
        pm: applied.pm,
        bml: applied.bml || null,
        team: applied.team || null,
        entity_count: entityCount,
      });
    },
    onSuccess: () => {
      setLocation("/domain-home");
    },
    onError: () => {
      // Scope recording failed — navigate anyway (non-blocking)
      setLocation("/domain-home");
    },
  });

  const handleApply = () => {
    if (!pm) return;
    const filters: AppliedFilters = { pm, bml, team };
    setApplied(filters);
    setListOpen(false);

    // Persist selections locally too (for pages that read sessionStorage)
    sessionStorage.setItem("selectedDomain", pm);
    sessionStorage.setItem("selectedDomainId", pm.toLowerCase().replace(/\s+/g, "-"));
    if (bml) sessionStorage.setItem("selectedBml", bml);
    else sessionStorage.removeItem("selectedBml");
    if (team) sessionStorage.setItem("selectedTeam", team);
    else sessionStorage.removeItem("selectedTeam");
  };

  const handleReset = () => {
    setPm(""); setBml(""); setTeam("");
    setApplied(null);
    setListOpen(false);
    sessionStorage.removeItem("selectedDomain");
    sessionStorage.removeItem("selectedDomainId");
    sessionStorage.removeItem("selectedBml");
    sessionStorage.removeItem("selectedTeam");
  };

  const handleConfirm = () => {
    if (!scopeApplied || totalEntities === 0) return;
    // Record scope server-side then navigate
    scopeMutation.mutate(totalEntities);
  };

  const canConfirm = scopeApplied && !entitiesLoading && totalEntities > 0 && pm !== "";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100%", padding: "40px 24px 48px", background: "#f6f8fb" }}>

      {/* Page heading */}
      <div style={{ textAlign: "center", marginBottom: 28, maxWidth: 680 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0b2a4a", margin: "0 0 14px" }}>AI Continuous Monitoring</h1>
        <p style={{ fontSize: 13.5, color: "#4a5d70", margin: "0 0 4px", fontWeight: 600, lineHeight: 1.6 }}>
          Define your monitoring scope to generate insights and maintain audit universe coverage.
        </p>
        <p style={{ fontSize: 13.5, color: "#4a5d70", margin: "0 0 4px", fontWeight: 600, lineHeight: 1.6 }}>
          You define the scope once.
        </p>
        <p style={{ fontSize: 13, color: "#4a5d70", margin: 0, fontStyle: "italic", fontWeight: 600, lineHeight: 1.6 }}>
          All modules use the same auditable entities.
        </p>
      </div>

      {/* Define Monitoring Scope card */}
      <div style={{ width: "100%", maxWidth: 720, marginBottom: 18 }}>
        <div style={{ borderRadius: 10, border: "1px solid #ccd5df", overflow: "hidden", background: "#fff", boxShadow: "0 4px 14px rgba(16,24,40,0.07)" }}>
          <div style={{ background: "#0b2a4a", padding: "12px 20px" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 14, letterSpacing: 0.3 }}>Define Monitoring Scope</span>
          </div>
          <div style={{ padding: "18px 20px 16px" }}>
            <p style={{ fontSize: 13, color: "#4a5d70", fontWeight: 600, margin: "0 0 14px" }}>
              Start by selecting a Portfolio Manager.
            </p>

            <div style={{ marginBottom: 16 }}>
              <SearchDropdown
                label="Portfolio Manager"
                required
                placeholder="Search Portfolio Manager"
                options={PORTFOLIO_MANAGERS}
                value={pm}
                onChange={setPm}
              />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: "#1a2e44", marginBottom: 10 }}>Optional Filters:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              <SearchDropdown
                placeholder="Search Business Monitoring Lead"
                options={BML_OPTIONS}
                value={bml}
                onChange={setBml}
              />
              <SearchDropdown
                placeholder="Search Responsible Teams"
                options={TEAM_OPTIONS}
                value={team}
                onChange={setTeam}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                data-testid="button-reset-filters"
                onClick={handleReset}
                style={{
                  background: "#fff", color: "#1a2e44", fontWeight: 900, fontSize: 13,
                  border: "1px solid #ccd5df", borderRadius: 8, padding: "9px 18px", cursor: "pointer",
                }}
              >
                Reset Filters
              </button>
              <button
                data-testid="button-apply-scope"
                onClick={handleApply}
                disabled={!pm}
                style={{
                  background: pm ? "#0b2a4a" : "#a0b0c4", color: "#fff", fontWeight: 900, fontSize: 13,
                  border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "9px 18px",
                  cursor: pm ? "pointer" : "not-allowed",
                }}
              >
                Apply Scope
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Monitoring Scope Applied card */}
      <div style={{ width: "100%", maxWidth: 720, marginBottom: 20 }}>
        <div style={{ borderRadius: 10, border: "1px solid #ccd5df", overflow: "visible", background: "#fff", boxShadow: "0 4px 14px rgba(16,24,40,0.07)" }}>
          <div style={{ background: "#0b2a4a", padding: "12px 20px", borderRadius: "10px 10px 0 0" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 14, letterSpacing: 0.3 }}>Monitoring Scope Applied</span>
          </div>

          <div style={{ padding: "16px 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, paddingBottom: listOpen && scopeApplied ? 12 : 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: "#0b2a4a", display: "flex", alignItems: "center", gap: 8 }}>
                Total Auditable Entities:{" "}
                {entitiesLoading ? (
                  <Loader2 size={14} className="animate-spin" style={{ color: "#1f5ea8" }} />
                ) : (
                  <span style={{ color: scopeApplied ? "#1f5ea8" : "#9aa5b4" }}>
                    {scopeApplied ? totalEntities : "—"}
                  </span>
                )}
              </span>
              <button
                data-testid="button-view-full-list"
                onClick={() => scopeApplied && !entitiesLoading && setListOpen(v => !v)}
                disabled={!scopeApplied || entitiesLoading}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 13, fontWeight: 900,
                  color: scopeApplied && !entitiesLoading ? "#1f5ea8" : "#9aa5b4",
                  background: "none", border: "none",
                  cursor: scopeApplied && !entitiesLoading ? "pointer" : "not-allowed", padding: "4px 0",
                }}
              >
                View full list
                {listOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {listOpen && scopeApplied && (
              <div style={{ borderTop: "1px solid #eef2f7", marginLeft: -20, marginRight: -20 }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "100px 1fr auto",
                  alignItems: "center", padding: "8px 20px",
                  gap: 12, background: "#f7f9fd",
                  borderBottom: "1px solid #eef2f7",
                }}>
                  <span style={{ fontSize: 11.5, fontWeight: 900, color: "#5b6b7a", letterSpacing: 0.3, textTransform: "uppercase" }}>AE ID</span>
                  <span style={{ fontSize: 11.5, fontWeight: 900, color: "#5b6b7a", letterSpacing: 0.3, textTransform: "uppercase" }}>AE Title</span>
                  <span style={{ fontSize: 11.5, fontWeight: 900, color: "#5b6b7a", letterSpacing: 0.3, textTransform: "uppercase", whiteSpace: "nowrap" }}>Responsible Team</span>
                </div>
                <div style={{ maxHeight: 260, overflowY: "auto" }}>
                  {entities.map((e, i) => (
                    <div
                      key={e.ae_id}
                      data-testid={`row-entity-${e.ae_id}`}
                      style={{
                        display: "grid", gridTemplateColumns: "100px 1fr auto",
                        alignItems: "center", padding: "9px 20px", gap: 12,
                        borderBottom: i < entities.length - 1 ? "1px solid #f3f6fb" : "none",
                        fontSize: 12.5,
                        background: i % 2 === 0 ? "#fff" : "#fafbfd",
                      }}
                    >
                      <span style={{ color: "#5b6b7a", fontWeight: 700 }}>{e.ae_id}</span>
                      <span style={{ color: "#1a2e44", fontWeight: 800 }}>{e.ae_name}</span>
                      <span style={{ color: "#7a8fa3", fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap" }}>{e.team}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm button */}
      <div style={{ width: "100%", maxWidth: 720, display: "flex", justifyContent: "flex-end" }}>
        <button
          data-testid="button-confirm"
          onClick={handleConfirm}
          disabled={!canConfirm || scopeMutation.isPending}
          style={{
            background: canConfirm && !scopeMutation.isPending ? "#0b2a4a" : "#a0b0c4",
            color: "#fff", fontWeight: 900, fontSize: 13,
            border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10,
            padding: "11px 28px", cursor: canConfirm && !scopeMutation.isPending ? "pointer" : "not-allowed",
            minWidth: 130, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {scopeMutation.isPending && <Loader2 size={13} className="animate-spin" />}
          Confirm
        </button>
      </div>

      {/* Footer links */}
      <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#0b2a4a" }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, color: "#0b2a4a" }}>Data Retention Policy</button>
        <span style={{ color: "#ccd5df" }}>|</span>
        <button style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, color: "#0b2a4a" }}>User Guide</button>
        <span style={{ color: "#ccd5df" }}>|</span>
        <button style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, color: "#0b2a4a" }}>Support</button>
      </div>
    </div>
  );
}
