import { Component } from 'react';
import path from 'path';
import '../../public/AboutMe.css'
import MyFace2 from '../../public/MyFace2.png'

class AboutMe extends Component{
    render(){
        return (<div className='AboutMe'>
        <h1 className='Title'>Who am I?</h1>
        <div className='Text'>
            <p>
            Hello there, my name is Canberk. I am a professional and enthusiastic game developer with 6 years of experience. I am a quick learner with a self-learning attitude and am passionate about problem-solving. My passion for game development began with the thought, "When I play a game, I enjoy it. So, if I create a game, I create enjoyment." My passion on technology led me expand my knowledge to include desktop development, mobile development, web development, and AI. My core skills are based on C/C++, Java, and C#, and I also have intermediate skills in Python, React, and Flutter/Dart.
            </p>
            <img src={MyFace2}/>
        </div>
        </div>);
    }
}


export default AboutMe;