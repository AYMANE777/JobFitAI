'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const ThreeDBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Simple floating animation for a subtle gradient background
      gsap.to('.bg-orb', {
        x: 'random(-50, 50)',
        y: 'random(-50, 50)',
        duration: 'random(10, 20)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 2,
          from: 'random'
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden bg-slate-50">
      <div className="bg-orb absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[120px]" />
      <div className="bg-orb absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-100/40 blur-[120px]" />
      <div className="bg-orb absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-50/50 blur-[100px]" />
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px] opacity-20" />
    </div>
  );
};
