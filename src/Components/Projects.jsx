import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Button, Grid, IconButton, Chip } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub';
import StoreIcon from '@mui/icons-material/Store';
import Naming from './Naming';
import { Carousel } from "react-responsive-carousel";
import { Progress } from 'react-sweet-progress';

//The Dummy Bird
import DummyBirdLogo from '/images/DummyBirdLogo.png'
import DummyBird1 from '/images/DummyBird1.png'
import DummyBird2 from '/images/DummyBird2.png'
import DummyBird3 from '/images/DummyBird3.png'
import DummyBird4 from '/images/DummyBird4.png'

//Rebellion images
import Rebellion1 from '/images/Rebellion1.png'
import Rebellion2 from '/images/Rebellion2.png'
import Rebellion3 from '/images/Rebellion3.png'

//Introduction to DirectX programming images
import DXCourse1 from '/images/DXCourse1.png'
import DXCourse2 from '/images/DXCourse2.png'
import DXCourse3 from '/images/DXCourse3.png'
import DXCourse4 from '/images/DXCourse4.png'
import DXCourse5 from '/images/DXCourse5.png'
import DXCourse6 from '/images/DXCourse6.png'
import DXCourse7 from '/images/DXCourse7.png'

//Focus Kingdom images
import FKLogo from '/images/FKLogo.png';
import FKAd1 from '/images/FK_Ad1.png';
import FKAd2 from '/images/FK_Ad2.png';
import FKAd3 from '/images/FK_Ad3.png';
import FKAd4 from '/images/FK_Ad4.png';

//DXCraft images
import DXCraftLogo from '/images/DXCraft Logo.png';
import DXCraft1 from '/images/DXCraft1.png';
import DXCraft2 from '/images/DXCraft2.png';
import DXCraft3 from '/images/DXCraft3.png';
import DXCraft4 from '/images/DXCraft4.png';
import DXCraft5 from '/images/DXCraft5.png';

//WPF Course
import WPFCourse1 from '/images/WPFCourse1.png';
import WPFCourse2 from '/images/WPFCourse2.png';
import WPFCourse3 from '/images/WPFCourse3.png';
import WPFCourse4 from '/images/WPFCourse4.png';

//Brokeout images
import Brokeout1 from '/images/Brokeout1.png';
import Brokeout2 from '/images/Brokeout2.png';
import Brokeout3 from '/images/Brokeout3.png';
import Brokeout4 from '/images/Brokeout4.png';
import Brokeout5 from '/images/Brokeout5.png';
import Brokeout6 from '/images/Brokeout6.png';

import Rubycafe1 from '/images/Rubycafe1.png';
import Rubycafe2 from '/images/Rubycafe2.png';

//Programming languages
import CPPLogo from '/images/Cpp Logo.svg';
import CSLogo from '/images/Cs Logo.svg';
import JLogo from '/images/Java Logo.svg';
import JSLogo from '/images/JS Logo.svg';
import PythonLogo from '/images/Python Logo.svg';
import RustLogo from '/images/RustLogo1.svg';

//Operating systems
import WindowsLogo from '/images/Windows Logo.svg';
import AndroidLogo from '/images/Android Logo.svg';
import AppleLogo from '/images/Apple Logo.svg';

//Technologies
import GLLogo from '/images/GL Logo.svg';
import DXLogo from '/images/DirectX Logo.png';
import UELogo from '/images/UE Logo.svg';
import UELogo2 from '/images/UE Logo2.svg';
import ULogo from '/images/Unity Logo.svg';
import LibGDXLogo from '/images/LibGDX Logo.svg';
import NodeLogo from '/images/Node Logo.svg';
import WPFLogo from '/images/WPF Logo.svg';
import ASLogo from '/images/AS Logo.svg';
import VSLogo from '/images/VS Logo.svg';

//Databses
import MYLogo from '/images/MySQL Logo.svg';
import PSQL from '/images/PostgreSQL Logo.svg';

import 'react-vertical-timeline-component/style.min.css';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "react-sweet-progress/lib/style.css";
import { useLocation } from "react-router-dom";

const projects = [
    {
        title: 'Unawake',
        desc: 'Contributed as a C++ Developer at Reality Arts Studio to this high-fidelity action-adventure title. \
        My role focused on the architectural enhancement of core gameplay systems and the implementation of complex mechanics \
        to ensure a seamless player experience. I worked closely with technical artists and designers to bridge the gap \
        between creative vision and technical execution, while performing deep-level engine optimizations in Unreal Engine \
        to maintain high performance across demanding environments. My contributions were pivotal in stabilizing \
        frame rates and refining the overall game loop through rigorous debugging and performance profiling.',
        date: '2022-2024',
        isVisible: true,
        categories: ['Game Development'],
        type: 'AA Game',
        language: [CPPLogo],
        languageNames: ['C++'],
        iconBackground: '#1a1a1a',
        progress: 1,
        progressStatus: 'Released/Professional Work',
        platform: [WindowsLogo],
        techs: [UELogo, VSLogo],
        store: 'https://store.steampowered.com/app/1722610/Unawake/',
        images: ['https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1722610/ss_43f264bf3aa087154bc70cb5b111e733bb7dc94c.1920x1080.jpg?t=1755195743',
            'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1722610/ss_9f81660b7801a9b18d015b8b792bbb4540a71b2e.1920x1080.jpg?t=1755195743',
            'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1722610/ss_61d60295c009abf562cb897a2b5814e326ffdb8b.1920x1080.jpg?t=1755195743'],
        preview: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1722610/header.jpg?t=1755195743'
    },
    {
        title: 'The Stranger',
        desc: 'During my tenure at Reality Arts, I specialized in refining the technical foundation of "The Stranger." \
        I focused on engineering robust C++ systems to improve game stability and optimize resource management. \
        Through proactive debugging and the implementation of engine-level improvements, I successfully reduced \
        technical debt and enhanced the responsiveness of player interactions. This role required a disciplined \
        approach to performance profiling, ensuring that high-intensity gameplay remained fluid and stable for a global audience.',
        date: '2022-2024',
        isVisible: true,
        categories: ['Game Development'],
        type: 'AA Game',
        language: [CPPLogo],
        languageNames: ['C++'],
        iconBackground: '#2c3e50',
        progress: 1,
        progressStatus: 'Released/Professional Work',
        platform: [WindowsLogo],
        techs: [UELogo, VSLogo],
        store: 'https://store.steampowered.com/app/828640/The_Stranger_VR/?l=turkish&curator_clanid=35141205',
        images: ['https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/828640/ss_41de877f48eef10affbc17b47c614aa89b7e9159.1920x1080.jpg?t=1600535189',
            'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/828640/ss_9a7c4de1a78abe1c99bde14273cb87f14e09ac9b.1920x1080.jpg?t=1600535189',
            'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/828640/ss_8f498e0e46dc4be21c7f3576fe1c2294feb43581.1920x1080.jpg?t=1600535189'],
        preview: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/828640/header.jpg?t=1600535189'
    },
    {
        title: 'Endless Combat',
        desc: 'A cooperative multiplayer experience where players battle waves of zombies using characters with unique abilities and skills. Features both co-op survival mode and free-for-all PvP combat. Built with Unreal Engine to deliver robust networking, dynamic visual effects, and engaging gameplay mechanics across detailed maps. Originally a premium title, the game transitioned to free-to-play in 2023, making the intense zombie combat accessible to a wider audience.',
        date: '2014-2016',
        isVisible: true,
        categories: ['Game Development'],
        type: 'Multiplayer Game',
        language: [CPPLogo],
        languageNames: ['C++'],
        iconBackground: `#4881bf`,
        progress: 1,
        progressStatus: 'Completed & Released',
        platform: [WindowsLogo],
        techs: [UELogo, PSQL],
        store: 'https://store.steampowered.com/app/690350/Endless_Combat/',
        images: [
            'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/690350/ss_45f4c133cff300ca2d16e390727b781b15404fd7.600x338.jpg?t=1624199444',
            'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/690350/ss_d85a06ac754e699fb2b361cb519a30e9b235645a.1920x1080.jpg?t=1624199444',
            'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/690350/ss_d7592531721a18d17f1e2df8f6847ed74c19809e.600x338.jpg?t=1624199444',
            'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/690350/ss_852f48b4a2bf12133a4877a7d15e0d5d423256f1.600x338.jpg?t=1624199444'
        ],
        preview: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/690350/ss_45f4c133cff300ca2d16e390727b781b15404fd7.600x338.jpg?t=1624199444'
    },
    {
        title: 'Advanced game programming with DirectX 11',
        desc: `A comprehensive educational course designed to teach the fundamentals and advanced concepts of 3D graphics programming using DirectX 11. The curriculum covers essential topics from basic rendering pipelines to sophisticated techniques like deferred shading, shadow mapping, and post-processing effects. Published on Udemy as an ongoing project, the course receives weekly updates with new content, tutorials, and optimizations. Perfect for aspiring game developers seeking to master low-level graphics programming and build a strong foundation in real-time rendering.`,
        date: '2024-Present',
        isVisible: true,
        categories: ['Education'],
        type: 'Online Course',
        language: [CPPLogo],
        languageNames: ['C++'],
        iconBackground: `#4881bf`,
        progress: 0.75,
        progressStatus: 'In Progress - Weekly Updates',
        platform: [WindowsLogo],
        techs: [DXLogo, VSLogo],
        store: 'https://www.udemy.com/course/advanced-game-programming-with-directx-11/',
        images: [DXCourse1, DXCourse2, DXCourse3, DXCourse4, DXCourse5, DXCourse6, DXCourse7],
        preview: DXCourse1
    },
    {
        title: 'Rebellion',
        desc: 'A tactical third-person shooter featuring intense 5v5 battles between Special Forces and Rebel factions. Players choose from a roster of characters, each with unique abilities and playstyles, to engage in objective-based combat across dynamic and destructible environments. Emphasizes team coordination, strategic positioning, and character synergy to achieve victory. The project showcases advanced multiplayer systems, destructible terrain, and competitive gameplay mechanics.',
        date: '2024-2025',
        isVisible: false,
        categories: ['Game Development'],
        type: 'Multiplayer Shooter',
        language: [CPPLogo],
        languageNames: ['C++'],
        iconBackground: `#4881bf`,
        progress: 0.05,
        progressStatus: 'Early Development',
        platform: [WindowsLogo],
        techs: [UELogo, VSLogo],
        store: 'https://store.steampowered.com/app/1501560/Rebellion/',
        designdoc: 'https://docs.google.com/document/d/1CiA4SwRwFJmwA5Pn-PDyF30bffnJIeWa/edit?usp=sharing&ouid=109227678266582583277&rtpof=true&sd=true',
        images: [Rebellion1, Rebellion2, Rebellion3],
        preview: Rebellion1
    },
    {
        title: 'Focus Kingdom',
        logo: FKLogo,
        desc: 'An innovative productivity application that gamifies study and work sessions through real-time strategy game mechanics. Users earn rewards for focused work time, which they can invest in building and expanding their virtual kingdom. Features LibGDX for engaging mobile graphics, Node.js backend for real-time synchronization, and MySQL for persistent user data. Combines motivational game design with practical time management to help users overcome concentration challenges and build productive habits.',
        date: '2023-2024',
        isVisible: true,
        categories: ['Mobile', 'Backend', 'Full Stack'],
        type: 'Productivity App',
        language: [JLogo, JSLogo],
        languageNames: ['Java', 'JavaScript'],
        iconBackground: `linear-gradient(to right,${'#F2B40C'},90%,${'#EDCE24'})`,
        progress: 1,
        progressStatus: 'Completed & Published',
        platform: [AndroidLogo, AppleLogo],
        techs: [ASLogo, LibGDXLogo, MYLogo, NodeLogo],
        git: 'https://github.com/CanReader/FocusKingdomServer',
        store: 'https://play.google.com/store/apps/details?id=com.focus.kingdom.release',
        images: [FKAd1, FKAd2, FKAd3, FKAd4],
        preview: FKAd1
    },
    {
        title: 'The Dummy Bird',
        logo: DummyBirdLogo,
        desc: 'A modern 3D reimagining of the classic Flappy Bird concept, developed in Unreal Engine 5. Players navigate Dummy Bird through increasingly challenging obstacle courses featuring advanced physics simulation, dynamic lighting systems, and meticulously crafted environments. The game elevates simple tap-to-fly mechanics with stunning visuals, smooth performance optimization, and responsive controls. Designed for both casual players seeking quick entertainment and hardcore gamers pursuing high scores and achievements.',
        date: '2024',
        isVisible: true,
        categories: ['Game Development', 'Mobile'],
        type: 'Casual Game',
        language: [CPPLogo],
        languageNames: ['C++'],
        iconBackground: '#4881bf',
        progress: 1,
        progressStatus: 'Completed & Published',
        platform: [AndroidLogo, AppleLogo],
        techs: [UELogo],
        store: 'https://play.google.com/store/apps/details?id=com.sleaksoft.dummybird.release',
        images: [DummyBird1, DummyBird2, DummyBird3, DummyBird4],
        preview: DummyBird1
    },
    {
        title: 'DXCraft',
        logo: DXCraftLogo,
        desc: `A Minecraft-inspired voxel engine developed from scratch using C++ and DirectX 11 as an educational exploration of 3D graphics programming. Implements fundamental game engine systems including procedural world generation, chunk-based terrain management, block placement mechanics, and camera controls. While it doesn't aim to replicate Minecraft's full feature set, this project demonstrates core concepts in real-time rendering, spatial data structures, and interactive 3D environments. A valuable learning experience in low-level graphics API programming and game architecture.`,
        date: '2022-2023',
        isVisible: true,
        categories: ['Game Development'],
        type: 'Voxel Engine',
        language: [CPPLogo],
        languageNames: ['C++'],
        iconBackground: `#4881bf`,
        progress: 1,
        progressStatus: 'Completed',
        platform: [WindowsLogo],
        techs: [DXLogo, VSLogo, 'https://www.cdnlogo.com/logos/m/40/microsoft-xna.svg'],
        git: 'https://github.com/CanReader/DXCraft',
        images: [DXCraft1, DXCraft2, DXCraft3, DXCraft4, DXCraft5],
        preview: DXCraft1
    },
    {
        title: 'Uzman C# WPF Course',
        desc: `A comprehensive Turkish-language course designed to address the industry's growing demand for skilled WPF (Windows Presentation Foundation) developers. Covers everything from XAML fundamentals and data binding to advanced topics like custom controls, MVVM architecture, and performance optimization. The course provides practical, hands-on experience with real-world projects and best practices. Available on Udemy, it serves both beginners starting their WPF journey and experienced developers looking to deepen their expertise in modern Windows desktop application development.`,
        date: '2022',
        isVisible: true,
        categories: ['Education'],
        type: 'Online Course',
        language: [CSLogo],
        languageNames: ['C#'],
        iconBackground: `#8969af`,
        progress: 1,
        progressStatus: 'Completed & Published',
        platform: [WindowsLogo, AndroidLogo, AppleLogo],
        techs: [WPFLogo, VSLogo],
        store: 'https://www.udemy.com/course/uzman-wpf-egitim/',
        images: [WPFCourse1, WPFCourse2, WPFCourse2, WPFCourse3, WPFCourse4],
        preview: 'https://img-c.udemycdn.com/course/750x422/4406682_a5e3_2.jpg'
    },
    {
        title: 'RubySoft',
        desc: `A Point of Sale (POS) system developed specifically to address common pain points in restaurant management software. Built with WPF for a modern, responsive user interface and PostgreSQL for reliable data persistence. Features include order management, inventory tracking, table management, employee scheduling, and sales reporting. The system emphasizes ease of use for staff while providing powerful administrative tools for restaurant owners. Designed to streamline operations and improve service efficiency in food service establishments.`,
        date: '2021',
        isVisible: true,
        categories: ['Desktop Application', 'Backend'],
        type: 'POS System',
        language: [CSLogo],
        languageNames: ['C#'],
        iconBackground: `#8969af`,
        progress: 1,
        progressStatus: 'Completed',
        platform: [WindowsLogo],
        techs: [WPFLogo, VSLogo, PSQL],
        git: 'https://github.com/CanReader/Ruby',
        images: [Rubycafe1, Rubycafe2],
        preview: Rubycafe1
    },
    {
        title: 'Brokeout',
        desc: 'A 3D interpretation of the classic Breakout arcade game, implemented using OpenGL and GLFW. Developed as a learning project to understand OpenGL rendering pipelines, 3D mathematics, and real-time physics simulation. Features paddle controls, ball physics with realistic collision detection, destructible blocks with visual effects, and progressive difficulty levels. The Minecraft-inspired aesthetic adds a unique visual style while demonstrating fundamental 3D graphics programming techniques including texture mapping, lighting, and camera transformations.',
        date: '2020',
        isVisible: true,
        categories: ['Game Development'],
        type: 'Arcade Game',
        language: [CPPLogo],
        languageNames: ['C++'],
        iconBackground: `#4881bf`,
        progress: 1,
        progressStatus: 'Completed',
        platform: [WindowsLogo],
        techs: [GLLogo, VSLogo],
        git: 'https://github.com/CanReader/Brokeout',
        images: [Brokeout1, Brokeout2, Brokeout3, Brokeout4, Brokeout5, Brokeout6],
        preview: Brokeout1
    },
    {
        title: 'TodoCLI',
        desc: 'A minimalist command-line todo list manager built with Rust, emphasizing simplicity and efficiency. Provides essential task management features including adding, completing, deleting, and listing tasks through an intuitive CLI interface. Designed for developers and power users who prefer working in the terminal. Features persistent storage, clean text-based output, and fast performance. Perfect for integrating into daily workflows, scripts, or as a productivity tool for those who live in the command line.',
        date: '2024',
        isVisible: true,
        categories: ['CLI/TUI'],
        type: 'CLI Tool',
        language: [RustLogo],
        languageNames: ['Rust'],
        iconBackground: '#C84409',
        progress: 1,
        progressStatus: 'Completed',
        platform: [WindowsLogo],
        techs: [],
        git: 'https://github.com/CanReader/TodoCLI',
        images: ['https://opengraph.githubassets.com/1/CanReader/TodoCLI'],
        preview: 'https://opengraph.githubassets.com/1/CanReader/TodoCLI'
    },
    {
        title: 'TUImer',
        desc: 'An elegant terminal-based timer and stopwatch application built with Rust, featuring a beautiful text user interface (TUI). Offers multiple timing modes including countdown timers, stopwatch, and Pomodoro technique support. The interface uses terminal graphics for a polished, distraction-free experience while remaining lightweight and responsive. Ideal for time management, coding sessions, or focused work periods. Demonstrates advanced terminal UI programming and efficient resource management in a practical productivity tool.',
        date: '2024',
        isVisible: true,
        categories: ['CLI/TUI'],
        type: 'TUI Application',
        language: [RustLogo],
        languageNames: ['Rust'],
        iconBackground: '#C84409',
        progress: 1,
        progressStatus: 'Completed',
        platform: [WindowsLogo],
        techs: [],
        git: 'https://github.com/CanReader/TUImer',
        images: ['https://opengraph.githubassets.com/1/CanReader/TUImer'],
        preview: 'https://opengraph.githubassets.com/1/CanReader/TUImer'
    },
    {
        title: 'SnakeTerm',
        desc: 'A terminal-based implementation of the classic Snake game, showcasing Rust programming and terminal graphics capabilities. Features smooth gameplay, score tracking, increasing difficulty, and responsive controls all within a text-based interface. Demonstrates real-time input handling, game loop architecture, and efficient rendering in a constrained environment. A nostalgic tribute to classic gaming reimagined for modern terminal emulators, proving that engaging gameplay doesn\'t require complex graphics.',
        date: '2024',
        isVisible: true,
        categories: ['CLI/TUI', 'Game Development'],
        type: 'Terminal Game',
        language: [RustLogo],
        languageNames: ['Rust'],
        iconBackground: '#C84409',
        progress: 1,
        progressStatus: 'Completed',
        platform: [WindowsLogo],
        techs: [],
        git: 'https://github.com/CanReader/SnakeTerm',
        images: ['https://opengraph.githubassets.com/1/CanReader/SnakeTerm'],
        preview: 'https://opengraph.githubassets.com/1/CanReader/SnakeTerm'
    },
    {
        title: 'SimpleCNN',
        desc: 'A from-scratch implementation of a Convolutional Neural Network (CNN) built with Python and NumPy, designed as an educational deep learning project. Demonstrates the fundamental mathematics and algorithms behind CNNs including convolution operations, pooling layers, backpropagation, and gradient descent. Trained on image classification tasks to showcase practical applications of computer vision. An excellent resource for understanding neural network internals without the abstraction of high-level frameworks, revealing the mathematics that powers modern AI systems.',
        date: '2024',
        isVisible: true,
        categories: ['AI/ML'],
        type: 'ML Framework',
        language: [PythonLogo],
        languageNames: ['Python'],
        iconBackground: '#01CE6A',
        progress: 1,
        progressStatus: 'Completed',
        platform: [WindowsLogo],
        techs: [],
        git: 'https://github.com/CanReader/SimpleCNN',
        images: ['https://opengraph.githubassets.com/1/CanReader/SimpleCNN'],
        preview: 'https://opengraph.githubassets.com/1/CanReader/SimpleCNN'
    },
    {
        title: 'TensorBench',
        desc: 'A comprehensive benchmarking suite for comparing tensor operation performance across different deep learning frameworks and hardware configurations. Provides detailed metrics on matrix multiplication, convolution, activation functions, and other common neural network operations. Helps developers make informed decisions about framework selection and optimization strategies. Features extensive test coverage, statistical analysis, and visual performance comparisons. An essential tool for ML engineers focused on maximizing computational efficiency in production environments.',
        date: '2024',
        isVisible: true,
        categories: ['AI/ML', 'DevOps'],
        type: 'Benchmarking Tool',
        language: [PythonLogo],
        languageNames: ['Python'],
        iconBackground: '#01CE6A',
        progress: 1,
        progressStatus: 'Completed',
        platform: [WindowsLogo],
        techs: [],
        git: 'https://github.com/CanReader/TensorBench',
        images: ['https://opengraph.githubassets.com/1/CanReader/TensorBench'],
        preview: 'https://opengraph.githubassets.com/1/CanReader/TensorBench'
    },
    {
        title: 'DX11 Terrain Tessellator Demo',
        desc: 'A technical demonstration of hardware tessellation using DirectX 11, showcasing dynamic level-of-detail (LOD) terrain rendering. Implements the tessellation pipeline with hull and domain shaders to generate high-resolution terrain geometry on the GPU in real-time. Features adaptive tessellation based on camera distance, displacement mapping for realistic surface detail, and optimized rendering for large-scale environments. Demonstrates advanced graphics programming techniques essential for modern game engines and demonstrates the power of GPU-accelerated geometry generation.',
        date: '2024',
        isVisible: true,
        categories: ['Game Development'],
        type: 'Graphics Demo',
        language: [CPPLogo],
        languageNames: ['C++'],
        iconBackground: '#4881bf',
        progress: 1,
        progressStatus: 'Completed',
        platform: [WindowsLogo],
        techs: [DXLogo, VSLogo],
        git: 'https://github.com/CanReader/DX11-TerrainTesellatorDemo',
        images: ['https://opengraph.githubassets.com/1/CanReader/DX11-TerrainTesellatorDemo'],
        preview: 'https://opengraph.githubassets.com/1/CanReader/DX11-TerrainTesellatorDemo'
    },
];

// Programming language data
const programmingLanguages = [
    { name: 'C++', logo: CPPLogo },
    { name: 'C#', logo: CSLogo },
    { name: 'Java', logo: JLogo },
    { name: 'JavaScript', logo: JSLogo },
    { name: 'Python', logo: PythonLogo },
    { name: 'Rust', logo: RustLogo },
];

// Custom hook for filtering projects with multiple categories support and language filter
const useProjectFilter = (projects) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedLanguage, setSelectedLanguage] = useState(null);

    const categories = [
        'All',
        'Game Development',
        'Mobile',
        'Desktop Application',
        'Backend',
        'Frontend',
        'Full Stack',
        'Library/Framework',
        'CLI/TUI',
        'Education',
        'AI/ML',
        'DevOps',
    ];

    const filteredProjects = projects.filter(p => {
        if (!p.isVisible) return false;
        
        const categoryMatch = selectedCategory === 'All' || p.categories.includes(selectedCategory);
        const languageMatch = !selectedLanguage || p.languageNames.includes(selectedLanguage);
        
        return categoryMatch && languageMatch;
    });

    return {
        categories,
        selectedCategory,
        setSelectedCategory,
        selectedLanguage,
        setSelectedLanguage,
        filteredProjects
    };
};

const ProjectSection = () => {
    const [selectedProject, setSelectedProject] = useState(null);
    const { categories, selectedCategory, setSelectedCategory, selectedLanguage, setSelectedLanguage, filteredProjects } = useProjectFilter(projects);
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { margin: "-100px" });

    const loc = useLocation();

    useEffect(() => {
        const path = loc.pathname.toLowerCase();

        if (path === '/game') {
            setSelectedCategory('Game Development');
        } else if (path === '/mobile') {
            setSelectedCategory('Mobile');
        } else if (path === '/web' || path === '/full') {
            setSelectedCategory('Full Stack');
        } else if (path === '/front') {
            setSelectedCategory('Frontend');
        } else if (path === '/ai') {
            setSelectedCategory('AI/ML');
        }

    }, [loc.pathname]);

    const variants1 = {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
    };

    const CategoryNaming = ({ text, type }) => {
        const ref = useRef(null);
        const inView = useInView(ref, { once: true, margin: "-100px" });

        return <Naming text={text} ref={ref} variants={variants1} inViewHeading={inView} type={type} />;
    };

    const handleArrowClick = (e, project) => {
        e.stopPropagation();
        if (project.store) {
            window.open(project.store, '_blank');
        } else if (project.git) {
            window.open(project.git, '_blank');
        }
    };

    const handleLanguageClick = (langName) => {
        if (selectedLanguage === langName) {
            setSelectedLanguage(null); // Deselect if clicking the active language
        } else {
            setSelectedLanguage(langName);
        }
    };

    const ProjectLanguage = ({ lang }) => {
        if (Array.isArray(lang)) {
            return (
                <>
                    {lang.map((individualLang, index) => (
                        <img
                            key={index}
                            src={individualLang}
                            width='20'
                            height='20'
                            alt={`tech-${index}`}
                        />
                    ))}
                </>
            );
        }
        return <img src={lang} width='24' height='24' alt="tech" />;
    };

    const ProjectCard = ({ project, index }) => {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '350px',
                    height: '350px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedProject(project)}
            >
                {/* Background Image */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${project.preview})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.7)',
                    }}
                />

                {/* Overlay Content */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '20px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.7), transparent)',
                        color: 'white',
                    }}
                >
                    {/* Project Logo and Title */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        {project.logo && (
                            <img src={project.logo} style={{ height: '30px', marginRight: '10px' }} alt={project.title} />
                        )}
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{project.title}</h3>
                    </div>

                    {/* Project Type Badge */}
                    <div style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: project.iconBackground,
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        marginBottom: '8px'
                    }}>
                        {project.type}
                    </div>

                    {/* Technologies */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <ProjectLanguage lang={project.language} />
                        {project.techs && project.techs.map((tech, i) => (
                            <img key={i} src={tech} width='24' height='24' alt="tech" style={{}} />
                        ))}
                    </div>
                </div>

                {/* Arrow Icon (top right) - Opens store or git */}
                <div
                    onClick={(e) => handleArrowClick(e, project)}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    {project.store ? (
                        <StoreIcon style={{ color: 'white', fontSize: '20px' }} />
                    ) : project.git ? (
                        <GitHubIcon style={{ color: 'white', fontSize: '20px' }} />
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                    )}
                </div>
            </motion.div>
        );
    };

    const ProjectModal = ({ project, onClose }) => {
        return (
            <AnimatePresence>
                {project && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            overflowY: 'auto',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: '#1a1a1a',
                                borderRadius: '20px',
                                maxWidth: '900px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                position: 'relative',
                                color: 'white',
                            }}
                        >
                            {/* Close Button */}
                            <IconButton
                                onClick={onClose}
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    zIndex: 10,
                                }}
                            >
                                <CloseIcon />
                            </IconButton>

                            {/* Image Carousel */}
                            {project.images && project.images.length > 0 && (
                                <div style={{ marginBottom: '30px' }}>
                                    <Carousel
                                        showThumbs={false}
                                        infiniteLoop
                                        autoPlay
                                        interval={3000}
                                        showStatus={false}
                                    >
                                        {project.images.map((image, i) => (
                                            <div key={i} style={{ height: '400px', backgroundColor: '#000' }}>
                                                <img
                                                    src={image}
                                                    style={{
                                                        height: '100%',
                                                        width: '100%',
                                                        objectFit: 'contain',
                                                    }}
                                                    alt={`${project.title} ${i + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </Carousel>
                                </div>
                            )}

                            {/* Content */}
                            <div style={{ padding: '0 40px 40px 40px' }}>
                                {/* Title and Logo */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                    {project.logo && (
                                        <img src={project.logo} style={{ height: '50px', marginRight: '15px' }} alt={project.title} />
                                    )}
                                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{project.title}</h2>
                                </div>

                                {/* Date and Type */}
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                    <div style={{
                                        padding: '6px 16px',
                                        background: project.iconBackground,
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                    }}>
                                        {project.type}
                                    </div>
                                    <div style={{
                                        padding: '6px 16px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                    }}>
                                        {project.date}
                                    </div>
                                    {/* Category badges */}
                                    {project.categories.map((cat, i) => (
                                        <div key={i} style={{
                                            padding: '6px 16px',
                                            background: 'rgba(72, 129, 191, 0.3)',
                                            borderRadius: '20px',
                                            fontSize: '0.9rem',
                                        }}>
                                            {cat}
                                        </div>
                                    ))}
                                </div>

                                {/* Description */}
                                <p style={{
                                    fontSize: '1rem',
                                    lineHeight: '1.8',
                                    color: '#ccc',
                                    marginBottom: '30px'
                                }}>
                                    {project.desc}
                                </p>

                                {/* Progress */}
                                <div style={{ marginBottom: '30px' }}>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Development Progress</h3>
                                    <Progress
                                        percent={project.progress * 100}
                                        status='success'
                                        theme={{
                                            success: {
                                                symbol: project.progress >= 1 ? '✓' : '⏳',
                                                color: project.progress < 1 ? '#398FD7' : '#289B61'
                                            }
                                        }}
                                    />
                                    <p style={{ marginTop: '8px', color: '#888' }}>{project.progressStatus}</p>
                                </div>

                                {/* Technologies Used */}
                                <div style={{ marginBottom: '30px' }}>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Technologies Used</h3>
                                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                        {project.language && project.language.map((lang, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 16px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '12px',
                                            }}>
                                                <img src={lang} width='30' height='30' alt="language" />
                                            </div>
                                        ))}
                                        {project.techs && project.techs.map((tech, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 16px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '12px',
                                            }}>
                                                <img src={tech} width='30' height='30' alt="tech" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Platforms */}
                                {project.platform && project.platform.length > 0 && (
                                    <div style={{ marginBottom: '30px' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Available Platforms</h3>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            {project.platform.map((platform, i) => (
                                                <img key={i} src={platform} width='40' height='40' alt="platform" />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    {project.store && (
                                        <Button
                                            variant="contained"
                                            href={project.store}
                                            target="_blank"
                                            startIcon={<StoreIcon />}
                                            style={{
                                                background: project.iconBackground,
                                                padding: '12px 24px',
                                                borderRadius: '10px',
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                            }}
                                        >
                                            Visit Store
                                        </Button>
                                    )}
                                    {project.git && (
                                        <Button
                                            variant="outlined"
                                            href={project.git}
                                            target="_blank"
                                            startIcon={<GitHubIcon />}
                                            style={{
                                                borderColor: '#888',
                                                color: 'white',
                                                padding: '12px 24px',
                                                borderRadius: '10px',
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                            }}
                                        >
                                            GitHub Repository
                                        </Button>
                                    )}
                                    {project.designdoc && (
                                        <Button
                                            variant="outlined"
                                            href={project.designdoc}
                                            target="_blank"
                                            style={{
                                                borderColor: '#888',
                                                color: 'white',
                                                padding: '12px 24px',
                                                borderRadius: '10px',
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                            }}
                                        >
                                            Design Document
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    return (
        <section ref={sectionRef} className="sm:px-8 py-[80px]" id="projects" style={{ position: 'relative' }}>
            <CategoryNaming text="Projects" type={1} />

            <p style={{
                textAlign: 'center',
                maxWidth: '800px',
                margin: '0 auto 40px auto',
                color: '#888',
                fontSize: '1.1rem'
            }}>
                Explore my portfolio of game development projects, mobile applications, desktop software, and educational content.
                Each project showcases my expertise across different technologies and platforms. <p style={{ fontSize: '0.8rem' }}>(Click to projects for more information) </p>
            </p>

            {/* Category Filter Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    marginBottom: '60px',
                    padding: '0 20px'
                }}
            >
                {categories.map((category) => (
                    <Chip
                        key={category}
                        label={category}
                        onClick={() => setSelectedCategory(category)}
                        style={{
                            padding: '10px 20px',
                            fontSize: '0.95rem',
                            fontWeight: selectedCategory === category ? 'bold' : 'normal',
                            backgroundColor: selectedCategory === category ? '#4881bf' : 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: selectedCategory === category ? '2px solid #4881bf' : '1px solid rgba(255, 255, 255, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}
                        sx={{
                            '&:hover': {
                                backgroundColor: selectedCategory === category ? '#4881bf' : 'rgba(255, 255, 255, 0.15)',
                                transform: 'translateY(-2px)',
                            }
                        }}
                    />
                ))}
            </motion.div>

            {/* Programming Language Filter - Right Side - Only visible when section is in view */}
            <AnimatePresence>
                {isInView && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        style={{
                            position: 'fixed',
                            right: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px',
                            zIndex: 100,
                            background: 'rgba(26, 26, 26, 0.8)',
                            backdropFilter: 'blur(10px)',
                            padding: '20px 15px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#888',
                            textAlign: 'center',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                            letterSpacing: '1px'
                        }}>
                            FILTER BY
                        </div>
                        {programmingLanguages.map((lang) => (
                            <motion.div
                                key={lang.name}
                                onClick={() => handleLanguageClick(lang.name)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    width: selectedLanguage === lang.name ? '60px' : '50px',
                                    height: selectedLanguage === lang.name ? '60px' : '50px',
                                    padding: '10px',
                                    background: selectedLanguage === lang.name
                                        ? 'rgba(72, 129, 191, 0.3)'
                                        : 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: selectedLanguage === lang.name
                                        ? '2px solid #4881bf'
                                        : '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: selectedLanguage === lang.name
                                        ? '0 0 20px rgba(72, 129, 191, 0.5)'
                                        : 'none',
                                }}
                            >
                                <img
                                    src={lang.logo}
                                    alt={lang.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        filter: selectedLanguage === lang.name ? 'brightness(1.2)' : 'brightness(0.8)',
                                    }}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
                <Grid
                    container
                    spacing={4}
                    justifyContent="center"
                    style={{ maxWidth: '1400px', margin: '0 auto' }}
                >
                    {filteredProjects.map((project, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <ProjectCard project={project} index={index} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        color: '#888'
                    }}
                >
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>😢</div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#ccc' }}>
                        No Projects Found
                    </h3>
                    <p style={{ fontSize: '1.1rem' }}>
                        {selectedLanguage
                            ? `I don't have any ${selectedLanguage} projects in the ${selectedCategory} category yet.`
                            : `I can't show any project from this category right now :(`
                        }
                        <p style={{ fontSize: '0.8rem' }}>But I'm trying my hard to add some</p>
                    </p>
                </motion.div>
            )}

            {/* Project Modal */}
            <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        </section>
    );
};

export default ProjectSection;
