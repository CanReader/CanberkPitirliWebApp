
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import { motion, progress, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@mui/material";
import { Carousel } from "react-responsive-carousel";
import { Progress } from 'react-sweet-progress';

import FKLogo from '/images/FKLogo.png';
import FKAd1 from '/images/FK_Ad1.png';
import FKAd2 from '/images/FK_Ad2.png';
import FKAd3 from '/images/FK_Ad3.png';
import FKAd4 from '/images/FK_Ad4.png';

import JLogo from '../../public/images/Java Logo.svg';
import JSLogo from '../../public/images/JS Logo.svg';
import LibGDXLogo from '../../public/images/LibGDX Logo.svg';
import AndroidLogo from '../../public/images/Android Logo.svg';
import AppleLogo from '../../public/images/Apple Logo.svg';
import ASLogo from '../../public/images/AS Logo.svg';
import MYLogo from '../../public/images/MySQL Logo.svg';
import NodeLogo from '../../public/images/Node Logo.svg';

import 'react-vertical-timeline-component/style.min.css';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "react-sweet-progress/lib/style.css";

const projects = [
    {
      id: 0,
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
      progress: 1,
      progressStatus: 'Completed',
      platform:[AndroidLogo, AppleLogo],
      techs:[ASLogo,LibGDXLogo,MYLogo,NodeLogo],
      git:'https://github.com/CanReader/FocusKingdomServer',
      store:'',
      images: [FKAd1,FKAd2,FKAd3,FKAd4],
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
            return <img src={project.logo} width='40'/>
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
                        objectFit:'contain',
                        width:'50%'
                    }}
                    alt='Image'/>);
        return imageList;
    }

    const repoButton = (link) => {
    return link ? 
        <Button variant="contained" style={{marginTop:'2vh'}} href="https://github.com/CanReader/FocusKingdomServer/">
            To git repository
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
          projects.map(project => {
            return (

              <VerticalTimelineElement
                key={project.id}
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
                </div>
              </VerticalTimelineElement>

            );
          })}
      </VerticalTimeline>

            
        </section>
    );
};

export default ProjectSection;