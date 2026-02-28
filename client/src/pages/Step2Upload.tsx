import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { FileText, File, FileImage, ChevronRight } from "lucide-react";

export default function Step2Upload() {
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState([
    { name: "Meeting Pack.pdf", type: "PDF", status: "Readable", size: "2.1 MB", icon: <FileText className="w-5 h-5 text-[#2c4b7e]" /> },
    { name: "Quarterly Notes.docx", type: "Word", status: "Readable", size: "1.1 MB", icon: <File className="w-5 h-5 text-[#2c4b7e]" /> },
    { name: "Budget Presentation.pptx", type: "PowerPoint", status: "Readable", size: "1.4 MB", icon: <FileImage className="w-5 h-5 text-[#d35400]" /> },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newDocs = Array.from(e.target.files).map(file => {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
        
        let type = "Document";
        let icon = <FileText className="w-5 h-5 text-[#2c4b7e]" />;
        
        if (file.name.toLowerCase().endsWith('.pdf')) {
          type = "PDF";
        } else if (file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx')) {
          type = "Word";
          icon = <File className="w-5 h-5 text-[#2c4b7e]" />;
        } else if (file.name.toLowerCase().endsWith('.ppt') || file.name.toLowerCase().endsWith('.pptx')) {
          type = "PowerPoint";
          icon = <FileImage className="w-5 h-5 text-[#d35400]" />;
        } else if (file.type.startsWith('image/')) {
          type = "Image";
          icon = <FileImage className="w-5 h-5 text-[#2c4b7e]" />;
        }

        return {
          name: file.name,
          type,
          status: "Readable",
          size: `${sizeInMB === "0.0" ? "< 0.1" : sizeInMB} MB`,
          icon
        };
      });

      setDocuments([...documents, ...newDocs]);
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-10 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a6a] mb-6">Step 2: Upload Documents</h1>
        <div className="w-full h-px bg-slate-200 mb-6" />
      </header>

      <div className="mb-10">
        <p className="text-[17px] text-[#333] mb-4">Do you have documents to upload?</p>
        <input 
          type="file" 
          multiple 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
        />
        <Button 
          onClick={triggerUpload}
          className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white px-8 py-5 text-base rounded-sm shadow-md font-medium"
        >
          Upload Files
        </Button>
      </div>

      <div className="mb-8">
        <h2 className="text-[17px] font-bold text-[#1e3a6a] mb-4 flex items-center gap-1 cursor-pointer hover:underline">
          Uploaded Documents Review <ChevronRight className="w-5 h-5" />
        </h2>
        
        <div className="w-full h-px bg-slate-200 mb-4" />

        <div className="flex flex-col gap-3">
          {documents.map((doc, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-4 bg-white border border-[#c5cdd4] rounded-sm shadow-sm"
            >
              {doc.icon}
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
          ))}
        </div>
      </div>
      
      <div className="w-full h-px bg-slate-200 mb-8" />

      <div className="flex items-center gap-4 max-w-[600px]">
        <Button 
          variant="outline"
          onClick={() => setLocation("/step-1")}
          className="bg-white hover:bg-slate-50 text-[#1e3a6a] border-[#c5cdd4] px-8 py-5 text-base rounded-sm shadow-sm font-medium"
        >
          Back
        </Button>
        <Button 
          onClick={() => setLocation("/step-3")}
          className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white px-8 py-5 text-base rounded-sm shadow-md font-medium"
        >
          Confirm & Continue
        </Button>
        <Button 
          variant="outline"
          onClick={triggerUpload}
          className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white border-0 px-6 py-5 text-base rounded-sm shadow-md font-medium"
        >
          + Add More Files <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
