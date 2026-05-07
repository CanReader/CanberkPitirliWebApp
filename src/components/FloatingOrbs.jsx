const orbs = [
  { size: 400, x: "10%", y: "15%", color: "rgba(52,211,153,0.04)", duration: 25, delay: 0 },
  { size: 350, x: "75%", y: "40%", color: "rgba(52,211,153,0.03)", duration: 30, delay: -8 },
  { size: 500, x: "50%", y: "70%", color: "rgba(6,95,70,0.04)", duration: 35, delay: -15 },
  { size: 300, x: "85%", y: "85%", color: "rgba(52,211,153,0.025)", duration: 20, delay: -5 },
  { size: 250, x: "20%", y: "55%", color: "rgba(6,95,70,0.035)", duration: 28, delay: -12 },
];

export default function FloatingOrbs() {
  return (
    <>
      <style>{`
        @keyframes orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(40px, -30px) scale(1.1); }
          50% { transform: translate(-30px, 20px) scale(0.95); }
          75% { transform: translate(20px, -40px) scale(1.05); }
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
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              filter: "blur(60px)",
              animation: `orb-drift ${orb.duration}s ease-in-out infinite`,
              animationDelay: `${orb.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
