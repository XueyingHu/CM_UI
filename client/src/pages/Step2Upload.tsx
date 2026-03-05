import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { FileText, File, FileImage, ChevronRight, X } from "lucide-react";

interface DocItem {
  id: string;
  name: string;
  type: string;
  status: string;
  size: string;
}

function getDocIcon(type: string) {
  if (type === "PDF") return <FileText className="w-5 h-5 text-[#2c4b7e]" />;
  if (type === "Word") return <File className="w-5 h-5 text-[#2c4b7e]" />;
  if (type === "PowerPoint") return <FileImage className="w-5 h-5 text-[#d35400]" />;
  return <FileText className="w-5 h-5 text-[#2c4b7e]" />;
}

const DEFAULT_DOCS: DocItem[] = [
  { id: "1", name: "Meeting Pack.pdf", type: "PDF", status: "Readable", size: "2.1 MB" },
  { id: "2", name: "Quarterly Notes.docx", type: "Word", status: "Readable", size: "1.1 MB" },
  { id: "3", name: "Budget Presentation.pptx", type: "PowerPoint", status: "Readable", size: "1.4 MB" },
];

let nextId = 4;

export default function Step2Upload() {
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocItem[]>(DEFAULT_DOCS);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newDocs = Array.from(e.target.files).map(file => {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
        let type = "Document";
        if (file.name.toLowerCase().endsWith('.pdf')) type = "PDF";
        else if (file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx')) type = "Word";
        else if (file.name.toLowerCase().endsWith('.ppt') || file.name.toLowerCase().endsWith('.pptx')) type = "PowerPoint";
        else if (file.type.startsWith('image/')) type = "Image";

        return {
          id: String(nextId++),
          name: file.name,
          type,
          status: "Readable",
          size: `${sizeInMB === "0.0" ? "< 0.1" : sizeInMB} MB`,
        };
      });

      setDocuments(prev => [...prev, ...newDocs]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const removeDocument = (docId: string) => {
    setDocuments(documents.filter(d => d.id !== docId));
  };

  return (
    <div className="p-10 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a6a] mb-6">Step 2: Upload Documents</h1>
        <div className="w-full h-px bg-slate-200 mb-6" />
      </header>

      <div className="mb-10">
        <p className="text-sm text-[#333] mb-4">Do you have documents to upload?</p>
        <input 
          type="file" 
          multiple 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
        />
        <Button 
          data-testid="button-upload"
          onClick={triggerUpload}
          className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white text-sm font-medium px-8 py-2.5 rounded-sm shadow-sm"
        >
          Upload Files
        </Button>
      </div>

      <div className="mb-8">
        <h2 className="text-base font-bold text-[#1e3a6a] mb-4 flex items-center gap-1 cursor-pointer hover:underline">
          Uploaded Documents Review <ChevronRight className="w-5 h-5" />
        </h2>
        
        <div className="w-full h-px bg-slate-200 mb-4" />

        {documents.length === 0 ? (
          <p className="text-[15px] text-[#999]">No documents uploaded yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                data-testid={`doc-row-${doc.id}`}
                className="flex items-center justify-between p-4 bg-white border border-[#c5cdd4] rounded-sm shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {getDocIcon(doc.type)}
                  <div className="flex items-center text-[15px]">
                    <span className="text-[#333]">{doc.name}</span>
                    <span className="mx-2 text-[#c5cdd4]">|</span>
                    <span className="text-[#333]">{doc.type}</span>
                    <span className="mx-2 text-[#c5cdd4]">|</span>
                    <span className="text-[#333]">{doc.status}</span>
                    <span className="mx-2 text-[#c5cdd4]">|</span>
                    <span className="text-[#333]">{doc.size}</span>
                  </div>
                </div>
                <button 
                  data-testid={`button-remove-${doc.id}`}
                  onClick={() => removeDocument(doc.id)}
                  className="text-[#c93b3b] hover:text-[#9c2e2e] text-[14px] font-medium flex items-center gap-1 transition-colors"
                >
                  <X className="w-4 h-4" /> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="w-full h-px bg-slate-200 mb-8" />

      <div className="flex justify-between mt-8">
        <Button 
          variant="outline"
          onClick={() => setLocation("/step-1")}
          className="bg-white hover:bg-slate-50 text-[#333] border-[#c5cdd4] text-sm font-medium px-8 py-2.5 rounded-sm shadow-sm"
        >
          Back
        </Button>
        <Button 
          data-testid="button-confirm"
          onClick={() => setLocation("/step-3")}
          className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white text-sm font-medium px-8 py-2.5 rounded-sm shadow-sm"
        >
          Confirm & Continue
        </Button>
      </div>
    </div>
  );
}
