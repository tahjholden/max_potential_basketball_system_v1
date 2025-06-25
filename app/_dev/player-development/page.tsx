"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import EditPDPModal from "@/components/EditPDPModal";
import AddObservationModal from "../dashboard/AddObservationModal";
import AddPlayerModal from "../dashboard/AddPlayerModal";

export default function PlayerDevDashboard() {
  const supabase = createClient();

  const [players, setPlayers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [listView, setListView] = useState('all'); // 'all' or 'search'
  const [selected, setSelected] = useState<any | null>(null);
  const [pdp, setPdp] = useState<any | null>(null);
  const [observations, setObservations] = useState<any[]>([]);
  
  const [editPdpOpen, setEditPdpOpen] = useState(false);
  const [addObsOpen, setAddObsOpen] = useState(false);
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    const fetchDetailsForSelectedPlayer = async () => {
      if (!selected) {
        setPdp(null);
        setObservations([]);
        return;
      }

      // Fetch PDP
      const { data: pdpData, error: pdpError } = await supabase
        .from("pdp")
        .select("*")
        .eq("player_id", selected.id)
        .is("archived_at", null)
        .order("start_date", { ascending: false })
        .limit(1)
        .single();
      
      if (pdpError && pdpError.code !== 'PGRST116') {
        console.error("Error fetching PDP:", pdpError);
        toast.error('Failed to fetch PDP.');
      }
      setPdp(pdpData || null);

      // Fetch observations
      const { data: obsData, error: obsError } = await supabase
        .from("observations")
        .select("*, coaches(first_name, last_name)")
        .eq("player_id", selected.id)
        .eq("archived", false)
        .order("observation_date", { ascending: false });

      if (obsError) {
        console.error("Error fetching observations:", obsError);
        toast.error('Failed to fetch observations.');
      }
      
      const transformedObs = (obsData || []).map(o => ({
        ...o,
        coach_name: o.coaches ? `${o.coaches.first_name || ""} ${o.coaches.last_name || ""}`.trim() : "Unknown"
      }));
      setObservations(transformedObs || []);
    };

    fetchDetailsForSelectedPlayer();
  }, [selected, supabase]);

  const fetchPlayers = async () => {
    const { data, error } = await supabase.from("players").select("id, name, first_name, last_name");
    if (error) {
      toast.error('Failed to fetch players.');
      console.error(error);
    } else if (data) {
      const transformed = data.map(p => ({
        ...p,
        name: (p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : p.name)
      }));
      setPlayers(transformed);
    }
  };
  
  const refreshPlayers = async () => {
    await fetchPlayers();
    setListView('all');
    setSearchTerm('');
  };

  const handlePlayerSubmit = async (name: string) => {
    const nameParts = name.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ');

    const { error } = await supabase
      .from('players')
      .insert([{ name, first_name, last_name }]);

    if (error) {
      toast.error('Failed to add player.');
      console.error(error);
    } else {
      toast.success('Player added successfully.');
      setAddPlayerOpen(false);
      await refreshPlayers();
    }
  };
  
  const handleObservationSubmit = async (content: string) => {
    if (!selected || !pdp) return;
    const { error } = await supabase.from("observations").insert([
      { content, player_id: selected.id, pdp_id: pdp.id, observation_date: new Date().toISOString() }
    ]);

    if (error) {
      toast.error("Failed to add observation.");
    } else {
      toast.success("Observation added.");
      setAddObsOpen(false);
      const current = selected;
      setSelected(null);
      setSelected(current);
    }
  };

  const addPdp = async (content: string) => {
    if (!selected || !content.trim()) return;
    const payload = { content, player_id: selected.id, start_date: new Date().toISOString() };
    const { error } = await supabase.from("pdp").insert([payload]).select().single();
    
    if (error) {
      toast.error("Failed to create PDP");
    } else {
      toast.success("PDP created");
      setSelected(selected); // trigger refresh
    }
  };

  const displayPlayers = searchTerm.trim() === '' && listView === 'search'
    ? []
    : listView === 'all'
      ? players
      : players.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex space-x-4 p-4 h-[calc(100vh-100px)]">
      {/* === LEFT PANE === */}
      <div className="w-[22%] bg-[#1f1f1f] rounded p-3 flex flex-col relative h-full">
        {players.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <Image src="/maxsM.png" alt="Watermark" width={64} height={64} />
          </div>
        )}
        <div className="flex items-center justify-between mb-2 z-10">
          <input
            type="text"
            placeholder="Search players..."
            className="w-full mr-2 p-1 rounded bg-[#2a2a2a] text-white"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setListView("search");
            }}
          />
          <button
            onClick={() => setListView(listView === "all" ? "search" : "all")}
            className="text-xs border border-slate-500 rounded px-2 py-1"
          >
            {listView === "all" ? "List / Search" : "Show All"}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 z-10">
          <ul className="space-y-1">
            {displayPlayers.map((p) => (
              <li
                key={p.id}
                onClick={() => setSelected(p)}
                className={`p-2 rounded cursor-pointer ${
                  selected?.id === p.id
                    ? "bg-[#d8cc97] text-black"
                    : "bg-[#2a2a2a] hover:bg-slate-700"
                }`}
              >
                {p.name}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => setAddPlayerOpen(true)}
          className="mt-2 w-full bg-[#d8cc97] rounded py-2 text-black z-10"
        >
          + Add Player
        </button>
      </div>

      {/* === MIDDLE PANE (PDP) === */}
      <div className="w-[38%] bg-[#1f1f1f] rounded p-4 flex flex-col relative h-full">
        <h3 className="text-lg font-semibold text-white mb-2">Player Development Plan</h3>
        {selected ? (
          pdp ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto pr-2">
                <p className="italic mb-2">{pdp.content}</p>
              </div>
              <button
                className="w-full border border-[#d8cc97] text-[#d8cc97] py-2 rounded mt-2 hover:bg-[#d8cc97] hover:text-black transition"
                onClick={() => setEditPdpOpen(true)}
              >
                Edit PDP
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <textarea
                id="newPdp"
                className="w-full p-2 rounded bg-[#2a2a2a] flex-1 resize-none"
                placeholder="Write new PDP..."
              />
              <button
                onClick={() => {
                  const newPdpContent = (document.getElementById("newPdp") as HTMLTextAreaElement).value;
                  addPdp(newPdpContent);
                }}
                className="mt-2 w-full bg-[#d8cc97] py-2 rounded text-black"
              >
                Save PDP
              </button>
            </div>
          )
        ) : (
          <div className="h-full flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Image src="/maxsM.png" alt="Watermark" width={96} height={96} />
            </div>
            <p className="text-slate-500 italic text-center z-10">
              Select a player to view or assign a development plan.<br />
              Use the left sidebar to search or browse your roster.
            </p>
          </div>
        )}
      </div>

      {/* === RIGHT PANE (Observations) === */}
      <div className="w-[40%] bg-[#1f1f1f] rounded p-4 flex flex-col relative h-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white">Observations</h3>
          {selected && pdp && (
            <button
              onClick={() => setAddObsOpen(true)}
              className="text-sm border-2 border-[#d8cc97] rounded px-2 text-[#d8cc97] hover:bg-[#d8cc97] hover:text-black transition"
            >
              + Add
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {selected ? (
            observations.length > 0 ? (
              <ul className="space-y-2">
                {observations.map((obs) => (
                  <li key={obs.id} className="p-2 bg-[#2a2a2a] rounded">
                    <p>{obs.content}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(obs.observation_date).toLocaleDateString()} – {obs.coach_name}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 italic p-6">
                {pdp ? "No observations for this PDP yet." : "No observations for this player yet."}
              </div>
            )
          ) : (
            <div className="h-full flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <Image src="/maxsM.png" alt="Watermark" width={96} height={96} />
              </div>
              <p className="text-slate-500 italic text-center z-10">
                Observations for the current PDP will appear here.<br />
                Click "+ Add" to start logging performance notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 