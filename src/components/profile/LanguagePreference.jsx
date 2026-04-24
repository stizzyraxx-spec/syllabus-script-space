import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BIBLE_VERSIONS = [
  { value: "KJV", label: "King James Version (KJV)" },
  { value: "NIV", label: "New International Version (NIV)" },
  { value: "ESV", label: "English Standard Version (ESV)" },
  { value: "NKJV", label: "New King James Version (NKJV)" },
];

export default function LanguagePreference({ preference = "KJV", onChange }) {
  return (
    <div>
      <label className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
        Bible Version Preference
      </label>
      <Select value={preference} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BIBLE_VERSIONS.map((v) => (
            <SelectItem key={v.value} value={v.value}>
              {v.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}