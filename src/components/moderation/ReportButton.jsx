import React, { useState } from "react";
import { Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReportModal from "./ReportModal";

export default function ReportButton({ contentType, contentId, reportedUserEmail, contentPreview }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors font-body text-xs font-medium"
        title="Report this content"
      >
        <Flag className="w-3.5 h-3.5" />
        Report
      </button>

      <AnimatePresence>
        {showModal && (
          <ReportModal
            contentType={contentType}
            contentId={contentId}
            reportedUserEmail={reportedUserEmail}
            contentPreview={contentPreview}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}