import { useState } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";

const GROUPS = [
  {
    id: 1,
    title: "Same Business Monitoring Lead & Level 3 Exec.",
    confidence: "High Confidence",
    confidenceColor: "bg-[#4a8c3f] text-white",
    rationale: "AEs share the same Business Monitoring Lead and Level 3 Responsible Executive.",
    entities: [
      { id: "AE12345", name: "Trading Systems" },
      { id: "AE12346", name: "Ops Risk Controls" },
      { id: "AE12347", name: "Market Data Services" },
    ],
  },
  {
    id: 2,
    title: "Same Responsible Legal Entities & Level 4 Execs.",
    confidence: "Medium Confidence",
    confidenceColor: "bg-[#e8a838] text-white",
    rationale: "AEs are linked to the same Responsible Legal Entities and Level 4 Responsible Executives.",
    entities: [
      { id: "AE12456", name: "Regulatory Compliance" },
      { id: "AE12457", name: "Legal Risk Management" },
      { id: "AE12458", name: "Wealth Management Ops" },
    ],
  },
  {
    id: 3,
    title: "Same Responsible Verticals & Level 3 Org.",
    confidence: "Low Confidence",
    confidenceColor: "bg-[#c9483c] text-white",
    rationale: "AEs belong to the same Responsible Verticals and Level 3 Responsible Executive Org.",
    entities: [
      { id: "AE12567", name: "Retail Branch Operations" },
      { id: "AE12568", name: "Consumer Lending Services" },
      { id: "AE12569", name: "Retail Wealth Advisory" },
    ],
  },
];

const SIDEBAR_STEPS = [
  { id: 1, label: "Portfolio & AE Selection" },
  { id: 2, label: "Define Domain Details" },
  { id: 3, label: "Review & Publish" },
];

export default function CreateDomain() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [activeStep] = useState(1);

  const toggleEntity = (entityId: string) => {
    setSelectedEntities((prev) =>
      prev.includes(entityId)
        ? prev.filter((id) => id !== entityId)
        : [...prev, entityId]
    );
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
        <span className="text-[#555] text-sm">Domain: Market Tech – Ops Risk</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[240px] bg-[#f4f4f4] border-r border-[#e0e0e0] flex flex-col shrink-0 pt-4">
          <nav className="flex flex-col">
            {SIDEBAR_STEPS.map((step) => (
              <div
                key={step.id}
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
          <h1 className="text-2xl font-bold text-[#1e3a6a] mb-6 text-center">
            Select a Portfolio to Begin
          </h1>

          <div className="relative mb-8 max-w-[550px] mx-auto">
            <input
              data-testid="input-search-portfolio"
              type="text"
              placeholder="Type to search for a portfolio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-[#c5cdd4] rounded-sm px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-[#1e3a6a]"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
          </div>

          <div className="space-y-8">
            {GROUPS.map((group) => (
              <div key={group.id}>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-[16px] font-bold text-[#1e3a6a]">
                    Group {group.id}: {group.title}
                  </h2>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-sm ${group.confidenceColor}`}
                  >
                    {group.confidence}
                  </span>
                </div>
                <p className="text-sm text-[#555] mb-3">
                  <span className="font-semibold text-[#1e3a6a]">Rationale:</span>{" "}
                  {group.rationale}
                </p>
                <div className="space-y-2 ml-4">
                  {group.entities.map((entity) => (
                    <label
                      key={entity.id}
                      data-testid={`checkbox-entity-${entity.id}`}
                      className="flex items-center gap-3 cursor-pointer text-sm text-[#333]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEntities.includes(entity.id)}
                        onChange={() => toggleEntity(entity.id)}
                        className="w-4 h-4 rounded-sm border-[#c5cdd4] accent-[#1e3a6a]"
                      />
                      <span>
                        {entity.id} – {entity.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#e0e0e0] flex items-center justify-between">
            <p className="text-sm text-[#555]">
              Select auditable entities from the suggestions above to include in your new business domain.
            </p>
            <div className="flex gap-3">
              <button
                data-testid="button-back-create-domain"
                onClick={() => setLocation("/")}
                className="bg-white hover:bg-slate-50 text-[#333] text-sm font-medium px-8 py-2.5 rounded-sm border border-[#c5cdd4] shadow-sm"
              >
                Back
              </button>
              <button
                data-testid="button-next-create-domain"
                onClick={() => setLocation("/define-domain")}
                className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white text-sm font-medium px-8 py-2.5 rounded-sm shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
