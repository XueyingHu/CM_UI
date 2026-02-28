import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import DocumentAnalysis from "@/pages/DocumentAnalysis";
import StructuredData from "@/pages/StructuredData";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full">
        <Switch>
          <Route path="/" component={Dashboard}/>
          <Route path="/document-analysis" component={DocumentAnalysis}/>
          <Route path="/structured-data" component={StructuredData}/>
          <Route component={NotFound} />
        </Switch>
      </main>
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
