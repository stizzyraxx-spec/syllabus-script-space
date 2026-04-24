import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, MessageSquare, Heart, Volume2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

function useContent() {
  const { data = [] } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => base44.entities.SiteContent.list("section", 200),
  });
  return (key, fallback) => {
    const item = data.find((d) => d.key === key);
    return item ? item.value : fallback;
  };
}

export default function About() {
  const c = useContent();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/G%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="h-px w-12 bg-accent" />
            <Volume2 className="w-5 h-5 text-accent" />
            <span className="font-body text-accent text-xs font-semibold tracking-[0.2em] uppercase">
              A Voice Crying Out
            </span>
            <Volume2 className="w-5 h-5 text-accent" />
            <div className="h-px w-12 bg-accent" />
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6 italic"
          >
            "{c("about_hero_quote", "A voice of one calling in the wilderness, 'Prepare the way of the Lord.'")}"
          </motion.blockquote>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-body text-primary-foreground/60 text-sm"
          >
            {c("about_hero_citation", "Isaiah 40:3 / Matthew 3:3")}
          </motion.p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16">

        {/* Who I Am */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-5 h-5 text-accent flex-shrink-0" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Who I Am</h2>
          </div>
          <div className="space-y-5 font-body text-foreground/80 leading-relaxed text-base md:text-lg">
            <p>{c("about_who_p1", "I am nothing. And I mean that with the full weight of Scripture behind it. This life, my ambitions, my comfort, my reputation, holds no lasting value to me. I have seen enough of the world to know that it is passing away, and everything in it. The only thing worth pouring my soul into is the truth of Yeshua, Jesus the Messiah, and His Word.")}</p>
            <p>{c("about_who_p2", "I am a crying voice. Not a polished preacher. Not a theologian with letters behind my name. Just someone who cannot be silent when the world burns and the church sleeps. Someone who reads the headlines and sees Revelation. Someone who watches the nations rage and hears the Psalms echo back.")}</p>
            <p>{c("about_who_p3", "This platform was not built for fame, for followers, or for profit. It was built because I was compelled, because the Spirit does not allow peace when the truth goes unspoken.")}</p>
          </div>
        </motion.section>

        {/* The Mission */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-2xl bg-primary text-primary-foreground"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-accent" />
            </div>
            <h2 className="font-display text-2xl font-bold">The Mission</h2>
          </div>
          <div className="space-y-5 font-body text-primary-foreground/80 leading-relaxed">
            <p>{c("about_mission_p1", "The Condition of Man exists for one purpose: to serve Yeshua by renewing, restoring, and reigniting Biblical faith in a generation that has been lied to by every institution: media, government, church, and culture.")}</p>
            <p>{c("about_mission_p2", "We take current events, wars, crimes, political betrayals, moral collapse, and we hold them up against the eternal light of Scripture. Not to be political. Not to pick a side. But to say: this was written. This was warned. This is what it means.")}</p>
            <p>{c("about_mission_p3", "The Bible is not a relic. It is a living document that explains the human condition better than any psychology, philosophy, or political theory ever conceived. Every headline is a sermon waiting to be preached. Every tragedy is a call to return.")}</p>
            <blockquote className="border-l-2 border-accent pl-5 mt-6">
              <p className="font-display italic text-xl text-primary-foreground">
                "{c("about_mission_quote", "If My people, who are called by My name, will humble themselves and pray and seek My face and turn from their wicked ways, then I will hear from heaven...")}"
              </p>
              <cite className="font-body text-accent text-sm font-semibold mt-2 block">
                {c("about_mission_citation", "2 Chronicles 7:14")}
              </cite>
            </blockquote>
          </div>
        </motion.section>

        {/* Why Now */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">Why Now</h2>
          <div className="space-y-5 font-body text-foreground/80 leading-relaxed text-base md:text-lg">
            <p>{c("about_why_p1", "We are living in the most consequential moment in human history since the first century. Nations are collapsing under the weight of their own sin. Wars are erupting across the globe. Governments are erasing the image of God from the public square. The family is being dismantled. Truth is being called hate.")}</p>
            <p>{c("about_why_p2", "And the church? Too often, it is silent. Comfortable. Distracted. Afraid of being cancelled more than afraid of standing before a holy God.")}</p>
            <p>{c("about_why_p3", "This is the hour for the remnant to rise. Not with anger or bitterness, but with the Word. With clarity. With compassion. With the courage of the prophets who did not flinch when kings threatened them, because they served a King whose throne is everlasting.")}</p>
          </div>
        </motion.section>

        {/* Pillars */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-6"
        >
          {[
            { icon: "📖", title: "Return to Scripture", desc: "Not as a cultural artifact, but as the living, breathing Word of the living God. Daily. Urgently." },
            { icon: "👁", title: "See Clearly", desc: "Learn to read the news through the lens of Scripture, not the reverse. The Bible interprets the world, not the other way around." },
            { icon: "🔥", title: "Be Set Ablaze", desc: "Faith without fire is religion. True restoration ignites a burning that no comfort, criticism, or cost can extinguish." },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-xl border border-border bg-card">
              <span className="text-3xl mb-4 block">{item.icon}</span>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">{item.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center py-12 px-8 rounded-2xl border border-accent/20 bg-accent/5"
        >
          <MessageSquare className="w-10 h-10 text-accent mx-auto mb-4" />
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            {c("about_cta_title", "You Were Not Meant to Walk Alone")}
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
            {c("about_cta_body", "Iron sharpens iron. Join a community of believers who are watching, praying, and standing firm together, discussing the Word, the world, and the Way through our open forums.")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/forums"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-body font-semibold px-8 py-3 rounded-lg hover:bg-accent/90 transition-colors text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Join the Community Forums
            </Link>
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 border border-accent text-accent font-body font-semibold px-8 py-3 rounded-lg hover:bg-accent/10 transition-colors text-sm"
            >
              <Heart className="w-4 h-4" />
              Support This Ministry
            </Link>
          </div>
        </motion.section>

      </div>
    </div>
  );
}