import { useState, useRef, Suspense } from "react";
import { motion, useInView } from "framer-motion";

const About = () => {
    const [tab, setTab] = useState("skills");
    const refHeading = useRef(null);
    const refContent = useRef(null);
    const inViewHeading = useInView(refHeading);
    // Trigger animation when the content enters the viewport
    const inViewContent = useInView(refContent, { once: true, margin: "-100px" });

    const variants1 = {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
    };

   const texts = {
    Game: "I'm a software developer focused on C++, game development, and real-time graphics programming. I work primarily on performance-critical systems, gameplay and engine-level features, and rendering pipelines, with hands-on experience using Unreal Engine and DirectX 11/12. I’m a highly self-driven engineer who enjoys learning complex systems, solving hard technical problems, and building clean, maintainable code. I also enjoy sharing knowledge and have created an Advanced DirectX 11 graphics programming course, reflecting my passion for both engineering and continuous learning.",

    System: "I'm a software developer focused on C++/Rust, systems programming, and real-time applications. I bridge the gap between low-level hardware and high-level software, specializing in memory management, concurrency, and performance optimization. My background in graphics and game engines allows me to approach systems architecture with a deep understanding of hardware constraints. I’m a highly self-driven engineer who enjoys solving complex technical problems and building robust, scalable systems that power modern technology.",

    Fullstack: "I'm a Fullstack Developer with a unique perspective rooted in systems engineering. I build end-to-end applications that combine high-performance backends with intuitive, responsive frontends. Whether it's architecting scalable APIs or designing complex state management in React, I focus on creating seamless user experiences without sacrificing speed. My experience with C++ and graphics gives me a 'mechanical sympathy' for performance, ensuring that every layer of the stack is optimized for efficiency and reliability.",

    Backend: "I'm a Backend Engineer specializing in high-concurrency systems and distributed architectures. I focus on building the 'invisible' infrastructure that powers modern platforms, from optimized database schemas to real-time data processing pipelines. With a foundation in C++ and systems programming, I bring a level of performance-tuning and stability to backend services that is rare in the web world. I pride myself on writing clean, secure, and maintainable code that remains performant under heavy loads.",

    Generalist: "I'm a multi-disciplinary software engineer with a broad expertise spanning from low-level graphics and systems programming in C++ to modern web development and full-stack architecture. I thrive in environments that require versatility—whether I'm debugging a DirectX rendering pipeline, optimizing a Rust microservice, or building a React frontend. My goal is always the same: to solve difficult technical challenges by choosing the right tool for the job and delivering clean, maintainable, and high-performance software."
};

    const text = texts["Game"]; 

    return (
        <section className="sm:px-8 py-[80px] overflow-hidden" id="about" style={{ paddingBottom: 0 }}>
            <motion.div
                ref={refHeading}
                variants={variants1}
                initial="initial"
                animate={inViewHeading ? "animate" : "initial"}
                transition={{ duration: 0.6 }}
                className="flex gap-4 items-center"
            >
                <h3 className="text-textWhite text-3xl sm:text-5xl font-[800]">
                    About Me
                </h3>
                <div className="min-w-0 flex-grow mt-2 h-[4px] bg-textWhite"></div>
            </motion.div>

            <div className="py-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                {/* Left Side: Profile Image */}
                <motion.div
                    ref={refContent}
                    initial={{ opacity: 0, x: -100, scale: 0.8, filter: "blur(6px)" }}
                    animate={inViewContent ? { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" } : {}}
                    transition={{ duration: 0.8 }}
                    className="flex-1 md:max-w-[40%] sm:mt-10"
                >
                    <Suspense fallback={<div>Loading...</div>}>
                         <motion.img
    src="/images/Profile2.1.png"
    loading="eager"
    alt="Profile 2"
    className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] object-cover"
    whileHover={{
    rotateX: 8,
    rotateY: -8,
    scale: 1.04,
}}
    transition={{
        type: "spring",
        stiffness: 180,
        damping: 18
    }}
    style={{
        transformStyle: "preserve-3d",
        cursor: "pointer"
    }}
/>
                    </Suspense>
                </motion.div>

                {/* Right Side: Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                    animate={inViewContent ? { opacity: 1, x: 0, scale: 1 } : {}}
                    transition={{ duration: 0.8 }}
                    className="flex-1 flex items-center justify-center"
                >
                    <p className="text-textWhite p-4 text-lg sm:text-xl sm:leading-7 text-center md:mt-[12%]">
                        <span className="font-bold block mb-2">Hello there, that's Canberk.</span>
                        {text}
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default About;
