import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PrayerJournalCalendar({ entries, selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const entriesByDate = useMemo(() => {
    const map = {};
    entries.forEach(entry => {
      const dateStr = entry.entry_date;
      map[dateStr] = (map[dateStr] || 0) + 1;
    });
    return map;
  }, [entries]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const days = Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => i + 1);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null);

  const monthStr = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const consistency = entries.length;

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatDate = (day) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">{monthStr}</h3>
          <p className="font-body text-xs text-muted-foreground">{consistency} entries this year</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-body text-xs font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map(day => {
          const dateStr = formatDate(day);
          const hasEntry = entriesByDate[dateStr];
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <motion.button
              key={day}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDateSelect(dateStr)}
              className={`aspect-square rounded-lg flex items-center justify-center font-body text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-accent text-accent-foreground border-2 border-accent'
                  : hasEntry
                  ? 'bg-green-100/80 text-green-700 border border-green-300'
                  : isToday
                  ? 'bg-secondary text-foreground border border-accent'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
              }`}
            >
              {day}
              {hasEntry && !isSelected && <div className="absolute w-1 h-1 bg-green-600 rounded-full bottom-1" />}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-border space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-accent" />
          <p className="text-muted-foreground">Selected date</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-green-100 border border-green-300" />
          <p className="text-muted-foreground">Has entry</p>
        </div>
      </div>
    </motion.div>
  );
}