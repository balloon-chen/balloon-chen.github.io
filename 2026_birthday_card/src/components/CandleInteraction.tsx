/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Heart } from 'lucide-react';
import { submitWishToGoogleSheet } from '../utils/sheets';

interface CandleInteractionProps {
  audioCtxRef: React.MutableRefObject<AudioContext | null>;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  decay: number;
  gravity: number;
  shake?: number;
}

export default function CandleInteraction({ audioCtxRef }: CandleInteractionProps) {
  // States: 'writing' -> inputting wish, 'lit' -> wish injected, candle burning, 'blown' -> extinguished and sealed
  const [candleState, setCandleState] = useState<'writing' | 'lit' | 'blown'>('writing');
  const [wishInput, setWishInput] = useState<string>('');
  const [confirmedWish, setConfirmedWish] = useState<string>('');
  
  // Google Sheets sync state
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'failed'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Initialize Web Audio on click
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Sparkle generator for fireworks
  const createFireworkInstance = (x: number, y: number, colorPreset?: string) => {
    const colors = [
      '#D4A373', // Caramel Gold
      '#F4E3B1', // Warm Pale Gold
      '#F1E5AC', // Cream Wheat
      '#FFFFFF', // White Sparkle
      '#FFB74D'  // Sweet Orange Candle Fire
    ];

    const count = 90 + Math.floor(Math.random() * 40);
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4.0 + 1.5;
      const size = Math.random() * 2.5 + 0.8;
      const decay = Math.random() * 0.012 + 0.006;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 1.5),
        color: colorPreset || colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        size,
        decay,
        gravity: 0.04,
        shake: Math.random() * 0.2
      });
    }

    particlesRef.current.push(...particles);
  };

  // Rising particles for wish submission
  const createWishRisingParticles = (x: number, y: number) => {
    const count = 40;
    const colors = ['#D4A373', '#F4E3B1', '#FFB74D', '#FFFFFF'];
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: x + (Math.random() * 160 - 80),
        y: y,
        vx: (Math.random() * 1.6 - 0.8),
        vy: -Math.random() * 2.5 - 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        size: Math.random() * 2.2 + 0.9,
        decay: Math.random() * 0.008 + 0.004,
        gravity: -0.015
      });
    }
    particlesRef.current.push(...particles);
  };

  // Smoke trails from unlit/extinguished candle
  const createCandleSmoke = (x: number, y: number) => {
    const count = 18;
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x + (Math.random() * 4 - 2),
        y: y - 10,
        vx: (Math.random() * 0.8 - 0.4),
        vy: -Math.random() * 1.2 - 0.6,
        color: '#D4A373',
        alpha: 0.8,
        size: Math.random() * 3 + 1,
        decay: 0.012,
        gravity: -0.015
      });
    }
    particlesRef.current.push(...particles);
  };

  // Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 400;
    };
    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const renderLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        if (p.shake) {
          p.x += (Math.random() - 0.5) * p.shake;
        }
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

  // Handle wish submit
  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishInput.trim()) return;

    initAudio();

    const targetWish = wishInput.trim();
    setConfirmedWish(targetWish);
    setCandleState('lit');

    // Launch beautiful particles floating from base of canvas
    const canvas = canvasRef.current;
    if (canvas) {
      createWishRisingParticles(canvas.width / 2, canvas.height - 40);
    }

    // Trigger Google Sheets submittal
    setSyncStatus('syncing');
    setSyncMessage('正在上傳願望至 Google 試算表 A 欄...');
    try {
      const result = await submitWishToGoogleSheet(targetWish);
      if (result.success) {
        setSyncStatus('success');
        setSyncMessage(result.message);
      } else {
        setSyncStatus('failed');
        setSyncMessage(result.message);
      }
    } catch (err: any) {
      setSyncStatus('failed');
      setSyncMessage('網路同步失敗，已暫存於本頁面。');
    }
  };

  // Handle clicking candle to blow it out
  const handleCandleClick = () => {
    if (candleState !== 'lit') return;

    initAudio();
    
    setCandleState('blown');

    // Visual trails and smoke
    const canvas = canvasRef.current;
    if (canvas) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 - 25;
      createCandleSmoke(cx, cy);

      // Trigger spectacular fireworks cascade in sequence
      setTimeout(() => {
        createFireworkInstance(cx, cy - 50, '#D4A373');
      }, 350);

      setTimeout(() => {
        createFireworkInstance(cx - 80, cy - 20, '#F4E3B1');
      }, 700);

      setTimeout(() => {
        createFireworkInstance(cx + 80, cy - 30, '#FFB74D');
      }, 1050);

      setTimeout(() => {
        createFireworkInstance(cx, cy - 100, '#FFFFFF');
      }, 1400);
    }
  };

  return (
    <div className="relative w-full min-h-[480px] bg-gradient-to-b from-[#181818]/60 to-[#121212]/30 rounded-3xl border border-caramel-gold/15 pt-10 pb-8 px-6 flex flex-col items-center justify-start overflow-hidden">
      
      {/* Absolute background canvas for particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Elegant state prompt indicator above the candle - permanently fixed distance from top frame */}
      <div className="w-full text-center h-8 flex items-center justify-center select-none z-25 mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={candleState}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3 }}
            className="text-caramel-gold font-serif text-base tracking-[0.15em] font-medium"
          >
            {candleState === 'writing' && "許下你的心願"}
            {candleState === 'lit' && "點擊火苗吹熄蠟燭"}
            {candleState === 'blown' && "祝你願望成真！"}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Interactive Candle Visual Center */}
      <div className="relative w-full h-52 flex items-center justify-center z-20">
        
        {/* Soft glowing backdrop shadow when lit */}
        <AnimatePresence>
          {candleState === 'lit' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.4, scale: 1.15 }}
              exit={{ opacity: 0 }}
              className="absolute w-44 h-44 bg-gradient-to-radial from-caramel-gold/30 via-caramel-gold/10 to-transparent blur-[35px] rounded-full pointer-events-none animate-pulse"
            />
          )}
        </AnimatePresence>

        <div 
          className={`relative flex flex-col items-center ${candleState === 'lit' ? 'cursor-pointer' : 'cursor-default'} group`}
          onClick={handleCandleClick}
        >
          {/* Flame details (only rendered in Lit state) */}
          <AnimatePresence>
            {candleState === 'lit' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ 
                  opacity: [1, 0.9, 0],
                  scale: [1, 1.4, 0],
                  y: [0, -20, -40],
                  transition: { duration: 0.55 }
                }}
                className="absolute -top-12 flex flex-col items-center select-none"
              >
                {/* Flame soft aura */}
                <div className="w-9 h-14 rounded-full bg-gradient-to-t from-caramel-gold/90 via-yellow-400/40 to-transparent blur-sm animate-pulse-slow absolute -top-2.5" />
                
                {/* Visual candle fire */}
                <motion.div
                  animate={{
                    scaleX: [1, 0.82, 1.15, 0.88, 1],
                    scaleY: [1, 1.18, 0.85, 1.08, 1],
                    skewX: [0, -3.5, 4.5, -2, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.6,
                    ease: "easeInOut"
                  }}
                  className="w-4.5 h-10 rounded-b-full rounded-t-full bg-gradient-to-t from-[#B07D48] via-caramel-gold to-[#FAE8B2] shadow-[0_0_18px_rgba(212,163,115,0.85)]"
                />
                
                {/* Flame core (blue base) */}
                <div className="w-3 h-4 rounded-full bg-sky-400/60 blur-[1px] absolute top-6" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wick */}
          <div className="w-[3px] h-3.5 bg-zinc-700/80 rounded-t-full transition-colors duration-500" />

          {/* Candle Body */}
          <div className="relative w-6.5 h-28 bg-gradient-to-r from-[#cfad8c] via-[#ecd5be] to-[#bfa07f] rounded-t-sm shadow-xl flex flex-col justify-start overflow-hidden">
            {/* Candle wax drips */}
            <div className="absolute top-0 left-1 w-1.5 h-10 bg-white/75 rounded-b-full shadow-inner opacity-80" />
            <div className="absolute top-0 right-1.5 w-1 h-6 bg-white/60 rounded-b-full opacity-60" />
            <div className="absolute top-0 left-2.5 w-1 h-16 bg-white/50 rounded-b-full opacity-50" />
            
            {/* Soft decorative heart label inside wax */}
            <div className="absolute bottom-6 inset-x-0 flex justify-center opacity-40 group-hover:opacity-85 transition-opacity duration-500">
              <Heart className="w-3 h-3 text-[#503E2D]" />
            </div>
          </div>

          {/* Candle holder base */}
          <div className="w-16 h-2.5 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-900 rounded-full shadow-lg border-b border-zinc-900" />
          <div className="w-12 h-1.5 bg-gradient-to-r from-zinc-900 to-zinc-850 rounded-b-full" />
        </div>
      </div>

      {/* Control Tools Container - Stepped Flow */}
      <div className="w-full max-w-sm mx-auto z-25 flex flex-col items-center">
        
        {/* Step 1: Mandatory wishing form */}
        {candleState === 'writing' && (
          <motion.form 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            onSubmit={handleWishSubmit}
            className="w-full flex flex-col space-y-3"
          >
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-sans text-caramel-gold font-bold uppercase tracking-[0.16em] text-center">
                寫下你的生日願望
              </label>
              <input
                type="text"
                required
                value={wishInput}
                onChange={(e) => setWishInput(e.target.value)}
                maxLength={45}
                placeholder="許個願吧...（例如：每天都能心想事成！）"
                className="w-full px-4 py-3 rounded-xl bg-black/55 border border-caramel-gold/35 text-oatmeal text-sm placeholder-oatmeal/25 focus:outline-none focus:border-caramel-gold/80 focus:ring-1 focus:ring-caramel-gold/40 font-serif text-center transition-all duration-300"
              />
            </div>
            <button
              type="submit"
              disabled={!wishInput.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4A373] to-[#C8963E] text-[#121212] font-sans text-xs tracking-widest font-extrabold uppercase shadow-lg shadow-caramel-gold/15 hover:shadow-caramel-gold/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.01]"
            >
              填好了，為蠟燭注入心願 ✦
            </button>
          </motion.form>
        )}

        {/* Step 2: Wish is injected, candle lit, waiting to be snuffed */}
        {candleState === 'lit' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center space-y-3.5 select-none"
          >
            {/* Visual display of current wish */}
            <div className="px-4 py-2.5 bg-caramel-gold/5 border border-caramel-gold/20 rounded-xl w-full max-w-xs text-center shadow-lg">
              <span className="text-[10px] font-sans tracking-wide text-caramel-gold/50 block mb-1">已點亮願望</span>
              <p className="text-sm font-serif text-caramel-gold inline-flex items-center justify-center space-x-1">
                <Star className="w-3.5 h-3.5 fill-caramel-gold text-caramel-gold mr-1" />
                <span>「 {confirmedWish} 」</span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 3: Sealed final wish display (Resetting is disabled) */}
        {candleState === 'blown' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full text-center flex flex-col items-center space-y-3"
          >
            {/* Simplified final wish display */}
            <div className="inline-flex items-center space-x-2 px-4 py-3 rounded-2xl bg-black/40 border border-caramel-gold/30 text-xs font-serif text-caramel-gold shadow-md">
              <Star className="w-4 h-4 fill-caramel-gold text-caramel-gold animate-bounce" />
              <span className="text-sm tracking-wide font-semibold">「 {confirmedWish} 」</span>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

