import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, User, Calendar, FileText, Archive } from "lucide-react";
import ArchivedPDPsList from "@/components/ArchivedPDPsList";
import ArchivePDPButton from "@/components/ArchivePDPButton";
import ArchiveCreateNewModal from "@/components/ArchiveCreateNewModal";
import { getArchivedPDPsWithObservations } from "@/lib/archivePDPAndObservations";

interface PlayerDetailPageProps {
  params: { id: string };
}

export default async function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // Get coach data for org_id
  const { data: coachData } = await supabase
    .from("coaches")
    .select("org_id")
    .eq("auth_uid", user.id)
    .single();

  if (!coachData?.org_id) {
    redirect("/protected");
  }

  const orgId = coachData.org_id;

  // Get player data
  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("id", params.id)
    .eq("org_id", orgId)
    .single();

  if (playerError || !player) {
    redirect("/protected/players");
  }

  // Get current active PDP
  const { data: currentPDP } = await supabase
    .from("pdp")
    .select(`
      id,
      content,
      start_date,
      end_date,
      created_at,
      created_by,
      coaches!pdp_created_by_fkey (
        first_name,
        last_name
      )
    `)
    .eq("player_id", params.id)
    .eq("org_id", orgId)
    .is("archived_at", null)
    .single();

  // Get current observations
  const { data: currentObservations } = await supabase
    .from("observations")
    .select(`
      id,
      content,
      observation_date,
      created_at,
      created_by,
      coaches!observations_created_by_fkey (
        first_name,
        last_name
      )
    `)
    .eq("player_id", params.id)
    .eq("org_id", orgId)
    .is("archived_at", null)
    .order("observation_date", { ascending: false });

  const getCoachName = (coaches?: { first_name: string; last_name: string }[]) => {
    if (!coaches || coaches.length === 0) return "Unknown Coach";
    const coach = coaches[0];
    return `${coach.first_name} ${coach.last_name}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM do, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Player Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#C2B56B]">{player.name}</h1>
          <p className="text-zinc-400">Player ID: {player.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-zinc-400" />
          <span className="text-zinc-300">Active Player</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Development Plan */}
        <Card className="bg-zinc-800 border border-zinc-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#C2B56B]" />
              <h2 className="text-xl font-semibold text-[#C2B56B]">Current Development Plan</h2>
            </div>
            {currentPDP && (
              <ArchivePDPButton
                pdpId={currentPDP.id}
                playerId={player.id}
                playerName={player.name}
                variant="outline"
                size="sm"
              />
            )}
          </div>

          {currentPDP ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Started: {formatDate(currentPDP.start_date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>by {getCoachName(currentPDP.coaches)}</span>
                </div>
              </div>
              <div className="bg-zinc-900 p-4 rounded border border-zinc-700">
                <p className="text-zinc-300 whitespace-pre-wrap">{currentPDP.content}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#C2B56B] mb-2">No Active Plan</h3>
              <p className="text-zinc-400 text-sm mb-4">
                This player doesn't have an active development plan.
              </p>
              <ArchiveCreateNewModal
                playerId={player.id}
                open={false}
                onClose={() => {}}
                onSuccess={() => {}}
              />
            </div>
          )}
        </Card>

        {/* Current Observations */}
        <Card className="bg-zinc-800 border border-zinc-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#C2B56B]" />
              <h2 className="text-xl font-semibold text-[#C2B56B]">
                Current Observations ({currentObservations?.length || 0})
              </h2>
            </div>
          </div>

          {currentObservations && currentObservations.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {currentObservations.map((observation: any) => (
                <div key={observation.id} className="bg-zinc-900 p-3 rounded border border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400">
                      {formatDate(observation.observation_date || observation.created_at)}
                    </span>
                    <span className="text-xs text-zinc-500">
                      by {getCoachName(observation.coaches)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300">{observation.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">No current observations</p>
            </div>
          )}
        </Card>

        {/* Archived Development Plan Archive */}
        <div className="lg:col-span-2">
          {player.id && orgId ? (
            <ArchivedPDPsList playerId={player.id} orgId={orgId} />
          ) : (
            <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-400 text-center">
              Select a player to view archived plans.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 