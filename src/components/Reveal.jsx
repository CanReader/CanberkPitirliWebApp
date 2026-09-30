import { motion } from "framer-motion";

// Shared easing for the blog: fast out, long settle. Reads as "arriving"
// rather than "sliding".
export const EASE_OUT = [0.16, 1, 0.3, 1];

// Fades and lifts its children in the first time they scroll into view.
// Reduced motion is handled globally by <MotionConfig reducedMotion="user">,
// which drops the movement and keeps a plain fade.
export default function Reveal({
  as = "div",
  children,
  delay = 0,
  y = 18,
  amount = 0.15,
  className,
  ...rest
}) {
  const Tag = motion[as];
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.65, delay, ease: EASE_OUT }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Parent/child variants for staggered groups that animate on mount.
export const staggerParent = (stagger = 0.07, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

export const fadeUpChild = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};
