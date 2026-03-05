import { useState } from "react";
import { useLocation } from "wouter";

const SIDEBAR_STEPS = [
  { id: 1, label: "Portfolio & AE Selection" },
  { id: 2, label: "Define Domain Details" },
  { id: 3, label: "Review & Publish" },
];

const ALL_ENTITIES: Record<string, string> = {
  AE12345: "Trading Systems",
  AE12346: "Ops Risk Controls",
  AE12347: "Market Data Services",
  AE12456: "Regulatory Compliance",
  AE12457: "Legal Risk Management",
  AE12458: "Wealth Management Ops",
  AE12567: "Retail Branch Operations",
  AE12568: "Consumer Lending Services",
  AE12569: "Retail Wealth Advisory",
};

const DROPDOWN_LABEL_MAP: Record<string, string> = {
  "Business Monitoring Lead:": "Business Monitoring Lead",
  "Portfolio:": "Portfolio",
  "Level 3 Responsible Executive:": "Level 3 Responsible Executive",
  "Level 4 Responsible Executives:": "Level 4 Responsible Executive",
  "Responsible Legal Entities:": "Responsible Legal Entities",
  "Responsible Vertical(s):": "Responsible Verticals",
};

export default function ReviewPublish() {
  const [, setLocation] = useLocation();
  const [published, setPublished] = useState(false);
  const activeStep = 3;

  const domainName = sessionStorage.getItem("domainDetails_name") || "—";
  const domainDescription = sessionStorage.getItem("domainDetails_description") || "—";

  const dropdowns: Record<string, string> = (() => {
    const saved = sessionStorage.getItem("domainDetails_dropdowns");
    return saved ? JSON.parse(saved) : {};
  })();

  const selectedEntities: string[] = (() => {
    const saved = sessionStorage.getItem("createDomain_selectedEntities");
    return saved ? JSON.parse(saved) : [];
  })();

  const entitiesDisplay = selectedEntities
    .map((id) => `${id} – ${ALL_ENTITIES[id] || id}`)
    .join(", ") || "—";

  const summaryRows = [
    { label: "Domain Name:", value: domainName },
    { label: "Domain Description:", value: domainDescription },
    { label: "Business Monitoring Lead:", value: dropdowns["Business Monitoring Lead:"] || "—" },
    { label: "Portfolio:", value: dropdowns["Portfolio:"] || "—" },
    { label: "Level 3 Responsible Executive:", value: dropdowns["Level 3 Responsible Executive:"] || "—" },
    { label: "Level 4 Responsible Executive:", value: dropdowns["Level 4 Responsible Executives:"] || "—" },
    { label: "Responsible Legal Entities:", value: dropdowns["Responsible Legal Entities:"] || "—" },
    { label: "Responsible Verticals:", value: dropdowns["Responsible Vertical(s):"] || "—" },
    { label: "Auditable Entities:", value: entitiesDisplay },
    { label: "Effective Date:", value: "January 1, 2026" },
  ];

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
          <h1 className="text-2xl font-bold text-[#1e3a6a] mb-2">
            <span className="font-normal">Step 3:</span> Review & Publish
          </h1>
          <p className="text-sm text-[#555] mb-6">Review the details below and publish.</p>

          <div className="border border-[#d0d5dd] rounded-sm bg-white">
            <div className="bg-[#f4f6f8] px-5 py-3 border-b border-[#d0d5dd]">
              <h2 className="text-[15px] font-bold text-[#333]">Summary</h2>
            </div>
            <div className="divide-y divide-[#e8ebee]">
              {summaryRows.map((row) => (
                <div key={row.label} className="flex px-5 py-3 text-sm">
                  <span className="font-bold text-[#1e3a6a] w-[240px] shrink-0">{row.label}</span>
                  <span className="text-[#333]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              data-testid="button-back-review"
              onClick={() => setLocation("/define-domain")}
              className="bg-white hover:bg-slate-50 text-[#333] text-sm font-medium px-8 py-2.5 rounded-sm border border-[#c5cdd4] shadow-sm"
            >
              Back
            </button>
            <div className="flex-1" />
            <button
              data-testid="button-publish"
              onClick={() => setPublished(true)}
              className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white text-sm font-medium px-8 py-2.5 rounded-sm shadow-sm"
            >
              Publish
            </button>
          </div>

          <div className="mt-8 flex items-start gap-3 bg-[#f4f6f8] border border-[#d0d5dd] rounded-sm p-4">
            <div className="w-8 h-8 bg-[#1e3a6a] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
              A
            </div>
            <div>
              <p className="text-sm font-bold text-[#333] mb-1">Ready to publish?</p>
              <p className="text-sm text-[#555]">
                This Business Domain will be available as the golden source for auditors.
              </p>
            </div>
          </div>

          {published && (
            <div className="mt-4 bg-[#e8f5e9] border border-[#78b376] rounded-sm p-4 text-sm text-[#2e7d32] font-medium">
              Domain published successfully.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
