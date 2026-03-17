import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronDown } from "lucide-react";

const AUDITABLE_ENTITIES = [
  { id: "AE357812", title: "Investment Risk", description: "Investment risk analysis and oversight activities." },
  { id: "AE2689541", title: "Group Stress Testing", description: "Revised risk testing data for the exec. and testing indication." },
  { id: "AE2549286", title: "Internal Model Assessment", description: "Compensate system. Mar Assessment internal model and clash." },
  { id: "AE1575242", title: "Enterprise Risk Management", description: "Enterprise Risk Management & address key viability accesses." },
  { id: "AE2896410", title: "Enterprise & Climate Risk Strategy", description: "Strategy underpinnt with optimal bils, routory priorits." },
  { id: "AE2232754", title: "Credit Risk Policy & Frameworks", description: "Provides services for examples, where high and obligaties." },
  { id: "AE2222400", title: "Control and Model Risk Monitoring", description: "Control and model risk, monitoring to the done." },
  { id: "AE3142465", title: "Model Risk Management Validation", description: "Control model risk of approval new expose rules." },
  { id: "AE4569822", title: "Group Risk Reporting", description: "Internal Model Filing for expertise testing Mock Strangletips." },
];

const SIDEBAR_STEPS = [
  { id: 1, label: "Portfolio & BML Selection" },
  { id: 2, label: "Build Domain" },
  { id: 3, label: "Review & Define Domains" },
  { id: 4, label: "Publish & Export" },
];

const PORTFOLIO_MANAGERS = ["Alice Wang", "James Chen", "Sarah Johnson"];
const BML_OPTIONS = ["Michael Smith", "Rebecca Torres", "David Park"];

export default function CreateDomain() {
  const [, setLocation] = useLocation();
  const [activeStep] = useState(2);
  const [portfolioManager, setPortfolioManager] = useState("Alice Wang");
  const [businessMonitoringLead, setBusinessMonitoringLead] = useState("Michael Smith");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pmOpen, setPmOpen] = useState(false);
  const [bmlOpen, setBmlOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-[#3a6ea5] to-[#5b9bd5] border-b border-[#2c5f8a] px-6 py-2.5 text-sm text-white flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            data-testid="link-home"
            onClick={() => setLocation("/")}
            className="text-white hover:underline font-medium"
          >
            Home
          </button>
          <span className="mx-1">›</span>
          <span className="font-semibold text-white">Create a New Domain</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[220px] bg-white border-r border-[#d0d5dd] flex flex-col shrink-0 pt-2">
          <nav className="flex flex-col">
            {SIDEBAR_STEPS.map((step) => (
              <div
                key={step.id}
                data-testid={`sidebar-step-${step.id}`}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium cursor-pointer ${
                  step.id === activeStep
                    ? "bg-[#1e3a6a] text-white"
                    : "text-[#333] hover:bg-[#f0f4f8]"
                }`}
              >
                <span>{step.id}.</span>
                <span>{step.label}</span>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8">
          <h1 data-testid="text-page-title" className="text-2xl font-bold text-[#1e3a6a] mb-8 text-center">
            Select Portfolio & Business Monitoring Lead
          </h1>

          <div className="flex gap-8 mb-10 max-w-[700px] mx-auto">
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-[#333] mb-1.5">Portfolio Manager:</label>
              <button
                data-testid="select-portfolio-manager"
                onClick={() => { setPmOpen(!pmOpen); setBmlOpen(false); }}
                className="w-full border border-[#c5cdd4] rounded-sm px-3 py-2.5 text-sm text-left bg-white flex items-center justify-between focus:outline-none focus:border-[#1e3a6a]"
              >
                <span>{portfolioManager}</span>
                <ChevronDown className="w-4 h-4 text-[#1e3a6a]" />
              </button>
              {pmOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#c5cdd4] rounded-sm shadow-lg">
                  {PORTFOLIO_MANAGERS.map((pm) => (
                    <div
                      key={pm}
                      data-testid={`option-pm-${pm.replace(/\s/g, "-")}`}
                      onClick={() => { setPortfolioManager(pm); setPmOpen(false); }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#f0f4f8] ${pm === portfolioManager ? "bg-[#eef3fa] font-medium" : ""}`}
                    >
                      {pm}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-[#333] mb-1.5">Business Monitoring Lead</label>
              <button
                data-testid="select-business-monitoring-lead"
                onClick={() => { setBmlOpen(!bmlOpen); setPmOpen(false); }}
                className="w-full border border-[#c5cdd4] rounded-sm px-3 py-2.5 text-sm text-left bg-white flex items-center justify-between focus:outline-none focus:border-[#1e3a6a]"
              >
                <span>{businessMonitoringLead}</span>
                <ChevronDown className="w-4 h-4 text-[#1e3a6a]" />
              </button>
              {bmlOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[#c5cdd4] rounded-sm shadow-lg">
                  {BML_OPTIONS.map((bml) => (
                    <div
                      key={bml}
                      data-testid={`option-bml-${bml.replace(/\s/g, "-")}`}
                      onClick={() => { setBusinessMonitoringLead(bml); setBmlOpen(false); }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#f0f4f8] ${bml === businessMonitoringLead ? "bg-[#eef3fa] font-medium" : ""}`}
                    >
                      {bml}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="max-w-[900px] mx-auto">
            <h2 data-testid="text-ae-section-title" className="text-xl font-bold text-[#1e3a6a] mb-2">
              Auditable Entities In Scope
            </h2>
            <p className="text-sm text-[#555] mb-4">
              All AEs under the selected Business Monitoring Lead will be included in the domain grouping suggestions.
            </p>

            <div className="border border-[#d0d5dd] rounded-sm overflow-hidden">
              <table data-testid="table-auditable-entities" className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f7f9fb] border-b border-[#d0d5dd]">
                    <th className="text-left px-4 py-3 font-semibold text-[#1e3a6a] w-[140px]">AE ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#1e3a6a] w-[220px]">AE Title</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#1e3a6a]">AE Description</th>
                    <th className="text-right px-4 py-3 w-[100px]">
                      <button
                        data-testid="button-collapse-toggle"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="text-[#1e3a6a] text-sm font-medium hover:underline flex items-center gap-1 ml-auto"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                        {isCollapsed ? "Expand" : "Collapse"}
                      </button>
                    </th>
                  </tr>
                </thead>
                {!isCollapsed && (
                  <tbody>
                    {AUDITABLE_ENTITIES.map((ae, index) => (
                      <tr
                        key={ae.id}
                        data-testid={`row-ae-${ae.id}`}
                        className={`border-b border-[#e8ecf0] last:border-0 ${index % 2 === 0 ? "bg-white" : "bg-[#fafbfc]"}`}
                      >
                        <td className="px-4 py-3 text-[#333] font-medium">{ae.id}</td>
                        <td className="px-4 py-3 text-[#333] font-medium">{ae.title}</td>
                        <td colSpan={2} className="px-4 py-3 text-[#555]">{ae.description}</td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                data-testid="button-generate-domain-suggestions"
                onClick={() => setLocation("/define-domain")}
                className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white text-sm font-semibold px-10 py-3 rounded-sm shadow-sm transition-colors"
              >
                Generate Domain Suggestions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
