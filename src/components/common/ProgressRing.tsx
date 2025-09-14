import React, { useEffect, useMemo, useRef } from 'react';

interface ProgressRingProps {
  size?: number;
  stroke?: number;
  progress: number; // 0-100
  animate?: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ size = 32, stroke = 4, progress, animate = true }) => {
  const radius = useMemo(() => (size - stroke) / 2, [size, stroke]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const circleRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    const node = circleRef.current;
    if (!node) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const value = Math.max(0, Math.min(100, progress));
    const offset = circumference * (1 - value / 100);
    if (!animate || prefersReduced) {
      node.style.strokeDashoffset = String(offset);
      return;
    }
    // lazy import animejs
    import('animejs').then(({ default: anime }) => {
      anime({
        targets: node,
        strokeDashoffset: offset,
        easing: 'easeOutCubic',
        duration: 600
      });
    }).catch(() => {
      node.style.strokeDashoffset = String(offset);
    });
  }, [progress, circumference, animate]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="var(--hud-grid)"
        strokeWidth={stroke}
        fill="transparent"
      />
      <circle
        ref={circleRef}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="var(--hud-primary)"
        strokeWidth={stroke}
        fill="transparent"
        strokeLinecap="round"
        style={{ strokeDasharray: `${circumference} ${circumference}`, strokeDashoffset: circumference }}
      />
    </svg>
  );
};

export default ProgressRing;


