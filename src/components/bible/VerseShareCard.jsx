import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Download, Share2, Facebook, Twitter, Mail } from "lucide-react";
import html2canvas from "html2canvas";

export default function VerseShareCard({ verse, book, chapter, verseNum, onClose }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const verseRef = `${book} ${chapter}:${verseNum}`;

  const downloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#fff",
        scale: 2,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL();
      link.download = `verse-${book}-${chapter}-${verseNum}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to download image:", error);
      alert("Failed to download image");
    } finally {
      setDownloading(false);
    }
  };

  const shareOnSocial = (platform) => {
    const text = `"${verse}" — ${verseRef}`;
    const encodedText = encodeURIComponent(text);
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      email: `mailto:?subject=Check out this Bible verse&body=${encodedText}`,
    };
    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 pointer-events-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Preview Card */}
        <div ref={cardRef} className="p-8 bg-gradient-to-br from-primary via-primary to-primary/80 text-white space-y-6">
          <div className="space-y-4">
            <p className="text-sm font-body font-semibold opacity-80 uppercase tracking-widest">Holy Scripture</p>
            <p className="font-display text-3xl font-bold leading-tight italic">"{verse}"</p>
          </div>
          <div className="pt-4 border-t border-white/20">
            <p className="font-body text-sm font-semibold">{verseRef}</p>
          </div>
          <div className="text-center opacity-70">
            <p className="font-body text-xs">The Condition of Man</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={downloadImage}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-body text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {downloading ? "Saving..." : "Save Image"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <p className="font-body text-xs font-semibold text-muted-foreground mb-2">Share on Social Media</p>
            <div className="flex gap-2">
              <button
                onClick={() => shareOnSocial("twitter")}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                title="Share on X/Twitter"
              >
                <Twitter className="w-4 h-4" />
                <span className="hidden sm:inline font-body text-xs font-semibold">X</span>
              </button>
              <button
                onClick={() => shareOnSocial("facebook")}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                title="Share on Facebook"
              >
                <Facebook className="w-4 h-4" />
                <span className="hidden sm:inline font-body text-xs font-semibold">FB</span>
              </button>
              <button
                onClick={() => shareOnSocial("email")}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                title="Share via Email"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline font-body text-xs font-semibold">Email</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}