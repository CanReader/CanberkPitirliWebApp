import { Component } from 'react';
import path from 'path';
import '../../public/Profile.css'

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

        return <img src={`../../public/${icon}.svg`} alt={icon} />
    }

    Button({ children }) {
        return (
            <button className={children.replace(' ', '-')}>
                <img src={`../../public/${String(children)}.svg`}
                    width={"30vh"}
                    style={{ marginRight: 15 }} />
                {children}
            </button>);
    }

    render() {
        return (
            <div className='Profile'>
                <div className='UpPanel'>
                    <h1 className='Title'>CANBERK</h1>
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
                        <p>
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

                        <div style={{ marginTop: "5vh", display: "flex" }}>
                            <this.Button>Contact Me</this.Button>
                            <this.Button>Get Resume</this.Button>
                        </div>
                    </div>
                    <img className='MyFace' src='../../public/My Face.png' alt='This is my face :D' />
                </div>
            </div>
        );
    }
}

export default Profile;