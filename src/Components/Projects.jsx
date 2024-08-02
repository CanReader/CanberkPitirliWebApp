
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import { motion, progress, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@mui/material";
import { Carousel } from "react-responsive-carousel";
import { Progress } from 'react-sweet-progress';

//Focus Kingdom images
import FKLogo from '/images/FKLogo.png';
import FKAd1 from '/images/FK_Ad1.png';
import FKAd2 from '/images/FK_Ad2.png';
import FKAd3 from '/images/FK_Ad3.png';
import FKAd4 from '/images/FK_Ad4.png';

//DXCraft images
import DXCraftLogo from '../../public/images/DXCraft Logo.png';
import DXCraft1 from '/images/DXCraft1.png';
import DXCraft2 from '/images/DXCraft2.png';
import DXCraft3 from '/images/DXCraft3.png';
import DXCraft4 from '/images/DXCraft4.png';
import DXCraft5 from '/images/DXCraft5.png';

//
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
import CPPLogo from '../../public/images/Cpp Logo.svg';
import CSLogo from '../../public/images/Cs Logo.svg';
import JLogo from '../../public/images/Java Logo.svg';
import JSLogo from '../../public/images/JS Logo.svg';

//Operating systems
import WindowsLogo from '../../public/images/Windows Logo.svg';
import AndroidLogo from '../../public/images/Android Logo.svg';
import AppleLogo from '../../public/images/Apple Logo.svg';

//Technologies
import GLLogo from '../../public/images/GL Logo.svg';
import DXLogo from '../../public/images/DirectX Logo.svg';
import UELogo from '../../public/images/UE Logo.svg';
import UELogo2 from '../../public/images/UE Logo2.svg';
import ULogo from '../../public/images/Unity Logo.svg';
import LibGDXLogo from '../../public/images/LibGDX Logo.svg';
import NodeLogo from '../../public/images/Node Logo.svg';
import WPFLogo from '../../public/images/WPF Logo.svg';
import ASLogo from '../../public/images/AS Logo.svg';
import VSLogo from '../../public/images/VS Logo.svg';

//Databses
import MYLogo from '../../public/images/MySQL Logo.svg';
import PSQL from '../../public/images/PostgreSQL Logo.svg';

import 'react-vertical-timeline-component/style.min.css';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "react-sweet-progress/lib/style.css";

const projects = [
    {
      title: 'Focus Kingdom',
      logo: FKLogo,
      desc: 'Focus kingdom is such an amazing place for people who stuggle to concentrate! \
      The creation of this app is focused on gamify users study/work as a real-time strategy game.\
      With this attitude, users will be motivated for work more at their own tasks to add these gorgeous buildings to their virtual world.',
      date: '2023-2024',
      isVisible:true,
      type: 'App',
      language: [JLogo, JSLogo],
      iconBackground: `linear-gradient(to right,${'#F2B40C'},90%,${'#EDCE24'})`,
      progress: 0.8,
      progressStatus: 'Completed',
      platform:[AndroidLogo, AppleLogo],
      techs:[ASLogo,LibGDXLogo,MYLogo,NodeLogo],
      git:'https://github.com/CanReader/FocusKingdomServer',
      store:'https://play.google.com/store/apps/details?id=com.focus.kingdom.release',
      images: [FKAd1,FKAd2,FKAd3,FKAd4],
    },
    {
        title: 'DXCraft',
        logo: DXCraftLogo,
        desc: `This is a small-scale Minecraft-inspired project developed as a learning exercise using C++ and DirectX. Its primary purpose is to explore 3D graphics programming concepts, world generation, and game engine fundamentals.\
         While it features basic block-based gameplay, it lacks the depth and complexity of a full-fledged game. \
         Images are used as representation from original java Minecraft. Images of the game will be added soon...`,
        date: '2022',
        isVisible:true,
        type: 'Game',
        language: [CPPLogo],
        iconBackground: `#4881bf`,
        progress: 0.1,
        progressStatus: 'Completed',
        platform:[WindowsLogo],
        techs:[DXLogo,VSLogo,'https://www.cdnlogo.com/logos/m/40/microsoft-xna.svg'],
        git:'https://github.com/CanReader/DXCraft',
        images: [DXCraft1,DXCraft2,DXCraft3,DXCraft4,DXCraft5],
      },
      {
        title: 'Uzman C# WPF course',
        desc: `The industry's growing demand for skilled WPF developers led to the creation of this comprehensive course.\
        Designed to equip learners with the essential skills and knowledge needed to excel in WPF development,\
        the course remains available on Udemy. Whether you're a beginner looking to start your journey or a seasoned developer aiming to \
        enhance attendence's expertise, this course offers valuable insights and practical experience in WPF.`,
        date: '2022',
        isVisible:true,
        type: 'Course',
        language: [CSLogo],
        iconBackground: `#8969af`,
        progress: 1,
        progressStatus: 'Completed',
        platform:[WindowsLogo,AndroidLogo,AppleLogo],
        techs:[WPFLogo,VSLogo],
        store:'https://www.udemy.com/course/uzman-wpf-egitim/',
        images: [WPFCourse1,WPFCourse2,WPFCourse2,WPFCourse3,WPFCourse4],
      },
      {
        title: 'RubySoft',
        desc: `RubySoft is firstly started to fix problems of most POS applications for restaurant like organizations.\
         Images are used as representation from SambaPos. Images of the app will be added soon...`,
        date: '2021',
        isVisible:true,
        type: 'Application',
        language: [CSLogo],
        iconBackground: `#8969af`,
        progress: 0.95,
        progressStatus: 'Completed',
        platform:[WindowsLogo],
        techs:[WPFLogo,VSLogo,PSQL],
        git:'https://github.com/CanReader/Ruby',
        images: [Rubycafe1,
            Rubycafe2
        ],
      },
      ,
      {
        title: 'Brokeout',
        desc: 'A 3D breakout game made with OpenGL and GLFW. This project is initialized for learning the path of OpenGL,\
        inspired by Minecraft',
        date: '2020',
        isVisible:true,
        type: 'Game',
        language: [CPPLogo],
        iconBackground: `#4881bf`,
        progress: 1,
        progressStatus: 'Completed',
        platform:[WindowsLogo],
        techs:[GLLogo, VSLogo],
        git:'https://github.com/CanReader/Brokeout',
        images: [Brokeout1,Brokeout2,Brokeout3,Brokeout4,Brokeout5,Brokeout6],
      },
      {
        title: 'Endless Combat',
        desc: 'Endless Combat, is a coop game which is about fighting as characters with unique skills against zombies,\
    the game also contains free for all mode; Unreal Engine is used as game engine to create a better network system,effects,game mechanics and maps.\
    After 2023, the game has been updated as free to play.',
        date: '2014-2016',
        isVisible:true,
        type: 'Game',
        language: [CPPLogo],
        iconBackground: `#4881bf`,
        progress: 1,
        progressStatus: 'Completed',
        platform:[WindowsLogo],
        techs:[UELogo,PSQL],
        store:'https://store.steampowered.com/app/690350/Endless_Combat/',
        images: [
            'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/690350/ss_45f4c133cff300ca2d16e390727b781b15404fd7.600x338.jpg?t=1624199444',
            'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/690350/ss_d85a06ac754e699fb2b361cb519a30e9b235645a.1920x1080.jpg?t=1624199444',
            'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/690350/ss_d7592531721a18d17f1e2df8f6847ed74c19809e.600x338.jpg?t=1624199444',
            'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/690350/ss_852f48b4a2bf12133a4877a7d15e0d5d423256f1.600x338.jpg?t=1624199444'
        ],
      },
  ];

const ProjectSection = () => {
    const refHeading = useRef(null);
    const inViewHeading = useInView(refHeading);

    const variants1 = {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
    };

    const getAppLogo = (project) => {
        if(project.logo)
            return <img src={project.logo} style={{height:'35px',marginRight:5}}/>
    }

    const getPlatforms = (platforms) => {
        let platformList = [];
        if(platforms)
            for(let platform of platforms)
        platformList.push(<img src={platform} style={{height:20, marginLeft:5}}/>);

        return platformList;
    }
    
    const getUsedTechs = (project) => {
        let techList = [];
        if(project.techs)
            for(let tech of project.techs)
                techList.push(<img src={tech} width='20' style={{marginRight:3,marginLeft:2}}/>);
        return techList;
    }

    const getCarouselImages = (images) => {
        let imageList = [];
        if(images)
            for(let image of images)
                imageList.push(<img
                    src={image} 
                    style={{
                        height:400,
                        objectFit:'contain',
                    }}
                    alt='Image'/>);
        return imageList;
    }

    const repoButton = (link) => {
    return link ? 
        <Button variant="contained" style={{marginTop:'2vh',marginRight:5,fontSize:5}} href={link}>
            To git repository
            </Button> 
        : <></>
    };

    const storeButton = (link) => {
    return link ? 
        <Button variant="contained" style={{marginTop:'2vh',marginRight:5,fontSize:5}} href={link}>
            Get Store
            </Button> 
        : <></>
    };

    return (
        <section className=" sm:px-8 py-[80px]" id="projects">
            <motion.div
                ref={refHeading}
                variants={variants1}
                initial="initial"
                animate={inViewHeading ? "animate" : "initial"}
                transition={{ duration: 0.6 }}
                className="flex gap-4 items-center"
            >
                <h3 className="text-textWhite text-3xl sm:text-5xl font-[800]">
                    Projects
                </h3>
                <div className="min-w-0 flex-grow mt-2 h-[4px] bg-textWhite"></div>

            </motion.div>

            <VerticalTimeline>

        {
          projects.map((project,index) => {
            return (

              <VerticalTimelineElement
                key={index}
                date={project.date}
                iconStyle={
                  {
                    background: `${project.iconBackground}`,
                    display: 'flex',
                    alignItems: 'center'
                  }
                }
                icon={
                    <img src={project.language[0]} style={{height:'80%',marginLeft:'auto',marginRight:'auto'}}/>
                }>

                <div className='vertical-timeline-block text-[#000000]'>
                    <span style={{display:'flex'}}>
                        {getAppLogo(project)}
                        <h1 style={{display:'inline',fontSize:'1.5em', fontFamily:'sans'}}>{project.title}</h1>
                    </span>
                    <span style={{display:'flex'}}>
                        <p style={{margin:0}}>Platforms:</p>
                        {...getPlatforms(project.platform)}
                    </span>
                    <Progress percent={project.progress*100} status={
                        project.progress == 1 ? 'success' : 'active'
                        }/>
                    <p>{project.desc}</p>
                    <span style={{display:'flex',marginTop:10,marginBottom:5}}>
                        <p style={{margin:0}}>Used Techs:</p>
                        {...getUsedTechs(project)}
                    </span>
                        <Carousel
                        className='bg-neutral-100 border'
                        showArrows={false}
                        showThumbs={false}
                        showIndicators={true}
                        showStatus={false}
                        autoPlay={true}
                        infiniteLoop={true}>
                            {...getCarouselImages(project.images)}
                        </Carousel>

                        {repoButton(project.git)}
                        {storeButton(project.store)}
                </div>
              </VerticalTimelineElement>

            );
          })}
      </VerticalTimeline>

            
        </section>
    );
};

export default ProjectSection;