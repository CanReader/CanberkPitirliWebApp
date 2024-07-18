import { useState, useTransition, useRef, Suspense } from "react";
import { motion, useInView } from "framer-motion";

const About = () => {
    const [tab, setTab] = useState("skills");
    const refHeading = useRef(null);
    const refContent = useRef(null);
    const inViewHeading = useInView(refHeading);
    const inViewContent = useInView(refContent, { once: true });

    const variants1 = {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
    };

    return (
        <section className=" sm:px-8 py-[80px] overflow-hidden" id="about" style={{paddingBottom:0}}>
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
                <motion.div
                    ref={refContent}
                    initial={{
                        opacity: 0,
                        x: -100,
                        scale: 0.8,
                        filter: "blur(6px)",
                    }}
                    animate={
                        inViewContent
                            ? {
                                opacity: 1,
                                x: 0,
                                scale: 1,
                                filter: "blur(0px)",
                            }
                            : { opacity: 1, x: -100, scale: 0.8 }
                    }
                    transition={{ duration: 0.8 }}
                    className="flex-1 md:max-w-[40%] sm:mt-10 "
                >
                    <Suspense>
                        <img
                            src="/images/Profile2.png"
                            alt="Profile 2"
                            className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] "
                        />
                    </Suspense>
                </motion.div>
                <motion.div
                    ref={refContent}
                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                    animate={
                        inViewContent
                            ? { opacity: 1, x: 0, scale: 1 }
                            : { opacity: 0, x: 100, scale: 0.8 }
                    }
                    transition={{ duration: 0.8 }}
                    className="flex-1 items-center"
                >
                    <p className="text-textWhite p-4 text-lg sm:text-xl sm:leading-7 align-self-center" style={{textAlign:'center',marginTop:'12%'}}>
                        Hello there, that's Canberk. <br />
                        I am a professional and enthusiastic software developer with 6 years of experience. I am a quick learner with a self-learning attitude and am passionate about problem-solving.
                        My passion for game development began with the thought, "When I play a game, I enjoy it. So, if I create a game, I create enjoyment."
                        My passion on technology led me expand my knowledge to include desktop development, mobile development, web development, and AI.
                        My core skills are based on C/C++, Java, and C#, and I also have intermediate skills in Python, React, and Flutter/Dart.
                    </p>

                </motion.div>
            </div>
        </section>
    );
};

export default About;




