export default function CurrentPDPCard({ pdp }: { pdp: any }) {
  if (!pdp) {
    return (
      <div className="p-4 bg-[#d8cc97]/10 border-l-4 border-[#d8cc97] rounded-md text-[#d8cc97] italic">
        No active PDP.
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="p-4 bg-[#232323] border border-[#323232] rounded-md space-y-2">
      <h2 className="text-lg font-semibold text-[#d8cc97]">Current PDP</h2>
      <p className="italic text-sm text-gray-300">{pdp.content}</p>
      <p className="text-xs text-gray-400 pt-2 border-t border-gray-600">
        Started: {formatDate(pdp.start_date)}
      </p>
    </div>
  );
} 