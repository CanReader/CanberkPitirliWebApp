import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Send, CheckCircle, Download } from "lucide-react";
import emailjs from "@emailjs/browser";
import MagneticButton from "./MagneticButton";
import { trackEvent } from "../lib/analytics";

emailjs.init({ publicKey: "4_l3B7W070UlktnIE", blockHeadless: true });

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ email: "", subject: "", message: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.subject || !form.message) return;
    setSending(true);
    try {
      await emailjs.send("service_2bl3p3k", "template_jrdzeb3", {
        from_name: "Portfolio Visitor",
        subject: form.subject,
        to_name: "Canberk Pitirli",
        message: form.message,
        from_mail: form.email,
        reply_to: "mail@canberkpitirli.com",
      });
      setSent(true);
      setForm({ email: "", subject: "", message: "" });
      trackEvent("contact_submit");
    } catch (err) {
      console.error("Failed to send:", err);
      trackEvent("contact_error");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-24 lg:py-32" ref={ref}>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
      >
        <motion.p variants={fadeUp} className="font-mono text-accent text-xs sm:text-sm tracking-wider mb-2 sm:mb-3">
          CONTACT
        </motion.p>
        <motion.h2 variants={fadeUp} className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-text mb-3 sm:mb-4">
          Let's build something
        </motion.h2>
        <motion.p variants={fadeUp} className="text-muted text-sm sm:text-base max-w-lg mb-8 sm:mb-10">
          I'm always interested in challenging technical work. If you have a
          project that needs someone who thinks in milliseconds and ships
          production code, let's talk.
        </motion.p>

        <div className="grid md:grid-cols-5 gap-8 md:gap-10">
          <div className="md:col-span-3 order-2 md:order-1">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-accent/10 border border-accent/20 rounded-xl p-6"
              >
                <CheckCircle className="text-accent flex-shrink-0" size={24} />
                <p className="text-text">
                  Message sent! I typically respond within 24 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div variants={fadeUp}>
                  <label htmlFor="email" className="text-sm text-muted mb-1.5 block">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text text-sm placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-colors"
                  />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <label htmlFor="subject" className="text-sm text-muted mb-1.5 block">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text text-sm placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-colors"
                  />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <label htmlFor="message" className="text-sm text-muted mb-1.5 block">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell me about the project..."
                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text text-sm placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-colors resize-none"
                  />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <MagneticButton strength={0.2} className="inline-block">
                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex items-center gap-2 bg-accent text-bg font-medium text-sm px-6 py-3 rounded-lg hover:bg-emerald-300 disabled:opacity-50 transition-colors duration-200"
                    >
                      <Send size={16} />
                      {sending ? "Sending..." : "Send Message"}
                    </button>
                  </MagneticButton>
                </motion.div>
              </form>
            )}
          </div>

          {/* Quick info sidebar */}
          <motion.div
            variants={fadeUp}
            className="md:col-span-2 order-1 md:order-2 flex flex-col gap-3 sm:gap-4"
          >
            <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:block">
              <p className="text-[10px] sm:text-xs font-mono text-muted tracking-wider uppercase sm:mb-3 flex-shrink-0">
                Response
              </p>
              <p className="text-text text-xs sm:text-sm">
                Typically within <span className="text-accent font-medium">24 hours</span>
              </p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:block">
              <p className="text-[10px] sm:text-xs font-mono text-muted tracking-wider uppercase sm:mb-3 flex-shrink-0">
                Email
              </p>
              <a
                href="mailto:mail@canberkpitirli.com"
                className="text-accent text-xs sm:text-sm hover:underline font-mono break-all"
              >
                mail@canberkpitirli.com
              </a>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:block">
              <p className="text-[10px] sm:text-xs font-mono text-muted tracking-wider uppercase sm:mb-3 flex-shrink-0">
                Resume
              </p>
              <a
                href="https://drive.google.com/file/d/1N0feMoS_lJVaWSPMEQ0rEjmC5wttEtzR/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("resume_click", { from: "contact" })}
                className="inline-flex items-center gap-2 text-accent text-xs sm:text-sm hover:underline"
              >
                <Download size={14} />
                Download PDF
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
