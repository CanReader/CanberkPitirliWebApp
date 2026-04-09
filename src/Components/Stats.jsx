import { motion, useInView, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const stats = [
    { label: "Published Games", value: 5, suffix: "+" },
    { label: "Udemy Courses", value: 2, suffix: "" },
    { label: "Years of Exp.", value: 4, suffix: "+" },
    { label: "Languages", value: 8, suffix: "" },
    { label: "GitHub Repos", value: 30, suffix: "+" },
    { label: "Steam Titles", value: 3, suffix: "" },
];

const CountUp = ({ target, suffix, inView }) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!inView) return;
        const controls = animate(0, target, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate: (v) => setDisplay(Math.round(v)),
        });
        return () => controls.stop();
    }, [inView, target]);

    return (
        <span>
            {display}{suffix}
        </span>
    );
};

const Stats = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <section className="sm:px-8 py-16" id="stats" ref={ref}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="overflow-x-auto"
            >
                <div className="flex justify-between items-stretch min-w-[700px] max-w-4xl mx-auto">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 15 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            className="flex-1 flex flex-col items-center text-center relative"
                        >
                            <div className="text-heading text-4xl font-[900] tabular-nums mb-2">
                                <CountUp target={stat.value} suffix={stat.suffix} inView={inView} />
                            </div>
                            <div className="w-8 h-[2px] bg-heading/30 mb-2" />
                            <span className="text-textLight text-sm font-[500]">
                                {stat.label}
                            </span>

                            {i < stats.length - 1 && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-white/10" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

export default Stats;
