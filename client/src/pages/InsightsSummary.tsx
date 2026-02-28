import { ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

export default function InsightsSummary() {
  const [, setLocation] = useLocation();

  return (
    <div className="p-10 max-w-5xl relative min-h-full pb-32">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a6a] mb-6">Insights Analysis and Summary</h1>
        <div className="w-full h-px bg-slate-200 mb-6" />
      </header>

      {/* Tabs */}
      <div className="flex mb-6">
        <div className="bg-[#1e3a6a] text-white px-6 py-2.5 text-[15px] font-medium border-r border-white/20 cursor-pointer shadow-sm">
          ORAC Risk Events
        </div>
        <div className="bg-[#f4f6f8] text-[#333] px-6 py-2.5 text-[15px] border border-l-0 border-[#c5cdd4] cursor-pointer hover:bg-[#e6ebf1]">
          ORAC Issues
        </div>
        <div className="bg-[#f4f6f8] text-[#333] px-6 py-2.5 text-[15px] border border-l-0 border-[#c5cdd4] cursor-pointer hover:bg-[#e6ebf1]">
          Navigator Changes
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-[#c5cdd4] rounded-sm bg-[#f8fbff] p-5 shadow-sm">
          <h3 className="text-[#1e3a6a] text-[15px] font-medium mb-3">New Risk Events</h3>
          <div className="text-[36px] font-bold text-[#1e3a6a] mb-2 leading-none">9</div>
          <div className="text-[#1e3a6a] text-[13px] flex items-center gap-1 font-medium">
            <span className="text-[14px]">↗</span> New This Month
          </div>
        </div>
        
        <div className="border border-[#c5cdd4] rounded-sm bg-white p-5 shadow-sm">
          <h3 className="text-[#333] text-[15px] font-medium mb-3">Risk Events Still Open or Valid</h3>
          <div className="text-[36px] font-bold text-[#333] mb-2 leading-none">14</div>
          <div className="text-[#6b9c41] text-[13px] flex items-center gap-1 font-medium">
            <span className="text-[14px]">↗</span> 1 New This Month
          </div>
        </div>

        <div className="border border-[#e8d5cc] rounded-sm bg-[#fffaf5] p-5 shadow-sm">
          <h3 className="text-[#b33a3a] text-[15px] font-medium mb-3">Overdue Risk Events</h3>
          <div className="text-[36px] font-bold text-[#b33a3a] mb-2 leading-none">5</div>
          <div className="text-[#b33a3a] text-[13px] flex items-center gap-1 font-medium">
            <span className="text-[14px]">↗</span> 1 New Overdue
          </div>
        </div>
      </div>

      {/* Text Sections */}
      <div className="space-y-8">
        {/* Key Themes */}
        <div>
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2 mb-4">
            <h2 className="text-[17px] font-bold text-[#1e3a6a]">Key Themes</h2>
            <button className="text-[13px] text-[#1e3a6a] font-medium flex items-center">
              Modify <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            <p className="text-[14px] text-[#333]">
              Vendor patch management issues are leading to validation problems and reconciliation breakdowns. <span className="font-bold text-[#1e3a6a]">EVENT 109771</span>
            </p>
            <p className="text-[14px] text-[#333]">
              Settlement processing delays are inflating downstream queue saturation and operational risk. <span className="font-bold text-[#1e3a6a]">EVENT 104382</span>
            </p>
            <p className="text-[14px] text-[#333]">
              Third-party impacts continue to disrupt payment reconciliation processes. <span className="font-bold text-[#1e3a6a]">EVENT 119205</span>
            </p>
          </div>
        </div>

        {/* Emerging Risks */}
        <div>
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2 mb-4">
            <h2 className="text-[17px] font-bold text-[#1e3a6a]">Emerging Risks</h2>
            <button className="text-[13px] text-[#1e3a6a] font-medium flex items-center">
              Modify <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="space-y-4">
            <li className="text-[14px] text-[#333] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-[#1e3a6a]">
              Increase in incidents post-deploymentchange failure across applications <span className="font-bold text-[#1e3a6a]">(EVENT 112205, 119025)</span>
            </li>
            <li className="text-[14px] text-[#333] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-[#1e3a6a]">
              Recurring fraud threats detected in ACH transactions point to gaps in financial controls <span className="font-bold text-[#1e3a6a]">(EVENT 118643)</span>
            </li>
          </ul>
        </div>

        {/* Risk Impact Analysis */}
        <div>
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2 mb-4">
            <h2 className="text-[17px] font-bold text-[#1e3a6a]">Risk Impact Analysis</h2>
            <button className="text-[13px] text-[#1e3a6a] font-medium flex items-center">
              Modify <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="space-y-4">
            <li className="text-[14px] text-[#333] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-[#1e3a6a]">
              <span className="font-bold">Operational Impacts:</span> Recently surfacing risks indicate potential for substantial system downtime <span className="font-bold text-[#1e3a6a]">(EVENT 104382, EVENT 117502)</span>
            </li>
            <li className="text-[14px] text-[#333] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-[#1e3a6a]">
              <span className="font-bold">Financial Impacts:</span> ACH and settlement risks imply recurring financial losses if not mitigated <span className="font-bold text-[#1e3a6a]">(EVENT 118643, EVENT 117502)</span>
            </li>
            <li className="text-[14px] text-[#333] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-[#1e3a6a]">
              <span className="font-bold">Regulatory Impacts:</span> Further scrutiny is expected to repeat third-party vendor disruptions <span className="font-bold text-[#1e3a6a]">(EVENT 119205)</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex justify-start mt-8">
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