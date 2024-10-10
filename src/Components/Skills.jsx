import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Glow, GlowCapture } from "@codaworks/react-glow";
import { Grid } from "@mui/material";
import { Progress } from 'react-sweet-progress';

import CSLogo from './../../public/images/Cs Logo.svg';
import CPPLogo from './../../public/images/Cpp Logo.svg';
import JLogo from './../../public/images/Java Logo.svg';
import JSLogo from './../../public/images/JS Logo.svg';
import UELogo from './../../public/images/UE Logo2.svg';
import PLogo from './../../public/images/Python Logo.svg';
import ULogo from './../../public/images/Unity Logo.svg';

const Skills = [
    {
        name:'C#',
        image:CSLogo,
        description:'The programming language I firstly learned with thinking about game development. After years I worked on commercial projects and made a udemy course about WPF framework',
        color:'#967AB8',
        progress : 0.80
    },
    
    {
        name:'C++',
        image:CPPLogo,
        description:'The programming language mostly I use and specialize in the most. My journey started with UE4, creating my own game engine and more...',
        color:'#669AD2',
        progress : 0.95
    },
    
    {
        name:'Java',
        image:JLogo,
        description:'The programming language  where I learned details about OOP paradigm. My first interest started with coding Minecraft plugins/mods. I took it even further with mobile programming ',
        color:'#F89921',
        progress : 0.85
    },
    
    {
        name:'Unreal Engine 5',
        image:UELogo,
        description:'Unreal Engine is my actual area of expertise. I’ve used more than 3 years and thus I continue my career on this game engine ',
        color:'red',
        progress: 0.97
    },
    
    {
        name:'Python',
        image:PLogo,
        description:'I firstly started python for get started with Artificial Intelligence with TensorFlow, Numpy, Pandas, SciPy libraries and still learning...',
        color:'#01CE6A',
        progress: 0.79
    },
    
    {
        name:'Javascript',
        image:JSLogo,
        description:'One of my biggest regrets is to get started with Javascript too late. In 2023, I realized how amazing language it is. I used NodeJS, React, Bootstrap frameworks',
        color:'#FEDE21',
        progress: 0.75
    },
    
    {
        name:'Unity',
        image:ULogo,
        description:'Unity is my first interaction with both software and game development. Unfortunately because I passed to UE4, I gave a long break of using Unity but still I use unity to develop hyper casual projects',
        color:'#818181',
        progress: 0.45
    }
];

const SkillSection = () => {
    const refHeading = useRef(null);
    const inViewHeading = useInView(refHeading);

    const refContent = useRef(null);
    const inViewContent = useInView(refContent);

    const variants1 = {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
    };

    return (
        <section className=" sm:px-8 py-[80px]" id="skills">
            <motion.div
                ref={refHeading}
                variants={variants1}
                initial="initial"
                animate={inViewHeading ? "animate" : "initial"}
                transition={{ duration: 0.6 }}
                className="flex gap-4 items-center mb-10"
            >
                <h3 className="text-textWhite text-3xl sm:text-5xl font-[800]">
                    Skills
                </h3>
                <div className="min-w-0 flex-grow mt-2 h-[4px] bg-textWhite"></div>
            </motion.div>

            <GlowCapture>
                <Grid container gap='10%' justifyContent={'center'}>
                    {
                        Skills.map((skill, i) => (
                            <Glow key={i} color={skill.color}>
                                <Grid item>
                                <motion.div
                                ref={refContent}
                                initial={{ opacity: 0}}
                                animate={
                                    { opacity: 1}
                                }
                                transition={{ duration: 0.8 }}
                                className="border border-border rounded-2xl px-5 py-4 glow:ring-1 glow:border-glow glow:ring-glow glow:bg-glow/[.15]"
                                    style={{
                                        display:'flex',
                                        flexDirection:'column',
                                        width: '300px',
                                        minHeight:'380px',
                                        marginBottom:'20%',
                                        textAlign:'center'
                                    }}>
                                        <img src={skill.image} loading="eager" style={{width:'25%',marginLeft:'auto',marginRight:'auto',marginBottom:10}}/>
                                        <h1 style={{fontSize:'1.2em'}}>{skill.name}</h1>
                                        <p style={{fontFamily:'ui-sans-serif',marginRight:10,marginLeft:10}}>{skill.description}</p>
                                        <Progress style={{marginTop:'auto'}} percent={skill.progress*100} status='success'
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
                                            }}}
                                            />
                                </motion.div>
                                </Grid>
                            </Glow>
                        )
                        )
                    }
                </Grid>
            </GlowCapture>

        </section>
    );
};

export default SkillSection;
