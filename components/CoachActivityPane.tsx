"use client";

import { useState, useEffect } from "react";
import { Activity, Clock, FileText, Users, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  active: boolean;
  created_at: string;
  team_id?: string;
  team_name?: string;
}

interface CoachActivityPaneProps {
  coach: Coach | null;
}

interface ActivityItem {
  id: string;
  type: 'login' | 'player_edit' | 'observation_add' | 'team_edit';
  description: string;
  timestamp: string;
  metadata?: any;
}

export default function CoachActivityPane({ coach }: CoachActivityPaneProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (coach) {
      fetchCoachActivity();
    } else {
      setActivities([]);
    }
  }, [coach]);

  const fetchCoachActivity = async () => {
    if (!coach) return;

    try {
      setLoading(true);
      
      // For now, we'll create mock activity data
      // In a real implementation, you'd query your activity/audit logs
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'login',
          description: 'Logged into the system',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        },
        {
          id: '2',
          type: 'player_edit',
          description: 'Updated player profile: John Smith',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: '3',
          type: 'observation_add',
          description: 'Added new observation for player: Mike Johnson',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        },
        {
          id: '4',
          type: 'team_edit',
          description: 'Updated team settings',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error('Error fetching coach activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <Activity className="w-4 h-4 text-blue-400" />;
      case 'player_edit':
        return <Users className="w-4 h-4 text-green-400" />;
      case 'observation_add':
        return <FileText className="w-4 h-4 text-gold" />;
      case 'team_edit':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      default:
        return <Activity className="w-4 h-4 text-zinc-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  if (!coach) {
    return (
      <div className="bg-zinc-900 rounded-lg p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-400 mb-2">
            Coach Activity
          </h3>
          <p className="text-sm text-zinc-500">
            Select a coach to view their activity
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-gold" />
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-zinc-400">Loading activity...</div>
        </div>
      ) : activities.length === 0 ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <div className="text-zinc-400 text-sm">No recent activity</div>
            <div className="text-zinc-500 text-xs mt-1">
              Activity tracking coming soon
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-zinc-800 rounded-lg"
            >
              <div className="mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white mb-1">
                  {activity.description}
                </div>
                <div className="text-xs text-zinc-400">
                  {formatTimestamp(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Future Features Section */}
      <div className="mt-6 pt-6 border-t border-zinc-800">
        <h4 className="text-sm font-medium text-zinc-300 mb-3">Coming Soon</h4>
        <div className="space-y-2 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-zinc-600 rounded-full" />
            <span>Detailed activity logs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-zinc-600 rounded-full" />
            <span>Coach performance metrics</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-zinc-600 rounded-full" />
            <span>Team management history</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-zinc-600 rounded-full" />
            <span>Login session tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
} 