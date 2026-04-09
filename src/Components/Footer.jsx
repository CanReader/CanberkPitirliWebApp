import { BsLinkedin, BsGithub, BsTwitterX, BsStackOverflow, BsInstagram } from "react-icons/bs";
import { FaArrowUp } from "react-icons/fa";
import { Link as ScrollLink } from "react-scroll";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MenuItems } from "./Navbar";

const socialLinks = [
    { href: "https://github.com/CanReader", icon: BsGithub, label: "GitHub" },
    { href: "https://www.linkedin.com/in/bereader/", icon: BsLinkedin, label: "LinkedIn" },
    { href: "https://x.com/can_reader", icon: BsTwitterX, label: "X (Twitter)" },
    { href: "https://stackoverflow.com/users/13887310/canberk", icon: BsStackOverflow, label: "Stack Overflow" },
    { href: "https://www.instagram.com/canthereader/", icon: BsInstagram, label: "Instagram" },
];

const Footer = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <footer ref={ref} className="border-t border-white/10 mt-20 pt-12 pb-8 px-5 md:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="max-w-6xl mx-auto"
            >
                {/* Top row: branding + nav + back to top */}
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-10">
                    {/* Branding */}
                    <div className="text-center md:text-left">
                        <ScrollLink
                            to="intro"
                            smooth={true}
                            duration={800}
                            className="cursor-pointer text-2xl font-[800] text-textWhite hover:text-heading transition-colors duration-300"
                        >
                            Canberk Pitirli
                        </ScrollLink>
                        <p className="text-textPara text-sm mt-2 max-w-xs">
                            Software Developer passionate about game engines, graphics programming, and building things that matter.
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                        {MenuItems.map((item) => (
                            <ScrollLink
                                key={item.url}
                                to={item.url}
                                smooth={true}
                                duration={800}
                                className="cursor-pointer text-textLight text-sm hover:text-textWhite transition-colors duration-300"
                            >
                                {item.name}
                            </ScrollLink>
                        ))}
                    </nav>

                    {/* Back to top */}
                    <ScrollLink
                        to="intro"
                        smooth={true}
                        duration={800}
                        className="cursor-pointer group flex items-center gap-2 text-textLight hover:text-textWhite transition-colors duration-300"
                    >
                        <span className="text-sm hidden sm:inline">Back to top</span>
                        <span className="border border-white/20 group-hover:border-white/50 rounded-full p-2 transition-all duration-300 group-hover:-translate-y-1">
                            <FaArrowUp className="text-sm" />
                        </span>
                    </ScrollLink>
                </div>

                {/* Social links */}
                <div className="flex justify-center gap-5 mb-8">
                    {socialLinks.map((social) => (
                        <a
                            key={social.label}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.label}
                            className="text-textLight hover:text-textWhite text-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <social.icon />
                        </a>
                    ))}
                </div>

                {/* Divider + Copyright */}
                <div className="border-t border-white/10 pt-6 text-center">
                    <p className="text-textPara text-sm">
                        All Rights Reserved &copy; {new Date().getFullYear()} &mdash; Canberk Pitirli
                    </p>
                </div>
            </motion.div>
        </footer>
    );
};

export default Footer;
