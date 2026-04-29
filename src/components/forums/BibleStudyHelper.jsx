import React, { useState, useRef, useEffect } from "react";
import { BookOpen, Search, Lightbulb, ChevronDown, ChevronUp, Send, Loader2, Sparkles, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/api/supabaseClient";

const tips = [
  {
    category: "Getting Started",
    icon: "📖",
    items: [
      { title: "Pray Before You Read", body: "Ask the Holy Spirit for wisdom and understanding before opening the Word. James 1:5 promises that God gives wisdom generously to those who ask." },
      { title: "Choose the Right Translation", body: "Start with a readable translation like the NIV or ESV for devotional reading. Use the NASB or KJV for deeper word studies. Compare multiple translations for a fuller picture." },
      { title: "Read in Context", body: "Never read a single verse in isolation. Read the whole chapter, then the whole book. Understanding the context of a passage is the single most important skill in Bible study." },
    ],
  },
  {
    category: "Interpretation Methods",
    icon: "🔍",
    items: [
      { title: "The Inductive Method (OIA)", body: "Observe — What does the text say? Interpret — What does it mean? Apply — How does it change my life? This three-step method is the foundation of sound Bible study." },
      { title: "Historical-Grammatical Method", body: "Understand the original historical context, the culture of the author, and the grammar of the original language (Hebrew/Greek). Tools like Strong's Concordance help with word meanings." },
      { title: "Scripture Interprets Scripture", body: "Let the Bible explain itself. Unclear passages are often clarified by clearer ones. Cross-referencing is essential — use a study Bible or Bible Gateway's cross-reference tool." },
      { title: "Identify the Literary Genre", body: "Poetry (Psalms), prophecy (Isaiah), history (Kings), epistles (Romans), and apocalyptic (Revelation) are all written differently and must be interpreted accordingly." },
    ],
  },
  {
    category: "Study Tools",
    icon: "🛠️",
    items: [
      { title: "Concordance", body: "A concordance lists every occurrence of a word in the Bible. Strong's Exhaustive Concordance shows the original Hebrew and Greek words — invaluable for deep study." },
      { title: "Bible Commentary", body: "Commentaries from scholars like Matthew Henry, John Calvin, or modern works by N.T. Wright provide historical background and theological insight." },
      { title: "Bible Dictionary & Atlas", body: "Bible dictionaries explain names, places, and customs. A Bible atlas helps you visualize the geography of biblical events, which transforms your understanding of many passages." },
      { title: "Lexicons", body: "Hebrew and Greek lexicons (like Thayer's Greek Lexicon) define words in the original language. Apps like Blue Letter Bible make this accessible to everyone." },
    ],
  },
  {
    category: "Practical Habits",
    icon: "✏️",
    items: [
      { title: "Journal Your Study", body: "Write down observations, questions, and personal applications. Writing forces clarity of thought and creates a record of your spiritual growth." },
      { title: "Memorize Key Passages", body: "Memorization hides the Word in your heart (Psalm 119:11). Start with key passages like Romans 8, John 1, Psalm 23, and Isaiah 53." },
      { title: "Study with Others", body: "A community of believers sharpens your understanding. Iron sharpens iron (Proverbs 27:17). Join or form a Bible study group to discuss and challenge each other." },
      { title: "Be Consistent Over Intensive", body: "15 minutes every day is more transformative than a 3-hour session once a week. Consistency builds understanding and forms a lifelong relationship with God's Word." },
    ],
  },
];

const suggestedQuestions = [
  "How do we know the Bible is historically accurate?",
  "What does archaeology say about the Old Testament?",
  "Is there evidence for the resurrection of Jesus?",
  "How were the books of the Bible chosen?",
  "What do the Dead Sea Scrolls prove?",
  "Did Jesus actually exist historically?",
  "How do we know the Bible hasn't been changed over time?",
  "What is the historical evidence for the Exodus?",
];

function TipSection({ section }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-card hover:bg-secondary/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{section.icon}</span>
          <span className="font-body font-semibold text-sm text-foreground">{section.category}</span>
          <span className="font-body text-xs text-muted-foreground">({section.items.length} tips)</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-3 bg-card">
              {section.items.map((item, i) => (
                <div key={i} className="p-4 rounded-lg bg-secondary/40 border border-border/60">
                  <div className="flex items-start gap-2 mb-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="font-body font-semibold text-sm text-foreground">{item.title}</span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed pl-5">{item.body}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AISearchEngine() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome! I am a Biblical AI search engine dedicated to answering questions about the Bible, verifying its historical accuracy, and connecting Scripture to archaeological and historical evidence. Ask me anything — from prophecy fulfillment to manuscript reliability to archaeological discoveries.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAsk = async (question) => {
    const q = question || input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await db.functions.invoke("bibleAiSearch", { question: q });
      const answer = res?.data?.answer || "I couldn't find an answer. Try rephrasing your question or asking about a specific Bible book or topic.";
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (err) {
      console.error("bibleAiSearch error:", err);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry — I ran into a problem looking that up. Please try again in a moment.",
      }]);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setMessages([{
      role: "assistant",
      content: "Welcome! I am a Biblical AI search engine dedicated to answering questions about the Bible, verifying its historical accuracy, and connecting Scripture to archaeological and historical evidence. Ask me anything — from prophecy fulfillment to manuscript reliability to archaeological discoveries.",
    }]);
    setInput("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-display text-lg font-bold text-foreground">Biblical AI Search Engine</h3>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      <p className="font-body text-xs text-muted-foreground mb-4 leading-relaxed">
        Powered by AI + live internet search. Asks questions about the Bible's history, prophecy, archaeology, manuscript evidence, and truth claims.
      </p>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <p className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Suggested Questions</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleAsk(q)}
                className="font-body text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-accent/40 hover:text-accent transition-colors text-muted-foreground"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4 max-h-[420px] overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                <BookOpen className="w-3.5 h-3.5 text-accent" />
              </div>
            )}
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl font-body text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-accent text-accent-foreground rounded-br-sm"
                  : "bg-secondary text-foreground rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mr-2">
              <BookOpen className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="bg-secondary px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-accent animate-spin" />
              <span className="font-body text-sm text-muted-foreground">Searching Scripture & history...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask about the Bible, its history, prophecy, archaeology..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAsk()}
          className="font-body text-sm flex-1"
          disabled={loading}
        />
        <button
          onClick={() => handleAsk()}
          disabled={!input.trim() || loading}
          className="w-10 h-9 flex items-center justify-center bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function BibleStudyHelper() {
  const [section, setSection] = useState("tips");

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSection("tips")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm font-medium transition-all ${
            section === "tips"
              ? "bg-accent text-accent-foreground"
              : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Study Tips & Methods
        </button>
        <button
          onClick={() => setSection("ai")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm font-medium transition-all ${
            section === "ai"
              ? "bg-accent text-accent-foreground"
              : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Bible Search
        </button>
      </div>

      <AnimatePresence mode="wait">
        {section === "tips" ? (
          <motion.div key="tips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-accent" />
              <h3 className="font-display text-lg font-bold text-foreground">How to Study the Bible</h3>
            </div>
            <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed">
              Proven methods and practical tools used by scholars and everyday believers to understand God's Word more deeply.
            </p>
            <div className="space-y-3">
              {tips.map((section, i) => (
                <TipSection key={i} section={section} />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AISearchEngine />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}