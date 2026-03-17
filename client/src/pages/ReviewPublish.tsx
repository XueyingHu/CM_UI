import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronRight, ChevronLeft } from "lucide-react";

const SIDEBAR_STEPS = [
  { id: 1, label: "Portfolio & BML Selection" },
  { id: 2, label: "Build Domain" },
  { id: 3, label: "Review & Define Domains" },
  { id: 4, label: "Publish & Export" },
];

const DEFAULT_DOMAINS = [
  {
    id: 1,
    name: "Risk Oversight & Governance",
    entityCount: 5,
    entityIds: ["AE337812", "AE2699541", "AE549286", "AE1372242", "AE2836410"],
  },
  {
    id: 2,
    name: "Enterprise Risk Strategy",
    entityCount: 3,
    entityIds: ["AE2232754", "AE2222400", "AE3142465"],
  },
  {
    id: 3,
    name: "Compliance & Controls",
    entityCount: 4,
    entityIds: ["AE4569822", "AE357812", "AE2689541", "AE2549286"],
  },
];

interface DomainData {
  id: number;
  name: string;
  entityCount: number;
  entityIds: string[];
}

export default function ReviewPublish() {
  const [, setLocation] = useLocation();
  const [published, setPublished] = useState(false);
  const activeStep = 4;

  const domains: DomainData[] = (() => {
    const saved = sessionStorage.getItem("finalizedDomains");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_DOMAINS;
      }
    }
    return DEFAULT_DOMAINS;
  })();

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
            Publish & Export Business Domains
          </h1>
          <p className="text-sm text-[#555] mb-8 text-center">
            You are about to publish <span className="font-bold text-[#1e3a6a]">{domains.length} Business Domains</span> for
            Portfolio Manager: <span className="font-bold text-[#1e3a6a]">Alice Wang</span> and
            BM Lead: <span className="font-bold text-[#1e3a6a]">Michael Smith</span>;
            Effective <span className="font-bold text-[#1e3a6a]">01 Oct 2026</span>.
          </p>

          <div className="space-y-4 max-w-[900px] mx-auto mb-8">
            {domains.map((domain) => (
              <div key={domain.id} className="border border-[#d0d5dd] rounded-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 bg-[#f7f9fb]">
                  <ChevronRight className="w-4 h-4 text-[#1e3a6a] shrink-0" />
                  <span className="text-[15px] font-bold text-[#1e3a6a]">
                    Domain {domain.id} – {domain.name}
                  </span>
                  <span className="text-sm text-[#555] ml-1">
                    ({domain.entityCount} AEs)
                  </span>
                </div>
                <div className="px-10 py-3 bg-white border-t border-[#e8ecf0]">
                  <p data-testid={`text-domain-entities-${domain.id}`} className="text-sm text-[#555]">
                    {domain.entityIds.join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {published && (
            <div className="max-w-[900px] mx-auto mb-6 bg-[#e8f5e9] border border-[#78b376] rounded-sm p-4 text-sm text-[#2e7d32] font-medium">
              Domains published successfully to the system.
            </div>
          )}

          <div className="max-w-[900px] mx-auto flex items-center justify-between pt-4 border-t border-[#e0e0e0]">
            <button
              data-testid="button-back-publish"
              onClick={() => setLocation("/review-define-domains")}
              className="flex items-center gap-1 bg-white hover:bg-slate-50 text-[#333] text-sm font-medium px-6 py-2.5 rounded-sm border border-[#c5cdd4] shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <button
                data-testid="button-publish-to-system"
                onClick={() => setPublished(true)}
                className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white text-sm font-semibold px-8 py-3 rounded-sm shadow-sm transition-colors"
              >
                Publish to System
              </button>
              <button
                data-testid="button-export-excel"
                className="bg-white hover:bg-slate-50 text-[#333] text-sm font-medium px-6 py-3 rounded-sm border border-[#c5cdd4] shadow-sm"
              >
                Export to Excel
              </button>
              <button
                data-testid="button-export-pdf"
                className="bg-white hover:bg-slate-50 text-[#333] text-sm font-medium px-6 py-3 rounded-sm border border-[#c5cdd4] shadow-sm"
              >
                Export to PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
