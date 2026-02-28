import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Business Domain Overview</h1>
        <p className="text-muted-foreground">Aggregated Change Management insights powered by AWS Bedrock.</p>
      </header>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Active Domains" value="4" icon={LayoutDashboardIcon} />
        <MetricCard title="Pending CM Events" value="12" icon={TrendingUp} trend="+2 this week" />
        <MetricCard title="High Risk Issues" value="3" icon={AlertTriangle} variant="destructive" />
        <MetricCard title="Processed Docs" value="148" icon={BrainCircuit} trend="Last 30 days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Domain Grouping View */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-display font-semibold flex items-center gap-2">
            Domain Summarization
            <Badge variant="secondary" className="ml-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">AI Synthesized</Badge>
          </h2>
          
          <DomainCard 
            name="Retail Banking Core"
            description="Core banking infrastructure and customer-facing transaction systems."
            status="healthy"
            events={5}
            aes={12}
            aiInsight="No critical ORAC issues identified. Recent Navigator changes implemented successfully with 0 rollback rate."
          />
          
          <DomainCard 
            name="Payment Processing Gateway"
            description="Inter-bank and cross-border payment routing and settlement."
            status="at-risk"
            events={3}
            aes={8}
            aiInsight="CM Event #4022 has conflicting objectives. 2 High severity ORAC risks identified in recent compliance document upload."
          />

          <DomainCard 
            name="Wealth Management Platform"
            description="Investment portfolio management and trading interfaces."
            status="warning"
            events={4}
            aes={15}
            aiInsight="Unstructured document analysis reveals potential delays in CM Activity rollout. Pending validation against Navigator."
          />
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm bg-gradient-to-br from-indigo-50/50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-primary" />
                Bedrock Synthesis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The AI has correlated <strong>45 unstructured documents</strong> with <strong>212 structured ORAC/Navigator records</strong> across all Business Domains this week.
              </p>
              <div className="mt-4 p-3 bg-white rounded-md border border-indigo-100 shadow-sm text-sm">
                <strong className="text-foreground block mb-1">Key Recommendation:</strong>
                Review the "Payment Processing Gateway" domain. Discrepancies found between proposed CM Objectives and recent ORAC issue reports.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, variant = "default" }: any) {
  return (
    <Card className="border-border shadow-sm overflow-hidden group hover:border-primary/20 transition-colors">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg ${variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && <span className="text-xs font-medium text-muted-foreground">{trend}</span>}
        </div>
        <div>
          <h3 className="text-3xl font-display font-bold text-foreground">{value}</h3>
          <p className="text-sm font-medium text-muted-foreground mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DomainCard({ name, description, status, events, aes, aiInsight }: any) {
  const statusColors = {
    'healthy': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'warning': 'bg-amber-50 text-amber-700 border-amber-200',
    'at-risk': 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-semibold font-display">{name}</h3>
              <Badge variant="outline" className={statusColors[status as keyof typeof statusColors]}>
                {status === 'healthy' ? 'Healthy' : status === 'warning' ? 'Needs Review' : 'At Risk'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <button className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-primary">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-6 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-700">
              {events}
            </div>
            <span className="text-muted-foreground">CM Events</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-700">
              {aes}
            </div>
            <span className="text-muted-foreground">Grouped AEs</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex gap-3">
          <BrainCircuit className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700 leading-relaxed">
            {aiInsight}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Temporary icon fallback
function LayoutDashboardIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}