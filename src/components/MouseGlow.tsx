"use client";

import { useEffect, useRef } from "react";

export function MouseGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        const mask = `radial-gradient(circle 120px at ${e.clientX}px ${e.clientY}px, black 0%, transparent 100%)`;
        glowRef.current.style.maskImage = mask;
        glowRef.current.style.webkitMaskImage = mask;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="dot-grid-glow"
    />
  );
}
