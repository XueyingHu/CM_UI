import { useLocation } from "wouter";
import { FileOutput, Network } from "lucide-react";

export default function DomainHome() {
  const [, setLocation] = useLocation();

  const domainName = sessionStorage.getItem("selectedDomain") || "Market Tech – Ops Risk";

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#eef1f5] border-b border-[#d0d5dd] px-6 py-2 text-sm text-[#555] flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            data-testid="link-home"
            onClick={() => setLocation("/")}
            className="text-[#1e3a6a] hover:underline font-medium"
          >
            Home
          </button>
          <span className="mx-1">›</span>
          <span className="font-semibold text-[#333]">Select Module</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-10 pb-16">
        <div className="flex gap-6 w-full max-w-[800px]">
          <div className="flex-1 border border-[#c5cdd4] rounded-sm bg-white shadow-sm flex flex-col overflow-hidden">
            <div className="bg-[#2c4b7e] px-5 py-3 flex items-center gap-3">
              <FileOutput className="w-6 h-6 text-white" />
              <h2 className="text-base font-bold text-white">Document to CM Insights</h2>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <ul className="list-disc ml-5 space-y-2 text-sm text-[#333] mb-6 flex-1">
                <li>Upload CM related documents</li>
                <li>AI generates summarized CM insights</li>
                <li>Output aligned to Assure templates</li>
              </ul>
              <div className="flex justify-center">
                <button
                  data-testid="button-start-document-insights"
                  onClick={() => setLocation("/step-2")}
                  className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white text-sm font-medium px-8 py-2.5 rounded-sm shadow-sm"
                >
                  Start
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 border border-[#c5cdd4] rounded-sm bg-white shadow-sm flex flex-col overflow-hidden">
            <div className="bg-[#2c4b7e] px-5 py-3 flex items-center gap-3">
              <Network className="w-6 h-6 text-white" />
              <h2 className="text-base font-bold text-white">Audit Universe Mapping</h2>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <ul className="list-disc ml-5 space-y-2 text-sm text-[#333] mb-6 flex-1">
                <li>AI pre-tags structured data points</li>
                <li>PM & BMLs validate mappings</li>
                <li>AI generates summarized insights</li>
              </ul>
              <div className="flex justify-center">
                <button
                  data-testid="button-start-audit-mapping"
                  onClick={() => setLocation("/review-validate")}
                  className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white text-sm font-medium px-8 py-2.5 rounded-sm shadow-sm"
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex items-center gap-4 text-[13px] text-[#1e3a6a]">
          <button className="hover:underline font-medium">Data Retention Policy</button>
          <span className="text-[#c5cdd4]">|</span>
          <button className="hover:underline font-medium">User Guide</button>
          <span className="text-[#c5cdd4]">|</span>
          <button className="hover:underline font-medium">Support</button>
        </div>
      </div>
    </div>
  );
}
