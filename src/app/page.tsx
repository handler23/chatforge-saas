import { Features } from "@/components/marketing/features";
import { Hero } from "@/components/marketing/hero";
import { Pricing } from "@/components/marketing/pricing";
import { Navbar } from "@/components/layout/navbar";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <footer className="border-t border-white/10 py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ChatForge. Built for local businesses.
      </footer>
    </main>
  );
}
