import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Step2Upload from "@/pages/Step2Upload";
import Step3Extract from "@/pages/Step3Extract";
import Step4Synthesize from "@/pages/Step4Synthesize";
import Step5Validate from "@/pages/Step5Validate";
import Step6Summary from "@/pages/Step6Summary";
import ReviewValidate from "@/pages/ReviewValidate";
import ExpandSearch from "@/pages/ExpandSearch";
import InsightsSummary from "@/pages/InsightsSummary";
import DocumentAnalysis from "@/pages/DocumentAnalysis";
import StructuredData from "@/pages/StructuredData";
import DomainHome from "@/pages/DomainHome";
import { Bell, Mail, Menu } from "lucide-react";

const NO_SIDEBAR_ROUTES = ["/", "/domain-home"];

function Router() {
  const [location, setLocation] = useLocation();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(
    sessionStorage.getItem("selectedDomain")
  );

  useEffect(() => {
    const checkDomain = () => {
      const domain = sessionStorage.getItem("selectedDomain");
      setSelectedDomain(domain);
    };
    checkDomain();
    window.addEventListener("storage", checkDomain);
    const interval = setInterval(checkDomain, 500);
    return () => {
      window.removeEventListener("storage", checkDomain);
      clearInterval(interval);
    };
  }, [location]);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#f6f8fb" }}>
      <header className="h-14 flex items-center justify-between px-4 shrink-0 gap-3" style={{ background: "linear-gradient(0deg, #0b2a4a 0%, #103a66 100%)", boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }}>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffcc33] shrink-0" style={{ boxShadow: "0 0 0 3px rgba(255,204,51,0.25)" }} />
          <span className="text-white font-black text-sm tracking-wide whitespace-nowrap">Next Level Continuous Monitoring</span>
        </div>
        <div className="flex items-center gap-3 text-white">
          {selectedDomain && location !== "/" && (
            <button
              data-testid="text-selected-domain"
              onClick={() => setLocation("/")}
              className="text-xs font-bold text-white hover:underline cursor-pointer bg-transparent border-none p-0 mr-1 opacity-90"
            >
              Domain: {selectedDomain}
            </button>
          )}
          <Mail className="w-4 h-4 opacity-80" />
          <Bell className="w-4 h-4 opacity-80" />
          <Menu className="w-5 h-5 opacity-80" />
          <a href="#" className="text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/20 opacity-95 whitespace-nowrap hidden sm:inline-flex items-center" style={{ background: "rgba(255,255,255,0.06)" }}>Next Level Lab</a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {!NO_SIDEBAR_ROUTES.includes(location) && <Sidebar />}
        <main className="flex-1 overflow-y-auto w-full" style={{ background: "#f6f8fb" }}>
          <Switch>
            <Route path="/" component={Dashboard}/>
            <Route path="/domain-home" component={DomainHome}/>
            <Route path="/step-2" component={Step2Upload}/>
            <Route path="/step-3" component={Step3Extract}/>
            <Route path="/step-4" component={Step4Synthesize}/>
            <Route path="/step-5" component={Step5Validate}/>
            <Route path="/step-6" component={Step6Summary}/>
            <Route path="/review-validate" component={ReviewValidate}/>
            <Route path="/expand-search" component={ExpandSearch}/>
            <Route path="/insights-summary" component={InsightsSummary}/>
            <Route path="/document-analysis" component={DocumentAnalysis}/>
            <Route path="/structured-data" component={StructuredData}/>
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
