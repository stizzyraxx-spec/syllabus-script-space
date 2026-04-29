import React, { useState, useRef, useEffect } from "react";
import { db } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";

/**
 * A textarea/input with @mention autocomplete support.
 * Props:
 *   value, onChange(newValue), placeholder, className, multiline (bool)
 * Returns text with @username tags that can be parsed to find mentioned users.
 */
export function parseMentions(text, profiles) {
  // Returns array of user_email for each @username found in text
  const mentioned = [];
  const matches = text.match(/@(\w+)/g) || [];
  matches.forEach((m) => {
    const username = m.slice(1).toLowerCase();
    const profile = profiles.find(
      (p) => (p.username || "").toLowerCase() === username ||
              (p.display_name || "").toLowerCase() === username
    );
    if (profile && !mentioned.includes(profile.user_email)) {
      mentioned.push(profile.user_email);
    }
  });
  return mentioned;
}

export default function MentionInput({ value, onChange, placeholder, className, multiline = false }) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef(null);

  const { data: profiles = [] } = useQuery({
    queryKey: ["all-profiles-mention"],
    queryFn: () => db.entities.UserProfile.list(),
    staleTime: 60000,
  });

  const filtered = query.length > 0
    ? profiles.filter((p) =>
        (p.username || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.display_name || "").toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleChange = (e) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    setCursorPos(pos);
    onChange(val);

    // Find if cursor is inside an @mention
    const textUpToCursor = val.slice(0, pos);
    const mentionMatch = textUpToCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      setQuery(mentionMatch[1]);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setQuery("");
    }
  };

  const handleSelect = (profile) => {
    const handle = profile.username || profile.display_name || profile.user_email.split("@")[0];
    const textUpToCursor = value.slice(0, cursorPos);
    const beforeMention = textUpToCursor.replace(/@(\w*)$/, "");
    const after = value.slice(cursorPos);
    const newVal = `${beforeMention}@${handle} ${after}`;
    onChange(newVal);
    setShowDropdown(false);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const sharedProps = {
    ref: inputRef,
    value,
    onChange: handleChange,
    placeholder,
    className,
    onBlur: () => setTimeout(() => setShowDropdown(false), 150),
  };

  return (
    <div className="relative w-full">
      {multiline ? (
        <textarea {...sharedProps} />
      ) : (
        <input {...sharedProps} type="text" />
      )}

      {showDropdown && filtered.length > 0 && (
        <div className="absolute z-50 bottom-full mb-1 left-0 w-64 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {filtered.map((p) => (
            <button
              key={p.id}
              onMouseDown={() => handleSelect(p)}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-secondary transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-accent text-xs font-bold">
                    {(p.display_name || p.user_email || "A")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-body text-xs font-semibold text-foreground leading-tight">
                  {p.display_name || p.user_email}
                </p>
                {p.username && (
                  <p className="font-body text-[10px] text-muted-foreground">@{p.username}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}