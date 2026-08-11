import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";
import { CoinIntro } from "@/components/coin/CoinIntro";
import { CoinMark } from "@/components/coin/CoinMark";
import { CustomCursor } from "@/components/CustomCursor";
import { ExperienceTable } from "@/components/ExperienceTable";
import { ClickHint } from "@/components/shot/ClickHint";
import { ScrambleText } from "@/components/shot/ScrambleText";
import { ShotProvider } from "@/components/shot/ShotProvider";
import { useShotHit, useShotTarget } from "@/components/shot/shotContext";
import { links, site } from "@/data/site";

const ICONS = { mail: Mail, github: Github, linkedin: Linkedin };

const EASE = [0.16, 1, 0.3, 1] as const;

type Link = (typeof links)[number];

/** Each icon is its own target. Registering the whole row as one block gave
    the round a wide slab in the corner to rattle against. */
const IconLink = ({ link }: { link: Link }) => {
  const Icon = ICONS[link.icon];
  const external = link.href.startsWith("http");
  const { shaking, onHit } = useShotHit();
  const ref = useShotTarget<HTMLAnchorElement>({ solid: true, onHit });

  return (
    <a
      ref={ref}
      href={link.href}
      aria-label={link.label}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`text-faint transition-colors duration-200 hover:text-gold-300 ${shaking ? "shot-shake text-gold-300" : ""}`}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
    </a>
  );
};

const Page = () => {
  const [revealed, setRevealed] = useState(false);
  const [markVisible, setMarkVisible] = useState(false);
  const prefersReduced = useReducedMotion();

  /* Display type turns the round; so does each icon. */
  const heading = useShotHit();
  const headingRef = useShotTarget<HTMLHeadingElement>({ solid: true, onHit: heading.onHit });

  /* The name decodes itself once as the page arrives, then again on every hit.
     ScrambleText treats 0 as "never run", so the reveal is what takes the
     trigger off zero — `revealed` only ever flips once, so this cannot loop. */
  const headingTrigger = heading.hit + (revealed ? 1 : 0);

  /* Explicit per-block props rather than parent/child variants, so each block's
     entrance is readable on its own line. Reduced motion gets no entrance at
     all — staggering content in is exactly what that preference asks you not
     to do — so the page is simply there. */
  const rise = (delay: number) =>
    prefersReduced
      ? { initial: false as const, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
          transition: { duration: 0.7, delay: revealed ? delay : 0, ease: EASE },
        };

  return (
    <div id="top">
      <CustomCursor />
      <CoinIntro onReveal={() => setRevealed(true)} onHandoff={() => setMarkVisible(true)} />

      <motion.div
        className="page-grid"
        initial={prefersReduced ? false : { opacity: 0 }}
        animate={{ opacity: prefersReduced || revealed ? 1 : 0 }}
        transition={{ duration: prefersReduced ? 0 : 0.9, ease: EASE }}
      />

      <div className={revealed ? "relative z-10" : "pointer-events-none relative z-10"}>
        <header className="fixed inset-x-0 top-0 z-30 flex h-[var(--grid)] items-center justify-between px-6 sm:px-10">
          {/* Positioned, so the hint can anchor to the mark rather than to
              hard-coded viewport coordinates. */}
          <div className="relative sm:ml-3">
            <CoinMark visible={markVisible} />
            {markVisible && <ClickHint />}
          </div>

          <motion.nav {...rise(0)} className="flex items-center gap-5">
            {links.map((link) => (
              <IconLink key={link.label} link={link} />
            ))}
          </motion.nav>
        </header>

        <main className="mx-auto flex max-w-page flex-col px-6 sm:h-[100dvh] sm:px-10">
          <div className="flex h-[var(--masthead)] shrink-0 items-end pb-6 pt-24 sm:pt-0">
            <motion.h1
              {...rise(0.08)}
              ref={headingRef}
              className={`font-display text-display ${heading.shaking ? "shot-shake" : ""}`}
            >
              <ScrambleText
                text={site.greeting}
                trigger={headingTrigger}
                className="text-muted"
              />{" "}
              <ScrambleText
                text={site.firstName}
                trigger={headingTrigger}
                delay={280}
                className="italic"
              />
            </motion.h1>
          </div>

          <motion.section {...rise(0.18)} aria-label="Experience" className="shrink-0">
            <ExperienceTable />
          </motion.section>
        </main>
      </div>
    </div>
  );
};

const Index = () => (
  <ShotProvider>
    <Page />
  </ShotProvider>
);

export default Index;
