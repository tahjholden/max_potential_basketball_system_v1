"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import dynamic from "next/dynamic";

// Import modal components
const AddPlayerModal = dynamic(() => import("@/app/protected/players/AddPlayerModal"), { ssr: false });
const AddObservationModal = dynamic(() => import("@/app/protected/players/AddObservationModal"), { ssr: false });
const CreatePDPModal = dynamic(() => import("@/components/CreatePDPModal"), { ssr: false });
import AddCoachModal from "@/components/AddCoachModal";

import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
const AddTeamModal = dynamic(() => import("@/components/AddTeamModal"), { ssr: false });

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
];

const quickActionLinks = [
  { label: "Add Player", icon: UserPlus, action: "addPlayer" },
  { label: "Add Coach", icon: UserCog, action: "addCoach" },
  { label: "Add Team", icon: Building2, action: "addTeam" },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Modal state management
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [addCoachOpen, setAddCoachOpen] = useState(false);
  const [addObservationOpen, setAddObservationOpen] = useState(false);
  const [createPDPOpen, setCreatePDPOpen] = useState(false);
  const [addTeamOpen, setAddTeamOpen] = useState(false);
  
  // Player context state
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string } | null>(null);
  
  // Form states


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
      case 'addTeam':
        setAddTeamOpen(true);
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
          open={addPlayerOpen}
          onClose={() => setAddPlayerOpen(false)}
          onPlayerAdded={() => {
            setAddPlayerOpen(false);
            toast.success("Player added successfully!", { style: { background: '#d8cc97', color: '#181818', fontWeight: 'bold' } });
            router.refresh();
          }}
        />
      )}
      
      {/* Add Coach Modal */}
      {addCoachOpen && (
        <AddCoachModal
          open={addCoachOpen}
          onClose={() => setAddCoachOpen(false)}
          onCoachAdded={() => {
            setAddCoachOpen(false);
            toast.success("Coach added successfully!", { style: { background: '#d8cc97', color: '#181818', fontWeight: 'bold' } });
            router.refresh();
          }}
        />
      )}

      {/* Add Observation Modal */}
      {selectedPlayer && addObservationOpen && (
        <AddObservationModal
          open={addObservationOpen}
          onClose={() => setAddObservationOpen(false)}
          player={selectedPlayer}
          onObservationAdded={handleObservationAdded}
        />
      )}

      {/* Create PDP Modal */}
      {selectedPlayer && createPDPOpen && (
        <CreatePDPModal
          open={createPDPOpen}
          onClose={() => setCreatePDPOpen(false)}
          player={selectedPlayer}
          coachId={undefined}
          onCreated={handlePDPCreated}
        />
      )}

      {/* Add Team Modal */}
      {addTeamOpen && (
        <AddTeamModal
          open={addTeamOpen}
          onClose={() => setAddTeamOpen(false)}
          onTeamAdded={() => {
            setAddTeamOpen(false);
            toast.success("Team added successfully!", { style: { background: '#d8cc97', color: '#181818', fontWeight: 'bold' } });
            router.refresh();
          }}
        />
      )}
    </div>
  );
} 