import { Component } from 'react';
import '../../public/Profile.css'

import MyFace from '../../public/My Face.png';
import GetResume from '../../public/Get Resume.svg';
import ContactMe from '../../public/Contact Me.svg';
import Github from '../../public/Github.svg';
import Linkedin from '../../public/Linkedin.svg';
import X from '../../public/X.svg';
import StackOverflow from '../../public/Stackoverflow.svg';

const SocialMediaLinks = {
    'Github': 'https://github.com/CanReader',
    'Linkedin': 'https://www.linkedin.com/in/bereader/',
    'X': 'https://x.com/can_reader',
    'StackOverflow': 'https://stackoverflow.com/users/13887310/canberk'
}

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
            <button className={children.replace(' ', '-')}>
                <img src={src}
                    width={"30vh"}
                    style={{ marginRight: 15 }} 
                    alt={children}/>
                {children}
            </button>);
    }

    render() {
        return (
            <div className='Profile'>
                <div className='UpPanel'>
                    <h1 className='UpTitle'>CANBERK</h1>
                    <div className='Navigator'>
                        <ul>
                            <li><a>About Me    </a></li>
                            <li><a>Skills      </a></li>
                            <li><a>Experiences </a></li>
                            <li><a>Reading List</a></li>
                            <li><a>Contact Me  </a></li>
                        </ul>
                    </div>
                </div>
                <div className='MyProfile'>
                    <div style={{ marginRight: "10%", position: "absolute" }}>
                        <div class="ScrollDown">
                            <a className='Arrows'>
                                <span /><span /><span />
                            </a>
                            <div>
                                Scroll down to learn more about me
                            </div>
                        </div>
                        <p className='ProfileText'>
                            Hello there, <br />
                            My name is <span>Canberk Pitirli</span> <br />
                            I'm a <span>professional developer</span> <br />
                        </p>
                        <ul>
                            {
                                Object.keys(SocialMediaLinks).map((val, i) =>
                                    <li><this.SocialMediaButton icon={val} /></li>)
                            }
                        </ul>

                        <div className='ResumeContactButtons' style={{ marginTop: "5vh", display: "flex" }}>
                            <this.Button>Contact Me</this.Button>
                            <this.Button>Get Resume</this.Button>
                        </div>
                    </div>
                    <img className='MyFace' src={MyFace} alt='This is my face :D' />
                </div>
            </div>
        );
    }
}

export default Profile;