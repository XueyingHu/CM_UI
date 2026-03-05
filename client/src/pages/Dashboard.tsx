import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Check } from "lucide-react";

const DOMAINS = [
  {
    id: "market-tech-ops-risk",
    name: "Market Tech - Ops Risk",
    businessMonitoringLead: "John Smith",
    portfolio: "Markets and Technology",
    portfolioManager: "Sarah Johnson",
    auditableEntities: [
      { id: "AE12345", name: "Trading Systems" },
      { id: "AE23456", name: "Ops Risk Controls" },
      { id: "AE34567", name: "Market Data Services" },
      { id: "AE45678", name: "Tech Infrastructure" },
    ],
    description: "This domain focuses on operational risk management for markets and technology functions.",
    effectiveDate: "January 1, 2026",
  },
  {
    id: "retail-banking-compliance",
    name: "Retail Banking - Compliance",
    businessMonitoringLead: "Emily Chen",
    portfolio: "Retail Banking",
    portfolioManager: "David Lee",
    auditableEntities: [
      { id: "AE55001", name: "Consumer Lending" },
      { id: "AE55002", name: "Deposit Operations" },
      { id: "AE55003", name: "Branch Compliance" },
    ],
    description: "This domain covers compliance monitoring for retail banking operations and consumer-facing services.",
    effectiveDate: "January 1, 2026",
  },
  {
    id: "global-markets-credit-risk",
    name: "Global Markets - Credit Risk",
    businessMonitoringLead: "Robert Taylor",
    portfolio: "Global Markets",
    portfolioManager: "Maria Garcia",
    auditableEntities: [
      { id: "AE66001", name: "Credit Derivatives" },
      { id: "AE66002", name: "Counterparty Risk" },
      { id: "AE66003", name: "Credit Portfolio Mgmt" },
    ],
    description: "This domain addresses credit risk assessment and monitoring across global markets trading activities.",
    effectiveDate: "January 1, 2026",
  },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(() => {
    return sessionStorage.getItem("selectedDomainId") || null;
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedDomain = DOMAINS.find((d) => d.id === selectedDomainId) || null;

  const filteredDomains = DOMAINS.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectDomain = (domainId: string) => {
    setSelectedDomainId(domainId);
    sessionStorage.setItem("selectedDomainId", domainId);
    const domain = DOMAINS.find((d) => d.id === domainId);
    if (domain) {
      sessionStorage.setItem("selectedDomain", domain.name);
    }
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleConfirm = () => {
    if (selectedDomain) {
      setLocation("/step-2");
    }
  };

  return (
    <div className="flex items-start justify-center min-h-full px-10 py-12">
      <div className="w-full max-w-[700px]">
        <h1 className="text-2xl font-bold text-[#1e3a6a] mb-8 text-center">
          Select a Business Domain
        </h1>

        <div ref={dropdownRef} className="relative mb-6">
          <div
            className="flex items-center border border-[#c5cdd4] rounded-sm bg-white cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <input
              data-testid="input-search-domain"
              type="text"
              placeholder="Type to search..."
              value={isOpen ? searchQuery : (selectedDomain ? selectedDomain.name : searchQuery)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                setSearchQuery("");
                setIsOpen(true);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery("");
                setIsOpen(true);
              }}
              className={`flex-1 px-4 py-2.5 text-sm bg-transparent focus:outline-none ${selectedDomain && !isOpen ? "font-medium text-[#1e3a6a]" : ""}`}
            />
            <Search className="w-4 h-4 text-[#888] mr-3" />
          </div>

          {isOpen && (
            <div className="absolute z-10 w-full border border-[#c5cdd4] border-t-0 bg-white shadow-md rounded-b-sm">
              {filteredDomains.map((domain) => (
                <div
                  key={domain.id}
                  data-testid={`option-domain-${domain.id}`}
                  onClick={() => selectDomain(domain.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer ${
                    selectedDomainId === domain.id
                      ? "bg-[#1e3a6a] text-white font-medium"
                      : "text-[#333] hover:bg-[#f0f2f5]"
                  }`}
                >
                  {selectedDomainId === domain.id && (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
                  <span>{domain.name}</span>
                </div>
              ))}
              {filteredDomains.length === 0 && (
                <div className="px-4 py-3 text-sm text-[#888]">No domains found.</div>
              )}
            </div>
          )}
        </div>

        {selectedDomain && (
          <div
            data-testid="domain-details-panel"
            className="border border-[#c5cdd4] rounded-sm bg-white p-6 space-y-3 text-sm"
          >
            <div>
              <span className="font-bold text-[#1e3a6a]">Domain Name: </span>
              <span className="text-[#333]">{selectedDomain.name}</span>
            </div>
            <div>
              <span className="font-bold text-[#1e3a6a]">Business Monitoring Lead: </span>
              <span className="text-[#333]">{selectedDomain.businessMonitoringLead}</span>
            </div>
            <div>
              <span className="font-bold text-[#1e3a6a]">Portfolio: </span>
              <span className="text-[#333]">{selectedDomain.portfolio}</span>
            </div>
            <div>
              <span className="font-bold text-[#1e3a6a]">Portfolio Manager: </span>
              <span className="text-[#333]">{selectedDomain.portfolioManager}</span>
            </div>
            <div>
              <span className="font-bold text-[#1e3a6a]">Auditable Entities:</span>
              <ul className="list-disc ml-6 mt-1 space-y-1 text-[#333]">
                {selectedDomain.auditableEntities.map((ae) => (
                  <li key={ae.id}>
                    {ae.id} - {ae.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-bold text-[#1e3a6a]">Domain Description: </span>
              <span className="text-[#333]">{selectedDomain.description}</span>
            </div>
            <div>
              <span className="font-bold text-[#1e3a6a]">Effective Date: </span>
              <span className="text-[#333]">{selectedDomain.effectiveDate}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            data-testid="button-back-dashboard"
            onClick={() => setLocation("/domain-home")}
            className="bg-white hover:bg-slate-50 text-[#333] text-sm font-medium px-8 py-2.5 rounded-sm border border-[#c5cdd4] shadow-sm"
          >
            Back
          </button>
          <button
            data-testid="button-confirm-next"
            onClick={handleConfirm}
            disabled={!selectedDomain}
            className={`text-sm font-medium px-8 py-2.5 rounded-sm shadow-sm ${
              selectedDomain
                ? "bg-[#1e3a6a] hover:bg-[#152a4d] text-white"
                : "bg-[#a0b0c4] text-white cursor-not-allowed"
            }`}
          >
            Confirm and Next
          </button>
        </div>
      </div>
    </div>
  );
}
