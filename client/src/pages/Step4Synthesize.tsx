import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ChevronRight, ChevronLeft } from "lucide-react";

const INSIGHTS = [
  {
    title: "Risk Events",
    content: "A major system outage due to server failure and a fraud incident in the APAC region highlighted vulnerabilities in technology resilience and regional controls. Peak activity periods were identified as critical risk points."
  },
  {
    title: "ORAC Issues",
    content: "Multiple ORAC issues remain unresolved with extended remediation delays. Weak ownership and reliance on manual processes were noted."
  },
  {
    title: "Key Risk Indicators",
    content: "Several KRIs breached thresholds in trading operations, indicating rising operational risk exposure and incident frequency."
  },
  {
    title: "Key Staff and Organizational Changes",
    content: "No significant staff or organizational changes wee noted, raising concerns about succession planning and key person risks."
  },
  {
    title: "Business Process Changes",
    content: "The new AML monitoring tool was noted as beneficial, but inconsistent adoption and training gaps were observed."
  },
  {
    title: "Critical Change Programs and Status",
    content: "The digital transformation program is delayed, increasing execution risks and dependency concerns."
  },
  {
    title: "Macro External Events",
    content: "No major external events were discussed, but geopolitical and market volatility were referenced as ongoing risks."
  },
  {
    title: "Regulatory Exam, Inquiry, or Requirement Changes",
    content: "Upcoming regulatory attention on data privacy was emphasized, with gaps in current compliance readiness highlighted."
  }
];

export default function Step4Synthesize() {
  const [, setLocation] = useLocation();

  return (
    <div className="p-10 max-w-4xl relative min-h-full pb-32">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a6a] mb-6">Step 4: Synthesize Insights</h1>
        <div className="w-full h-px bg-slate-200 mb-6" />
        <p className="text-[15px] text-[#333] mb-6">Summarizing key insights from the documents.</p>
      </header>

      <div className="mb-8">
        <div className="border border-[#c5cdd4] rounded-sm bg-white shadow-sm overflow-hidden mb-6">
          <div className="bg-[#e6f0fa] border-b border-[#c5cdd4] p-3 px-4">
            <h2 className="text-[16px] font-bold text-[#1e3a6a]">
              Risk Management Forum - Q1 Meeting
            </h2>
          </div>
          
          <div className="p-4 px-6 flex flex-col gap-4">
            {INSIGHTS.map((insight, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <span className="text-[14px] font-bold text-[#1e3a6a] whitespace-nowrap">{insight.title}</span>
                  <div className="flex-1 h-px bg-slate-200 mt-1" />
                </div>
                <p className="text-[14px] text-[#333] leading-relaxed">
                  {insight.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Pagination Actions */}
      <div className="flex justify-between items-center max-w-4xl mt-12 mb-8">
        <Button 
          variant="outline"
          onClick={() => setLocation("/step-3")}
          className="bg-white hover:bg-slate-50 text-[#1e3a6a] border-[#c5cdd4] px-8 py-5 text-base rounded-sm shadow-sm font-medium"
        >
          Back
        </Button>
        <Button 
          onClick={() => setLocation("/step-5")}
          className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white px-8 py-5 text-base rounded-sm shadow-md font-medium"
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}