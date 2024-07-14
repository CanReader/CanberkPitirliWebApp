import { Component } from 'react';
import Typewriter from 'typewriter-effect';

import '../../public/stylesheets/Profile.css'

import MyFace from '../../public/img/Profile.png';
import GetResume from '../../public/img/Get Resume.svg';
import ContactMe from '../../public/img/Contact Me.svg';
import Github from '../../public/img/Github.svg';
import Linkedin from '../../public/img/Linkedin.svg';
import X from '../../public/img/X.svg';
import StackOverflow from '../../public/img/Stackoverflow.svg';

const SocialMediaLinks = {
    'Github': 'https://github.com/CanReader',
    'Linkedin': 'https://www.linkedin.com/in/bereader/',
    'X': 'https://x.com/can_reader',
    'StackOverflow': 'https://stackoverflow.com/users/13887310/canberk'
}

const titles = [
    'Professional developer',
    'Game developer',
    'Game designer',
    'Expert AI developer'
];

class Profile extends Component {
    SocialMediaButton({ icon }) {
        const exist = Object.keys(SocialMediaLinks).indexOf(icon) > -1;
        if (!icon || !exist)
            return <></>;
        var src = '';

        switch(icon){
            case 'Github':
                src = Github;
                break;
            case 'Linkedin':
                src = Linkedin;
                break;
            case 'StackOverflow':
                src = StackOverflow
                break;
            case 'X':
                src = X;
                break;
        }

        return <a href={SocialMediaLinks[icon]}>
                    <img src={src} alt={icon} />
            </a>
    }

    Button({ children }) {
        var src = '';

        if(children == 'Get Resume')
            src = GetResume;
        else
            src = ContactMe; 

        return (
            <button onClick={() => {
                if(children == 'Get Resume'){
                    window.open('https://drive.google.com/file/d/16QPpz5uZtzWhiHhM8AgzUK27B-e7Rnyj/view?usp=drive_link');
                }
                else{

                }
            }} className={children.replace(' ', '-')}>
                <img src={src}
                    width={"30vh"}
                    style={{ marginRight: 15 }} 
                    alt={children}/>
                {children}
            </button>);
    }

    render() {
        return (
            <section className='Profile'>
                <div className='UpPanel'>
                    <h1 className='UpTitle'>CANBERK</h1>
                    <div className='Navigator'>
                        <ul>
                            <li><a>About Me    </a></li>
                            <li><a>Skills      </a></li>
                            <li><a>Experiences </a></li>
                            <li><a>Contact Me  </a></li>
                        </ul>
                    </div>
                </div>
                <div className='MyProfile'>
                    <div style={{ marginRight: "10%", position: "absolute" }}>
                        
                        <p className='ProfileText'>
                            Hello there, <br />
                            My name is <span>Canberk Pitirli</span> <br />
                            I'm a <span>
                                <Typewriter className="typewriter" options={{
                                    strings:titles,
                                    autoStart: true,
                                    loop: true,
                                }}/>
                                </span><br/>
                        </p>
                        <ul>
                            {
                                Object.keys(SocialMediaLinks).map((val, i) =>
                                    <li key={val}>
                                        <this.SocialMediaButton icon={val}/>
                                    </li>)
                            }
                        </ul>

                        <div className='ResumeContactButtons' style={{ marginTop: "5vh", display: "flex" }}>
                            <this.Button>Contact Me</this.Button>
                            <this.Button>Get Resume</this.Button>
                        </div>
                    </div>
                    <img className='MyFace' src={MyFace} alt='This is my face :D' />
                </div>
                <div className="ScrollDown">
                    <a className='Arrows'>
                        <span /><span /><span />
                    </a>
                    <div>
                        Scroll down to learn more about me
                    </div>
                </div>
            </section>
        );
    }
}

export default Profile;
