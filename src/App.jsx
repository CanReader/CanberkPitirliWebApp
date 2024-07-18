import "./App.css";
import Profile from "./components/Profile";
import Navbar from "./components/Navbar";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";

export default function App() {
    return (
        <>
            <Navbar />
            <main className=" bg-bgDark text-textWhite px-5 md:px-8">
                <Profile/>
                <About/>
                <Skills/>
                <Projects/>
                <Contact/>
            </main>
        </>
    );
}
