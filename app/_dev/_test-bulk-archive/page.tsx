"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestBulkArchivePage() {
  const [result, setResult] = useState<string>("");

  // Hardcode a PDP ID for testing or use any valid one
  const pdpId = "35ef1db2-d69a-474d-b3b4-9a0c4d0a1908"; // <-- Change to your archived PDP

  async function archiveObservationsForPdp() {
    const supabase = createClient();

    // Simple bulk update: flip booleans for all observations with this pdp_id
    const { data, error, count } = await supabase
      .from("observations")
      .update({ archived: true })
      .eq("pdp_id", pdpId)
      .eq("archived", false);

    if (error) {
      setResult("Error: " + error.message);
    } else {
      setResult("Success! Flipped booleans for all observations for PDP " + pdpId);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Archive Observations</h1>
      <button
        onClick={archiveObservationsForPdp}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Archive All Observations for PDP
      </button>
      {result && (
        <div className="mt-4 p-2 bg-zinc-900 border border-zinc-700 rounded">{result}</div>
      )}
    </div>
  );
} 