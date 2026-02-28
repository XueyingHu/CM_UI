import { useState, useEffect } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { getReviewItems, updateReviewItemAction, getSessionId } from "@/lib/api";

export default function ExpandSearch() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("events");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const [dateRange, setDateRange] = useState("Last 90 Days");
  const [status, setStatus] = useState("Open");
  const [rating, setRating] = useState("Critical, Major");

  const dateOptions = ["Last 30 Days", "Last 90 Days", "Last 6 Months", "Last Year", "All Time"];
  const statusOptions = ["Open", "Closed", "Pending", "All Statuses"];
  const ratingOptions = ["Critical, Major", "Critical Only", "Major, Medium", "All Ratings"];

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const data = await getReviewItems(activeTab, "expand");
      setItems(data);
      setLoading(false);
    };
    fetchItems();
  }, [activeTab]);

  const handleAction = async (id: string, action: 'accepted' | 'deleted') => {
    const updated = await updateReviewItemAction(id, action);
    setItems(prev => prev.map(item => item.id === id ? updated : item));
  };

  const acceptedCount = items.filter(i => i.action === 'accepted').length;

  return (
    <div className="p-10 max-w-5xl relative min-h-full pb-32">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a6a] mb-6 flex items-center gap-2">
          Expand Search Criteria <span className="text-[18px] text-[#1e3a6a] font-normal">(optional)</span>
        </h1>
        <div className="w-full h-px bg-slate-200 mb-6" />
      </header>

      <div className="flex mb-6">
        <div 
          onClick={() => setActiveTab("events")}
          className={`px-6 py-2.5 text-[15px] font-medium cursor-pointer shadow-sm ${activeTab === "events" ? "bg-[#1e3a6a] text-white border-r border-white/20" : "bg-[#f4f6f8] text-[#333] border border-[#c5cdd4] hover:bg-[#e6ebf1]"}`}
        >
          ORAC Risk Events
        </div>
        <div 
          onClick={() => setActiveTab("issues")}
          className={`px-6 py-2.5 text-[15px] font-medium cursor-pointer shadow-sm ${activeTab === "issues" ? "bg-[#1e3a6a] text-white border-r border-white/20" : "bg-[#f4f6f8] text-[#333] border border-l-0 border-[#c5cdd4] hover:bg-[#e6ebf1]"}`}
        >
          ORAC Issues
        </div>
        <div 
          onClick={() => setActiveTab("changes")}
          className={`px-6 py-2.5 text-[15px] font-medium cursor-pointer shadow-sm ${activeTab === "changes" ? "bg-[#1e3a6a] text-white border-r border-white/20" : "bg-[#f4f6f8] text-[#333] border border-l-0 border-[#c5cdd4] hover:bg-[#e6ebf1]"}`}
        >
          Navigator Changes
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[15px] text-[#333] leading-relaxed">
          Add additional search criteria to find more relevant items. Use filters or AI search to supplement your analysis.<br/>
          Please validate by accepting or deleting.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex">
          <div className="bg-[#1e3a6a] text-white px-8 py-2 text-[14px] font-medium border-r border-white/20 cursor-pointer shadow-sm">
            Filter Search
          </div>
        </div>
        
        <div className="flex border border-[#c5cdd4] bg-white rounded-tr-sm rounded-b-sm shadow-sm min-h-[300px]">
          <div className="w-[300px] border-r border-[#c5cdd4] flex flex-col">
            
            <div className="relative border-b border-[#e0e4e8]">
              <div 
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                onClick={() => { setIsDateOpen(!isDateOpen); setIsStatusOpen(false); setIsRatingOpen(false); }}
              >
                <span className="text-[14px] text-[#333]">Date Range: <span className="font-medium text-[#1e3a6a]">{dateRange}</span></span>
                <ChevronDown className={`w-4 h-4 text-[#1e3a6a] transition-transform ${isDateOpen ? 'rotate-180' : ''}`} />
              </div>
              {isDateOpen && (
                <div className="absolute top-full left-0 w-full bg-white border border-[#c5cdd4] shadow-md z-10 py-1">
                  {dateOptions.map(opt => (
                    <div 
                      key={opt}
                      className={`px-3 py-2 text-[14px] cursor-pointer hover:bg-[#f4f6f8] ${dateRange === opt ? 'bg-[#e6ebf1] text-[#1e3a6a] font-medium' : 'text-[#333]'}`}
                      onClick={() => { setDateRange(opt); setIsDateOpen(false); }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative border-b border-[#e0e4e8]">
              <div 
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                onClick={() => { setIsStatusOpen(!isStatusOpen); setIsDateOpen(false); setIsRatingOpen(false); }}
              >
                <span className="text-[14px] text-[#333]">Status: <span className="font-medium text-[#1e3a6a]">{status}</span></span>
                <ChevronDown className={`w-4 h-4 text-[#1e3a6a] transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
              </div>
              {isStatusOpen && (
                <div className="absolute top-full left-0 w-full bg-white border border-[#c5cdd4] shadow-md z-10 py-1">
                  {statusOptions.map(opt => (
                    <div 
                      key={opt}
                      className={`px-3 py-2 text-[14px] cursor-pointer hover:bg-[#f4f6f8] ${status === opt ? 'bg-[#e6ebf1] text-[#1e3a6a] font-medium' : 'text-[#333]'}`}
                      onClick={() => { setStatus(opt); setIsStatusOpen(false); }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative border-b border-[#e0e4e8]">
              <div 
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                onClick={() => { setIsRatingOpen(!isRatingOpen); setIsDateOpen(false); setIsStatusOpen(false); }}
              >
                <span className="text-[14px] text-[#333]">Rating: <span className="font-medium text-[#1e3a6a]">{rating}</span></span>
                <ChevronDown className={`w-4 h-4 text-[#1e3a6a] transition-transform ${isRatingOpen ? 'rotate-180' : ''}`} />
              </div>
              {isRatingOpen && (
                <div className="absolute top-full left-0 w-full bg-white border border-[#c5cdd4] shadow-md z-10 py-1">
                  {ratingOptions.map(opt => (
                    <div 
                      key={opt}
                      className={`px-3 py-2 text-[14px] cursor-pointer hover:bg-[#f4f6f8] ${rating === opt ? 'bg-[#e6ebf1] text-[#1e3a6a] font-medium' : 'text-[#333]'}`}
                      onClick={() => { setRating(opt); setIsRatingOpen(false); }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-auto p-3 bg-[#f8fbff] flex justify-center border-t border-[#e0e4e8]">
              <button className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white text-[14px] py-1.5 px-6 rounded-sm w-full font-medium shadow-sm transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 p-4 bg-[#f8fbff] border-b border-[#e0e4e8]">
              <div className="bg-[#f4f6f8] text-[#333] px-8 py-2 text-[14px] border border-[#c5cdd4] cursor-pointer hover:bg-[#e6ebf1] font-medium">
                AI Search
              </div>
            </div>
            <div className="flex-1 p-4 flex items-start gap-2 bg-[#f8fbff]">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  data-testid="input-ai-search"
                  defaultValue="Payment related risk events with recurring issues"
                  className="w-full border border-[#c5cdd4] p-2 text-[14px] text-[#333] shadow-sm focus:outline-none focus:border-[#1e3a6a]"
                />
              </div>
              <button className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white text-[14px] py-2 px-4 rounded-sm font-medium shadow-sm transition-colors whitespace-nowrap">
                Run AI Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[14px] text-[#333]">
          Returned <span className="font-bold">{items.length} items</span> | <span className="text-[#1e3a6a]">Accepted so far: <span className="font-bold">{acceptedCount}</span></span>
        </p>
      </div>

      <div className="w-full">
        {loading ? (
          <p className="text-[15px] text-[#333]">Loading items...</p>
        ) : items.length === 0 ? (
          <p className="text-[15px] text-[#999]">No items found for this category.</p>
        ) : (
          <table className="w-full text-left border-collapse border border-[#e0e4e8]">
            <thead>
              <tr className="bg-[#f8fbff] border-b border-[#c5cdd4]">
                <th className="py-3 px-4 text-[14px] font-medium text-[#333] w-[15%]">Event ID</th>
                <th className="py-3 px-4 text-[14px] font-medium text-[#333] w-[35%]">Title</th>
                <th className="py-3 px-4 text-[14px] font-medium text-[#333] w-[10%]">Rating</th>
                <th className="py-3 px-4 text-[14px] font-medium text-[#333] w-[10%]">Status</th>
                <th className="py-3 px-4 text-[14px] font-medium text-[#333] w-[12%]">Opened</th>
                <th className="py-3 px-4 text-[14px] font-medium text-[#333] w-[10%]">Owner</th>
                <th className="py-3 px-4 text-[14px] font-medium text-[#333] w-[8%]"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const isDeleted = row.action === 'deleted';
                const isAccepted = row.action === 'accepted';
                
                return (
                <tr key={row.id} className={`border-b border-[#e0e4e8] last:border-0 ${isDeleted ? 'bg-slate-50 opacity-40' : 'bg-white'}`}>
                  <td className="py-4 px-4 text-[14px] text-[#1e3a6a] font-bold">
                    {row.eventId}
                  </td>
                  <td className="py-4 px-4 text-[14px] text-[#333] leading-snug whitespace-pre-line">
                    {row.title}
                  </td>
                  <td className={`py-4 px-4 text-[14px] ${row.rating === 'Critical' ? 'text-[#c93b3b]' : 'text-[#333]'}`}>
                    {row.rating}
                  </td>
                  <td className="py-4 px-4 text-[14px] text-[#333]">
                    {row.status}
                  </td>
                  <td className="py-4 px-4 text-[14px] text-[#333]">
                    {row.opened}
                  </td>
                  <td className="py-4 px-4 text-[14px] text-[#333]">
                    {row.owner}
                  </td>
                  <td className="py-2 px-4 flex flex-col gap-1.5 min-w-[100px]">
                    {!isAccepted && !isDeleted ? (
                      <>
                        <button 
                          onClick={() => handleAction(row.id, 'accepted')}
                          className="bg-[#2c7a3f] hover:bg-[#205c2e] text-white text-[13px] font-medium py-1 px-3 rounded-sm flex items-center justify-center gap-1 w-20 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={3} /> Accept
                        </button>
                        <button 
                          onClick={() => handleAction(row.id, 'deleted')}
                          className="bg-[#c93b3b] hover:bg-[#9c2e2e] text-white text-[13px] font-medium py-1 px-3 rounded-sm flex items-center justify-center w-20 shadow-sm"
                        >
                          Delete
                        </button>
                      </>
                    ) : isAccepted ? (
                      <span className="text-[#2c7a3f] font-medium text-[13px] flex items-center gap-1 justify-center w-20 py-1">
                        <Check className="w-4 h-4" strokeWidth={3} /> Accepted
                      </span>
                    ) : (
                      <span className="text-[#c93b3b] font-medium text-[13px] flex items-center justify-center w-20 py-1">
                        Deleted
                      </span>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button 
          onClick={() => setLocation("/review-validate")}
          className="bg-white hover:bg-slate-50 text-[#1e3a6a] border border-[#c5cdd4] px-8 py-5 text-base rounded-sm shadow-sm font-medium flex items-center"
        >
          Back
        </button>
        <button 
          onClick={() => setLocation("/insights-summary")}
          className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white px-8 py-5 text-base rounded-sm shadow-md font-medium flex items-center"
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
