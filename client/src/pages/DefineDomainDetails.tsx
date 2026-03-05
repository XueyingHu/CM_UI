import { useState } from "react";
import { useLocation } from "wouter";

const SIDEBAR_STEPS = [
  { id: 1, label: "Portfolio & AE Selection" },
  { id: 2, label: "Define Domain Details" },
  { id: 3, label: "Review & Publish" },
];

const DROPDOWN_FIELDS = [
  { label: "Business Monitoring Lead:", placeholder: "Select Business Monitoring Lead" },
  { label: "Portfolio:", placeholder: "Select Portfolio" },
  { label: "Level 3 Responsible Executive:", placeholder: "Select Level 3 Executive" },
  { label: "Responsible Legal Entities:", placeholder: "Select Legal Entities" },
  { label: "Level 4 Responsible Executives:", placeholder: "Select Level 4 Executives" },
  { label: "Responsible Vertical(s):", placeholder: "Select Verticals" },
];

export default function DefineDomainDetails() {
  const [, setLocation] = useLocation();
  const [domainName, setDomainName] = useState("");
  const [domainDescription, setDomainDescription] = useState("");
  const [dropdownValues, setDropdownValues] = useState<Record<string, string>>({});
  const activeStep = 2;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#eef1f5] border-b border-[#d0d5dd] px-6 py-2 text-sm text-[#555] flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            data-testid="link-home"
            onClick={() => setLocation("/")}
            className="text-[#1e3a6a] hover:underline font-medium"
          >
            Home
          </button>
          <span className="mx-1">›</span>
          <span className="font-semibold text-[#333]">Create a New Domain</span>
        </div>
        <span className="text-[#555] text-sm">Domain: Market Tech – Ops Risk</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[240px] bg-[#f4f4f4] border-r border-[#e0e0e0] flex flex-col shrink-0 pt-4">
          <nav className="flex flex-col">
            {SIDEBAR_STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-l-4 ${
                  step.id === activeStep
                    ? "border-[#1e3a6a] bg-[#1e3a6a] text-white"
                    : "border-transparent text-[#444] hover:bg-[#eaeaea]"
                }`}
              >
                <span>{step.id}.</span>
                <span>{step.label}</span>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8">
          <h1 className="text-2xl font-bold text-[#1e3a6a] mb-8 text-center">
            Define Domain Details
          </h1>

          <div className="max-w-[600px] space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#1e3a6a] mb-1">Domain Name:</label>
              <input
                data-testid="input-domain-name"
                type="text"
                placeholder="Enter domain name"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                className="w-full border border-[#c5cdd4] rounded-sm px-4 py-2.5 text-sm bg-[#fafaf2] focus:outline-none focus:border-[#1e3a6a]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1e3a6a] mb-1">Domain Description:</label>
              <textarea
                data-testid="input-domain-description"
                placeholder="Enter domain description."
                value={domainDescription}
                onChange={(e) => setDomainDescription(e.target.value)}
                rows={3}
                className="w-full border border-[#c5cdd4] rounded-sm px-4 py-2.5 text-sm bg-[#fafaf2] focus:outline-none focus:border-[#1e3a6a] resize-y"
              />
            </div>

            {DROPDOWN_FIELDS.map((field) => (
              <div key={field.label}>
                <label className="block text-sm font-bold text-[#1e3a6a] mb-1">{field.label}</label>
                <select
                  data-testid={`select-${field.label.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`}
                  value={dropdownValues[field.label] || ""}
                  onChange={(e) =>
                    setDropdownValues((prev) => ({ ...prev, [field.label]: e.target.value }))
                  }
                  className="w-full border border-[#c5cdd4] rounded-sm px-4 py-2.5 text-sm bg-[#fafaf2] focus:outline-none focus:border-[#1e3a6a] appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center]"
                >
                  <option value="">{field.placeholder}</option>
                </select>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-[#e0e0e0] flex justify-end gap-3">
            <button
              data-testid="button-back-define-domain"
              onClick={() => setLocation("/create-domain")}
              className="bg-white hover:bg-slate-50 text-[#333] text-sm font-medium px-8 py-2.5 rounded-sm border border-[#c5cdd4] shadow-sm"
            >
              Back
            </button>
            <button
              data-testid="button-next-define-domain"
              className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white text-sm font-medium px-8 py-2.5 rounded-sm shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
