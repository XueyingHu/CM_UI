import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Check, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Step3Extract() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(75), 500);
    return () => clearTimeout(timer);
  }, []);

  const meetingResults = [
    {
      title: "Risk Management Forum - Q1 Meeting",
      results: [
        { label: "Risk Events", source: "(Quarterly Notes.docx)", found: true },
        { label: "ORAC Issues", source: "(Quarterly Notes.docx)", found: true },
        { label: "Key Risk Indicators", source: "(Meeting Pack.pdf)", found: true },
        { label: "Key Staff / Org Change", source: "Not Found", found: false },
        { label: "Business Process Change", source: "(Meeting Pack.pdf)", found: true },
        { label: "Critical Change Program", source: "(Quarterly Notes.docx)", found: true },
        { label: "Macro External Event", source: "Not Found", found: false },
        { label: "Regulatory Exam/Inquiry", source: "(Meeting Pack.pdf)", found: true },
        { label: "Other Notable Items", source: "(Meeting Pack.pdf)", found: true },
      ]
    },
    {
      title: "Ops Improvement Meeting - March 2022",
      results: [
        { label: "Risk Events", source: "(Budget Presentation.pptx)", found: true },
        { label: "ORAC Issues", source: "Not Found", found: false },
        { label: "Key Risk Indicators", source: "(Budget Presentation.pptx)", found: true },
      ]
    }
  ];

  return (
    <div className="p-10 max-w-4xl relative min-h-full pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a6a] mb-6">Step 3: Extract Key Information</h1>
        <div className="w-full h-px bg-slate-200 mb-6" />
      </header>

      <div className="mb-10">
        <p className="text-[15px] text-[#333] mb-4">Extracting key information from documents...</p>
        <div className="flex items-center gap-4 max-w-[600px]">
          <Progress value={progress} className="h-6 flex-1 rounded-none border border-[#c5cdd4] bg-[#f4f6f8] [&>div]:bg-[#2c4b7e]" />
          <span className="font-bold text-[#333] min-w-[40px]">{progress}%</span>
        </div>
      </div>

      <div className="mb-8">
        {meetingResults.map((meeting, mIndex) => (
          <div key={mIndex} className="mb-8 last:mb-0">
            <h2 className="text-[17px] font-bold text-[#1e3a6a] mb-4">
              {meeting.title}
            </h2>
            
            <div className="flex flex-col border border-[#c5cdd4] rounded-sm bg-white shadow-sm overflow-hidden">
              {meeting.results.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-3 border-b border-[#e0e4e8] last:border-b-0 bg-white"
                >
                  <div className="w-5 flex justify-center">
                    {item.found ? (
                      <Check className="w-5 h-5 text-[#2c7a3f]" strokeWidth={3} />
                    ) : (
                      <X className="w-5 h-5 text-[#c93b3b]" strokeWidth={3} />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[15px]">
                    <span className="text-[#333] font-medium">{item.label}</span>
                    <span className={item.found ? "text-[#1e3a6a] italic font-medium ml-1" : "text-[#c93b3b] font-medium ml-1"}>
                      {item.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Absolute positioned buttons like in the screenshot */}
      <div className="absolute bottom-10 right-10 flex items-center gap-3">
        <Button 
          onClick={() => setLocation("/step-2")}
          className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white px-8 py-5 text-base rounded-sm shadow-md font-medium"
        >
          Back
        </Button>
        <Button 
          onClick={() => setLocation("/step-4")}
          className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white px-8 py-5 text-base rounded-sm shadow-md font-medium"
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}