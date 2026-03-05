import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Sidebar from "@/components/Sidebar";
import Welcome from "@/pages/Welcome";
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
import CreateDomain from "@/pages/CreateDomain";
import DefineDomainDetails from "@/pages/DefineDomainDetails";
import ReviewPublish from "@/pages/ReviewPublish";
import { Bell, Mail, Menu } from "lucide-react";

function Router() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <header className="h-12 bg-[#2c4b7e] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white/30 rounded-sm"></div>
          <div className="w-4 h-4 bg-white/30 rounded-sm"></div>
        </div>
        <div className="flex items-center gap-4 text-white">
          <Mail className="w-4 h-4" />
          <Bell className="w-4 h-4" />
          <Menu className="w-5 h-5" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {location !== "/" && location !== "/create-domain" && location !== "/define-domain" && location !== "/review-publish" && <Sidebar />}
        <main className="flex-1 overflow-y-auto w-full bg-white">
          <Switch>
            <Route path="/" component={Welcome}/>
            <Route path="/step-1" component={Dashboard}/>
            <Route path="/create-domain" component={CreateDomain}/>
            <Route path="/define-domain" component={DefineDomainDetails}/>
            <Route path="/review-publish" component={ReviewPublish}/>
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
