import { Component } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import { Carousel } from 'react-responsive-carousel';
import Button from '@mui/material/Button';

import FKLogo from '../../public/img/FKLogo.png';
import FKAd1 from '../../public/img/FK_Ad1.png';
import FKAd2 from '../../public/img/FK_Ad2.png';
import FKAd3 from '../../public/img/FK_Ad3.png';
import FKAd4 from '../../public/img/FK_Ad4.png';

import CSLogo from '../../public/img/Cs Logo.svg';
import CPPLogo from '../../public/img/Cpp Logo.svg';
import JLogo from '../../public/img/Java Logo.svg';
import JSLogo from '../../public/img/JS Logo.svg';
import UELogo from '../../public/img/UE Logo.svg';
import ULogo from '../../public/img/Unity Logo.svg';
import PYLogo from '../../public/img/Python Logo.svg';

import ASLogo from '../../public/img/AS Logo.svg';
import GLESLogo from '../../public/img/GLES Logo.svg';
import LibGDXLogo from '../../public/img/LibGDX Logo.svg';
import MYLogo from '../../public/img/MySQL Logo.svg';
import DXLogo from '../../public/img/DX Logo.svg';
import NodeLogo from '../../public/img/Node Logo.svg';

import AndroidLogo from '../../public/img/Android Logo.svg';
import AppleLogo from '../../public/img/Apple Logo.svg';
import WindowsLogo from '../../public/img/Windows Logo.svg';
import LinuxLogo from '../../public/img/Linux Logo.svg';

import "react-responsive-carousel/lib/styles/carousel.min.css";
import 'react-vertical-timeline-component/style.min.css';
import 'react-slideshow-image/dist/styles.css'

import '../../public/stylesheets/Experiences.css'
import { LinearProgress } from '@mui/material';
import { BorderAll, ThirtyFpsSelect } from '@mui/icons-material';

const JColor = '#f2b40c';
const JSColor = '#FEDD24';
const CppColor = '#2554DE';
const CSColor = '#925de2';
const UEColor = '#333435';
const UColor = '#333435';
const PYColor = '#316e9f';

class Experiences extends Component {
  getData() {
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
        iconBackground: `linear-gradient(to right,${JColor},90%,${JSColor})`,
        progress: 1,
        progressStatus: 'Completed',
        platform:[AndroidLogo, AppleLogo],
        techs:[ASLogo,LibGDXLogo,MYLogo,NodeLogo],
        git:'https://github.com/CanReader/FocusKingdomServer',
        store:'',
        images: [
          FKAd1,
          FKAd2,
          FKAd3,
          FKAd4,
          ],
      },
    ];

    return projects;
  }

  getLanguageIcon(project) {
    return (<img
      height='70%'
      src={project.language[0]}
      style={{ display: 'block', margin: 'auto' }}
    />);
  }

  Header({ project }) {
    let progress = project.progress * 100;

    let platformIcons = [];
    project.platform.map(logo => {
      platformIcons.push(<img height={15} src={logo} style={{marginRight:5}}/>);
    });

    return (
      <div className='vertical-timeline-header'>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {
            <img src={project.logo}
              width='10%'
              alt='logo'
              style={{ display: project.logo ? 'inline' : 'none' }}
            />
          }
          <h2 className='vertical-timeline-element-title'>{project.title}</h2>

          <h6 style={{alignSelf:'center', justifyContent:'end'}}>
          {project.type.split(',')[0]}
          </h6>

        </span>

        <div className='ProgressBack'>
          <span className='Progress' style={{ width: `${progress}%` }}>
            <p>{project.progressStatus}</p>
          </span>
          
        </div>

        <span style={{display:'flex',alignItems:'center'}}>
          <h5>Platforms:</h5>
          {
            ...platformIcons
          }
        </span>

      </div>
    );
  }

  Body({ project }) {
    var images = [];
    for (let i = 0; i < project.images.length; i++) {
      images.push(<img
        height='400vh'
        style={{
          objectFit:'contain'
        }}
        src={project.images[i]} 
        alt='Image'/>);
    }

    var gitLink = <a></a>
    if(project.git)
      gitLink = 
      <Button 
      variant="contained" 
      href={project.git}
      style={{marginTop:10, marginRight:5}}>
        To git repository
        </Button>

    var storeLink = <a></a>
    if(project.store)
      storeLink = <Button 
      variant="contained" 
      href={project.store}
      style={
        {
          marginTop:10
        }
        }>
        Store page
        </Button>

    var techs = [];
    for (let i = 0; i < project.techs.length; i++)
      techs.push(<img height={20} src={project.techs[i]} style={{marginRight:10}}/>);

    return (
      <div className='vertical-timeline-body'>
        <p className='description'>
          {project.desc}
        </p>
        
        <span style={{display:'flex',alignItems:'center'}}>
          <h5>Used techs:</h5>
          {...techs}
        </span>
        
        <Carousel
          className='Carousel'
          showArrows={false}
          showThumbs={false}
          showIndicators={true}
          showStatus={false}
          autoPlay={true}
          infiniteLoop={true}
        >
          {...images}
        </Carousel>

        {gitLink}
        {storeLink}
      </div>
    );
  }

  render() {
    return (<div className='Experiences'>
      <h1 className='Title'>Projects I made</h1>
      <VerticalTimeline>

        {
          this.getData().map(project => {
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
                  this.getLanguageIcon(project)
                }>

                <div className='vertical-timeline-block'>

                  <this.Header project={project} />

                  <this.Body project={project} />


                </div>
              </VerticalTimelineElement>

            );
          })}
      </VerticalTimeline>
    </div>);
  }
}


export default Experiences;