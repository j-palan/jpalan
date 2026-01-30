import CustomCursor from '@/components/CustomCursor';
import Hero from '@/components/Hero';
import Highlights from '@/components/Highlights';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Skills from '@/components/Skills';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Custom cursor */}
      <CustomCursor />

      {/* Main content */}
      <main>
        <Hero />
        <Highlights />
        <Experience />
        <Projects />
        <Skills />
        <Footer />
      </main>
    </div>
  );
};

export default Index;
