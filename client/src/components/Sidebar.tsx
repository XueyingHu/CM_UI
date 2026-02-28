import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, Database, ShieldAlert, Settings, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Domain Overview", icon: LayoutDashboard },
  { href: "/document-analysis", label: "Document Analysis", icon: FileText },
  { href: "/structured-data", label: "Structured Synthesis", icon: Database },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full shrink-0 shadow-sm z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary/10 text-primary p-2 rounded-lg">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-tight text-foreground">Assure CM AI</h1>
          <p className="text-xs text-muted-foreground font-medium">Bedrock Engine</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        <div className="mb-4 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          AI Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {item.label}
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </div>
  );
}
