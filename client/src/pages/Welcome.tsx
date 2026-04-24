import { useLocation } from "wouter";

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-10 py-16">
      <h1 className="text-3xl font-bold text-[#0b2a4a] mb-6">Welcome!</h1>

      <p className="text-sm text-[#5b6b7a] text-center max-w-[600px] mb-12 leading-relaxed">
        This AI solution supports continuous monitoring by processing documents, generating actionable insights,
        and suggesting essential data points to enrich and maintain the audit universe.
      </p>

      <div className="w-full max-w-[360px]">
        <div className="border border-[#e6e9ef] rounded-xl bg-white shadow-sm p-6 flex flex-col" style={{ boxShadow: "0 6px 18px rgba(16,24,40,0.08)" }}>
          <h2 className="text-base font-black text-white bg-[#0b2a4a] px-4 py-3 -mx-6 -mt-6 mb-5 rounded-t-xl">
            Select a Business Domain
          </h2>
          <p className="text-sm text-[#5b6b7a] mb-6 flex-1">
            Choose from existing business domains to get started.
          </p>
          <div>
            <button
              data-testid="button-select-domain"
              onClick={() => setLocation("/step-1")}
              style={{ background: "#0b2a4a", borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)" }}
              className="text-white text-sm font-bold px-8 py-2.5 shadow-sm transition-colors hover:opacity-90 w-full"
            >
              Select Business Domain
            </button>
          </div>
        </div>
      </div>

      <div className="mt-16 flex items-center gap-4 text-[13px] text-[#0b2a4a]">
        <button className="hover:underline font-bold">Data Retention Policy</button>
        <span className="text-[#e6e9ef]">|</span>
        <button className="hover:underline font-bold">User Guide</button>
        <span className="text-[#e6e9ef]">|</span>
        <button className="hover:underline font-bold">Support</button>
      </div>
    </div>
  );
}
