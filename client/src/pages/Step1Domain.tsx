import { useState } from "react";
import { CheckCircle2, Circle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const DOMAINS = [
  "Market Tech - Pre-Trade",
  "Market Tech - Post-Trade",
  "Market Tech - Ops Risk",
  "Market Tech - Data Analytics",
  "Market Tech - Compliance",
  "Market Tech - Algo Development"
];

export default function Step1Domain() {
  const [, setLocation] = useLocation();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(
    () => sessionStorage.getItem("selectedDomain") || null
  );

  const handleDomainSelect = (domain: string) => {
    setSelectedDomain(domain);
    sessionStorage.setItem("selectedDomain", domain);
  };

  return (
    <div className="p-10 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a6a] mb-6">Step 1: Select business domain</h1>
        <div className="w-full h-px bg-slate-200 mb-6" />
        <p className="text-[17px] text-[#333] mb-6">Please choose a business domain:</p>
      </header>

      <div className="mb-8 max-w-[600px]">
        <div className="border border-[#c5cdd4] rounded-sm bg-white shadow-sm flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-[#c5cdd4] bg-[#f4f6f8] cursor-pointer hover:bg-[#e6ebf1]">
            <div className="flex items-center gap-3">
              {selectedDomain ? (
                <>
                  <div className="bg-[#78b376] rounded-full p-0.5">
                    <CheckCircle2 className="w-5 h-5 text-white" fill="#78b376" stroke="white" />
                  </div>
                  <span className="text-[#1e3a6a] font-medium text-[15px]">{selectedDomain}</span>
                </>
              ) : (
                <span className="text-[#333] font-normal text-[15px]">Select a domain...</span>
              )}
            </div>
            <ChevronDown className="w-5 h-5 text-[#1e3a6a]" />
          </div>
          
          <div className="flex flex-col">
            {DOMAINS.map((domain, index) => {
              const isEven = index % 2 === 0;
              const isSelected = domain === selectedDomain;
              return (
                <div 
                  key={index}
                  data-testid={`domain-option-${index}`}
                  onClick={() => handleDomainSelect(domain)}
                  className={`flex items-center gap-3 px-3 py-2.5 border-b border-[#e0e4e8] last:border-b-0 hover:bg-[#e6ebf1] cursor-pointer ${isEven ? 'bg-[#f4f6f8]' : 'bg-white'}`}
                >
                  {isSelected ? (
                    <div className="bg-[#78b376] rounded-full p-0.5">
                      <CheckCircle2 className="w-5 h-5 text-white" fill="#78b376" stroke="white" />
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-[#c5cdd4]" />
                  )}
                  <span className={`text-[15px] ${isSelected ? 'text-[#1e3a6a] font-medium' : 'text-[#333] font-normal'}`}>{domain}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button 
          variant="outline"
          onClick={() => setLocation("/")}
          className="bg-white hover:bg-slate-50 text-[#1e3a6a] border-[#c5cdd4] px-8 py-5 text-base rounded-sm shadow-sm font-medium"
        >
          Back
        </Button>
        <Button 
          onClick={() => setLocation("/step-2")}
          disabled={!selectedDomain}
          className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white px-8 py-5 text-base rounded-sm shadow-md font-medium disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
