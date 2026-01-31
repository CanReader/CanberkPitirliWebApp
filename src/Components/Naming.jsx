import React, { forwardRef } from "react";
import { motion } from "framer-motion";

const Naming = forwardRef(({ text = "Name", variants, inViewHeading = false, type = 1 }, ref) => {
  const commonProps = {
    ref,
    variants,
    initial: "initial",
    animate: inViewHeading ? "animate" : "initial",
    transition: { duration: 0.6 }
  };

  switch (type) {
    case 1: // Title + Trailing Line
      return (
        <motion.div {...commonProps} className="flex gap-4 items-center mb-10">
          <h3 className="text-textWhite text-3xl sm:text-5xl font-[800] whitespace-nowrap">{text}</h3>
          <div className="min-w-0 flex-grow mt-2 h-[4px] bg-textWhite"></div>
        </motion.div>
      );

    case 2: // Small Centered + Fixed Short Lines
      return (
        <motion.div {...commonProps} className="flex gap-4 items-center mb-6 justify-center">
          <div className="w-12 h-[2px] bg-textWhite/50"></div>
          <h4 className="text-textWhite text-xl sm:text-2xl font-[600] uppercase tracking-widest px-2 text-center">{text}</h4>
          <div className="w-12 h-[2px] bg-textWhite/50"></div>
        </motion.div>
      );

    case 3: // Centered + Full Expanding Lines
      return (
        <motion.div {...commonProps} className="flex gap-4 items-center mb-6 justify-center">
          <div className="min-w-0 flex-grow mt-2 h-[4px] bg-textWhite"></div>
          <h4 className="text-textWhite text-xl sm:text-4xl font-[800] uppercase tracking-widest px-2">{text}</h4>
          <div className="min-w-0 flex-grow mt-2 h-[4px] bg-textWhite"></div>
        </motion.div>
      );

    case 4: // Modern Gradient Underline
      return (
        <motion.div {...commonProps} className="inline-block mb-8">
          <h3 className="text-textWhite text-2xl sm:text-4xl font-[700] pb-1">{text}</h3>
          <div className="h-[4px] w-full bg-gradient-to-r from-textWhite to-transparent"></div>
        </motion.div>
      );

    case 5: // Code/Systems Style (Brackets)
      return (
        <motion.div {...commonProps} className="flex items-center gap-2 mb-6 text-textWhite font-mono">
          <span className="text-3xl font-[300] opacity-50">[</span>
          <h4 className="text-lg sm:text-xl font-[600] uppercase tracking-[0.2em]">{text}</h4>
          <span className="text-3xl font-[300] opacity-50">]</span>
        </motion.div>
      );

    case 6: // Vertical Accent (Sidebar Style)
      return (
        <motion.div {...commonProps} className="flex items-center gap-4 mb-8 border-l-8 border-textWhite pl-6">
          <h3 className="text-textWhite text-3xl sm:text-5xl font-[900] leading-none uppercase">{text}</h3>
        </motion.div>
      );

    case 7: // Overlined (Minimalist/Industrial)
      return (
        <motion.div {...commonProps} className="inline-flex flex-col mb-8">
          <div className="w-1/3 h-[6px] bg-textWhite mb-2"></div>
          <h3 className="text-textWhite text-2xl sm:text-4xl font-[800] tracking-tighter">{text}</h3>
        </motion.div>
      );

    case 8: // Sub-label + Main Title (Stacked)
      return (
        <motion.div {...commonProps} className="flex flex-col mb-10">
          <span className="text-textWhite/60 text-xs font-mono uppercase tracking-[0.5em] mb-1">0x0_SECTION</span>
          <h3 className="text-textWhite text-4xl sm:text-6xl font-[900]">{text}</h3>
        </motion.div>
      );

    case 9: // Dot Indicator (Status Style)
      return (
        <motion.div {...commonProps} className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 rounded-full bg-textWhite animate-pulse"></div>
          <h4 className="text-textWhite text-xl sm:text-2xl font-[500] tracking-widest uppercase">{text}</h4>
        </motion.div>
      );

    case 10: // The "Gamer/Engine" Outlined Style
      return (
        <motion.div {...commonProps} className="mb-10 text-center">
          <h3 className="text-5xl sm:text-7xl font-[900] uppercase tracking-tighter text-transparent" 
              style={{ WebkitTextStroke: "1px rgba(255,255,255,0.5)" }}>
            {text}
          </h3>
          <div className="h-[2px] w-24 bg-textWhite mx-auto -mt-2"></div>
        </motion.div>
      );

    default:
      return null;
  }
});

export default Naming;
