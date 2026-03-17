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
    description: "Oversight of investment risk and stress testing processes.",
    entities: [
      { id: "AE337812", title: "Investment Risk" },
      { id: "AE2699541", title: "Group Stress Testing" },
      { id: "AE549286", title: "Internal Model Assessment" },
      { id: "AE1372242", title: "Enterprise Risk Management" },
      { id: "AE2836410", title: "Climate & Climate Risk Strategy" },
    ],
  },
  {
    id: 2,
    name: "Enterprise Risk Strategy",
    entityCount: 3,
    description: "Strategic risk planning and model risk governance.",
    entities: [
      { id: "AE2232754", title: "Credit Risk Policy & Frameworks" },
      { id: "AE2222400", title: "Control and Model Risk Monitoring" },
      { id: "AE3142465", title: "Model Risk Management Validation" },
    ],
  },
  {
    id: 3,
    name: "Compliance & Controls",
    entityCount: 4,
    description: "Compliance monitoring and control framework management.",
    entities: [
      { id: "AE4569822", title: "Group Risk Reporting" },
      { id: "AE357812", title: "Investment Risk" },
      { id: "AE2689541", title: "Group Stress Testing" },
      { id: "AE2549286", title: "Internal Model Assessment" },
    ],
  },
];

export default function ReviewDefineDomains() {
  const [, setLocation] = useLocation();
  const activeStep = 3;
  const [expandedDomain, setExpandedDomain] = useState<number | null>(3);
  const [domainNames, setDomainNames] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    DOMAINS.forEach((d) => { initial[d.id] = d.name; });
    return initial;
  });
  const [domainDescriptions, setDomainDescriptions] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    DOMAINS.forEach((d) => { initial[d.id] = d.description; });
    return initial;
  });

  const toggleDomain = (domainId: number) => {
    setExpandedDomain(expandedDomain === domainId ? null : domainId);
  };

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
            Review & Define Business Domains
          </h1>
          <p className="text-sm text-[#555] mb-8 text-center">
            Review and define each business domain. Edit the details as needed before finalizing.
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
                    Domain {domain.id} – {domainNames[domain.id]}
                  </span>
                  {expandedDomain !== domain.id && (
                    <span className="text-sm text-[#555] ml-1">
                      (Click to Review)
                    </span>
                  )}
                  {expandedDomain === domain.id && (
                    <span className="text-sm text-[#555] ml-1">
                      ({domain.entityCount} Auditable Entities)
                    </span>
                  )}
                </button>

                {expandedDomain === domain.id && (
                  <div className="px-6 py-5 bg-[#fafbfc]">
                    <div className="space-y-4 mb-5">
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-bold text-[#1e3a6a] w-[160px] shrink-0">Domain Name:</label>
                        <input
                          data-testid={`input-domain-name-${domain.id}`}
                          type="text"
                          value={domainNames[domain.id]}
                          onChange={(e) => setDomainNames((prev) => ({ ...prev, [domain.id]: e.target.value }))}
                          className="flex-1 border border-[#c5cdd4] rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1e3a6a]"
                        />
                      </div>
                      <div className="flex items-start gap-4">
                        <label className="text-sm font-bold text-[#1e3a6a] w-[160px] shrink-0 pt-2">Domain Description:</label>
                        <input
                          data-testid={`input-domain-desc-${domain.id}`}
                          type="text"
                          value={domainDescriptions[domain.id]}
                          onChange={(e) => setDomainDescriptions((prev) => ({ ...prev, [domain.id]: e.target.value }))}
                          className="flex-1 border border-[#c5cdd4] rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1e3a6a]"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#1e3a6a] mb-3">Auditable Entities in Scope:</h3>
                      <div className="border border-[#d0d5dd] rounded-sm overflow-hidden bg-white">
                        {domain.entities.map((ae, idx) => (
                          <div
                            key={ae.id}
                            data-testid={`row-review-ae-${ae.id}`}
                            className={`flex items-center px-4 py-2.5 text-sm border-b border-[#e8ecf0] last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-[#fafbfc]"}`}
                          >
                            <span className="text-[#333] font-medium w-[140px]">{ae.id}</span>
                            <span className="text-[#333] mx-2">–</span>
                            <span className="text-[#333]">{ae.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="max-w-[900px] mx-auto flex items-center justify-between pt-4 border-t border-[#e0e0e0]">
            <button
              data-testid="button-back-review-define"
              onClick={() => setLocation("/build-domain")}
              className="flex items-center gap-1 bg-white hover:bg-slate-50 text-[#333] text-sm font-medium px-6 py-2.5 rounded-sm border border-[#c5cdd4] shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              data-testid="button-finalize-domains"
              onClick={() => {
                const finalDomains = DOMAINS.map((d) => ({
                  id: d.id,
                  name: domainNames[d.id],
                  description: domainDescriptions[d.id],
                  entityCount: d.entities.length,
                  entityIds: d.entities.map((e) => e.id),
                }));
                sessionStorage.setItem("finalizedDomains", JSON.stringify(finalDomains));
                setLocation("/review-publish");
              }}
              className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white text-sm font-semibold px-10 py-3 rounded-sm shadow-sm transition-colors"
            >
              Finalize Domains
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
