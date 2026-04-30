import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function usePresence(roomId = 'global') {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState([]);
  const [profile, setProfile] = useState(null);
  // Use a ref to hold the channel so cleanup can always access the latest value
  const channelRef = useRef(null);

  useEffect(() => {
    // Guard flag: prevents state updates and channel tracking after unmount
    let isMounted = true;

    const setupPresence = async () => {
      if (!user) return;

      // 1. Fetch user profile safely
      let userProfile = null;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_color')
          .eq('id', user.id)
          .maybeSingle();
          
        if (!error && data) {
          userProfile = data;
        }
      } catch (err) {
        console.warn('Could not fetch user profile for presence:', err);
      }

      // Bail out if component unmounted while we were fetching
      if (!isMounted) return;

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
        await supabase.removeChannel(c);
      }

      // Bail out again in case unmount happened during channel cleanup
      if (!isMounted) return;

      // 2. Setup Supabase Channel
      const channel = supabase.channel(topic, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      // Store in ref immediately so cleanup can access it
      channelRef.current = channel;

      channel
        .on('presence', { event: 'sync' }, () => {
          if (!isMounted) return;
          const state = channel.presenceState();
          const usersOnline = [];
          for (const id in state) {
            usersOnline.push(state[id][0]);
          }
          setActiveUsers(usersOnline);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && isMounted) {
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
      // Mark as unmounted to stop any in-flight async operations
      isMounted = false;

      // Safely remove the channel if it was created
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, roomId]);

  return { activeUsers, profile };
}
