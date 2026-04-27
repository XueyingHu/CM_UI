import { Switch, Route, useLocation, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Step1Upload from "@/pages/Step1Upload";
import Step3Validate from "@/pages/Step3Validate";
import Step4Analyze from "@/pages/Step4Analyze";
import Step5Finalize from "@/pages/Step5Finalize";
import Step6Summary from "@/pages/Step6Summary";
import ReviewValidate from "@/pages/ReviewValidate";
import ExpandSearch from "@/pages/ExpandSearch";
import InsightsSummary from "@/pages/InsightsSummary";
import DocumentAnalysis from "@/pages/DocumentAnalysis";
import StructuredData from "@/pages/StructuredData";
import DomainHome from "@/pages/DomainHome";
import Login from "@/pages/Login";
import { Bell, Mail, Menu, LogOut, User } from "lucide-react";

const NO_SIDEBAR_ROUTES = ["/", "/domain-home"];

function isAuthenticated(): boolean {
  const sessionId = sessionStorage.getItem("session_id");
  const expiresAt = sessionStorage.getItem("session_expires_at");
  if (!sessionId || !expiresAt) return false;
  try {
    return new Date(expiresAt) > new Date();
  } catch {
    return false;
  }
}

function handleLogout(setLocation: (path: string) => void) {
  const sessionId = sessionStorage.getItem("session_id");
  if (sessionId) {
    fetch("http://localhost:8000/api/v1/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    }).catch(() => {});
  }
  sessionStorage.clear();
  setLocation("/login");
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  if (!isAuthenticated()) {
    return <Redirect to="/login" />;
  }
  return <Component />;
}

function Router() {
  const [location, setLocation] = useLocation();
  const authenticated = isAuthenticated();
  const fullName = sessionStorage.getItem("user_full_name") || "";
  const role = sessionStorage.getItem("user_role") || "";

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#f6f8fb" }}>
      {location !== "/login" && (
        <header
          className="h-14 flex items-center justify-between px-4 shrink-0 gap-3"
          style={{
            background: "linear-gradient(0deg, #0b2a4a 0%, #103a66 100%)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full bg-[#ffcc33] shrink-0"
              style={{ boxShadow: "0 0 0 3px rgba(255,204,51,0.25)" }}
            />
            <span className="text-white font-black text-sm tracking-wide whitespace-nowrap">
              Next Level Continuous Monitoring
            </span>
          </div>
          <div className="flex items-center gap-3 text-white">
            {authenticated && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-white/70 font-semibold">
                <User size={13} className="opacity-70" />
                <span>{fullName}</span>
                {role && (
                  <span
                    style={{
                      background: "rgba(255,255,255,0.12)", borderRadius: 10,
                      padding: "2px 8px", fontSize: 11, fontWeight: 700,
                    }}
                  >
                    {role}
                  </span>
                )}
              </div>
            )}
            <Mail className="w-4 h-4 opacity-80" />
            <Bell className="w-4 h-4 opacity-80" />
            <Menu className="w-5 h-5 opacity-80" />
            {authenticated ? (
              <button
                data-testid="button-logout"
                onClick={() => handleLogout(setLocation)}
                title="Sign out"
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8, padding: "5px 10px", cursor: "pointer",
                  color: "#fff", fontSize: 12, fontWeight: 700,
                }}
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <a
                href="#"
                className="text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/20 opacity-95 whitespace-nowrap hidden sm:inline-flex items-center"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                Next Level Lab
              </a>
            )}
          </div>
        </header>
      )}

      <div className="flex flex-1 overflow-hidden">
        {!NO_SIDEBAR_ROUTES.includes(location) && location !== "/login" && <Sidebar />}
        <main className="flex-1 overflow-y-auto w-full" style={{ background: "#f6f8fb" }}>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/">
              {() => <ProtectedRoute component={Dashboard} />}
            </Route>
            <Route path="/domain-home">
              {() => <ProtectedRoute component={DomainHome} />}
            </Route>
            <Route path="/step-1">
              {() => <ProtectedRoute component={Step1Upload} />}
            </Route>
            <Route path="/step-3">
              {() => <ProtectedRoute component={Step3Validate} />}
            </Route>
            <Route path="/step-4">
              {() => <ProtectedRoute component={Step4Analyze} />}
            </Route>
            <Route path="/step-5">
              {() => <ProtectedRoute component={Step5Finalize} />}
            </Route>
            <Route path="/step-6">
              {() => <ProtectedRoute component={Step6Summary} />}
            </Route>
            <Route path="/review-validate">
              {() => <ProtectedRoute component={ReviewValidate} />}
            </Route>
            <Route path="/expand-search">
              {() => <ProtectedRoute component={ExpandSearch} />}
            </Route>
            <Route path="/insights-summary">
              {() => <ProtectedRoute component={InsightsSummary} />}
            </Route>
            <Route path="/document-analysis">
              {() => <ProtectedRoute component={DocumentAnalysis} />}
            </Route>
            <Route path="/structured-data">
              {() => <ProtectedRoute component={StructuredData} />}
            </Route>
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
