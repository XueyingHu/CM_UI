import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();

  const isReviewPhase = location === "/review-validate" || location === "/expand-search" || location === "/insights-summary";

  // Sidebar changes completely based on the mockup when transitioning to this new phase
  const MAIN_STEPS = [
    { id: 1, label: "Select business domain", isActive: location === "/step-1", isCompleted: location === "/step-2" || location === "/step-3" || location === "/step-4" || location === "/step-5" || location === "/step-6" },
    { id: 2, label: "Upload Documents", isActive: location === "/step-2", isCompleted: location === "/step-3" || location === "/step-4" || location === "/step-5" || location === "/step-6" },
    { id: 3, label: "Extract Key Information", isActive: location === "/step-3", isCompleted: location === "/step-4" || location === "/step-5" || location === "/step-6" },
    { id: 4, label: "Synthesize Insights", isActive: location === "/step-4", isCompleted: location === "/step-5" || location === "/step-6" },
    { id: 5, label: "Validate Against Source Data", isActive: location === "/step-5", isCompleted: location === "/step-6" },
    { id: 6, label: "Generate Executive Summary", isActive: location === "/step-6", isCompleted: false },
  ];

  const REVIEW_STEPS = [
    { id: 1, label: "Review and Validate\nRelevant Items", isActive: location === "/review-validate", isCompleted: location === "/expand-search" || location === "/insights-summary", checkmark: true },
    { id: 2, label: "Expand Search Criteria (optional)", isActive: location === "/expand-search", isCompleted: location === "/insights-summary", checkmark: true },
    { id: 3, label: "Generate Insights Summary", isActive: location === "/insights-summary", isCompleted: false, checkmark: true },
  ];

  const currentSteps = isReviewPhase ? REVIEW_STEPS : MAIN_STEPS;

  return (
    <div className="w-[280px] bg-[#f4f4f4] border-r border-[#e0e0e0] flex flex-col h-full shrink-0 shadow-[inset_-1px_0_0_rgba(0,0,0,0.05)]">
      <div className="px-6 py-5">
        <h2 className="text-[#1e3a6a] text-xl font-semibold font-sans mb-4">Your Progress</h2>
      </div>

      <nav className="flex-1 bg-white mx-4 rounded-sm border border-[#e0e0e0] overflow-hidden mb-6">
        <ul className="flex flex-col">
          {currentSteps.map((step, index) => {
            const isCompletedAndNotActive = step.isCompleted && !step.isActive;
            const isCompletedAndActive = step.isCompleted && step.isActive;
            
            return (
              <li key={step.id}>
                <div 
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium border-b border-[#e0e0e0] last:border-0",
                    (step.isActive || isCompletedAndNotActive) ? "bg-[#fff8cc] text-[#333]" : "bg-white text-[#333]"
                  )}
                >
                  <div className="w-6 flex-shrink-0 flex justify-center mr-2">
                    {step.isCompleted || isCompletedAndActive || (step.isActive && step.checkmark) ? (
                      <Check className="w-5 h-5 text-black" strokeWidth={2.5} />
                    ) : (
                      <span className="font-bold">{step.id}.</span>
                    )}
                  </div>
                  <span className="whitespace-pre-line">{step.label}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}