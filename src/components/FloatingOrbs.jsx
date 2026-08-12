import usePrefersReducedMotion from "../lib/usePrefersReducedMotion";

const orbs = [
  { size: 700, x: "5%",  y: "10%", color: "rgba(52,211,153,0.055)", duration: 25, delay: 0 },
  { size: 650, x: "70%", y: "35%", color: "rgba(52,211,153,0.04)",  duration: 30, delay: -8 },
  { size: 750, x: "45%", y: "65%", color: "rgba(6,95,70,0.05)",     duration: 35, delay: -15 },
];

export default function FloatingOrbs() {
  // With reduced motion the orbs stay as static background gradients
  const reducedMotion = usePrefersReducedMotion();
  return (
    <>
      <style>{`
        @keyframes orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(35px, -25px) scale(1.06); }
          66%       { transform: translate(-25px, 18px) scale(0.96); }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {orbs.map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full will-change-transform"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 65%)`,
              animation: reducedMotion
                ? "none"
                : `orb-drift ${orb.duration}s ease-in-out infinite`,
              animationDelay: `${orb.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
