import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CustomCursor } from "@/components/CustomCursor";
import { GlassNavbar } from "@/components/GlassNavbar";
import { ExperienceSection } from "@/components/ExperienceSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { SkillsSection } from "@/components/SkillsSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

const Work = () => {
  const location = useLocation();

  // Scroll to hash on page load or hash change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // Scroll to top if no hash
      window.scrollTo(0, 0);
    }
  }, [location.hash]);

  return (
    <div className="relative min-h-screen bg-background cursor-none">
      <CustomCursor />
      <GlassNavbar />

      <main className="pt-24">
        <ExperienceSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
};

export default Work;
