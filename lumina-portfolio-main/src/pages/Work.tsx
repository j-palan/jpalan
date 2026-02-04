import { CustomCursor } from "@/components/CustomCursor";
import { GlassNavbar } from "@/components/GlassNavbar";
import { ExperienceSection } from "@/components/ExperienceSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { SkillsSection } from "@/components/SkillsSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

const Work = () => {
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
