import { useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import useGamesStore from "../stores/useGamesStore";
import HeroSection from "../components/landing/HeroSection";
import FeaturedGames from "../components/landing/FeaturedGames";
import RecentlyViewed from "../components/games/RecentlyViewed";
import TrendingSection from "../components/landing/TrendingSection";
import TrustBanner from "../components/landing/TrustBanner";

export default function Home() {
  const { initialize } = useGamesStore();

  useEffect(() => {
    window.scrollTo(0, 0);
    initialize();
  }, []);

  return (
    <div className="relative min-h-screen">
      <HeroSection />
      <FeaturedGames />
      <RecentlyViewed />
      <TrendingSection />
      <TrustBanner />

      <div className="h-20" />
    </div>
  );
}
