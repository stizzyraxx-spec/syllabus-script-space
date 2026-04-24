import React from "react";
import { Share2 } from "lucide-react";

export default function ShareButton({ title, text, url, imageUrl, className = "" }) {
  const shareUrl = url || window.location.href;
  const shareText = text || title || "Check this out on The Condition of Man";

  const handleShare = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        const shareData = { title: title || "The Condition of Man", text: shareText, url: shareUrl };
        // If an image URL is provided and we can fetch it as a file, include it
        if (imageUrl && navigator.canShare) {
          try {
            const res = await fetch(imageUrl);
            const blob = await res.blob();
            const ext = blob.type.includes("png") ? "png" : "jpg";
            const file = new File([blob], `post.${ext}`, { type: blob.type });
            const withFile = { ...shareData, files: [file] };
            if (navigator.canShare(withFile)) {
              await navigator.share(withFile);
              return;
            }
          } catch (_) {
            // fall through to share without image
          }
        }
        await navigator.share(shareData);
      } catch (_) {
        // user cancelled or error — do nothing
      }
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-accent transition-colors ${className}`}
      title="Share"
    >
      <Share2 className="w-4 h-4" />
      <span className="text-xs">Share</span>
    </button>
  );
}