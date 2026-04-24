import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ChevronRight, ChevronLeft } from "lucide-react";

const INSIGHTS_DICT: Record<string, string> = {
  "Risk Events": "A major system outage due to server failure and a fraud incident in the APAC region highlighted vulnerabilities in technology resilience and regional controls. Peak activity periods were identified as critical risk points.",
  "ORAC Issues": "Multiple ORAC issues remain unresolved with extended remediation delays. Weak ownership and reliance on manual processes were noted.",
  "Key Risk Indicators": "Several KRIs breached thresholds in trading operations, indicating rising operational risk exposure and incident frequency.",
  "Key Staff and Organizational Changes": "No significant staff or organizational changes wee noted, raising concerns about succession planning and key person risks.",
  "Business Process Changes": "The new AML monitoring tool was noted as beneficial, but inconsistent adoption and training gaps were observed.",
  "Critical Change Programs and Status": "The digital transformation program is delayed, increasing execution risks and dependency concerns.",
  "Macro External Events": "No major external events were discussed, but geopolitical and market volatility were referenced as ongoing risks.",
  "Regulatory Exam, Inquiry, or Requirement Changes": "Upcoming regulatory attention on data privacy was emphasized, with gaps in current compliance readiness highlighted."
};

export default function Step4Analyze() {
  const [, setLocation] = useLocation();

  return (
    <div className="p-10 max-w-4xl relative min-h-full pb-32">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a6a] mb-6">Step 4: Synthesize Insights</h1>
        <div className="w-full h-px bg-slate-200 mb-6" />
        <p className="text-sm text-[#333] mb-6">Summarizing key insights from the documents.</p>
      </header>

      <div className="mb-8">
        <div className="border border-[#c5cdd4] rounded-sm bg-white shadow-sm overflow-hidden mb-6">
          <div className="bg-[#e6f0fa] border-b border-[#c5cdd4] p-3 px-4">
            <h2 className="text-base font-bold text-[#1e3a6a]">
              Risk Management Forum - Q1 Meeting
            </h2>
          </div>
          
          <div className="p-4 px-6 flex flex-col gap-4">
            {Object.entries(INSIGHTS_DICT).map(([title, content], index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <span className="text-[14px] font-bold text-[#1e3a6a] whitespace-nowrap">{title}</span>
                  <div className="flex-1 h-px bg-slate-200 mt-1" />
                </div>
                <p className="text-[14px] text-[#333] leading-relaxed">
                  {content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Pagination Actions */}
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline"
          onClick={() => setLocation("/step-3")}
          className="bg-white hover:bg-slate-50 text-[#333] border-[#c5cdd4] text-sm font-medium px-8 py-2.5 rounded-sm shadow-sm"
        >
          Back
        </Button>
        <Button 
          onClick={() => setLocation("/step-5")}
          className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white text-sm font-medium px-8 py-2.5 rounded-sm shadow-sm"
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}