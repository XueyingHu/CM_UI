import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

const TAB_DATA: Record<string, {
  kpis: { title: string; value: number; trend: string; color: string; bg: string; borderColor: string }[];
  keyThemes: { text: string; ref: string }[];
  emergingRisks: { text: string; ref: string }[];
  riskImpact: { label: string; text: string; ref: string }[];
}> = {
  events: {
    kpis: [
      { title: "New Risk Events", value: 9, trend: "New This Month", color: "#1e3a6a", bg: "#f8fbff", borderColor: "#c5cdd4" },
      { title: "Risk Events Still Open or Valid", value: 14, trend: "1 New This Month", color: "#333", bg: "#ffffff", borderColor: "#c5cdd4" },
      { title: "Overdue Risk Events", value: 5, trend: "1 New Overdue", color: "#b33a3a", bg: "#fffaf5", borderColor: "#e8d5cc" },
    ],
    keyThemes: [
      { text: "Vendor patch management issues are leading to validation problems and reconciliation breakdowns.", ref: "EVENT 109771" },
      { text: "Settlement processing delays are inflating downstream queue saturation and operational risk.", ref: "EVENT 104382" },
      { text: "Third-party impacts continue to disrupt payment reconciliation processes.", ref: "EVENT 119205" },
    ],
    emergingRisks: [
      { text: "Increase in incidents post-deployment change failure across applications", ref: "EVENT 112205, 119025" },
      { text: "Recurring fraud threats detected in ACH transactions point to gaps in financial controls", ref: "EVENT 118643" },
    ],
    riskImpact: [
      { label: "Operational Impacts:", text: "Recently surfacing risks indicate potential for substantial system downtime", ref: "EVENT 104382, EVENT 117502" },
      { label: "Financial Impacts:", text: "ACH and settlement risks imply recurring financial losses if not mitigated", ref: "EVENT 118643, EVENT 117502" },
      { label: "Regulatory Impacts:", text: "Further scrutiny is expected to repeat third-party vendor disruptions", ref: "EVENT 119205" },
    ],
  },
  issues: {
    kpis: [
      { title: "New Issues Identified", value: 6, trend: "New This Month", color: "#1e3a6a", bg: "#f8fbff", borderColor: "#c5cdd4" },
      { title: "Issues Still Open or Pending", value: 11, trend: "2 New This Month", color: "#333", bg: "#ffffff", borderColor: "#c5cdd4" },
      { title: "Overdue Issues", value: 3, trend: "1 Newly Overdue", color: "#b33a3a", bg: "#fffaf5", borderColor: "#e8d5cc" },
    ],
    keyThemes: [
      { text: "Missing authorization controls in manual override processes are creating compliance gaps and audit exposure.", ref: "ISSUE 402911" },
      { text: "Incomplete training records for newly deployed AML monitoring tools are limiting effectiveness of fraud detection.", ref: "ISSUE 405822" },
      { text: "Data privacy compliance gaps in customer onboarding flows risk regulatory penalties under GDPR and local data protection laws.", ref: "ISSUE 410293" },
    ],
    emergingRisks: [
      { text: "Growing backlog of unresolved issues in manual reconciliation processes increasing error rates", ref: "ISSUE 402911, 412558" },
      { text: "Inadequate sign-off procedures on quarterly financial reconciliations creating audit trail gaps", ref: "ISSUE 412558" },
    ],
    riskImpact: [
      { label: "Compliance Impacts:", text: "Authorization and training deficiencies could result in regulatory findings during upcoming audits", ref: "ISSUE 402911, ISSUE 405822" },
      { label: "Financial Impacts:", text: "Missing reconciliation sign-offs may lead to undetected discrepancies and financial misstatements", ref: "ISSUE 412558" },
      { label: "Operational Impacts:", text: "Data privacy gaps in onboarding could halt new customer acquisition if enforcement actions are taken", ref: "ISSUE 410293" },
    ],
  },
  changes: {
    kpis: [
      { title: "Upcoming Changes", value: 4, trend: "Scheduled This Quarter", color: "#1e3a6a", bg: "#f8fbff", borderColor: "#c5cdd4" },
      { title: "Changes In Progress", value: 7, trend: "2 Nearing Completion", color: "#333", bg: "#ffffff", borderColor: "#c5cdd4" },
      { title: "High-Risk Changes", value: 2, trend: "Requires Attention", color: "#b33a3a", bg: "#fffaf5", borderColor: "#e8d5cc" },
    ],
    keyThemes: [
      { text: "Core banking platform upgrade (v2.4) introduces significant infrastructure dependencies and requires coordinated downtime planning.", ref: "CHG 89012" },
      { text: "Cloud infrastructure migration is in planning phase with broad impact across multiple business domains and application stacks.", ref: "CHG 90221" },
      { text: "Firewall ruleset updates for APAC region have been completed, reducing exposure to cross-region network vulnerabilities.", ref: "CHG 89105" },
    ],
    emergingRisks: [
      { text: "Delayed core banking upgrade increasing technical debt and compatibility risks with downstream systems", ref: "CHG 89012" },
      { text: "Cloud migration planning gaps may lead to service disruptions if rollback procedures are not validated", ref: "CHG 90221" },
    ],
    riskImpact: [
      { label: "Operational Impacts:", text: "Core banking upgrade downtime could affect real-time transaction processing and settlement cycles", ref: "CHG 89012" },
      { label: "Strategic Impacts:", text: "Cloud migration delays may push back digital transformation milestones and increase total cost of ownership", ref: "CHG 90221" },
      { label: "Security Impacts:", text: "Completed APAC firewall changes reduce network attack surface but ongoing monitoring is required", ref: "CHG 89105" },
    ],
  },
};

export default function InsightsSummary() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("events");

  const data = TAB_DATA[activeTab];

  return (
    <div className="p-10 max-w-5xl relative min-h-full pb-32">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a6a] mb-6">Insights Analysis and Summary</h1>
        <div className="w-full h-px bg-slate-200 mb-6" />
      </header>

      <div className="flex mb-6">
        <div 
          data-testid="tab-events"
          onClick={() => setActiveTab("events")}
          className={`px-6 py-2.5 text-[15px] font-medium cursor-pointer shadow-sm ${activeTab === "events" ? "bg-[#1e3a6a] text-white border-r border-white/20" : "bg-[#f4f6f8] text-[#333] border border-[#c5cdd4] hover:bg-[#e6ebf1]"}`}
        >
          ORAC Risk Events
        </div>
        <div 
          data-testid="tab-issues"
          onClick={() => setActiveTab("issues")}
          className={`px-6 py-2.5 text-[15px] font-medium cursor-pointer shadow-sm ${activeTab === "issues" ? "bg-[#1e3a6a] text-white border-r border-white/20" : "bg-[#f4f6f8] text-[#333] border border-l-0 border-[#c5cdd4] hover:bg-[#e6ebf1]"}`}
        >
          ORAC Issues
        </div>
        <div 
          data-testid="tab-changes"
          onClick={() => setActiveTab("changes")}
          className={`px-6 py-2.5 text-[15px] font-medium cursor-pointer shadow-sm ${activeTab === "changes" ? "bg-[#1e3a6a] text-white border-r border-white/20" : "bg-[#f4f6f8] text-[#333] border border-l-0 border-[#c5cdd4] hover:bg-[#e6ebf1]"}`}
        >
          Navigator Changes
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {data.kpis.map((kpi, i) => (
          <div key={i} className="rounded-sm p-5 shadow-sm" style={{ border: `1px solid ${kpi.borderColor}`, backgroundColor: kpi.bg }}>
            <h3 className="text-[15px] font-medium mb-3" style={{ color: kpi.color }}>{kpi.title}</h3>
            <div className="text-[36px] font-bold mb-2 leading-none" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-[13px] flex items-center gap-1 font-medium" style={{ color: i === 1 ? "#6b9c41" : kpi.color }}>
              <span className="text-[14px]">↗</span> {kpi.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2 mb-4">
            <h2 className="text-[17px] font-bold text-[#1e3a6a]">Key Themes</h2>
            <button className="text-[13px] text-[#1e3a6a] font-medium flex items-center">
              Modify <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            {data.keyThemes.map((item, i) => (
              <p key={i} className="text-[14px] text-[#333]">
                {item.text} <span className="font-bold text-[#1e3a6a]">{item.ref}</span>
              </p>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2 mb-4">
            <h2 className="text-[17px] font-bold text-[#1e3a6a]">Emerging Risks</h2>
            <button className="text-[13px] text-[#1e3a6a] font-medium flex items-center">
              Modify <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="space-y-4">
            {data.emergingRisks.map((item, i) => (
              <li key={i} className="text-[14px] text-[#333] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-[#1e3a6a]">
                {item.text} <span className="font-bold text-[#1e3a6a]">({item.ref})</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2 mb-4">
            <h2 className="text-[17px] font-bold text-[#1e3a6a]">Risk Impact Analysis</h2>
            <button className="text-[13px] text-[#1e3a6a] font-medium flex items-center">
              Modify <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="space-y-4">
            {data.riskImpact.map((item, i) => (
              <li key={i} className="text-[14px] text-[#333] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-[#1e3a6a]">
                <span className="font-bold">{item.label}</span> {item.text} <span className="font-bold text-[#1e3a6a]">({item.ref})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button 
          onClick={() => setLocation("/expand-search")}
          className="bg-white hover:bg-slate-50 text-[#1e3a6a] border border-[#c5cdd4] px-8 py-5 text-base rounded-sm shadow-sm font-medium flex items-center"
        >
          Back
        </button>
      </div>
    </div>
  );
}
