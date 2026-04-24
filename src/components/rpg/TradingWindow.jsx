import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Package, AlertCircle } from "lucide-react";
import { useTrading } from "@/hooks/useTrading";

export default function TradingWindow({
  playerEmail,
  otherPlayerEmail,
  otherPlayerName,
  onClose,
}) {
  const [myItems, setMyItems] = useState([]);
  const [theirItems, setTheirItems] = useState([]);
  const [activeTab, setActiveTab] = useState("my"); // my or their
  const { activeTrades, updateTrade, completeTrade, cancelTrade } =
    useTrading(playerEmail);

  // Fetch player inventory
  const { data: myInventory } = useQuery({
    queryKey: ["inventory", playerEmail],
    queryFn: () =>
      base44.entities.PlayerInventory.filter({
        player_email: playerEmail,
      }),
  });

  // Fetch other player inventory (visible items only)
  const { data: theirInventory } = useQuery({
    queryKey: ["inventory", otherPlayerEmail],
    queryFn: () =>
      base44.entities.PlayerInventory.filter({
        player_email: otherPlayerEmail,
      }),
  });

  // Fetch items data
  const { data: items } = useQuery({
    queryKey: ["items"],
    queryFn: () => base44.entities.Item.list(),
  });

  // Find active trade between these two players
  const activeTrade = activeTrades.find(
    (t) =>
      (t.initiator_email === playerEmail &&
        t.recipient_email === otherPlayerEmail) ||
      (t.initiator_email === otherPlayerEmail &&
        t.recipient_email === playerEmail)
  );

  const isInitiator = activeTrade?.initiator_email === playerEmail;
  const myConfirmed = isInitiator
    ? activeTrade?.initiator_confirmed
    : activeTrade?.recipient_confirmed;
  const theirConfirmed = isInitiator
    ? activeTrade?.recipient_confirmed
    : activeTrade?.initiator_confirmed;

  const toggleItem = (itemId, isMyItem) => {
    if (isMyItem) {
      setMyItems((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
    } else {
      setTheirItems((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
    }
  };

  const getItemDetails = (itemId) => {
    return items?.find((item) => item.id === itemId);
  };

  const handleConfirm = () => {
    if (!activeTrade) return;
    updateTrade({
      tradeId: activeTrade.id,
      recipientItems: theirItems.map((id) => ({
        item_id: id,
        item_name: getItemDetails(id)?.name || id,
        quantity: 1,
      })),
      isInitiator,
      confirmed: true,
    });
  };

  const handleExecuteTrade = () => {
    if (!activeTrade) return;
    completeTrade({ tradeId: activeTrade.id, trade: activeTrade });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border-2 border-accent rounded-2xl max-w-2xl w-full max-h-96 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-accent/20">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Trade with {otherPlayerName}
            </h2>
            {activeTrade && (
              <p className="text-xs text-muted-foreground mt-1">
                Status: {activeTrade.status}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trade Interface */}
        <div className="flex-1 overflow-hidden flex gap-4 p-4">
          {/* My Items */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-accent" />
              <h3 className="font-semibold text-foreground">My Offer</h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 border border-accent/20 rounded-lg p-3 bg-white/5">
              {myInventory && myInventory.length > 0 ? (
                myInventory.map((inv) => {
                  const item = getItemDetails(inv.item_id);
                  return (
                    <button
                      key={inv.id}
                      onClick={() => toggleItem(inv.item_id, true)}
                      className={`w-full p-2 rounded-lg text-left transition-all ${
                        myItems.includes(inv.item_id)
                          ? "bg-accent/30 border border-accent"
                          : "bg-white/5 border border-white/10 hover:border-accent/50"
                      }`}
                      disabled={!!activeTrade}
                    >
                      <p className="font-semibold text-sm text-foreground">
                        {item?.name || inv.item_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {inv.quantity || 1}
                      </p>
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No items to trade
                </p>
              )}
            </div>
          </div>

          {/* Their Items */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-accent" />
              <h3 className="font-semibold text-foreground">Their Offer</h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 border border-accent/20 rounded-lg p-3 bg-white/5">
              {theirInventory && theirInventory.length > 0 ? (
                theirInventory.map((inv) => {
                  const item = getItemDetails(inv.item_id);
                  return (
                    <button
                      key={inv.id}
                      onClick={() => toggleItem(inv.item_id, false)}
                      className={`w-full p-2 rounded-lg text-left transition-all ${
                        theirItems.includes(inv.item_id)
                          ? "bg-accent/30 border border-accent"
                          : "bg-white/5 border border-white/10 hover:border-accent/50"
                      }`}
                      disabled={!!activeTrade}
                    >
                      <p className="font-semibold text-sm text-foreground">
                        {item?.name || inv.item_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {inv.quantity || 1}
                      </p>
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No items available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Status */}
        {activeTrade && (
          <div className="px-4 py-3 border-t border-accent/20 bg-white/5">
            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    myConfirmed ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
                <span className="text-foreground">
                  You: {myConfirmed ? "Confirmed" : "Not confirmed"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    theirConfirmed ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
                <span className="text-foreground">
                  Them: {theirConfirmed ? "Confirmed" : "Not confirmed"}
                </span>
              </div>
            </div>

            {!myConfirmed && (
              <button
                onClick={handleConfirm}
                className="w-full px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirm Trade
              </button>
            )}

            {myConfirmed && theirConfirmed && (
              <button
                onClick={handleExecuteTrade}
                className="w-full px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
              >
                Execute Trade
              </button>
            )}

            {myConfirmed && !theirConfirmed && (
              <p className="text-center text-sm text-muted-foreground">
                Waiting for {otherPlayerName} to confirm...
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!activeTrade && myItems.length > 0 && (
          <div className="px-4 py-3 border-t border-accent/20 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-accent/30 hover:border-accent/50 text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Initiate trade would be called here
                onClose();
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-semibold transition-colors"
            >
              Start Trade
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}