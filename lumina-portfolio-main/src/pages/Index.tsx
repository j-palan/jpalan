import { CustomCursor } from "@/components/CustomCursor";
import { GlassNavbar } from "@/components/GlassNavbar";
import { HeroSection } from "@/components/HeroSection";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background cursor-none">
      <CustomCursor />
      <GlassNavbar />

      <main>
        <HeroSection />
      </main>
    </div>
  );
};

export default Index;
