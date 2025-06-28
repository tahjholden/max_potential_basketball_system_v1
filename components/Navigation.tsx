"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  Smartphone,
  Monitor,
  Home,
  Shield,
  BarChart2,
  Building2,
  Target,
  TrendingUp,
  UserCheck,
  UserPlus,
  UserCog,
  MessageCirclePlus,
  ClipboardPlus,
  LayoutDashboard,
  MessageCircle,
  Trophy,
} from "lucide-react";

// Import modal components
import AddPlayerModal from "@/app/protected/players/AddPlayerModal";
import AddObservationModal from "@/app/protected/players/AddObservationModal";
import CreatePDPModal from "@/components/CreatePDPModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const mainNavLinks = [
  { href: "/protected/dashboard", label: "Dashboard", icon: BarChart2 },
  { href: "/protected/teams", label: "Teams", icon: Building2 },
  { href: "/protected/coaches", label: "Coaches", icon: UserCheck },
  { href: "/protected/players", label: "Players", icon: Users },
  {
    href: "/protected/observations",
    label: "Observations",
    icon: Shield,
  },
  { href: "/protected/test-teams", label: "Test Teams", icon: Building2 },
  { href: "/protected/test-coaches", label: "Test Coaches", icon: UserCheck },
  { href: "/protected/test-players", label: "Test Players", icon: Users },
  { href: "/protected/test-observations", label: "Test Observations", icon: Shield },
];

const quickActionLinks = [
  { label: "Add Player", icon: UserPlus, action: "addPlayer" },
  { label: "Add Coach", icon: UserCog, action: "addCoach" },
  { label: "Add Observation", icon: MessageCirclePlus, action: "addObservation" },
  { label: "Add Dev Plan", icon: ClipboardPlus, action: "addPDP" },
];

export default function Navigation() {
  const pathname = usePathname();
  
  // Modal state management
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [addCoachOpen, setAddCoachOpen] = useState(false);
  const [addObservationOpen, setAddObservationOpen] = useState(false);
  const [createPDPOpen, setCreatePDPOpen] = useState(false);
  
  // Player context state
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string } | null>(null);
  
  // Form states
  const [coachForm, setCoachForm] = useState({ firstName: "", lastName: "", email: "" });
  const [coachLoading, setCoachLoading] = useState(false);

  // Add a sidebarExpanded state to control label visibility
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Listen for player selection from URL or localStorage
  useEffect(() => {
    // Check if we're on a player page and extract player info
    if (pathname.includes('/protected/players/')) {
      const playerId = pathname.split('/').pop();
      if (playerId && playerId !== 'players') {
        // Fetch player info
        fetchPlayerInfo(playerId);
      }
    } else {
      // Check localStorage for selected player
      const storedPlayer = localStorage.getItem('selectedPlayer');
      if (storedPlayer) {
        try {
          setSelectedPlayer(JSON.parse(storedPlayer));
        } catch (e) {
          localStorage.removeItem('selectedPlayer');
        }
      } else {
        setSelectedPlayer(null);
      }
    }
  }, [pathname]);

  // Listen for sidebar hover to simulate expand/collapse
  useEffect(() => {
    const sidebar = document.querySelector('aside.group');
    if (!sidebar) return;
    const handleMouseEnter = () => setSidebarExpanded(true);
    const handleMouseLeave = () => setSidebarExpanded(false);
    sidebar.addEventListener('mouseenter', handleMouseEnter);
    sidebar.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      sidebar.removeEventListener('mouseenter', handleMouseEnter);
      sidebar.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const fetchPlayerInfo = async (playerId: string) => {
    try {
      const supabase = createClient();
      const { data: player, error } = await supabase
        .from('players')
        .select('id, first_name, last_name')
        .eq('id', playerId)
        .single();
      
      if (player && !error) {
        const playerInfo = {
          id: player.id,
          name: `${player.first_name} ${player.last_name}`
        };
        setSelectedPlayer(playerInfo);
        localStorage.setItem('selectedPlayer', JSON.stringify(playerInfo));
      }
    } catch (error) {
      console.error('Error fetching player info:', error);
    }
  };

  // Nav link: icon always visible and centered, label never causes scroll
  const renderLink = (link: any, index: number) => {
    const isActive = pathname === link.href;
    return (
      <Link
        href={link.href}
        key={index}
        className="group/nav flex items-center h-12 w-full my-1 rounded-lg hover:bg-zinc-800 transition-all duration-200 relative overflow-x-hidden"
        aria-label={link.label}
      >
        {/* Icon always visible, centered */}
        <span className="w-12 h-12 flex items-center justify-center">
          <link.icon className={`w-6 h-6 ${isActive ? "text-[#C2B56B]" : "text-zinc-400 group-hover/nav:text-[#C2B56B]"}`} />
        </span>
        {/* Label: absolutely never takes up space when collapsed */}
        <span
          className={`
            ml-3 whitespace-nowrap transition-all duration-200
            max-w-0 group-hover/sidebar:max-w-xs
            overflow-hidden group-hover/sidebar:overflow-visible
            opacity-0 group-hover/sidebar:opacity-100
          `}
        >
          {link.label}
        </span>
      </Link>
    );
  };

  // Quick action button: same bulletproof pattern
  const renderQuickActionLink = (link: any, index: number) => {
    const isDisabled = (link.action === 'addObservation' || link.action === 'addPDP') && !selectedPlayer;
    return (
      <button
        key={index}
        onClick={() => handleQuickAction(link.action)}
        disabled={isDisabled}
        aria-label={link.label}
        className={`group/nav flex items-center h-12 w-full my-1 rounded-lg transition-colors relative overflow-x-hidden
          ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-800"}
        `}
        title={isDisabled ? "Select a player first" : link.label}
      >
        <span className="w-12 h-12 flex items-center justify-center">
          <link.icon className={`w-6 h-6 ${isDisabled ? "text-zinc-600" : "text-[#C2B56B]"}`} />
        </span>
        <span
          className={`
            ml-3 whitespace-nowrap transition-all duration-200
            max-w-0 group-hover/sidebar:max-w-xs
            overflow-hidden group-hover/sidebar:overflow-visible
            opacity-0 group-hover/sidebar:opacity-100
          `}
        >
          {link.label}
        </span>
      </button>
    );
  };

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'addPlayer':
        setAddPlayerOpen(true);
        break;
      case 'addCoach':
        setAddCoachOpen(true);
        break;
      case 'addObservation':
        if (selectedPlayer) {
          setAddObservationOpen(true);
        } else {
          toast.error("Please select a player first to add an observation");
        }
        break;
      case 'addPDP':
        if (selectedPlayer) {
          setCreatePDPOpen(true);
        } else {
          toast.error("Please select a player first to create a PDP");
        }
        break;
    }
  };

  const handleAddCoachSubmit = async () => {
    if (!coachForm.firstName.trim() || !coachForm.lastName.trim() || !coachForm.email.trim()) {
      toast.error("All fields are required");
      return;
    }

    setCoachLoading(true);
    try {
      const supabase = createClient();
      
      // For now, just show a success message since coach creation might require admin privileges
      toast.success("Coach creation functionality coming soon!");
      setAddCoachOpen(false);
      setCoachForm({ firstName: "", lastName: "", email: "" });
    } catch (error) {
      toast.error("Failed to add coach");
    } finally {
      setCoachLoading(false);
    }
  };

  const handleObservationAdded = () => {
    setAddObservationOpen(false);
    toast.success("Observation added successfully!");
  };

  const handlePDPCreated = () => {
    setCreatePDPOpen(false);
    toast.success("PDP created successfully!");
  };

  return (
    <div className="flex flex-col h-full group">
      {/* Nav items (scrollable) */}
      <div className="flex-1 overflow-y-auto pt-6">
        {mainNavLinks.map(renderLink)}
      </div>
      
      {/* Selected Player Indicator */}
      {selectedPlayer && (
        <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950">
          <div className="text-xs text-zinc-400 mb-1">Selected Player:</div>
          <div className="text-sm text-[#C2B56B] font-medium truncate">
            {selectedPlayer.name}
          </div>
        </div>
      )}
      
      {/* Quick Actions Section (no header) */}
      <div className="bg-zinc-950">
        {/* Thin minimal divider, no mx-2 */}
        <div className="border-t border-zinc-800 my-2" />
        <div className="pb-4">
          {quickActionLinks.map(renderQuickActionLink)}
        </div>
      </div>

      {/* Add Player Modal */}
      {addPlayerOpen && (
        <AddPlayerModal 
          onPlayerAdded={() => {
            setAddPlayerOpen(false);
          }}
        />
      )}
      
      {/* Add Coach Modal */}
      <Dialog open={addCoachOpen} onOpenChange={setAddCoachOpen}>
        <DialogContent className="bg-[#181818] border border-[#d8cc97]/30 rounded-2xl shadow-2xl px-8 py-7 w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-center mb-4 bg-gradient-to-r from-[#d8cc97] via-[#d8cc97] to-[#d8cc97] bg-clip-text text-transparent">
              Add New Coach
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label htmlFor="coach_first_name" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
                First Name *
              </label>
              <Input
                id="coach_first_name"
                placeholder="e.g., John"
                value={coachForm.firstName}
                onChange={e => setCoachForm(prev => ({ ...prev, firstName: e.target.value }))}
                className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="coach_last_name" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
                Last Name *
              </label>
              <Input
                id="coach_last_name"
                placeholder="e.g., Smith"
                value={coachForm.lastName}
                onChange={e => setCoachForm(prev => ({ ...prev, lastName: e.target.value }))}
                className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="coach_email" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
                Email *
              </label>
              <Input
                id="coach_email"
                type="email"
                placeholder="e.g., john.smith@example.com"
                value={coachForm.email}
                onChange={e => setCoachForm(prev => ({ ...prev, email: e.target.value }))}
                className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setAddCoachOpen(false)}
                className="flex-1 border-[#d8cc97]/30 text-[#d8cc97] hover:bg-[#d8cc97]/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCoachSubmit}
                disabled={coachLoading || !coachForm.firstName.trim() || !coachForm.lastName.trim() || !coachForm.email.trim()}
                className="flex-1 bg-[#d8cc97] text-black hover:bg-[#d8cc97]/80 disabled:opacity-50"
              >
                {coachLoading ? "Adding..." : "Add Coach"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Observation Modal */}
      {selectedPlayer && (
        <AddObservationModal
          open={addObservationOpen}
          onClose={() => setAddObservationOpen(false)}
          player={selectedPlayer}
          onObservationAdded={handleObservationAdded}
        />
      )}

      {/* Create PDP Modal */}
      {selectedPlayer && (
        <CreatePDPModal
          open={createPDPOpen}
          onClose={() => setCreatePDPOpen(false)}
          player={selectedPlayer}
          coachId={undefined}
          onCreated={handlePDPCreated}
        />
      )}
    </div>
  );
} 