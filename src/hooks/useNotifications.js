import { useEffect, useRef } from "react";
import { db } from "@/api/supabaseClient";

export function useNotifications(playerEmail, playerName) {
  const notifiedIdsRef = useRef(new Set());

  useEffect(() => {
    if (!playerEmail) return;

    // Subscribe to trade requests
    const unsubscribeTrades = db.entities.Trade.subscribe((event) => {
      if (event.type === "create" && event.data) {
        const trade = event.data;
        const notificationId = `trade_${trade.id}`;

        if (!notifiedIdsRef.current.has(notificationId)) {
          if (trade.recipient_email === playerEmail) {
            notifiedIdsRef.current.add(notificationId);
            alert(
              `🤝 Trade Request from ${trade.initiator_name}\n\nThey want to trade items with you. Check the trading window for details.`
            );
          }
        }
      }
    });

    // Subscribe to messages (including party requests and coop invites)
    const unsubscribeMessages = db.entities.PlayerMessage.subscribe((event) => {
      if (event.type === "create" && event.data) {
        const message = event.data;
        const notificationId = `message_${message.id}`;

        if (!notifiedIdsRef.current.has(notificationId)) {
          if (message.to_email === playerEmail && !message.read) {
            notifiedIdsRef.current.add(notificationId);

            let title = "💬 New Message";
            let content = `From ${message.from_name}: ${message.content.substring(0, 50)}...`;

            if (message.message_type === "party_request") {
              title = "⚔️ Party Request";
              content = `${message.from_name} invited you to join their party!`;
            } else if (message.message_type === "coop_invite") {
              title = "🤝 Co-op Invite";
              content = `${message.from_name} invited you for co-op gameplay!`;
            }

            alert(`${title}\n\n${content}`);
          }
        }
      }
    });

    // Subscribe to world boss events
    const unsubscribeBoss = db.entities.WorldBoss.subscribe((event) => {
      if (event.type === "create" && event.data) {
        const boss = event.data;
        const notificationId = `boss_${boss.id}`;

        if (!notifiedIdsRef.current.has(notificationId)) {
          if (boss.is_active) {
            notifiedIdsRef.current.add(notificationId);
            alert(
              `🐉 WORLD BOSS EVENT STARTED!\n\n${boss.boss_name} has spawned!\n\nGather your strength and join the battle. This boss will despawn in 30 minutes.`
            );
          }
        }
      }
    });

    // Cleanup
    return () => {
      unsubscribeTrades();
      unsubscribeMessages();
      unsubscribeBoss();
    };
  }, [playerEmail]);
}