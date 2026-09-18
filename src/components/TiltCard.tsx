import { useRef, useState } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

/** كارت 3D — يميل مع حركة الماوس وعليه لمعة ضوئية */
export default function TiltCard({ children, className = '', intensity = 9 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<React.CSSProperties>({ transform: 'perspective(1100px) rotateX(0deg) rotateY(0deg)' });
  const [glare, setGlare] = useState<{ x: number; y: number; o: number }>({ x: 50, y: 50, o: 0 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - py) * intensity;
    const rotateY = (px - 0.5) * intensity;
    setTilt({
      transform: `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`,
      transition: 'transform 0.06s linear',
    });
    setGlare({ x: px * 100, y: py * 100, o: 1 });
  };

  const handleLeave = () => {
    setTilt({
      transform: 'perspective(1100px) rotateX(0deg) rotateY(0deg) translateZ(0)',
      transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
    });
    setGlare((g) => ({ ...g, o: 0 }));
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ ...tilt, transformStyle: 'preserve-3d' }}
      className={`relative will-change-transform ${className}`}
    >
      {children}
      {/* لمعة الماوس */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-500"
        style={{
          opacity: glare.o,
          background: `radial-gradient(420px circle at ${glare.x}% ${glare.y}%, rgba(240,215,162,0.14), rgba(139,92,246,0.08) 40%, transparent 70%)`,
          borderRadius: 'inherit',
        }}
      />
    </div>
  );
}
