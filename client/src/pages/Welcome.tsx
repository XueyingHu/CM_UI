import { useLocation } from "wouter";

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-10 py-16">
      <h1 className="text-3xl font-bold text-[#1e3a6a] mb-6">Welcome!</h1>

      <p className="text-[16px] text-[#444] text-center max-w-[700px] mb-12 leading-relaxed">
        This AI solution supports continuous monitoring by processing documents, generating actionable insights,
        and suggesting essential data points to enrich and maintain the audit universe.
      </p>

      <div className="flex gap-6 w-full max-w-[750px]">
        <div className="flex-1 border border-[#c5cdd4] rounded-sm bg-white shadow-sm p-6 flex flex-col">
          <h2 className="text-[18px] font-bold text-white bg-[#2c4b7e] px-4 py-2.5 -mx-6 -mt-6 mb-5 rounded-t-sm">
            Select a Business Domain
          </h2>
          <p className="text-[15px] text-[#444] mb-6 flex-1">
            Choose from existing business domains to get started.
          </p>
          <div>
            <button
              data-testid="button-select-domain"
              onClick={() => setLocation("/step-1")}
              className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white text-[15px] font-medium px-6 py-2.5 rounded-sm shadow-sm transition-colors"
            >
              Select Business Domain
            </button>
          </div>
        </div>

        <div className="flex-1 border border-[#c5cdd4] rounded-sm bg-white shadow-sm p-6 flex flex-col">
          <h2 className="text-[18px] font-bold text-[#333] bg-[#f5e6a3] px-4 py-2.5 -mx-6 -mt-6 mb-5 rounded-t-sm">
            Create a New Domain
          </h2>
          <p className="text-[15px] text-[#444] mb-6 flex-1">
            Set up a new business domain for the first time.
          </p>
          <div>
            <button
              data-testid="button-create-domain"
              onClick={() => setLocation("/create-domain")}
              className="bg-white hover:bg-slate-50 text-[#333] text-[15px] font-medium px-6 py-2.5 rounded-sm border border-[#c5cdd4] shadow-sm transition-colors"
            >
              Create New Domain
            </button>
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
  );
}
