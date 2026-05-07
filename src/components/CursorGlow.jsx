import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const el = glowRef.current;
    if (!el) return;

    const onMove = (e) => {
      el.style.transform = `translate(${e.clientX - 250}px, ${e.clientY - 250}px)`;
      el.style.opacity = "1";
    };
    const onLeave = () => { el.style.opacity = "0"; };
    const onEnter = () => { el.style.opacity = "1"; };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  // Hide on touch devices via SSR-safe check
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <div
        ref={glowRef}
        className="absolute w-[500px] h-[500px] rounded-full will-change-transform"
        style={{
          opacity: 0,
          transition: "opacity 0.3s",
          background:
            "radial-gradient(circle, rgba(52,211,153,0.06) 0%, rgba(52,211,153,0.02) 35%, transparent 70%)",
        }}
      />
    </div>
  );
}
