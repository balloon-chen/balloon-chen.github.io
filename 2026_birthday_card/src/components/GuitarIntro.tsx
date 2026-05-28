/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GUITAR_PRESET_TUNINGS } from '../data';

interface GuitarIntroProps {
  onUnlock: () => void;
  audioCtxRef: React.MutableRefObject<AudioContext | null>;
  onPrepareAudio?: (silent?: boolean) => void;
}

export default function GuitarIntro({ onUnlock, audioCtxRef, onPrepareAudio }: GuitarIntroProps) {
  const [vibratingStrings, setVibratingStrings] = useState<{ [key: number]: boolean }>({});
  const touchedStringsRef = useRef<Set<number>>(new Set());
  const [hasUnlocked, setHasUnlocked] = useState(false);

  // Initialize Web Audio context on user action
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const handleTouchTracking = (clientX: number, clientY: number) => {
    if (hasUnlocked) return;
    initAudio();
    const element = document.elementFromPoint(clientX, clientY);
    if (!element) return;
    
    const stringEl = element.closest('[data-string-id]');
    if (stringEl) {
      const stringId = parseInt(stringEl.getAttribute('data-string-id') || '0', 10);
      const stringTuning = GUITAR_PRESET_TUNINGS.find(s => s.id === stringId);
      
      if (stringTuning && !touchedStringsRef.current.has(stringId)) {
        touchedStringsRef.current.add(stringId);
        
        // Trigger visual vibrating string animation
        setVibratingStrings(prev => ({ ...prev, [stringId]: true }));
        setTimeout(() => {
          setVibratingStrings(prev => ({ ...prev, [stringId]: false }));
        }, 500);

        // Once user successfully swiped across all 6 strings in a single pass
        if (touchedStringsRef.current.size === 6) {
          setHasUnlocked(true);
          if (onPrepareAudio) {
            onPrepareAudio(false);
          }
          
          setTimeout(() => {
            onUnlock();
          }, 850);
        }
      }
    }
  };

  const startTouchSwipe = (e: React.TouchEvent) => {
    initAudio();
    if (onPrepareAudio) {
      onPrepareAudio(true);
    }
    touchedStringsRef.current.clear();
    const touch = e.touches[0];
    handleTouchTracking(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleTouchTracking(touch.clientX, touch.clientY);
    }
  };

  const handleMouseOverString = (id: number, frequency: number) => {
    if (hasUnlocked) return;
    initAudio();
    
    // Track unique hover strings to support desktop sweeping as well
    touchedStringsRef.current.add(id);
    
    setVibratingStrings(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setVibratingStrings(prev => ({ ...prev, [id]: false }));
    }, 500);

    if (touchedStringsRef.current.size === 6) {
      setHasUnlocked(true);
      if (onPrepareAudio) {
        onPrepareAudio(false);
      }
      setTimeout(() => {
        onUnlock();
      }, 850);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8 text-center select-none">
      {/* Decorative background stars glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-caramel-gold/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-warm-accent/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center"
      >
        {/* Elegant Chinese instruction on top */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8 text-caramel-gold text-[15px] tracking-[0.16em] font-serif font-semibold cursor-pointer text-center max-w-xs leading-relaxed"
          onClick={() => {
            initAudio();
            if (onPrepareAudio) {
              onPrepareAudio(false);
            }
            setTimeout(() => {
              onUnlock();
            }, 850);
          }}
        >
          撥動琴弦，解鎖今日限定的神秘禮物
        </motion.div>

        {/* Minimalist High-End Virtual Guitar Canvas */}
        <div 
          className="relative w-72 h-[340px] mx-auto bg-gradient-to-b from-[#181818] to-[#141414] rounded-3xl border border-caramel-gold/15 shadow-2xl overflow-hidden flex flex-col justify-between p-6 cursor-pointer touch-none"
          onTouchStart={startTouchSwipe}
          onTouchMove={handleTouchMove}
          onMouseDown={() => {
            initAudio();
            if (onPrepareAudio) {
              onPrepareAudio(true);
            }
          }}
        >
          {/* Wooden guitar fingerboard running up */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-16 h-28 bg-[#1f1a16] border-x border-caramel-gold/10 opacity-80 flex flex-col justify-around py-2">
            <div className="h-[2px] bg-[#3a3028] w-full" />
            <div className="h-[2px] bg-[#3a3028] w-full" />
            <div className="h-[2px] bg-[#3a3028] w-full" />
            <div className="h-[2px] bg-[#3a3028] w-full" />
          </div>

          {/* Sound Hole (Rosette) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-36 w-32 h-32 rounded-full bg-black flex items-center justify-center border-4 border-caramel-gold/20 shadow-inner">
            <div className="w-28 h-28 rounded-full border border-dashed border-caramel-gold/30 animate-pulse-slow flex items-center justify-center" />
          </div>

          {/* Guitar strings layer (Drawn vertically over the guitar) */}
          <div className="absolute inset-x-0 top-0 bottom-16 flex justify-around px-12 z-20">
            {GUITAR_PRESET_TUNINGS.map((string) => {
              const isVibrating = vibratingStrings[string.id];
              const isTouched = touchedStringsRef.current.has(string.id);
              return (
                <div
                  key={string.id}
                  data-string-id={string.id}
                  className="relative h-full w-6 flex flex-col items-center cursor-pointer"
                  onMouseEnter={() => handleMouseOverString(string.id, string.frequency)}
                >
                  {/* Visual String Line */}
                  <motion.div
                    animate={
                      isVibrating
                        ? {
                            x: [0, -5, 5, -3.5, 3.5, -1.8, 1.8, 0],
                            boxShadow: [
                              `0 0 5px ${string.color}`,
                              `0 0 12px ${string.color}`,
                              `0 0 5px ${string.color}`,
                            ],
                          }
                        : { x: 0 }
                    }
                    transition={{ duration: isVibrating ? 0.6 : 0.1, ease: "easeInOut" }}
                    className={`absolute h-full w-[2px] bg-gradient-to-b from-oatmeal/40 to-oatmeal/30 shadow-md transition-all duration-150 ${
                      isTouched ? 'bg-caramel-gold w-[3px]' : 'bg-oatmeal/60'
                    }`}
                    style={{
                      backgroundImage: isTouched 
                        ? 'linear-gradient(to bottom, #E0E0E0, #D4A373, #E0E0E0)' 
                        : undefined,
                      boxShadow: isVibrating ? `0 0 14px ${string.color}` : 'none',
                    }}
                  />

                  {/* Aligned bridge dot right below the string line */}
                  <div className={`absolute bottom-[-16px] w-[6px] h-[6px] rounded-full transition-all duration-300 z-30 ${
                    isTouched ? 'bg-caramel-gold shadow-[0_0_8px_rgba(212,163,115,0.8)]' : 'bg-caramel-gold/40'
                  }`} />
                </div>
              );
            })}
          </div>

          {/* Bridge background bar at the bottom holding strings */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-40 h-5 bg-[#251b14] border border-[#3e2e22] rounded-md shadow-md z-10" />
        </div>
      </motion.div>
    </div>
  );
}
