import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";

const SIDEBAR_STEPS = [
  { id: 1, label: "Portfolio & BML Selection" },
  { id: 2, label: "Build Domain" },
  { id: 3, label: "Review & Define Domains" },
  { id: 4, label: "Publish & Export" },
];

const DOMAINS = [
  {
    id: 1,
    name: "Risk Oversight & Governance",
    entityCount: 5,
    entities: [
      { id: "AE337812", title: "Investment Risk" },
      { id: "AE2699541", title: "Group Stress Testing" },
      { id: "AE549286", title: "Internal Model Assessment" },
      { id: "AE1575242", title: "Enterprise Risk Management" },
      { id: "AE2896410", title: "Climate & Climate Risk Strategy" },
    ],
    metrics: {
      governanceConsistency: 0.87,
      legalEntityOverlap: 0.80,
      coherence: "High",
    },
    rationale: [
      "Shared Level 3 & Level 4 Responsible Executives",
      "Common Responsible Vertical",
      "Significant Overlap in Responsible Legal Entities",
    ],
  },
  {
    id: 2,
    name: "Enterprise Risk Strategy",
    entityCount: 3,
    entities: [
      { id: "AE2232754", title: "Credit Risk Policy & Frameworks" },
      { id: "AE2222400", title: "Control and Model Risk Monitoring" },
      { id: "AE3142465", title: "Model Risk Management Validation" },
    ],
    metrics: {
      governanceConsistency: 0.72,
      legalEntityOverlap: 0.65,
      coherence: "Medium",
    },
    rationale: [
      "Same Level 3 Responsible Executive",
      "Overlapping Responsible Legal Entities",
    ],
  },
  {
    id: 3,
    name: "Compliance & Controls",
    entityCount: 4,
    entities: [
      { id: "AE4569822", title: "Group Risk Reporting" },
      { id: "AE357812", title: "Investment Risk" },
      { id: "AE2689541", title: "Group Stress Testing" },
      { id: "AE2549286", title: "Internal Model Assessment" },
    ],
    metrics: {
      governanceConsistency: 0.91,
      legalEntityOverlap: 0.85,
      coherence: "High",
    },
    rationale: [
      "Shared Level 3 & Level 4 Responsible Executives",
      "Common Responsible Vertical",
      "Significant Overlap in Responsible Legal Entities",
    ],
  },
];

export default function BuildDomain() {
  const [, setLocation] = useLocation();
  const activeStep = 2;
  const [expandedDomain, setExpandedDomain] = useState<number | null>(3);
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    DOMAINS.forEach((domain) => {
      domain.entities.forEach((ae) => {
        initial[ae.id] = `Domain ${domain.id}`;
      });
    });
    return initial;
  });

  const toggleDomain = (domainId: number) => {
    setExpandedDomain(expandedDomain === domainId ? null : domainId);
  };

  const updateAssignment = (aeId: string, value: string) => {
    setAssignments((prev) => ({ ...prev, [aeId]: value }));
  };

  const allEntities = DOMAINS.flatMap((d) =>
    d.entities.map((e) => ({ ...e, domainId: d.id }))
  );
  const uniqueEntities = allEntities.filter(
    (e, i, arr) => arr.findIndex((x) => x.id === e.id) === i
  );

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#eef1f5] border-b border-[#d0d5dd] px-6 py-2 text-sm text-[#555] flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            data-testid="link-home"
            onClick={() => setLocation("/")}
            className="text-[#1e3a6a] hover:underline font-medium"
          >
            Home
          </button>
          <span className="mx-1">›</span>
          <span className="font-semibold text-[#333]">Create a New Domain</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[240px] bg-[#f4f4f4] border-r border-[#e0e0e0] flex flex-col shrink-0 pt-4">
          <nav className="flex flex-col">
            {SIDEBAR_STEPS.map((step) => (
              <div
                key={step.id}
                data-testid={`sidebar-step-${step.id}`}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-l-4 ${
                  step.id === activeStep
                    ? "border-[#1e3a6a] bg-[#1e3a6a] text-white"
                    : "border-transparent text-[#444] hover:bg-[#eaeaea]"
                }`}
              >
                <span>{step.id}.</span>
                <span>{step.label}</span>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8">
          <h1 data-testid="text-page-title" className="text-2xl font-bold text-[#1e3a6a] mb-3 text-center">
            Build Business Domain Groupings
          </h1>
          <p className="text-sm text-[#555] mb-8 text-center">
            Based on shared governance, legal entities, and operational scope, the following domains are suggested.
          </p>

          <div className="space-y-4 max-w-[900px] mx-auto mb-8">
            {DOMAINS.map((domain) => (
              <div key={domain.id} className="border border-[#d0d5dd] rounded-sm overflow-hidden">
                <button
                  data-testid={`button-toggle-domain-${domain.id}`}
                  onClick={() => toggleDomain(domain.id)}
                  className="w-full flex items-center gap-2 px-5 py-3.5 text-left bg-[#f7f9fb] hover:bg-[#eef3fa] transition-colors"
                >
                  {expandedDomain === domain.id ? (
                    <ChevronDown className="w-4 h-4 text-[#1e3a6a] shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#1e3a6a] shrink-0" />
                  )}
                  <span className="text-[15px] font-bold text-[#1e3a6a]">
                    Domain {domain.id} – {domain.name}
                  </span>
                  <span className="text-sm text-[#555] ml-1">
                    ({domain.entityCount} Auditable Entities)
                  </span>
                </button>

                {expandedDomain === domain.id && (
                  <div className="px-5 py-4 bg-white">
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <table data-testid={`table-domain-${domain.id}`} className="w-full text-sm border border-[#d0d5dd]">
                          <thead>
                            <tr className="bg-[#f7f9fb] border-b border-[#d0d5dd]">
                              <th className="text-left px-4 py-2.5 font-semibold text-[#1e3a6a]">AE ID</th>
                              <th className="text-left px-4 py-2.5 font-semibold text-[#1e3a6a]">Domain Title</th>
                            </tr>
                          </thead>
                          <tbody>
                            {domain.entities.map((ae, idx) => (
                              <tr
                                key={ae.id}
                                data-testid={`row-domain-${domain.id}-ae-${ae.id}`}
                                className={`border-b border-[#e8ecf0] last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-[#fafbfc]"}`}
                              >
                                <td className="px-4 py-2.5 text-[#333] font-medium">{ae.id}</td>
                                <td className="px-4 py-2.5 text-[#333]">{ae.title}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="w-[280px] shrink-0">
                        <div className="border border-[#d0d5dd] rounded-sm p-4 bg-[#f7f9fb]">
                          <h3 className="text-sm font-bold text-[#1e3a6a] mb-3">Domain Metrics</h3>
                          <ul className="space-y-1.5 text-sm text-[#333]">
                            <li>
                              <span className="text-[#555]">Governance Consistency Score: </span>
                              <span className="font-bold">{domain.metrics.governanceConsistency.toFixed(2)}</span>
                            </li>
                            <li>
                              <span className="text-[#555]">Legal Entity Overlap Score: </span>
                              <span className="font-bold">{domain.metrics.legalEntityOverlap.toFixed(2)}</span>
                            </li>
                            <li>
                              <span className="text-[#555]">Overall Domain Coherence: </span>
                              <span className="font-bold">{domain.metrics.coherence}</span>
                            </li>
                          </ul>

                          <h3 className="text-sm font-bold text-[#1e3a6a] mt-4 mb-2">Rationale:</h3>
                          <ul className="space-y-1 text-sm text-[#333]">
                            {domain.rationale.map((r, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-[#1e3a6a] mt-0.5">•</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="max-w-[900px] mx-auto mb-8">
            <button
              data-testid="button-toggle-assignments"
              className="flex items-center gap-2 text-[#1e3a6a] font-bold text-sm mb-4"
            >
              <ChevronDown className="w-4 h-4" />
              Review & Adjust Domain Assignments (Optional)
            </button>

            <div className="border border-[#d0d5dd] rounded-sm overflow-hidden">
              <table data-testid="table-assignments" className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f7f9fb] border-b border-[#d0d5dd]">
                    <th className="text-left px-4 py-2.5 font-semibold text-[#1e3a6a] w-[160px]">AE ID</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-[#1e3a6a] w-[240px]">AE Title</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-[#1e3a6a]">Assigned Domain</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueEntities.map((ae, idx) => (
                    <tr
                      key={ae.id}
                      data-testid={`row-assignment-${ae.id}`}
                      className={`border-b border-[#e8ecf0] last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-[#fafbfc]"}`}
                    >
                      <td className="px-4 py-2.5 text-[#333] font-medium">{ae.id}</td>
                      <td className="px-4 py-2.5 text-[#333]">{ae.title}</td>
                      <td className="px-4 py-2.5">
                        <select
                          data-testid={`select-assignment-${ae.id}`}
                          value={assignments[ae.id] || `Domain ${ae.domainId}`}
                          onChange={(e) => updateAssignment(ae.id, e.target.value)}
                          className="border border-[#c5cdd4] rounded-sm px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1e3a6a]"
                        >
                          {DOMAINS.map((d) => (
                            <option key={d.id} value={`Domain ${d.id}`}>
                              Domain {d.id}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="max-w-[900px] mx-auto flex items-center justify-between pt-4 border-t border-[#e0e0e0]">
            <button
              data-testid="button-back-build-domain"
              onClick={() => setLocation("/create-domain")}
              className="flex items-center gap-1 bg-white hover:bg-slate-50 text-[#333] text-sm font-medium px-6 py-2.5 rounded-sm border border-[#c5cdd4] shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              data-testid="button-confirm-domain-groupings"
              onClick={() => setLocation("/review-define-domains")}
              className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white text-sm font-semibold px-10 py-3 rounded-sm shadow-sm transition-colors"
            >
              Confirm Domain Groupings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
