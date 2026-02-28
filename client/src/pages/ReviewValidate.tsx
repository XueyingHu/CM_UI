import { useState, useEffect } from "react";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getReviewItems, updateReviewItemAction, seedReviewItems, getSessionId } from "@/lib/api";

export default function ReviewValidate() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("events");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    const init = async () => {
      const sessionId = getSessionId();
      if (!sessionId) { setLoading(false); return; }

      if (!seeded) {
        const existing = await getReviewItems("events", "review");
        if (existing.length === 0) {
          await seedReviewItems();
        }
        setSeeded(true);
      }

      const data = await getReviewItems(activeTab, "review");
      setItems(data);
      setLoading(false);
    };
    init();
  }, [activeTab, seeded]);

  const handleAction = async (id: string, action: 'accepted' | 'deleted') => {
    const updated = await updateReviewItemAction(id, action);
    setItems(prev => prev.map(item => item.id === id ? updated : item));
  };

  return (
    <div className="p-10 max-w-5xl relative min-h-full pb-32">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a6a] mb-6">Review and Validate relevant Items</h1>
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
          We identified candidate {activeTab === "events" ? "Risk Events" : activeTab === "issues" ? "Issues" : "Navigator Changes"} for your domain using rules and AI semantic matching.
          <br />
          Please validate by accepting or deleting each item.
        </p>
      </div>

      <div className="w-full mb-8">
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
                  <td className="py-4 px-4 text-[14px] text-[#333] leading-snug">
                    {row.title}
                  </td>
                  <td className="py-4 px-4 text-[14px] text-[#333]">
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
                          data-testid={`button-accept-${row.id}`}
                          onClick={() => handleAction(row.id, 'accepted')}
                          className="bg-[#2c7a3f] hover:bg-[#205c2e] text-white text-[13px] font-medium py-1 px-3 rounded-sm flex items-center justify-center gap-1 w-20 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={3} /> Accept
                        </button>
                        <button 
                          data-testid={`button-delete-${row.id}`}
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
        <Button 
          variant="outline"
          onClick={() => setLocation("/step-6")}
          className="bg-white hover:bg-slate-50 text-[#1e3a6a] border-[#c5cdd4] px-8 py-5 text-base rounded-sm shadow-sm font-medium"
        >
          Back
        </Button>
        <Button 
          onClick={() => setLocation("/expand-search")}
          className="bg-[#1e3a6a] hover:bg-[#152a4d] text-white px-8 py-5 text-base rounded-sm shadow-md font-medium"
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
