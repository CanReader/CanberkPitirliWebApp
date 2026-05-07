import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen({ finished }) {
  return (
    <AnimatePresence>
      {!finished && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-bg flex flex-col items-center justify-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            <motion.span
              className="font-heading text-5xl sm:text-6xl font-bold text-text select-none"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            >
              CP<span className="text-accent">.</span>
            </motion.span>

            {/* Orbit ring */}
            <motion.div
              className="absolute -inset-8 rounded-full border border-accent/20"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent" />
            </motion.div>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            className="mt-12 w-48 h-[2px] bg-border rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
