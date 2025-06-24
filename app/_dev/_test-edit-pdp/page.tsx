"use client";
import { useState } from "react";
// import { StyledModal } from "@/components/ui/StyledModal";
import { createClient } from "@/lib/supabase/client";

export default function TestEditPDPPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [testContent, setTestContent] = useState("This is the current PDP content for testing purposes.");
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Mock data for testing
  const mockPlayer = { id: "test-player-1", name: "Test Player" };
  const mockPDP = { 
    id: "test-pdp-1", 
    content: testContent, 
    start_date: "2024-01-15" 
  };

  const handleSave = async (newContent: string) => {
    console.log("Saving new content:", newContent);
    
    try {
      // Test database update
      const supabase = createClient();
      
      // First, let's check if we can connect to the database
      const { data: testData, error: testError } = await supabase
        .from('pdp')
        .select('id, content')
        .limit(1);
      
      if (testError) {
        console.error("Database connection test failed:", testError);
        setDebugInfo(`Database connection failed: ${testError.message}`);
        return;
      }
      
      console.log("Database connection successful, found PDPs:", testData);
      
      // Now try to update a real PDP (if any exist)
      if (testData && testData.length > 0) {
        const firstPdp = testData[0];
        console.log("Attempting to update PDP:", firstPdp.id);
        
        const { data: updateData, error: updateError } = await supabase
          .from("pdp")
          .update({
            content: newContent,
            updated_at: new Date().toISOString(),
          })
          .eq("id", firstPdp.id)
          .select();
        
        if (updateError) {
          console.error("Update failed:", updateError);
          setDebugInfo(`Update failed: ${updateError.message}`);
          return;
        }
        
        console.log("Update successful:", updateData);
        setDebugInfo(`Successfully updated PDP ${firstPdp.id} with new content`);
      } else {
        setDebugInfo("No PDPs found in database to update");
      }
      
      setTestContent(newContent);
      setModalOpen(false);
      alert("Content updated! Check console and debug info for details.");
      
    } catch (err) {
      console.error("Error in handleSave:", err);
      setDebugInfo(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">EditPDPModal Test</h1>
      
      <div className="mb-6 p-4 bg-gray-800 rounded">
        <h2 className="text-lg font-semibold mb-2">Current Test Content:</h2>
        <p className="text-gray-300 italic">{testContent}</p>
      </div>

      {debugInfo && (
        <div className="mb-6 p-4 bg-blue-900 rounded border border-blue-500">
          <h3 className="text-lg font-semibold mb-2">Debug Info:</h3>
          <p className="text-blue-200 text-sm">{debugInfo}</p>
        </div>
      )}

      <button
        onClick={() => setModalOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
      >
        Open EditPDPModal Test
      </button>

      {/* Direct modal implementation for testing */}
      {/*
      {modalOpen && (
        <StyledModal 
          open={modalOpen} 
          onOpenChange={setModalOpen} 
          title={`Edit PDP for ${mockPlayer.name}`}
        >
          <p className="text-sm text-slate-300 mb-2">
            Edit the existing PDP content below. This will update the current development plan.
          </p>
          
          <div className="mb-3 p-2 bg-[#1a1a1a] rounded border border-slate-600">
            <p className="text-xs text-slate-400 mb-1">Current PDP (Started {new Date(mockPDP.start_date).toLocaleDateString()}):</p>
            <p className="text-xs text-slate-300 italic">{mockPDP.content}</p>
          </div>
          
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Updated PDP Content:
          </label>
          <textarea
            defaultValue={mockPDP.content}
            rows={6}
            placeholder="Enter updated PDP content..."
            className="w-full px-3 py-2 rounded bg-[#2a2a2a] border border-slate-600 text-white focus:outline-none focus:ring focus:border-[#d8cc97]"
            id="test-textarea"
          />
          
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="px-3 py-1 border border-slate-500 text-sm rounded text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const textarea = document.getElementById('test-textarea') as HTMLTextAreaElement;
                const newContent = textarea.value;
                handleSave(newContent);
              }}
              className="bg-[#d8cc97] text-black px-4 py-2 rounded font-semibold hover:bg-yellow-300 transition"
            >
              Save Changes
            </button>
          </div>
        </StyledModal>
      )}
      */}
    </div>
  );
} 