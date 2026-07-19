'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import StoryHero from '@/components/story/StoryHero';
import { MaisonSection } from '@/components/maison/MaisonSection';
import { MaisonSectionHeader } from '@/components/maison/MaisonSectionHeader';
import { MaisonProse } from '@/components/maison/MaisonProse';
import { MaisonFounderNote } from '@/components/maison/MaisonFounderNote';
import { MaisonButton } from '@/components/maison/MaisonButton';

export default function OurStoryPage() {
  const reduce = useReducedMotion();

  // One restrained move: a 12px fade-up on scroll into view. Fully disabled
  // under reduced-motion rather than merely shortened.
  const fadeUp = reduce
    ? { initial: { opacity: 1, y: 0 }, whileInView: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: 'easeOut' as const },
        viewport: { once: true, margin: '-80px' },
      };

  return (
    <>
      <StoryHero />

      {/* Section B — the founder narrative (warm bone field, 7/5 asymmetric split) */}
      <MaisonSection tone="bone">
        <div className="flex flex-col items-start gap-12 md:flex-row md:gap-16">
          <motion.div {...fadeUp} className="min-w-0 md:w-7/12">
            <MaisonSectionHeader
              eyebrow="The journey to NFE"
              heading="Born out of necessity, and love"
              headingMaxCh={20}
              className="mb-8"
            />

            <MaisonProse>
              <p>
                I believe in <span className="font-semibold text-maison-accent-on-light">honest skincare</span>.
                NFE was born out of necessity—and love.
              </p>
              <p>
                For most of my life, my skin was even, balanced, and easy to care for. But in my
                late forties, everything changed. My tone became uneven in ways I didn&apos;t
                recognize, my skin felt less resilient, and my reflection felt unfamiliar. Those
                changes led me to seek professional guidance and reconsider what mature, melanated
                skin actually needed from daily care. What I learned is that consistency mattered
                most: a twice-daily ritual that deeply hydrates, strengthens the skin&apos;s
                barrier, and supports a more even-looking, radiant tone. That ritual became NFE.
              </p>
              <p>
                But my story with NFE started years earlier. Back in 2016, I was frustrated with
                dry, crepey skin that no store-bought lotion could touch. Premium creams left me
                ashy by midday, and even the DIY mixtures I made lost their magic over time. So I
                began researching, experimenting, and learning—layer by layer—what mature,
                melanated skin truly needs to thrive. What began as a simple body oil evolved over
                years into a sophisticated, nutrient-rich emulsion that hydrates like water,
                nourishes like an oil, and supports tone with brightening botanicals and
                restorative actives.
              </p>
              <p>
                As I aged, I embraced a new philosophy:{' '}
                <span className="font-semibold text-maison-accent-on-light">
                  well-aging, not age resistance
                </span>
                . If you&apos;re lucky, you get to age. My goal is simply to do it well—to stay
                vibrant, balanced, and confident in my own skin. For me, that means a holistic,
                layered approach: I move my body, eat well, protect my skin from the sun, and
                nourish it daily with NFE.
              </p>
              <p>
                NFE—short for{' '}
                <span className="font-semibold text-maison-accent-on-light">Not For Everyone</span>
                —is a reflection of that truth. It&apos;s not meant to be everything for everyone.
                It&apos;s for those who want simplicity without compromise; who want to age well,
                not fight it; who want skincare that understands the unique needs of mature,
                melanated skin—dryness, uneven tone, and barrier fragility—and meets them with
                science and care.
              </p>
              <p>
                Healthy, radiant skin isn&apos;t about chasing miracles. It&apos;s about smart
                layers: protect with SPF, treat when needed with your dermatologist, and nourish
                daily with NFE. That layered approach brought my skin to a place I&apos;m truly
                happy with—and it&apos;s the philosophy behind everything I create.
              </p>
            </MaisonProse>

            <MaisonFounderNote
              className="mt-10"
              quote="I made NFE for myself. I share it with anyone who sees themselves in my story. Because beautiful skin isn't effortless—it's intentional. And it's always worth it."
              attribution="Vanessa McCaleb · Founder"
            />
          </motion.div>

          <motion.div
            {...fadeUp}
            className="min-w-0 md:w-5/12 md:flex-none md:sticky md:top-24"
          >
            {/* Separate relative wrapper from the sticky element above: Next's
                fill Image warns unless its immediate parent reports position
                relative/absolute/fixed, and does not recognize `sticky` even
                though it behaves equivalently for this purpose. */}
            <div className="relative aspect-[666/841] overflow-hidden">
              <Image
                src="/images/our-story/founder-portrait.webp"
                alt="Vanessa McCaleb, founder of NFE"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          </motion.div>
        </div>
      </MaisonSection>

      {/* Section D — brand ethos (dark green anchor, gold accent on dark only) */}
      <MaisonSection tone="dark">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <MaisonSectionHeader
            tone="dark"
            heading="Honest skincare, designed for the journey"
            headingMaxCh={28}
            className="mb-6 [&_h2]:mx-auto"
          />
          <p className="mx-auto max-w-[60ch] text-lg leading-8 text-maison-bone">
            NFE is built for well-aging and skin confidence. Our formulations are crafted for
            mature, melanated skin, built on nourishment, science, and simplicity. We believe in
            healthy barrier function, visible radiance, and the confidence that comes from
            care—not perfection.
          </p>
        </motion.div>
      </MaisonSection>

      {/* Section E — closing (warm ivory field, one clear CTA to The Atelier) */}
      <MaisonSection tone="ivory">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <MaisonSectionHeader
            heading="Discover the ritual"
            headingMaxCh={22}
            className="mb-4 [&_h2]:mx-auto"
          />
          <p className="mx-auto mb-9 max-w-[52ch] text-lg leading-8 text-maison-espresso">
            Explore the NFE Face and Body Elixirs in The Atelier—the daily nourishment your skin
            deserves.
          </p>
          <MaisonButton href="/shop" variant="solid">
            Discover the elixirs
            <span aria-hidden="true">&rarr;</span>
          </MaisonButton>
        </motion.div>
      </MaisonSection>
    </>
  );
}
