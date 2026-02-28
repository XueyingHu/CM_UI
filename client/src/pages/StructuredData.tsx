import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ShieldAlert, GitMerge, AlertCircle, Database } from "lucide-react";

export default function StructuredData() {
  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Structured Data Synthesis</h1>
        <p className="text-muted-foreground">Search, validate, and correlate ORAC risk events, issues, and Navigator changes.</p>
      </header>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by CM Event ID, Domain, or keyword..." 
            className="pl-10 h-12 bg-white border-slate-200 shadow-sm"
          />
        </div>
        <Button variant="outline" className="h-12 px-6 bg-white gap-2 border-slate-200">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
        <Button className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700">
          Synthesize Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Data Sources */}
        <div className="space-y-6">
          <DataSourceCard 
            title="ORAC Risk Events"
            icon={ShieldAlert}
            color="text-amber-500"
            bgColor="bg-amber-100"
            count="12 Active"
            description="Identified operational risks associated with proposed CM activities."
          />
          <DataSourceCard 
            title="ORAC Issues"
            icon={AlertCircle}
            color="text-red-500"
            bgColor="bg-red-100"
            count="3 Critical"
            description="Logged issues and incidents from previous or ongoing changes."
          />
          <DataSourceCard 
            title="Navigator Changes"
            icon={GitMerge}
            color="text-blue-500"
            bgColor="bg-blue-100"
            count="45 Pending"
            description="Configuration and topological changes tracked in Navigator."
          />
        </div>

        {/* Right Column: Synthesis Results Table/List */}
        <div className="lg:col-span-2">
          <Card className="border-border shadow-sm h-full flex flex-col">
            <CardHeader className="border-b border-border/50 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg font-display flex items-center justify-between">
                <span>Correlated Findings</span>
                <Badge variant="secondary" className="font-normal">Last sync: 2 mins ago</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-border/50">
                <SynthesisRow 
                  domain="Payment Processing Gateway"
                  event="CM-2044: API Gateway Scaling"
                  insight="Navigator shows pending network changes that conflict with ORAC Risk #892 (DDoS Vulnerability)."
                  severity="high"
                />
                <SynthesisRow 
                  domain="Retail Banking Core"
                  event="CM-2105: Auth Service Patch"
                  insight="Clean synthesis. No open ORAC issues. Navigator topology confirms redundancy is in place."
                  severity="low"
                />
                <SynthesisRow 
                  domain="Wealth Management Platform"
                  event="CM-1988: Data Lake Sync"
                  insight="ORAC Issue #412 reports latency in target DB. Navigator confirms recent storage volume expansion."
                  severity="medium"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DataSourceCard({ title, icon: Icon, color, bgColor, count, description }: any) {
  return (
    <Card className="border-border shadow-sm hover:border-primary/20 transition-colors">
      <CardContent className="p-5 flex gap-4">
        <div className={`p-3 rounded-xl h-fit ${bgColor} ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            {title}
            <Badge variant="outline" className="text-xs px-2 py-0 h-5 border-slate-200">{count}</Badge>
          </h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SynthesisRow({ domain, event, insight, severity }: any) {
  const severities = {
    high: { color: 'bg-red-500', bg: 'bg-red-50/50' },
    medium: { color: 'bg-amber-500', bg: 'bg-amber-50/50' },
    low: { color: 'bg-emerald-500', bg: 'bg-emerald-50/50' },
  };

  const style = severities[severity as keyof typeof severities];

  return (
    <div className={`p-5 hover:bg-slate-50 transition-colors ${style.bg}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{domain}</span>
          <h4 className="text-base font-medium text-slate-900 mt-0.5">{event}</h4>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${style.color}`} />
          <span className="text-xs font-medium text-slate-600 capitalize">{severity} Risk</span>
        </div>
      </div>
      <div className="flex gap-2 items-start mt-3">
        <Database className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
      </div>
    </div>
  );
}