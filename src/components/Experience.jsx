import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, GraduationCap, Rocket } from "lucide-react";

const timeline = [
  {
    type: "work",
    visible: false, // set to true (or remove) to publish
    role: "Fullstack Software Engineer",
    company: "Creatant",
    period: "May 2026 - Present",
    description:
      "The biggest role of my career so far. I build and ship features across the whole stack of a production web platform: TypeScript and React on the front, with the backend and infrastructure work that comes with a real product. Most of what we're building isn't public yet, so this entry stays short on purpose.",
    highlights: [
      "Fullstack ownership: UI, APIs, and the data layer behind them",
      "TypeScript and React in production, shipping daily",
      "Relocating to Japan for the company in September 2026",
    ],
    techs: ["TypeScript", "React", "PostgreSQL", "Docker"],
  },
  {
    type: "work",
    visible: false, // set to true (or remove) to publish
    role: "C++ Developer (Freelance)",
    company: "Ursa Majeur",
    period: "Jan 2026 - Present",
    description:
      "Freelance C++ developer for an Istanbul based game studio. I built their procedural terrain generation plugin for Unreal Engine 5 from scratch: deterministic generation from a seed, fast enough for runtime use, and simple enough that designers shape worlds without touching code.",
    highlights: [
      "Procedural terrain generation plugin in C++ for UE5, built from scratch",
      "The plugin generates the worlds of Slashbang, the studio's unannounced roguelike",
      "Contributing to Celestial Temple, coming to Steam in Q4 2026",
    ],
    techs: ["C++", "Unreal Engine 5"],
  },
  {
    type: "work",
    role: "C++ Game Developer",
    company: "Reality Arts Studio",
    period: "Jun 2022 - Aug 2024",
    description:
      "Core C++ developer on two shipped Steam titles: The Stranger (PC/VR) and Unawake (published by Toplitz Productions, shown at Gamescom 2024). Reality Arts is a member of the Unreal Developer Network and received 3 Epic Games grants.",
    highlights: [
      "The Stranger won Best Game at WN Unreal European Developer Contest",
      "20% rendering performance gain via custom occlusion culling system",
      "Built AI behaviors (Behavior Trees, Blackboard, state machines) and designer-facing tools",
      "Partnerships secured with Microsoft, Nvidia, and MSI",
    ],
    techs: ["C++", "Unreal Engine 5", "HLSL", "Perforce"],
  },
  {
    type: "work",
    role: "Udemy Instructor",
    company: "Self-employed",
    period: "Jan 2023 - Present",
    description:
      "Created and maintain two technical courses: Advanced DirectX 11 Graphics Programming (C++/HLSL) and Advanced WPF Application Development (C#). Ongoing content updates and student Q&A.",
    highlights: [
      "200+ enrolled students across both courses",
      "4.8/5 average rating",
      "Built a complete DX11 rendering framework as course material",
      "Covers HLSL shaders, MVVM architecture, custom controls",
    ],
    techs: ["C++", "DirectX 11", "HLSL", "C#", "WPF"],
  },
  {
    type: "work",
    role: "Freelance Software Developer",
    company: "Self-employed",
    period: "2020 - 2022",
    description:
      "Built custom desktop and mobile applications for clients including a full POS system for a restaurant chain and a gamified productivity app published on Google Play.",
    highlights: [
      "Delivered Ruby POS system, multi-module WPF application, MVVM architecture",
      "Published Focus Kingdom on Google Play with real-time multiplayer via Socket.IO",
      "Full-stack delivery: UI, backend, database, deployment",
    ],
    techs: ["C#", "WPF", "Java", "Node.js", "PostgreSQL"],
  },
  {
    type: "education",
    role: "B.Sc. Computer Engineering",
    company: "University",
    period: "2018 - 2022",
    description:
      "Focused on systems programming, computer graphics, and algorithms. Started professional game development work during sophomore year and graduated while working full-time at Reality Arts.",
    highlights: [
      "Started at Reality Arts during sophomore year",
      "Built graphics demos and game projects throughout studies",
      "Graduated while working full-time on shipped titles",
    ],
    techs: ["C++", "Java", "Python", "OpenGL", "Algorithms"],
  },
  {
    type: "origin",
    role: "C++ Game Developer",
    company: "Fatalitech Game Studios",
    period: "Mar 2014 - Nov 2016",
    description:
      "Shipped Endless Combat, a co-op multiplayer zombie survival game, on Steam at age 14. Built gameplay features and AI systems in C++, optimized AI routines reducing frame time by 18%. Remote team of 8.",
    highlights: [
      "Shipped a Steam title as a teenager",
      "Built gameplay features and AI systems in C++",
      "Endless Combat is still available on Steam today",
    ],
    techs: ["C++", "Unreal Engine", "Blueprints", "Perforce"],
  },
];

const iconMap = {
  work: Briefcase,
  education: GraduationCap,
  origin: Rocket,
};

export default function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="experience" className="py-16 sm:py-24 lg:py-32" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="font-mono text-accent text-xs sm:text-sm tracking-wider mb-2 sm:mb-3">
          EXPERIENCE
        </p>
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-text mb-3 sm:mb-4">
          Where I've been
        </h2>
        <p className="text-muted text-sm sm:text-base max-w-xl mb-10 sm:mb-14">
          From shipping my first Steam game at 14 to leading engine-level
          development on commercial titles. Here's my journey so far.
        </p>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] sm:left-[19px] top-0 bottom-0 w-px bg-border" />

          <div className="space-y-8 sm:space-y-12">
            {timeline.filter((item) => item.visible !== false).map((item, i) => {
              const Icon = iconMap[item.type];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  className="relative flex gap-3 sm:gap-6"
                >
                  {/* Icon node */}
                  <div className="relative z-10 flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface border border-border flex items-center justify-center">
                    <Icon size={14} className="text-accent sm:w-4 sm:h-4" />
                  </div>

                  {/* Content card */}
                  <div className="flex-1 min-w-0 bg-surface border border-border rounded-xl p-4 sm:p-6 hover:border-accent/30 transition-colors duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                      <div className="min-w-0">
                        <h3 className="font-heading font-semibold text-text text-base sm:text-lg truncate">
                          {item.role}
                        </h3>
                        <p className="text-accent text-xs sm:text-sm font-mono">
                          {item.company}
                        </p>
                      </div>
                      <span className="text-muted text-xs sm:text-sm font-mono flex-shrink-0">
                        {item.period}
                      </span>
                    </div>

                    <p className="text-muted text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                      {item.description}
                    </p>

                    {/* Highlights */}
                    <ul className="space-y-1 sm:space-y-1.5 mb-3 sm:mb-4">
                      {item.highlights.map((h, j) => (
                        <li
                          key={j}
                          className="text-xs sm:text-sm text-muted flex items-start gap-2"
                        >
                          <span className="mt-1.5 flex-shrink-0 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-accent" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                      {item.techs.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] sm:text-[11px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
