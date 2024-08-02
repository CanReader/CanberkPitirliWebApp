import { TypeAnimation } from "react-type-animation";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
    Link as ScrollLink,
    Button,
    Element,
    Events,
    animateScroll as scroll,
    scrollSpy,
    scroller,
} from "react-scroll";
import { Suspense } from "react";

const ProfileSection = () => {
    const refContent = useRef(null);
    const inViewContent = useInView(refContent, { once: true });

    return (
        <>
            <section
                className="sm:px-8 overflow-hidden pt-[110px] sm:pt-[120px] sm:pb-10 pb-8"
                id="intro"
                style={{paddingBottom:'0',paddingTop:'20vh',paddingBottom:'5%'}}
            >
                <div className="grid grid-cols-1 sm:grid-cols-12 place-items-center">
                    {/* The left of the component */}
                    <motion.div
                        ref={refContent}
                        initial={{ opacity: 0, x: -100, scale: 0.8 }}
                        animate={
                            inViewContent
                                ? { opacity: 1, x: 0, scale: 1 }
                                : { opacity: 0, x: -100, scale: 0.8 }
                        }
                        transition={{ duration: 0.8 }}
                        className="col-span-7"
                    >
                        <h1 className="text-white mb-4 text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-[700] lg:leading-normal">
                            Hello there,<br/> I'm{" "}
                            <span className="text-heading">Canberk Pitirli</span><br/>
                            a <span className="text-heading">passionate</span> Software Developer.
                        </h1>

                        <TypeAnimation
                            sequence={[
                                500,
                                "I'm a professional developer",
                                1000,
				"I'm a full-stack developer",
				1000,
                                "I'm a game developer",
                                1000,
                                "I'm a game designer",
                                1000,
                                "I'm a AI developer",
                                500,
                            ]}
                            speed={50}
                            className="text-lg md:text-3xl font-[500]"
                            repeat={Infinity}
                        />

                        <p className="text-textPara text-base sm:text-lg mb-6 mt-3 lg:text-xl">
                            Scroll down to see more about me!
                        </p>
                        <div className="flex items-center gap-4 flex-col sm:flex-row ">
                            <ScrollLink
                                to="contact"
                                smooth={true}
                                duration={1000}
                                className="px-6 py-3 cursor-pointer w-full sm:w-fit rounded-full md:mr-4 bg-white hover:bg-gray-300 text-black text-lg font-[700] text-center hover:scale-[0.99] transition-all duration-400 ease-in-out"
                            >
                                Contact me
                            </ScrollLink>
                            <a
                                href="https://drive.google.com/file/d/16QPpz5uZtzWhiHhM8AgzUK27B-e7Rnyj/view?usp=drive_link"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 w-full sm:w-fit rounded-full md:mr-4 bg-transparent border-white border-2 text-white text-center hover:bg-darkHover hover:scale-[0.99] transition-all duration-400 ease-in-out "
                            >
                                Download CV
                            </a>
                        </div>
                    </motion.div>

                    {/* The right of the component*/}
                    <motion.div
                        ref={refContent}
                        initial={{
                            opacity: 0,
                            x: 100,
                            y: -100,
                            scale: 0.8,
                            filter: "blur(6px)",
                        }}
                        animate={
                            inViewContent
                                ? {
                                      opacity: 1,
                                      x: 0,
                                      y:20,
                                      scale:1.0,
                                      filter: "blur(0px)",
                                  }
                                : { opacity: 0, x: 100, scale: 0.8 }
                        }
                        transition={{ duration: 0.8 }}
                        className="col-span-5 w-full h-full lg:h-[40px] h-[80vh] relative mt-16 sm:-mt-4"
                    >
                        <Suspense>
                            <img
                                src="/images/Profile.png"
                                loading="lazy"
                                className="hidden sm:block absolute transform -translate-x-1/2 -translate-y-1/2 top-1/10 left-1/2 h-[60vh] m:h-[0px]"/>
                        </Suspense>
                    </motion.div>
                </div>
            </section>
        </>
    );
};

export default ProfileSection;
