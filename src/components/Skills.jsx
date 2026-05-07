import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { skills, categories } from "../data/skills";

function ProgressBar({ progress, color, inView, delay }) {
  return (
    <div className="relative w-full h-1.5 sm:h-2 bg-zinc-800 rounded-full overflow-hidden mt-2.5 sm:mt-3">
      <motion.div
        initial={{ width: 0 }}
        animate={inView ? { width: `${progress}%` } : { width: 0 }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="skills" className="py-16 sm:py-24 lg:py-32" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="font-mono text-accent text-xs sm:text-sm tracking-wider mb-2 sm:mb-3">
          SKILLS
        </p>
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-text mb-8 sm:mb-12">
          Technologies I work with
        </h2>

        {categories.map((category) => {
          const items = skills.filter((s) => s.category === category);
          return (
            <div key={category} className="mb-10 sm:mb-14 last:mb-0">
              <h3 className="text-muted text-xs sm:text-sm font-mono tracking-wider uppercase mb-4 sm:mb-6">
                {category}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {items.map((skill, i) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.06 * i }}
                    className="group bg-surface border border-border rounded-xl p-3 sm:p-5 hover:border-accent/30 transition-colors duration-300"
                  >
                    {/* Header with logo and name */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center bg-zinc-800/60 rounded-lg p-1 sm:p-1.5">
                        <img
                          src={skill.image}
                          alt={skill.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading font-semibold text-text text-sm sm:text-base truncate">
                          {skill.name}
                        </h4>
                      </div>
                      <span className="text-[10px] sm:text-xs font-mono text-muted flex-shrink-0">
                        {skill.progress}%
                      </span>
                    </div>

                    {/* Description — hidden on very small screens */}
                    <p className="text-muted text-xs sm:text-sm leading-relaxed mb-1 hidden sm:block">
                      {skill.description}
                    </p>

                    {/* Progress bar */}
                    <ProgressBar
                      progress={skill.progress}
                      color={skill.color}
                      inView={inView}
                      delay={0.3 + 0.06 * i}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}
