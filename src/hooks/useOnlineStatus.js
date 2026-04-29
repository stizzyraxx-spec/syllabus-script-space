import { useEffect, useCallback } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useOnlineStatus(playerEmail, playerName, characterId, level, location) {
  const queryClient = useQueryClient();

  // Create/update active player status
  const updateStatusMutation = useMutation({
    mutationFn: async (statusData) => {
      const existing = await db.entities.ActivePlayer.filter({
        player_email: playerEmail,
      });

      if (existing && existing.length > 0) {
        await db.entities.ActivePlayer.update(existing[0].id, {
          ...statusData,
          last_active: new Date().toISOString(),
        });
      } else {
        await db.entities.ActivePlayer.create({
          player_email: playerEmail,
          ...statusData,
          is_online: true,
          last_active: new Date().toISOString(),
        });
      }
    },
  });

  // Update status every 10 seconds and on location/level change
  useEffect(() => {
    updateStatusMutation.mutate({
      player_name: playerName,
      character_id: characterId,
      level,
      location,
    });

    const interval = setInterval(() => {
      updateStatusMutation.mutate({
        player_name: playerName,
        character_id: characterId,
        level,
        location,
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [playerEmail, playerName, characterId, level, location]);

  // Go offline on unmount
  const goOffline = useCallback(async () => {
    const existing = await db.entities.ActivePlayer.filter({
      player_email: playerEmail,
    });
    if (existing && existing.length > 0) {
      await db.entities.ActivePlayer.update(existing[0].id, {
        is_online: false,
      });
    }
  }, [playerEmail]);

  useEffect(() => {
    return () => goOffline();
  }, []);

  return { goOffline };
}

export function useOnlinePlayers() {
  // Fetch online players
  const { data: onlinePlayers } = useQuery({
    queryKey: ["online-players"],
    queryFn: () =>
      db.entities.ActivePlayer.filter({
        is_online: true,
      }),
    refetchInterval: 15000, // Update every 15 seconds
  });

  // Mark as offline if last_active is older than 30 seconds
  const getActiveOnlinePlayers = useCallback(() => {
    if (!onlinePlayers) return [];
    const now = new Date();
    return onlinePlayers.filter((player) => {
      const lastActive = new Date(player.last_active);
      const secondsAgo = (now - lastActive) / 1000;
      return secondsAgo < 30 && player.is_online;
    });
  }, [onlinePlayers]);

  return { onlinePlayers: getActiveOnlinePlayers() };
}