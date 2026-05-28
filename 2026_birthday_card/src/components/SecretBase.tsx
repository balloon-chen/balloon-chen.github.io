/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { BLESSING_PARAGRAPHS } from '../data';
import CandleInteraction from './CandleInteraction';

interface SecretBaseProps {
  audioCtxRef: React.MutableRefObject<AudioContext | null>;
  bgAudioRef?: React.MutableRefObject<HTMLAudioElement | null>;
}

export default function SecretBase({ audioCtxRef, bgAudioRef }: SecretBaseProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.35);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Typewriter states
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [typingComplete, setTypingComplete] = useState<boolean>(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Accelerated Typewriter effect controller
  useEffect(() => {
    if (currentLineIdx >= BLESSING_PARAGRAPHS.length) {
      setTypingComplete(true);
      return;
    }

    const currentLineObj = BLESSING_PARAGRAPHS[currentLineIdx];
    const targetText = currentLineObj.text;
    
    // Scale down original custom delay times dramatically for faster experience
    const initialDelay = currentLineObj.delayBefore ? currentLineObj.delayBefore / 3.5 : 250;

    let textBuffer = '';
    let charIdx = 0;
    let timer: any;

    const startTyping = () => {
      timer = setInterval(() => {
        if (charIdx < targetText.length) {
          textBuffer += targetText.charAt(charIdx);
          setDisplayedText(textBuffer);
          charIdx++;
        } else {
          clearInterval(timer);
          // Set line output as completed
          setVisibleLines(prev => [...prev, targetText]);
          setDisplayedText('');
          
          // Advance to next line with brief reading pause (compressed from 1400ms to 450ms)
          setTimeout(() => {
            setCurrentLineIdx(prev => prev + 1);
          }, 450);
        }
      }, 30); // accelerated speed of typing individual char (from 75ms to 30ms)
    };

    // Delay before starting the current paragraph
    const delayTimer = setTimeout(() => {
      startTyping();
    }, initialDelay);

    return () => {
      clearTimeout(delayTimer);
      clearInterval(timer);
    };
  }, [currentLineIdx]);

  // HTML5 Background Audio Player initialization & management
  useEffect(() => {
    let audio: HTMLAudioElement;
    if (bgAudioRef && bgAudioRef.current) {
      audio = bgAudioRef.current;
    } else {
      audio = new Audio('https://cdn-www.cw.com.tw/voice/202605/voice-6a171be7eccb65.21769132.mp3');
      audio.loop = true;
      if (bgAudioRef) {
        bgAudioRef.current = audio;
      }
    }
    audioRef.current = audio;

    // Apply starting specifications
    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    if (isPlaying) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Autoplay blocked on mount: waiting for user interaction.", err);
        setIsPlaying(false);
      });
    } else {
      setIsPlaying(false);
    }

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
    };
  }, []);

  // Sync play/pause audio state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && audio.paused) {
      audio.play().catch(err => {
        console.warn("Failed to play audio:", err);
      });
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying]);

  // Sync volume & mute audio states
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="w-full max-w-[600px] mx-auto min-h-screen px-4 py-8 flex flex-col space-y-8 select-text animate-fade-in">
      {/* Embedded Ambient Soundtrack Widget */}
      <div className="relative z-10 w-full flex items-center justify-between bg-black/40 border border-caramel-gold/15 rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-caramel-gold/10 flex items-center justify-center border border-caramel-gold/20">
            <Play className={`w-3.5 h-3.5 text-caramel-gold ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <div className="text-[12px] font-sans text-caramel-gold font-medium tracking-wide">
              Baby - Lindsay Lohan
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Volume Control */}
          <div className="flex items-center space-x-2 bg-zinc-900/60 px-2.5 py-1.5 rounded-lg border border-oatmeal/5">
            <button onClick={toggleMute} className="text-oatmeal/60 hover:text-caramel-gold transition-colors duration-200 focus:outline-none">
              {(isMuted || volume === 0) ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-caramel-gold outline-none"
            />
          </div>

          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-caramel-gold/10 hover:bg-caramel-gold/25 border border-caramel-gold/20 text-caramel-gold transition-colors duration-200"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Secret Base Greeting Card Frame */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="w-full bg-[#181818] border border-caramel-gold/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Traditional Chinese Typewriter Blessings Section */}
        <div className="px-8 py-10 flex flex-col space-y-4 min-h-[200px]">
          <div className="space-y-4 font-serif text-oatmeal/90 text-[15px] leading-extraloose tracking-wide text-center">
            {visibleLines.map((line, idx) => (
              <motion.p 
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="hover:text-caramel-gold transition-colors duration-300"
              >
                {line}
              </motion.p>
            ))}

            {/* Currently Typing Line */}
            {displayedText && (
              <div className="inline-flex items-center justify-center">
                <p className="text-caramel-gold font-serif italic text-base inline">
                  {displayedText}
                </p>
                {/* Gold blinking typewriter cursor */}
                <span className="w-1.5 h-4 bg-caramel-gold ml-1 rounded-full animate-ping whitespace-nowrap inline-block" />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Birthday candle and wish trigger */}
      <AnimatePresence>
        {typingComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-full text-center"
          >
            {/* Interactive Custom Candle */}
            <CandleInteraction audioCtxRef={audioCtxRef} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
