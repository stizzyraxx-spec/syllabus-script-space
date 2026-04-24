import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Plus, Trash2, Loader2, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
// react-quill removed for performance

const DEFAULT_CONTENT = [
  // About page
  { key: "about_hero_quote", label: "Hero Quote", section: "about", value: "A voice of one calling in the wilderness, 'Prepare the way of the Lord.'" },
  { key: "about_hero_citation", label: "Hero Citation", section: "about", value: "Isaiah 40:3 / Matthew 3:3" },
  { key: "about_who_p1", label: "Who I Am — Paragraph 1", section: "about", value: "I am nothing. And I mean that with the full weight of Scripture behind it. This life — my ambitions, my comfort, my reputation — holds no lasting value to me. I have seen enough of the world to know that it is passing away, and everything in it. The only thing worth pouring my soul into is the truth of Yeshua — Jesus the Messiah — and His Word." },
  { key: "about_who_p2", label: "Who I Am — Paragraph 2", section: "about", value: "I am a crying voice. Not a polished preacher. Not a theologian with letters behind my name. Just someone who cannot be silent when the world burns and the church sleeps. Someone who reads the headlines and sees Revelation. Someone who watches the nations rage and hears the Psalms echo back." },
  { key: "about_who_p3", label: "Who I Am — Paragraph 3", section: "about", value: "This platform was not built for fame, for followers, or for profit. It was built because I was compelled — because the Spirit does not allow peace when the truth goes unspoken." },
  { key: "about_mission_p1", label: "The Mission — Paragraph 1", section: "about", value: "The Condition of Man exists for one purpose: to serve Yeshua by renewing, restoring, and reigniting Biblical faith in a generation that has been lied to by every institution — media, government, church, and culture." },
  { key: "about_mission_p2", label: "The Mission — Paragraph 2", section: "about", value: "We take current events — wars, crimes, political betrayals, moral collapse — and we hold them up against the eternal light of Scripture. Not to be political. Not to pick a side. But to say: this was written. This was warned. This is what it means." },
  { key: "about_mission_p3", label: "The Mission — Paragraph 3", section: "about", value: "The Bible is not a relic. It is a living document that explains the human condition better than any psychology, philosophy, or political theory ever conceived. Every headline is a sermon waiting to be preached. Every tragedy is a call to return." },
  { key: "about_mission_quote", label: "Mission Scripture Quote", section: "about", value: "If My people, who are called by My name, will humble themselves and pray and seek My face and turn from their wicked ways, then I will hear from heaven..." },
  { key: "about_mission_citation", label: "Mission Scripture Citation", section: "about", value: "2 Chronicles 7:14" },
  { key: "about_why_p1", label: "Why Now — Paragraph 1", section: "about", value: "We are living in the most consequential moment in human history since the first century. Nations are collapsing under the weight of their own sin. Wars are erupting across the globe. Governments are erasing the image of God from the public square. The family is being dismantled. Truth is being called hate." },
  { key: "about_why_p2", label: "Why Now — Paragraph 2", section: "about", value: "And the church? Too often, it is silent. Comfortable. Distracted. Afraid of being cancelled more than afraid of standing before a holy God." },
  { key: "about_why_p3", label: "Why Now — Paragraph 3", section: "about", value: "This is the hour for the remnant to rise. Not with anger or bitterness — but with the Word. With clarity. With compassion. With the courage of the prophets who did not flinch when kings threatened them, because they served a King whose throne is everlasting." },
  { key: "about_cta_title", label: "CTA Title", section: "about", value: "You Were Not Meant to Walk Alone" },
  { key: "about_cta_body", label: "CTA Body", section: "about", value: "Iron sharpens iron. Join a community of believers who are watching, praying, and standing firm together — discussing the Word, the world, and the Way through our open forums." },
  // Home
  { key: "home_hero_title", label: "Hero Title", section: "home", value: "The Condition of Man" },
  { key: "home_hero_subtitle", label: "Hero Subtitle", section: "home", value: "Current events through the lens of Scripture. Because every headline is a sermon waiting to be preached." },
  // Donate
  { key: "donate_title", label: "Page Title", section: "donate", value: "Support the Mission" },
  { key: "donate_subtitle", label: "Page Subtitle", section: "donate", value: "Your generosity helps keep this platform free, independent, and uncompromised." },
];

const SECTIONS = ["about", "home", "donate"];

function ContentItem({ item, onSave, onDelete }) {
  const [value, setValue] = useState(item.value);
  const [label, setLabel] = useState(item.label || "");
  const isDirty = value !== item.value || label !== (item.label || "");

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.SiteContent.update(item.id, { value, label }),
    onSuccess: onSave,
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.SiteContent.delete(item.id),
    onSuccess: onDelete,
  });

  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="font-body text-xs font-semibold text-foreground border-none shadow-none px-0 h-auto focus-visible:ring-0 bg-transparent"
          placeholder="Label..."
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          {isDirty && (
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 font-body text-xs bg-accent text-accent-foreground px-3 py-1.5 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {saveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save
            </button>
          )}
          <button
            onClick={() => { if (window.confirm("Delete this content block?")) deleteMutation.mutate(); }}
            className="text-muted-foreground hover:text-destructive transition-colors p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p className="font-body text-[10px] text-muted-foreground">{item.key}</p>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="font-body text-sm min-h-[80px] resize-y"
      />
    </div>
  );
}

function SectionPanel({ section, items, onRefresh }) {
  const [open, setOpen] = useState(true);
  const queryClient = useQueryClient();

  const sectionItems = items.filter((i) => i.section === section);

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors mb-3"
      >
        <span className="font-display font-bold text-base text-foreground capitalize">{section} Page</span>
        <div className="flex items-center gap-2">
          <span className="font-body text-xs text-muted-foreground">{sectionItems.length} blocks</span>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {open && (
        <div className="space-y-3">
          {sectionItems.map((item) => (
            <ContentItem key={item.id} item={item} onSave={onRefresh} onDelete={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminContent() {
  const [user, setUser] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) setUser(await base44.auth.me());
    });
  }, []);

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => base44.entities.SiteContent.list("section", 200),
  });

  const handleSeedDefaults = async () => {
    setSeeding(true);
    const existingKeys = items.map((i) => i.key);
    const toCreate = DEFAULT_CONTENT.filter((d) => !existingKeys.includes(d.key));
    if (toCreate.length > 0) {
      await base44.entities.SiteContent.bulkCreate(toCreate);
    }
    await refetch();
    setSeeding(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-body text-foreground font-semibold mb-1">Admin Only</p>
          <p className="font-body text-muted-foreground text-sm">You need admin access to edit site content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Content Editor</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">Edit all text across the site</p>
          </div>
          {items.length === 0 && (
            <button
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="flex items-center gap-2 font-body text-sm bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Load Default Content
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-muted-foreground mb-4">No content blocks yet.</p>
            <p className="font-body text-sm text-muted-foreground">Click "Load Default Content" to populate all editable text from the site.</p>
          </div>
        ) : (
          SECTIONS.map((section) => (
            <SectionPanel
              key={section}
              section={section}
              items={items}
              onRefresh={refetch}
            />
          ))
        )}
      </div>
    </div>
  );
}