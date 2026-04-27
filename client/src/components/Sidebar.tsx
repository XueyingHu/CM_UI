import { useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();

  const isReviewPhase = location === "/review-validate" || location === "/expand-search" || location === "/insights-summary";

  const DOC_STEPS = [
    { id: 1, label: "Upload Documents", path: "/step-1" },
    { id: 2, label: "Extract Key Events", path: "/step-2" },
    { id: 3, label: "Validate with Source Systems", path: "/step-3" },
    { id: 4, label: "Analyze Events and Impact", path: "/step-4" },
    { id: 5, label: "Finalize Outcome", path: "/step-5" },
  ];

  const REVIEW_STEPS = [
    { id: 1, label: "Review and Validate Relevant Items", path: "/review-validate" },
    { id: 2, label: "Expand Search Criteria (optional)", path: "/expand-search" },
    { id: 3, label: "Generate Insights Summary", path: "/insights-summary" },
  ];

  const currentSteps = isReviewPhase ? REVIEW_STEPS : DOC_STEPS;

  const isActive = (path: string) => location === path;

  return (
    <div className="w-[260px] bg-white border-r flex flex-col h-full shrink-0" style={{ borderColor: "#e6e9ef" }}>
      <div className="px-4 pt-4 pb-2">
        <p className="text-[13px] font-black" style={{ color: "#2b3c50" }}>Your Progress</p>
      </div>

      <nav className="flex-1 px-2 pb-4">
        <ol className="list-decimal pl-5 space-y-0.5">
          {currentSteps.map((step) => {
            const active = isActive(step.path);
            return (
              <li
                key={step.id}
                data-testid={`sidebar-step-${step.id}`}
                className="py-2 px-2.5 rounded-lg text-[13px] font-extrabold leading-snug cursor-pointer transition-all duration-150"
                style={{
                  color: active ? "#1f5ea8" : "#6b7a8a",
                  fontWeight: active ? 900 : 800,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "#f3f7ff";
                    (e.currentTarget as HTMLElement).style.color = "#2b3c50";
                    (e.currentTarget as HTMLElement).style.boxShadow = "inset 3px 0 0 #2a6acb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "";
                    (e.currentTarget as HTMLElement).style.color = "#6b7a8a";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }
                }}
              >
                {step.label}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
