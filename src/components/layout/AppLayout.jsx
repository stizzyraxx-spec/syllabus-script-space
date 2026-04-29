import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingPostButton from "./FloatingPostButton.jsx";
import GoldCursor from "@/components/effects/GoldCursor";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      <FloatingPostButton />
      <GoldCursor />
    </div>
  );
}