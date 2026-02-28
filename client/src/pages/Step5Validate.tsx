import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ChevronRight, ChevronLeft, ChevronsLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const RISK_EVENTS = [
  { id: "EVENT-102345", source: "Meeting\nPack.pdf", extracted: "Server Failure Incident", status: "Confirmed", outcome: "Validated & Updated", outcomeType: "success" },
  { id: "EVENT-204578", source: "Quarterly\nNotes.docx", extracted: "Fraud Incident in APAC", status: "No Recent Event", outcome: "Outdated", outcomeType: "error" },
];

const ORAC_ISSUES = [
  { id: "ISSUE-654321", source: "Quarterly\nNotes.docx", extracted: "Access Control Gaps", status: "Open - 2 Actions", outcome: "Validated & Updated", outcomeType: "success" },
  { id: "ISSUE-789012", source: "Meeting\nPack.pdf", extracted: "Compliance Deficiencies", status: "Remediation In Progress", outcome: "Validated & Updated", outcomeType: "success" },
  { id: "ISSUE-876543", source: "Meeting\nPack.pdf", extracted: "Incident Reporting Delays", status: "Resolved", outcome: "Validated & Updated", outcomeType: "success" },
];

const CHANGE_INITIATIVES = [
  { id: "MCF-300456", source: "Meeting\nPack.pdf", extracted: "Navigator Program Delayed", status: "New Q3 2024 Target", outcome: "Validated & Updated", outcomeType: "success" },
];

export default function Step5Validate() {
  const [, setLocation] = useLocation();

  return (
    <div className="p-10 max-w-5xl relative min-h-full pb-32">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a6a] mb-6">Step 5: Validate Against Source Data</h1>
        <div className="w-full h-px bg-slate-200 mb-6" />
        <p className="text-[15px] text-[#333] mb-6">Verifying and reconciling information against source data.</p>
      </header>

      <div className="flex flex-col gap-6">
        {/* Risk Event Verification Table */}
        <TableSection title="Risk Event Verification" data={RISK_EVENTS} />
        
        {/* ORAC Issue Validation Table */}
        <TableSection title="ORAC Issue Validation" data={ORAC_ISSUES} />
        
        {/* Change Initiative Status Check Table */}
        <TableSection title="Change Initiative Status Check" data={CHANGE_INITIATIVES} />
      </div>

      {/* Footer / Pagination Actions */}
      <div className="flex justify-between items-center max-w-5xl mt-12 mb-8">
        <div className="flex-1" />
        
        <div className="flex items-center justify-center flex-1">
          <button className="p-2 text-[#1e3a6a] hover:bg-slate-100 rounded-sm">
            <ChevronsLeft className="w-5 h-5" />
          </button>
          <button className="p-2 text-[#1e3a6a] hover:bg-slate-100 rounded-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-[15px] font-medium text-[#333] mx-2">Page 1 of 2</span>
          <button className="p-2 text-[#1e3a6a] hover:bg-slate-100 rounded-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 flex-1">
          <Button 
            onClick={() => setLocation("/step-4")}
            className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white px-8 py-5 text-base rounded-sm shadow-md font-medium"
          >
            Back
          </Button>
          <Button 
            onClick={() => setLocation("/step-6")}
            className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white px-8 py-5 text-base rounded-sm shadow-md font-medium"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function TableSection({ title, data }: { title: string, data: any[] }) {
  return (
    <div className="border border-[#c5cdd4] rounded-sm bg-white shadow-sm overflow-hidden">
      <div className="bg-[#f8fbff] p-3 px-4">
        <h2 className="text-[15px] font-bold text-[#1e3a6a]">
          {title}
        </h2>
      </div>
      
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white border-y border-[#c5cdd4]">
            <th className="py-2.5 px-4 text-[13px] font-medium text-[#555] w-[18%]">Event ID / Issue ID / Program ID</th>
            <th className="py-2.5 px-4 text-[13px] font-medium text-[#555] w-[12%]">Source</th>
            <th className="py-2.5 px-4 text-[13px] font-medium text-[#555] w-[25%]">Previously Extracted</th>
            <th className="py-2.5 px-4 text-[13px] font-medium text-[#555] w-[25%]">Current Status</th>
            <th className="py-2.5 px-4 text-[13px] font-medium text-[#555] w-[20%]">Outcome</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b border-[#e0e4e8] last:border-0 bg-white">
              <td className="py-3 px-4 text-[14px] text-[#333] font-medium">
                {row.id}
              </td>
              <td className="py-3 px-4 text-[14px] text-[#1e3a6a] whitespace-pre-line leading-tight">
                {row.source}
              </td>
              <td className="py-3 px-4 text-[14px] text-[#333]">
                {row.extracted}
              </td>
              <td className="py-3 px-4 text-[14px] text-[#333]">
                {row.status}
              </td>
              <td className="py-3 px-4">
                <span className={cn(
                  "px-2 py-1 text-[13px] font-medium rounded-sm inline-block",
                  row.outcomeType === 'success' 
                    ? "bg-[#fff8cc] text-[#6b5a00]" 
                    : "bg-[#ffe5e5] text-[#b33a3a]"
                )}>
                  {row.outcome}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}