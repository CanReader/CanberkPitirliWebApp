import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Glow, GlowCapture } from "@codaworks/react-glow";
import { Grid } from "@mui/material";
import { Progress } from 'react-sweet-progress';
import Naming from './Naming';

import CSLogo from './../../public/images/Cs Logo.svg';
import CPPLogo from './../../public/images/Cpp Logo.svg';
import JLogo from './../../public/images/Java Logo.svg';
import JSLogo from './../../public/images/JS Logo.svg';
import UELogo from './../../public/images/UE Logo2.svg';
import PLogo from './../../public/images/Python Logo.svg';
import ULogo from './../../public/images/Unity Logo.svg';
import RustLogo from './../../public/images/RustLogo1.svg';
import GoLogo from './../../public/images/GoLogo.svg';

const Skills = [
    {
        name:'C#',
        image:CSLogo,
        description:'The first programming language I learned with a game development mindset. Over the years, I worked on commercial projects and even created a Udemy course focused on the WPF framework and real-world application development.',
        color:'#967AB8',
        progress : 0.80,
        type:'Language',
        isVisible:true
    },
    
    {
        name:'C++',
        image:CPPLogo,
        description:'The programming language I use and specialize in the most. My journey started with Unreal Engine 4 and continued with developing my own game engine, low-level systems, graphics programming, and performance-critical software.',
        color:'#669AD2',
        progress : 0.95,
        type:'Language',
        isVisible:true
    },

    {
        name:'Rust',
        image:RustLogo,
        description:'I am actively and passionately learning Rust with a strong focus on systems programming. I’m drawn to its strict ownership model, memory safety guarantees, and zero-cost abstractions, applying it to low-level and performance-critical systems.',
        color:'#C84409',
        progress : 0.25,
        type:'Language',
        isVisible:true
    },

    {
      name:'Go',
      image:GoLogo,
description: 'The language I picked up driven by professional necessity and quickly grew to appreciate. I am drawn to its simplicity, fast compilation, and built-in concurrency model. I am actively applying it to backend and networked systems, expanding my perspective beyond systems programming into server-side development.',
      color:'#69bad9',
      progress:0.75,
      type:'Language',
      isVisible:true
      
    },

    {
        name:'Java',
        image:JLogo,
        description:'The language where I learned the fundamentals of object-oriented programming in depth. My interest started with developing Minecraft plugins and mods, and later expanded into mobile application development and larger-scale projects.',
        color:'#F89921',
        progress : 0.85,
        type:'Language',
        isVisible:true
    },
    
    {
        name:'Unreal Engine 5',
        image:UELogo,
        description:'Unreal Engine is my primary area of expertise. I have over three years of hands-on experience and continue to build my professional career around Unreal Engine, focusing on gameplay systems, performance, and engine-level understanding.',
        color:'red',
        progress: 0.97,
        type:'Game Engine',
        isVisible:true
    },
    
    {
        name:'Python',
        image:PLogo,
        description:'I started Python while exploring artificial intelligence and data processing. I have worked with libraries such as TensorFlow, NumPy, Pandas, and SciPy, and I continue to use Python for experimentation, tooling, and learning.',
        color:'#01CE6A',
        progress: 0.79,
        type:'Language',
        isVisible:true
    },
    
    {
        name:'Javascript',
        image:JSLogo,
        description:'One of my biggest regrets is starting JavaScript later than I should have. In 2023, I realized how powerful and versatile it is, using it with Node.js, React, and Bootstrap to build modern, interactive web applications.',
        color:'#FEDE21',
        progress: 0.75,
        type:'Language',
        isVisible:true
    },
    
    {
        name:'Unity',
        image:ULogo,
        description:'Unity was my first interaction with both software and game development. Although I later switched to Unreal Engine, I still use Unity occasionally to develop hyper-casual projects and rapid prototypes.',
        color:'#818181',
        progress: 0.45,
        type:'Game Engine',
        isVisible:true
    },
];

const SkillSection = () => {
    const variants1 = {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
    };

    // Group skills by type
    const groupedSkills = Skills.reduce((acc, skill) => {
        if (!acc[skill.type]) {
            acc[skill.type] = [];
        }
        acc[skill.type].push(skill);
        return acc;
    }, {});

    // Define the order and display names for categories
    const categories = [
        { key: 'Language', title: 'Programming Languages' },
        { key: 'Game Engine', title: 'Game Engines' },
        { key: 'Framework', title: 'Frameworks' },
    ];

    const SkillCard = ({ skill, index }) => (
        <Glow key={index} color={skill.color}>
            <Grid item>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="border border-border rounded-2xl px-5 py-4 glow:ring-1 glow:border-glow glow:ring-glow glow:bg-glow/[.15]"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '300px',
                        minHeight: '380px',
                        marginBottom: '20%',
                        textAlign: 'center'
                    }}>
                    <img src={skill.image} loading="eager" style={{ height: '70px', marginLeft: 'auto', marginRight: 'auto', marginBottom: 10 }} />
                    <h1 style={{ fontSize: '1.2em', fontWeight:'600' }}>{skill.name}</h1>
                    <p style={{ fontFamily: 'ui-sans-serif', marginRight: 10, marginLeft: 10, fontSize:'0.88em' }}>{skill.description}</p>
                    <Progress style={{ marginTop: 'auto' }} percent={skill.progress * 100} status='success'
                        theme={{
                            success: {
                                symbol:
                                    skill.progress > 0.95 ? '❤️‍🔥'
                                        : skill.progress > 0.9 ? '😍'
                                            : skill.progress > 0.8 ? '🤓'
                                                : skill.progress > 0.7 ? '🙂'
                                                    : skill.progress > 0.6 ? '😐'
                                                        : skill.progress > 0.4 ? '😒'
                                                            : skill.progress > 0.3 ? '🙈'
                                                                : skill.progress > 0.2 ? '😥'
                                                                    : '😭',
                                color: skill.color
                            }
                        }}
                    />
                </motion.div>
            </Grid>
        </Glow>
    );

    // Create a component for category naming with its own ref
    const CategoryNaming = ({ text, type }) => {
        const ref = useRef(null);
        const inView = useInView(ref, { once: true, margin: "-100px" });
        
        return <Naming text={text} ref={ref} variants={variants1} inViewHeading={inView} type={type} />;
    };

    return (
        <section className="sm:px-8 py-[2px]" id="skills">
            <GlowCapture>
                <CategoryNaming text="Skills" type={1} />
                
                {categories.map((category) => {
                    const categorySkills = groupedSkills[category.key];
                    
                    // Only render the category if there are skills for it
                    if (!categorySkills || categorySkills.length === 0) return null;
                    
                    return (
                        <div key={category.key} style={{ marginBottom: '30px' }}>
                            <CategoryNaming text={category.title} type={2} />
                            <Grid container gap='10%' justifyContent={'center'}>
                                {categorySkills.map((skill, i) => (
                                    <SkillCard key={i} skill={skill} index={i} />
                                ))}
                            </Grid>
                        </div>
                    );
                })}
            </GlowCapture>
        </section>
    );
};

export default SkillSection;
