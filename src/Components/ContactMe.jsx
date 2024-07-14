import { Component } from 'react';
import { Button, TextField } from '@mui/material';
import emailjs from '@emailjs/browser';

import '../../public/stylesheets/ContactMe.css'

import linkedin from '../../public/img/Linkedin.svg'
import x from '../../public/img/X.svg'
import ig from '../../public/img/Instagram Logo.svg'

var name = '';
var subject = '';
var message = '';
var email = '';

emailjs.init({
    publicKey: '4_l3B7W070UlktnIE',
  blockHeadless: true,
})

class ContactMe extends Component {
    sendMail(e) {
        e.preventDefault();
        
        if(name && subject && email){
            emailjs.send("service_2bl3p3k","template_jrdzeb3",{
                from_name: name,
                subject: subject,
                to_name: "Canberk Pitirli",
                message: message,
                from_mail: email,
                reply_to: 'canberkcs1912@gmail.com',
                }).then(
                    (response) => {
                    console.log('SUCCESS!', response.status, response.text);
                  },
                  (error) => {
                    console.log('FAILED...', error);
                  },);
        }
    }

    onHoverMediaButton(isIn,media){
        console.log(isIn ? 'Cursor inside' : 'Cursor outside');
    }

    render() {
        return (<>
            <section className='ContactMe'>
                <h1 className='Title'>Contact me</h1>
                <div className='Container'>
                    <div className='MailCard'>
                        <span className='CardContent'>
                            <div className='MailCardLeft'>
                                <TextField
                                    className='NameBox'
                                    onChange={(e) => {name = e.target.value}}
                                    label="Full Name"
                                    variant='standard'
                                    required={true}
                                />
                                <TextField
                                    className='SubjectBox'
                                    onChange={(e) => {subject = e.target.value}}
                                    label="Subject"
                                    variant='standard'
                                    required={true}
                                />
                                <TextField
                                    className='EmailBox'
                                    onChange={(e) => {email = e.target.value}}
                                    label="Email"
                                    variant='standard'
                                    required={true}
                                />
                            </div>
                            <div className='MailCardRight'>
                                <TextField
                                    className='MessageBox'
                                    onChange={(e) => {message = e.target.value}}
                                    variant='outlined'
                                    label="Message"
                                    multiline={true}
                                    size='medium'
                                    minRows={11}
                                    maxRows={15}
                                    style={{marginBottom:5}}
                                />
                                <Button
                                    variant='contained'
                                    onClick={(e) => this.sendMail(e)}>
                                    Submit
                                </Button>
                            </div>
                        </span>
                        <div className='ContactInfo'>
                            <div>
                                <img src='https://www.svgrepo.com/show/513317/location-pin.svg' height={30} />
                                <p>Ataturk mah. Sedef sok. Taşkın Vadi Konakları c blok no:14 daire 6 Kırklareli/Lüleburgaz</p>
                            </div>
                            <div>
                                <img src='https://www.svgrepo.com/show/513293/envelope.svg' height={30} />
                                <p style={{ cursor: 'pointer' }} onClick={() => { window.open('mailto:canberkcs1912@gmail.com') }}>canberkcs1912@gmail.com</p>
                            </div>
                            <div>
                                <img src='https://www.svgrepo.com/show/513336/phone-handle.svg' height={30} />
                                <p>(+90) 532-292-0939</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='SocialMedias'>
                    <p>Did you check my social media accounts?</p>
                    <span>
                        <a href="https://www.linkedin.com/in/bereader/" onMouseEnter={this.onHoverMediaButton(true, 'linkedin')} onMouseLeave={this.onHoverMediaButton(false, 'linkedin')}>
                            <img className='linkedin' src={linkedin} />
                        </a>
                        <a className='x' href="https://x.com/can_reader" onMouseEnter={this.onHoverMediaButton(true, 'x')} onMouseLeave={this.onHoverMediaButton(false, 'x')}>
                            <img className='x' src={x} />
                        </a>
                        <a href="https://www.instagram.com/canthereader/" onMouseEnter={this.onHoverMediaButton(true, 'instagram')} onMouseLeave={this.onHoverMediaButton(false, 'instagram')}>
                            <img className='Instagram' src={ig} />
                        </a>
                    </span>
                </div>
            </section>

            <p className='Copyright'>
                Copyright © {new Date().getFullYear()} by Canberk Pitirli |
                Developed with ReactJS
            </p>
        </>
        );
    }
}


export default ContactMe;