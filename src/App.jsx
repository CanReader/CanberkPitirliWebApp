import "./App.css";
import Profile from "./Components/Profile";
import Navbar from "./Components/Navbar";
import About from "./Components/About";
import Skills from "./Components/Skills";
import Projects from "./Components/Projects";
import Contact from "./Components/Contact";

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
