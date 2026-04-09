import "./App.css";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Profile from "./Components/Profile";
import Navbar from "./Components/Navbar";
import About from "./Components/About";
import Skills from "./Components/Skills";
import Projects from "./Components/Projects";
import Contact from "./Components/Contact";
import Footer from "./Components/Footer";
import Stats from "./Components/Stats";
import LoadingScreen from "./Components/LoadingScreen";

export default function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  return (
    <>
      <AnimatePresence>
        {loading && (
          <LoadingScreen onComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>

      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Navbar />
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              className="bg-bgDark text-textWhite px-5 md:px-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Profile />
              <About />
              <Stats />
              <Skills />
              <Projects />
              <Contact />
              <Footer />
            </motion.main>
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}
