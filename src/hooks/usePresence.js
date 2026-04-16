import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function usePresence(roomId = 'global') {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let channel;

    const setupPresence = async () => {
      if (!user) return;

      // 1. Fetch user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, avatar_color')
        .eq('id', user.id)
        .single();

      if (userProfile) {
        setProfile(userProfile);
      }

      // Fallback name if no profile found
      const finalName = userProfile?.full_name || user.email?.split('@')[0] || 'Unknown User';
      const finalColor = userProfile?.avatar_color || '#1a27c9';

      const topic = `presence:${roomId}`;

      // Clean up existing channels with the same name (React Strict Mode fix)
      const existing = supabase.getChannels().filter(c => c.topic === `realtime:${topic}`);
      for (const c of existing) {
        supabase.removeChannel(c);
      }

      // 2. Setup Supabase Channel
      channel = supabase.channel(topic, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const usersOnline = [];
          for (const id in state) {
            usersOnline.push(state[id][0]);
          }
          setActiveUsers(usersOnline);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: user.id,
              full_name: finalName,
              avatar_color: finalColor,
              online_at: new Date().toISOString(),
            });
          }
        });
    };

    setupPresence();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, roomId]);

  return { activeUsers, profile };
}
