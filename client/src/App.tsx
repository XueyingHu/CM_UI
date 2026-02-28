import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Step1Domain from "@/pages/Step1Domain";
import Step2Upload from "@/pages/Step2Upload";
import Step3Extract from "@/pages/Step3Extract";
import Step4Synthesize from "@/pages/Step4Synthesize";
import DocumentAnalysis from "@/pages/DocumentAnalysis";
import StructuredData from "@/pages/StructuredData";
import { Bell, Mail, Menu } from "lucide-react";

function Router() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Top Header */}
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
        <Sidebar />
        <main className="flex-1 overflow-y-auto w-full bg-white">
          <Switch>
            <Route path="/" component={Dashboard}/>
            <Route path="/step-1" component={Step1Domain}/>
            <Route path="/step-2" component={Step2Upload}/>
            <Route path="/step-3" component={Step3Extract}/>
            <Route path="/step-4" component={Step4Synthesize}/>
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;