import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useLocation } from "wouter";

export default function Step6Summary() {
  const [, setLocation] = useLocation();

  return (
    <div className="p-10 max-w-5xl relative min-h-full pb-32">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a6a] mb-6">Step 6: Generate Executive Summary</h1>
        <div className="w-full h-px bg-slate-200 mb-6" />
        <p className="text-sm text-[#333] mb-6">Review the consolidated executive summary below.</p>
      </header>

      <div className="mb-10">
        <h2 className="text-base font-bold text-[#1e3a6a] mb-4">Risk Overview Summary</h2>
        
        <div className="grid grid-cols-3 gap-4">
          {/* Key Risk Areas */}
          <div className="border border-[#c5cdd4] rounded-sm bg-white shadow-sm overflow-hidden">
            <div className="bg-[#2c4b7e] text-white p-3 text-center">
              <h3 className="text-[15px] font-medium">Key Risk Areas</h3>
            </div>
            <ul className="flex flex-col">
              <li className="px-4 py-3 text-[14px] text-[#333] border-b border-[#e0e4e8] relative before:content-['•'] before:absolute before:left-2 before:text-[#1e3a6a]">
                Operational Disruptions
              </li>
              <li className="px-4 py-3 text-[14px] text-[#333] border-b border-[#e0e4e8] relative before:content-['•'] before:absolute before:left-2 before:text-[#1e3a6a]">
                Regulatory Compliance
              </li>
              <li className="px-4 py-3 text-[14px] text-[#333] relative before:content-['•'] before:absolute before:left-2 before:text-[#1e3a6a]">
                Control Gaps
              </li>
            </ul>
          </div>

          {/* Emerging Risks */}
          <div className="border border-[#c5cdd4] rounded-sm bg-white shadow-sm overflow-hidden">
            <div className="bg-[#e68a00] text-white p-3 text-center">
              <h3 className="text-[15px] font-medium">Emerging Risks</h3>
            </div>
            <ul className="flex flex-col">
              <li className="px-4 py-3 text-[14px] text-[#333] border-b border-[#e0e4e8] relative before:content-['•'] before:absolute before:left-2 before:text-[#e68a00]">
                Geopolitical Instability
              </li>
              <li className="px-4 py-3 text-[14px] text-[#333] relative before:content-['•'] before:absolute before:left-2 before:text-[#e68a00]">
                Dependency Delays
              </li>
            </ul>
          </div>

          {/* Resolved Items */}
          <div className="border border-[#c5cdd4] rounded-sm bg-white shadow-sm overflow-hidden">
            <div className="bg-[#6b9c41] text-white p-3 text-center">
              <h3 className="text-[15px] font-medium">Resolved Items</h3>
            </div>
            <ul className="flex flex-col">
              <li className="px-4 py-3 text-[14px] text-[#333] border-b border-[#e0e4e8] relative before:content-['•'] before:absolute before:left-2 before:text-[#6b9c41]">
                IT Infrastructure Upgrade
              </li>
              <li className="px-4 py-3 text-[14px] text-[#333] relative before:content-['•'] before:absolute before:left-2 before:text-[#6b9c41]">
                Incident Reporting Delays
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-base font-bold text-[#1e3a6a] mb-2">Forum Summary Insights</h2>
        <div className="w-full h-[2px] bg-slate-200 mb-6" />

        <div className="mb-6">
          <h3 className="text-[15px] font-bold text-[#1e3a6a] mb-2">Risk Management Forum - Q1 Meeting</h3>
          <div className="w-full h-px bg-slate-200 mb-2" />
          <ul className="flex flex-col">
            <li className="py-3 text-[14px] text-[#333] border-b border-[#e0e4e8] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-[#333]">
              System outage due to server failure.
            </li>
            <li className="py-3 text-[14px] text-[#333] border-b border-[#e0e4e8] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-[#333]">
              Outstanding ORAC issues pending remediation.
            </li>
            <li className="py-3 text-[14px] text-[#333] border-b border-[#e0e4e8] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-[#333]">
              KRI breaches in trading operations.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[15px] font-bold text-[#1e3a6a] mb-2">Ops Improvement Meeting - March 2022</h3>
          <div className="w-full h-px bg-slate-200 mb-2" />
          <ul className="flex flex-col">
            <li className="py-3 text-[14px] text-[#333] border-b border-[#e0e4e8] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-[#333]">
              IT infrastructure upgrade completed.
            </li>
            <li className="py-3 text-[14px] text-[#333] border-b border-[#e0e4e8] relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-[#333]">
              Reduction in system downtime incidents.
            </li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button 
          variant="outline"
          onClick={() => setLocation("/step-5")}
          className="bg-white hover:bg-slate-50 text-[#333] border-[#c5cdd4] text-sm font-medium px-8 py-2.5 rounded-sm shadow-sm"
        >
          Back
        </Button>
        <Button 
          onClick={() => setLocation("/review-validate")}
          className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white text-sm font-medium px-8 py-2.5 rounded-sm shadow-sm flex items-center gap-2"
        >
          <Download className="w-5 h-5" /> Download Report
        </Button>
      </div>
    </div>
  );
}