import { useForm, ValidationError } from "@formspree/react";
import emailjs from '@emailjs/browser';
import linkedin from "../../public/images/linkedin.svg";
import twitter from "../../public/images/twitter.svg";
import instagram from "../../public/images/instagram.svg";
import github from "../../public/images/github.svg";
import { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

emailjs.init({
    publicKey: '4_l3B7W070UlktnIE',
  blockHeadless: true,
})

function sendMail(data) {
    let email = data.email;
    let subject = data.subject;
    let message = data.message;
    if(email && subject && message){
        emailjs.send("service_2bl3p3k","template_jrdzeb3",{
            from_name: 'Unknown',
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


const Contact = () => {
    const refHeading = useRef(null);
    const inViewHeading = useInView(refHeading);
    const refContent = useRef(null);
    const inViewContent = useInView(refContent);

    const [show, setShow] = useState(false);
    const [state, handleSubmit] = useForm('ContactMe');
    const [formData, setFormData] = useState({
        email: "",
        subject: "",
        message: "",
    });

    const variants1 = {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
    };
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        if (state.succeeded) {
            setShow(true);
            setFormData({
                email: "",
                subject: "",
                message: "",
            });
        }
    }, [state.succeeded]);

    return (
        <section className=" sm:px-8 pt-[80px]" id="contact">
            <motion.div
                ref={refHeading}
                variants={variants1}
                initial="initial"
                animate={inViewHeading ? "animate" : "initial"}
                transition={{ duration: 0.6 }}
                className="flex gap-4 items-center"
            >
                <h3 className="text-textWhite text-3xl sm:text-5xl font-[800]">
                    Get In Touch
                </h3>
                <div className="min-w-0 flex-grow mt-2 h-[4px] bg-textWhite"></div>
            </motion.div>
            <div className="grid md:grid-cols-2 mt-4 md:mt-10 py-12 gap-4 relative">
                <motion.div
                    ref={refContent}
                    initial={{ opacity: 0, y: -50 }}
                    animate={
                        inViewContent
                            ? { opacity: 1, y: 0 }
                            : { opacity: 1, y: -50 }
                    }
                    transition={{ duration: 1 }}
                >
                    <h5 className="text-2xl font-bold leading-9 text-textWhite my-2">
                        Let&apos;s Connect
                    </h5>
                    <p className="text-textWhite max-w-md">
                        I&apos;m actively seeking new opportunities, and I
                        welcome your messages. Whether you have inquiries or
                        simply want to say hello, feel free to reach out. <br />
                        I&apos;ll try my best to get back to you!
                    </p>
                    <div className="flex flex-row gap-5 mt-6">
                        {[
                            { href: "https://github.com/CanReader", icon: github, label: "Github" },
                            { href: "https://www.linkedin.com/in/bereader", icon: linkedin, label: "Linkedin" },
                            { href: "https://x.com/can_reader", icon: twitter, label: "Twitter" },
                            { href: "https://www.instagram.com/canthereader/", icon: instagram, label: "Instagram" },
                        ].map((social, i) => (
                            <motion.a
                                key={social.label}
                                href={social.href}
                                className="relative group hover:-translate-y-[2px] transition-all duration-500 ease-in-out"
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 20 }}
                                animate={inViewContent ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                            >
                                <img src={social.icon} alt={`${social.label} Icon`} style={{height:30}} />
                                <span className="text-textLight text-xs px-2 opacity-0 group-hover:opacity-100 absolute top-10 -left-3 w-fit">
                                    {social.label}
                                </span>
                            </motion.a>
                        ))}
                    </div>
                </motion.div>
                <motion.div
                    ref={refContent}
                    initial={{ opacity: 0, y: -50 }}
                    animate={
                        inViewContent
                            ? { opacity: 1, y: 0 }
                            : { opacity: 1, y: -50 }
                    }
                    transition={{ duration: 1 }}
                    className="mt-10 md:mt-0"
                >
                    {show ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="mt-6 w-[80%] flex items-center"
                        >
                            <p className="text-md text-textPara ">
                                Thank you for reaching out! I appreciate your
                                interest and will get back to you as soon as
                                possible. In the meantime, feel free to explore
                                more of my portfolio.
                            </p>
                        </motion.div>
                    ) : (
                        <form className="flex flex-col" onSubmit={handleSubmit}>
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={inViewContent ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="mb-6"
                            >
                                <label
                                    htmlFor="email"
                                    className="text-white block mb-2 text-sm font-medium"
                                >
                                    Your email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="bg-[#18191E] border border-[#33353F] placeholder-[#9CA2A9] text-gray-100 text-sm rounded-lg block w-full p-2.5 focus:border-heading focus:ring-1 focus:ring-heading transition-colors duration-300"
                                    placeholder="Mail adress"
                                />
                                <ValidationError
                                    prefix="Email"
                                    field="email"
                                    errors={state.errors}
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={inViewContent ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.35 }}
                                className="mb-6"
                            >
                                <label
                                    htmlFor="subject"
                                    className="text-white block text-sm mb-2 font-medium"
                                >
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="bg-[#18191E] border border-[#33353F] placeholder-[#9CA2A9] text-gray-100 text-sm rounded-lg block w-full p-2.5 focus:border-heading focus:ring-1 focus:ring-heading transition-colors duration-300"
                                    placeholder="Just saying hi"
                                />
                                <ValidationError
                                    prefix="Subject"
                                    field="subject"
                                    errors={state.errors}
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={inViewContent ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="mb-6"
                            >
                                <label
                                    htmlFor="message"
                                    className="text-white block text-sm mb-2 font-medium"
                                >
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    id="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="bg-[#18191E] border border-[#33353F] placeholder-[#9CA2A9] text-gray-100 text-sm rounded-lg block w-full p-2.5 focus:border-heading focus:ring-1 focus:ring-heading transition-colors duration-300"
                                    placeholder="Let's talk about..."
                                />
                                <ValidationError
                                    prefix="Message"
                                    field="message"
                                    errors={state.errors}
                                />
                            </motion.div>
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={inViewContent ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.65 }}
                                whileHover={{ scale: 0.98 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={state.submitting}
                                className="rounded-full mr-4 bg-transparent border-white border-2 text-white text-center hover:bg-darkHover font-medium py-2.5 px-5 w-full transition-all duration-500 ease-in-out"
                                onClick={(e) =>  {
                                    e.preventDefault();
                                    sendMail(formData);
                                }}
                            >
                                Send Message
                            </motion.button>
                        </form>
                    )}
                </motion.div>
            </div>

        </section>
    );
};

export default Contact;
