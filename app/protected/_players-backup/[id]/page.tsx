import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ObservationCard from "../ObservationCard";
import { Accordion } from "@/components/ui/accordion";
import Link from "next/link";
import PlayerDetailActions from "./PlayerDetailActions";

export default async function PlayerDetailPage({ params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      redirect("/auth/login");
    }

    // Fetch player data
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("id", params.id)
      .single();

    if (playerError || !player) {
      notFound();
    }

    // Fetch current (active) PDP for this player
    const { data: currentPDP } = await supabase
      .from("pdp")
      .select(`
        id,
        content,
        created_at,
        start_date,
        end_date,
        coach_id,
        coaches(first_name, last_name)
      `)
      .eq("player_id", params.id)
      .is("archived_at", null) // Active PDP
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Fetch recent observations (10-15 most recent)
    const { data: recentObservations } = await supabase
      .from("observations")
      .select(`
        id,
        content,
        observation_date,
        created_at,
        coach_id,
        pdp_id,
        coaches(first_name, last_name)
      `)
      .eq("player_id", params.id)
      .order("created_at", { ascending: false })
      .limit(15);

    // Fetch archived PDPs with their observations
    const { data: archivedPDPs } = await supabase
      .from("pdp")
      .select(`
        id,
        content,
        created_at,
        archived_at,
        start_date,
        end_date,
        coach_id,
        coaches(first_name, last_name)
      `)
      .eq("player_id", params.id)
      .not("archived_at", "is", null) // Archived PDPs
      .order("created_at", { ascending: false });

    // For each archived PDP, fetch its observations
    const archivedPDPsWithObservations = await Promise.all(
      (archivedPDPs || []).map(async (pdp) => {
        const { data: pdpObservations } = await supabase
          .from("observations")
          .select(`
            id,
            content,
            observation_date,
            created_at,
            coach_id,
            coaches(first_name, last_name)
          `)
          .eq("pdp_id", pdp.id)
          .order("created_at", { ascending: false });

        return {
          ...pdp,
          observations: pdpObservations || []
        };
      })
    );

    const formatDate = (dateString: string) => {
      if (!dateString) return "N/A";
      try {
        return new Date(dateString).toLocaleDateString();
      } catch (e) {
        return "N/A";
      }
    };

    const getCoachName = (coach: any) => {
      if (!coach) return "Unknown Coach";
      return `${coach.first_name || ""} ${coach.last_name || ""}`.trim() || "Unknown Coach";
    };

    return (
      <div className="p-6 bg-[#0f172a] min-h-screen font-sans text-white space-y-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <a 
              href="/protected/players" 
              className="inline-flex items-center text-oldgold hover:text-[color:var(--color-old-gold-light)] transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Players
            </a>
          </div>
          
          {/* Player Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-oldgold">{player.name}</h1>
            {player.position && (
              <p className="text-gray-400 text-sm">Position: {player.position}</p>
            )}
            <p className="text-gray-500 text-xs">Member since {formatDate(player.created_at)}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/protected/players"
              className="bg-oldgold text-black px-4 py-2 rounded font-bold hover:bg-[color:var(--color-old-gold-light)] transition-colors"
            >
              + Add Observation
            </Link>
            <PlayerDetailActions player={player} currentUser={user} />
            <Link
              href="/protected/observations"
              className="bg-slate-700 text-white px-4 py-2 rounded font-bold hover:bg-slate-600 transition-colors border border-slate-600"
            >
              View All Observations
            </Link>
          </div>

          {/* Current PDP */}
          {currentPDP ? (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-600 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-oldgold">
                  Current PDP ({formatDate(currentPDP.created_at)})
                </h2>
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Active
                </span>
              </div>
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <p className="text-gray-200 whitespace-pre-wrap">{currentPDP.content}</p>
                <p className="text-gray-500 text-xs mt-2">
                  Coach: {getCoachName(currentPDP.coaches)}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-600 shadow-md">
              <h2 className="text-xl font-semibold text-oldgold mb-4">Current PDP</h2>
              <p className="text-gray-400">No active PDP. Create one to get started.</p>
            </div>
          )}

          {/* Recent Observations */}
          <section>
            <h2 className="text-xl font-semibold text-oldgold mb-4">
              Recent Observations ({recentObservations?.length || 0})
            </h2>
            {recentObservations && recentObservations.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentObservations.map((obs) => (
                  <ObservationCard 
                    key={obs.id}
                    id={obs.id}
                    player_name={player.name}
                    date={obs.observation_date || obs.created_at}
                    content={obs.content}
                    coach_name={getCoachName(obs.coaches)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No observations yet.</p>
            )}
          </section>

          {/* Archived PDPs with Accordion */}
          {archivedPDPsWithObservations.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-oldgold mb-4">
                Archived Development Plans ({archivedPDPsWithObservations.length})
              </h2>
              <div className="space-y-4">
                {archivedPDPsWithObservations.map((pdp) => (
                  <Accordion
                    key={pdp.id}
                    title={`PDP from ${formatDate(pdp.created_at)} - Archived ${formatDate(pdp.archived_at)}`}
                    defaultOpen={false}
                  >
                    <div className="space-y-4">
                      {/* PDP Content */}
                      <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-oldgold font-semibold">Development Plan</h4>
                          <span className="text-gray-500 text-xs">
                            Coach: {getCoachName(pdp.coaches)}
                          </span>
                        </div>
                        <p className="text-gray-200 whitespace-pre-wrap text-sm">{pdp.content}</p>
                      </div>
                      
                      {/* Observations in this PDP */}
                      {pdp.observations.length > 0 && (
                        <div>
                          <h4 className="text-oldgold font-semibold mb-3">
                            Observations in this PDP ({pdp.observations.length})
                          </h4>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pdp.observations.map((obs) => (
                              <ObservationCard 
                                key={obs.id}
                                id={obs.id}
                                player_name={player.name}
                                date={obs.observation_date || obs.created_at}
                                content={obs.content}
                                coach_name={getCoachName(obs.coaches)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {pdp.observations.length === 0 && (
                        <p className="text-gray-400 text-sm italic">No observations linked to this PDP.</p>
                      )}
                    </div>
                  </Accordion>
                ))}
              </div>
            </section>
          )}

          {/* Empty State for Archived PDPs */}
          {archivedPDPsWithObservations.length === 0 && (
            <section>
              <h2 className="text-xl font-semibold text-oldgold mb-4">Archived Development Plans</h2>
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-600 text-center">
                <p className="text-gray-400">No archived PDPs yet.</p>
                <p className="text-gray-500 text-sm mt-2">When you create a new PDP, the previous one will be archived here.</p>
              </div>
            </section>
          )}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-6 bg-[#0f172a] min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-600">
            <h1 className="text-2xl text-oldgold font-bold mb-4">Error</h1>
            <p className="text-red-400">Something went wrong: {(error as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }
} 