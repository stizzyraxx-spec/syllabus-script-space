import React, { useState } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { Plus, Calendar, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PrayerJournalCalendar from "./PrayerJournalCalendar";
import PrayerJournalEntry from "./PrayerJournalEntry";

export default function PrayerJournalView({ userEmail }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["prayer-journal", userEmail],
    queryFn: () => userEmail ? db.entities.PrayerJournal.filter({ user_email: userEmail }) : Promise.resolve([]),
    enabled: !!userEmail,
  });

  const selectedDayEntries = entries.filter(e => e.entry_date === selectedDate);
  const todayEntries = entries.filter(e => e.entry_date === new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6" /> Prayer Journal
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Track your prayer journey and connect verses to your spiritual growth</p>
        </div>
        <button
          onClick={() => setShowNewEntry(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <PrayerJournalCalendar
            entries={entries}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>

        {/* Entries */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground mb-4">
              {selectedDate === new Date().toISOString().split('T')[0] ? "Today's Prayers" : `Prayers for ${new Date(selectedDate).toLocaleDateString()}`}
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-accent animate-spin" />
              </div>
            ) : selectedDayEntries.length === 0 ? (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <p className="text-muted-foreground font-body text-sm mb-3">No prayer entries for this day</p>
                <button
                  onClick={() => setShowNewEntry(true)}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-body text-sm font-semibold transition-colors"
                >
                  Start Your First Prayer
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEntries.map((entry, idx) => (
                  <motion.button
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setEditingEntry(entry)}
                    className="w-full text-left p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h4 className="font-display font-bold text-foreground">{entry.title}</h4>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          Mood: {entry.mood} • {entry.prayer_requests?.length || 0} requests
                        </p>
                      </div>
                      <span className="text-2xl">
                        {entry.mood === "grateful" && "🙏"}
                        {entry.mood === "peaceful" && "☮️"}
                        {entry.mood === "hopeful" && "🌅"}
                        {entry.mood === "struggling" && "💔"}
                        {entry.mood === "joyful" && "😊"}
                        {entry.mood === "reflective" && "🤔"}
                      </span>
                    </div>
                    <p className="text-foreground text-sm line-clamp-2 font-body">{entry.content}</p>
                    {entry.associated_verses?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entry.associated_verses.slice(0, 2).map((v, i) => (
                          <span key={i} className="inline-block px-2 py-1 rounded text-xs bg-accent/10 text-accent font-body font-semibold">
                            {v.book} {v.chapter}:{v.verse}
                          </span>
                        ))}
                        {entry.associated_verses.length > 2 && (
                          <span className="inline-block px-2 py-1 rounded text-xs bg-accent/10 text-accent font-body font-semibold">
                            +{entry.associated_verses.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Consistency Stats */}
          {todayEntries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-200 rounded-lg p-4"
            >
              <p className="font-body text-sm text-green-700 font-semibold">
                ✓ You've prayed today! Keep up your spiritual discipline.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showNewEntry && (
          <PrayerJournalEntry
            userEmail={userEmail}
            onClose={() => setShowNewEntry(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingEntry && (
          <PrayerJournalEntry
            entry={editingEntry}
            userEmail={userEmail}
            onClose={() => setEditingEntry(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}