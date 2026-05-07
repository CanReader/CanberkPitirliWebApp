import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";

const stats = [
  { value: 5, suffix: "+", label: "Years Commercial" },
  { value: 3, suffix: "", label: "Steam Titles" },
  { value: 53, suffix: "+", label: "GitHub Repos" },
  { value: 200, suffix: "+", label: "Students Taught" },
];

const testimonials = [
  {
    text: "One of the best DirectX 11 courses out there. Canberk explains complex rendering concepts in a way that actually makes sense. The weekly updates show real dedication.",
    author: "Chris Jennings - Student",
    context: "Advanced DirectX 11 Course",
    rating: 5,
  },
  {
    text: "Canberk's engine-level thinking and ability to profile and fix performance bottlenecks under pressure made him invaluable to the team.",
    author: "Bahar Baziki - CEO RealityArts",
    context: "Colleague Reference",
    rating: 5,
  },
  {
    text: "The WPF course finally taught me MVVM properly. Clear, practical, and well-structured. Exactly what the Turkish dev community needed.",
    author: "Oktay Karahan - Student",
    context: "WPF Development Course",
    rating: 4,
  },
];

function AnimatedCounter({ value, suffix, inView }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const rounded = useTransform(spring, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, value, spring]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return unsubscribe;
  }, [rounded]);

  return (
    <>
      {display.toLocaleString()}
      {suffix}
    </>
  );
}

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="about" className="py-16 sm:py-24 lg:py-32" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="font-mono text-accent text-xs sm:text-sm tracking-wider mb-2 sm:mb-3">
          ABOUT
        </p>
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-text mb-6 sm:mb-8">
          A bit about me
        </h2>

        {/* Bio + highlights */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mb-10 sm:mb-12">
        <div className="flex-1 space-y-4 sm:space-y-5 text-muted text-sm sm:text-base leading-relaxed">
          <p>
            I shipped my first game on Steam at <span className="text-text">14</span>,
            a co-op zombie survival game built with a small team at{" "}
            <span className="text-text">Fatalitech Game Studios</span> using Unreal Engine.
            It was rough around the edges, but it shipped, people played it, and I was hooked.
          </p>
          <p>
            That early start turned into a career. I spent over two years at{" "}
            <span className="text-text">Reality Arts Studio</span> as a C++ developer,
            where I shipped two commercial titles on Steam, including{" "}
            <span className="text-text">The Stranger</span>, which won Best Game at the
            WN Unreal European Developer Contest. The studio secured partnerships with
            Microsoft, Nvidia, and MSI, and received{" "}
            <span className="text-text">3 Epic Games grants</span>. My work was
            engine-level: occlusion culling, shader optimization, gameplay systems, AI,
            and tools that designers could use without engineering bottlenecks.
          </p>
          <p>
            I don't just use engines. <span className="text-text">I build them</span>.
            SleakEngine is a cross-platform game engine I wrote from scratch in C++23 with
            four graphics backends (DX11, DX12, Vulkan, OpenGL), an ECS, custom memory
            allocators, and fixed-timestep physics. It ships a real game: SleakCraft, a
            voxel sandbox with procedural terrain and wave-based water rendering.
          </p>
          <p>
            I also teach. My <span className="text-text">Udemy courses</span> on
            Advanced DirectX 11 and Advanced WPF have{" "}
            <span className="text-text">200+ students with a 4.8/5 rating</span>.
            Teaching forces you to understand things at a level where you can explain
            them. That's the standard I hold my own code to.
          </p>
        </div>

        {/* At a glance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:w-64 flex-shrink-0 self-stretch"
        >
          <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 h-full flex flex-col">
            <p className="text-[10px] sm:text-xs font-mono text-muted tracking-wider uppercase mb-4 sm:mb-5">
              At a glance
            </p>
            <ul className="space-y-3.5 sm:space-y-4 flex-1 flex flex-col justify-between">
              {[
                "Won Best Game, WN Unreal European Contest",
                "3 Epic Games grants (team)",
                "Microsoft, Nvidia, MSI partnerships",
                "Custom C++23 engine from scratch",
                "Udemy instructor, 4.8/5 rating",
                "4 languages: TR, EN, DE, FR",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted">
                  <span className="mt-1.5 flex-shrink-0 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
        </div>

        {/* Stats — single row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-border rounded-xl overflow-hidden">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              className={`bg-surface py-5 sm:py-6 px-4 text-center ${
                i < stats.length - 1 ? "sm:border-r sm:border-border" : ""
              } ${i < 2 ? "border-b sm:border-b-0 border-border" : ""} ${
                i % 2 === 0 ? "border-r sm:border-r border-border" : ""
              }`}
            >
              <p className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-accent leading-none">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  inView={inView}
                />
              </p>
              <p className="text-muted text-[10px] sm:text-xs font-mono mt-1.5 sm:mt-2 uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 sm:mt-16"
        >
          <p className="text-xs font-mono text-muted tracking-wider uppercase mb-4 sm:mb-6">
            What others say
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="bg-surface border border-border rounded-xl p-4 sm:p-5 relative"
              >
                <Quote
                  size={14}
                  className="text-accent/30 absolute top-3 right-3 sm:top-4 sm:right-4"
                />
                <p className="text-muted text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-text text-xs sm:text-sm font-medium truncate">{t.author}</p>
                    <p className="text-muted text-[10px] sm:text-xs">{t.context}</p>
                  </div>
                  {t.rating && (
                    <div className="flex gap-0.5 flex-shrink-0">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star
                          key={j}
                          size={10}
                          className="text-yellow-500 fill-yellow-500 sm:w-3 sm:h-3"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
