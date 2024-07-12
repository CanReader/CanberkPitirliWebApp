import {Component} from 'react'
import '../../public/stylesheets/MySkills.css';

import CSLogo from '../../public/img/Cs Logo.svg';
import CPPLogo from '../../public/img/Cpp Logo.svg';
import JLogo from '../../public/img/Java Logo.svg';
import JSLogo from '../../public/img/JS Logo.svg';
import UELogo from '../../public/img/UE Logo.svg';
import ULogo from '../../public/img/Unity Logo.svg';
import PLogo from '../../public/img/Python Logo.svg';


const skills = {
    Cs:{
        name:'C#',
        image:CSLogo,
        description:'The programming language I firstly learned with thinking about game development. After years I worked on commercial projects and made a udemy course about WPF framework',
        progress : 0.80
    },

    Cpp:{
        name:'C++',
        image:CPPLogo,
        description:'The programming language mostly I use and specialize in the most. My journey started with UE4, creating my own game engine and more...',
        progress : 0.95
    },

    Java:{
        name:'Java',
        image:JLogo,
        description:'The programming language  where I learned details about OOP paradigm. My first interest started with coding Minecraft plugins/mods. I took it even further with mobile programming ',
        progress : 0.85
    },

    UE:{
        name:'Unreal Engine 5',
        image:UELogo,
        description:'Unreal Engine is my actual area of expertise. I’ve used more than 3 years and thus I continue my career on this game engine ',
        progress: 0.97
    },

    Python:{
        name:'Python',
        image:PLogo,
        description:'I firstly started python for get started with Artificial Intelligence with TensorFlow, Numpy, Pandas, SciPy libraries and still learning...',
        progress: 0.75
    },

    JS:{
        name:'Javascript',
        image:JSLogo,
        description:'One of my biggest regrets is to get started with Javascript too late. In 2023, I realized how amazing language it is. I used NodeJS, React, Bootstrap frameworks',
        progress: 0.75
    },

    Unity:{
        name:'Unity',
        image:ULogo,
        description:'Unity is my first interaction with both software and game development. Unfortunately because I passed to UE4, I gave a long break of using Unity but still I use unity to develop hyper casual projects',
        progress: 0.75
    },
};

class MySkills extends Component
{
    SkillCard({object}){
        return <div className={'Card ' + object.name}>
            <img src={object.image} alt={object.name}/>
            <span className='CardName'>{object.name}</span>
            <p className='CardDescription'>{object.description}</p>
            <div className='ProgressHolder'>
                <div className='Progress' style={{
                    width: `${object.progress*100}%`
                }}>
                </div>
            </div>
        </div>
    }

    render(){
        return (<section className="MySkills">
            <h1 className='Title'>My Skills</h1>
            <div className='SkillList'>
                {
                    Object.values(skills).map((val, i) =>
                          <this.SkillCard key={i} object={val}/>)
                }
            </div>
        </section>);
    }
}

export default MySkills;