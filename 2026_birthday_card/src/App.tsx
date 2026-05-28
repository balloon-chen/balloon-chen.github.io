/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppStage } from './types';
import GuitarIntro from './components/GuitarIntro';
import SecretBase from './components/SecretBase';

export default function App() {
  const [stage, setStage] = useState<AppStage>('intro');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  // Automatically scroll to top of the screen when transitioning to stage 2
  useEffect(() => {
    if (stage === 'secret_base') {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [stage]);

  const handlePrepareAudio = (silent = false) => {
    // Eagerly instantiate background track inside the user action stack to guarantee autoplay bypassing
    if (!bgAudioRef.current) {
      const audio = new Audio('https://cdn-www.cw.com.tw/voice/202605/voice-6a171be7eccb65.21769132.mp3');
      audio.loop = true;
      audio.volume = silent ? 0 : 0.35;
      audio.muted = silent;
      bgAudioRef.current = audio;
    } else {
      bgAudioRef.current.volume = silent ? 0 : 0.35;
      bgAudioRef.current.muted = silent;
    }
  };

  const handleUnlockSequence = () => {
    // Ensure background track is full volume and played/unmuted on unlock transition
    handlePrepareAudio(false);
    setStage('secret_base');
  };

  return (
    <div className="relative min-h-screen bg-bg-dark text-oatmeal font-serif overflow-hidden flex items-center justify-center">
      {/* Decorative stars / dust particles background overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(#1e1e1e_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

      {/* Main card box containing width limits */}
      <div className="relative z-10 w-full max-w-[600px] mx-auto min-h-screen flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {stage === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <GuitarIntro 
                onUnlock={handleUnlockSequence} 
                audioCtxRef={audioCtxRef} 
                onPrepareAudio={handlePrepareAudio}
              />
            </motion.div>
          )}

          {stage === 'secret_base' && (
            <motion.div
              key="secret_base"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
            >
              <SecretBase audioCtxRef={audioCtxRef} bgAudioRef={bgAudioRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
