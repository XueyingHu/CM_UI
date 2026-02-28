import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getOrCreateSession } from "@/lib/api";

const MAIN_STEPS = [
  "Select business domain",
  "Upload Documents for Review",
  "Extract Key Information",
  "Synthesize Insights",
  "Validate Against Source Data",
  "Generate Executive Summary",
];

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const handleStart = async () => {
    await getOrCreateSession();
    setLocation("/step-1");
  };

  return (
    <div className="p-10 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-[#1e3a6a] mb-6">Welcome to the Continuous Monitoring Tool!</h1>
        <div className="w-full h-px bg-slate-200 mb-6" />
        <p className="text-lg text-slate-800 mb-6">Let's get started with a few easy steps:</p>
      </header>

      <div className="space-y-3 mb-10">
        {MAIN_STEPS.map((step, index) => (
          <div 
            key={index} 
            data-testid={`step-item-${index + 1}`}
            className="flex items-center gap-3 p-4 bg-[#f4f6f8] border border-[#e0e4e8] rounded-sm shadow-sm"
          >
            <div className="w-6 h-6 rounded-full bg-[#78b376] flex items-center justify-center text-white font-bold text-sm">
              {index + 1}
            </div>
            <span className="text-slate-800 font-medium">{step}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button 
          data-testid="button-get-started"
          onClick={handleStart}
          className="bg-[#2c4b7e] hover:bg-[#1e3a6a] text-white px-8 py-6 text-lg rounded-sm shadow-md font-medium"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
