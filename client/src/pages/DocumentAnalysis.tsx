import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, CheckCircle2, Loader2, BrainCircuit, AlignLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DocumentAnalysis() {
  const [isUploading, setIsUploading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setShowResults(true);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Unstructured Document Analysis</h1>
        <p className="text-muted-foreground">Upload CM Event proposals, architecture diagrams, or compliance docs for Bedrock extraction.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-dashed border-2 bg-slate-50/50 text-center">
            <CardContent className="p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <UploadCloud className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="font-medium text-foreground mb-1">Upload Document</h3>
              <p className="text-xs text-muted-foreground mb-6">PDF, DOCX, or TXT up to 50MB</p>
              
              <Button 
                onClick={handleUpload} 
                disabled={isUploading || showResults}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {isUploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  "Select File"
                )}
              </Button>
            </CardContent>
          </Card>

          {showResults && (
            <Card className="border-border shadow-sm bg-indigo-50/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-md text-indigo-700">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Project_Alpha_CM_V2.pdf</p>
                    <p className="text-xs text-muted-foreground">Analyzed just now</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Extracted Entities</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Confidence Score</span>
                    <span className="font-medium text-emerald-600">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          {!showResults ? (
            <div className="h-full min-h-[400px] border border-border rounded-xl bg-slate-50/30 flex flex-col items-center justify-center text-center p-8">
              <BrainCircuit className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-500 mb-2">Awaiting Document</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Upload a document to extract CM Objectives, Activities, and group them into the relevant Business Domain.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3 border-b border-border/50 bg-slate-50/50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-indigo-600" />
                      Bedrock Extraction Results
                    </CardTitle>
                    <Badge variant="outline" className="bg-white">Domain: Retail Banking</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-6 border-b border-border/50">
                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Identified CM Event</h4>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-lg text-indigo-900">Core Ledger Upgrade Q3</span>
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">High Confidence</Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Migration of legacy ledger database to the new distributed architecture to support real-time settlement.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50/50">
                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Extracted Objectives & Activities</h4>
                    
                    <div className="space-y-4">
                      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium text-slate-800">Objective: Minimize downtime during migration</span>
                        </div>
                        <div className="pl-6 space-y-2 mt-3 border-l-2 border-indigo-100 ml-2">
                          <div className="text-sm flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                            <span className="text-slate-600">Activity: Pre-sync historical data to secondary cluster (AE: Database Cluster A)</span>
                          </div>
                          <div className="text-sm flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                            <span className="text-slate-600">Activity: Establish active-active replication before cutover</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}