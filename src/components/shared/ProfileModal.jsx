import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ProfileView from "@/components/social/ProfileView";

export default function ProfileModal({ currentUser, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center px-0 sm:px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="bg-background w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
          <span className="font-display font-bold text-foreground">My Profile</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <ProfileView
            profileEmail={currentUser?.email}
            currentUser={currentUser}
            onBack={null}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}