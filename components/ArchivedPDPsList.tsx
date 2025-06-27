export default function ArchivedPDPsList({ pdps }: { pdps: any[] }) {
  if (!pdps || pdps.length === 0) {
    return null;
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
    <details className="bg-[#232323] border border-[#323232] rounded-md p-3">
      <summary className="cursor-pointer text-sm font-semibold text-[#C2B56B] hover:text-white">
        Archived Development Plans ({pdps.length})
      </summary>
      <ul className="mt-2 list-disc list-inside text-sm text-gray-300 space-y-1">
        {pdps.map(pdp => (
          <li key={pdp.id}>
            <span className="font-semibold">{formatDate(pdp.start_date)}:</span>
            <span className="italic ml-2">{pdp.content ? pdp.content.substring(0, 50) + '...' : 'No content'}</span>
          </li>
        ))}
      </ul>
    </details>
  );
} 