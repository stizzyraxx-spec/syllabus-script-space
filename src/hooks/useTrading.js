import { useState, useCallback } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useTrading(playerEmail) {
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState([]);

  // Fetch active trades for player
  const { data: activeTrades } = useQuery({
    queryKey: ["active-trades", playerEmail],
    queryFn: () =>
      db.entities.Trade.filter({
        $or: [
          { initiator_email: playerEmail },
          { recipient_email: playerEmail },
        ],
      }).then((trades) =>
        trades.filter(
          (t) => t.status !== "completed" && t.status !== "cancelled"
        )
      ),
    refetchInterval: 2000,
  });

  // Create trade mutation
  const createTradeMutation = useMutation({
    mutationFn: async ({ recipientEmail, recipientName, initiatorItems }) => {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      return await db.entities.Trade.create({
        initiator_email: playerEmail,
        initiator_name: playerEmail.split("@")[0],
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        initiator_items: initiatorItems,
        recipient_items: [],
        status: "pending",
        expires_at: expiresAt.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-trades", playerEmail] });
      setSelectedItems([]);
    },
  });

  // Update trade mutation
  const updateTradeMutation = useMutation({
    mutationFn: async ({ tradeId, recipientItems, isInitiator, confirmed }) => {
      const updateData = isInitiator
        ? { initiator_confirmed: confirmed }
        : { recipient_items: recipientItems, recipient_confirmed: confirmed };

      return await db.entities.Trade.update(tradeId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-trades", playerEmail] });
    },
  });

  // Complete trade mutation
  const completeTradeMutation = useMutation({
    mutationFn: async ({ tradeId, trade }) => {
      if (!trade.initiator_confirmed || !trade.recipient_confirmed) {
        throw new Error("Both parties must confirm");
      }

      // Execute trade - move items between inventories
      const initiatorInventory = await db.entities.PlayerInventory.filter({
        player_email: trade.initiator_email,
      });

      const recipientInventory = await db.entities.PlayerInventory.filter({
        player_email: trade.recipient_email,
      });

      // Move initiator items to recipient
      for (const item of trade.initiator_items) {
        const existing = initiatorInventory.find(
          (inv) => inv.item_id === item.item_id
        );
        if (existing) {
          await db.entities.PlayerInventory.update(existing.id, {
            quantity: Math.max(0, (existing.quantity || 1) - item.quantity),
          });
        }

        const recipientItem = recipientInventory.find(
          (inv) => inv.item_id === item.item_id
        );
        if (recipientItem) {
          await db.entities.PlayerInventory.update(recipientItem.id, {
            quantity: (recipientItem.quantity || 1) + item.quantity,
          });
        } else {
          await db.entities.PlayerInventory.create({
            player_email: trade.recipient_email,
            item_id: item.item_id,
            quantity: item.quantity,
          });
        }
      }

      // Move recipient items to initiator
      for (const item of trade.recipient_items) {
        const existing = recipientInventory.find(
          (inv) => inv.item_id === item.item_id
        );
        if (existing) {
          await db.entities.PlayerInventory.update(existing.id, {
            quantity: Math.max(0, (existing.quantity || 1) - item.quantity),
          });
        }

        const initiatorItem = initiatorInventory.find(
          (inv) => inv.item_id === item.item_id
        );
        if (initiatorItem) {
          await db.entities.PlayerInventory.update(initiatorItem.id, {
            quantity: (initiatorItem.quantity || 1) + item.quantity,
          });
        } else {
          await db.entities.PlayerInventory.create({
            player_email: trade.initiator_email,
            item_id: item.item_id,
            quantity: item.quantity,
          });
        }
      }

      // Mark trade as completed
      await db.entities.Trade.update(tradeId, { status: "completed" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-trades", playerEmail] });
    },
  });

  // Cancel trade mutation
  const cancelTradeMutation = useMutation({
    mutationFn: async (tradeId) => {
      return await db.entities.Trade.update(tradeId, {
        status: "cancelled",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-trades", playerEmail] });
    },
  });

  return {
    activeTrades: activeTrades || [],
    selectedItems,
    setSelectedItems,
    createTrade: createTradeMutation.mutate,
    updateTrade: updateTradeMutation.mutate,
    completeTrade: completeTradeMutation.mutate,
    cancelTrade: cancelTradeMutation.mutate,
    isLoading:
      createTradeMutation.isPending ||
      updateTradeMutation.isPending ||
      completeTradeMutation.isPending,
  };
}