import React from "react";
import HeroSection from "../components/home/HeroSection";
import DailyDevotional from "../components/home/DailyDevotional";
import DonationSection from "../components/home/DonationSection";
import HomeCommunityFeed from "../components/home/HomeCommunityFeed";
import GamesSection from "../components/home/GamesSection";
import PlayerProgressBar from "../components/home/PlayerProgressBar";
import GuidedSection from "../components/shared/GuidedSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <GuidedSection label="Your Progress" description="Track your spiritual growth, level up, and earn points through reading, praying, and playing faith-building games.">
        <div className="max-w-3xl mx-auto px-4 pt-8">
          <PlayerProgressBar />
        </div>
      </GuidedSection>
      <GuidedSection label="Games" description="Challenge yourself with Bible trivia, memory games, and role-playing scenarios to strengthen your faith.">
        <GamesSection />
      </GuidedSection>
      <GuidedSection label="Daily Devotional" description="Read daily Bible passages and reflections to stay connected to scripture.">
        <DailyDevotional />
      </GuidedSection>
      <GuidedSection label="Community" description="See what others are sharing, discuss faith, and join meaningful conversations.">
        <HomeCommunityFeed />
      </GuidedSection>
      <GuidedSection label="Support & Giving" description="Help others and support the ministry behind this app.">
        <DonationSection />
      </GuidedSection>
    </div>
  );
}