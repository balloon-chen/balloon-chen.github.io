/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlessingParagraph } from './types';

export const BLESSING_PARAGRAPHS: BlessingParagraph[] = [
  {
    id: 1,
    text: "在宇宙的無數顆星星之中，總有一顆，",
    delayBefore: 600,
  },
  {
    id: 2,
    text: "專屬於今晚的溫柔。✨",
    delayBefore: 800,
  },
  {
    id: 3,
    text: "撥動了這根琴弦，就像撥通了與你相遇的波長。",
    delayBefore: 1200,
  },
  {
    id: 4,
    text: "謝謝你來到這個世界，讓平常的日子，也變得閃閃發光。",
    delayBefore: 1200,
  },
  {
    id: 5,
    text: "在這個特別的日子裡，願你哭過笑過，依然被世界溫柔以待；",
    delayBefore: 1500,
  },
  {
    id: 6,
    text: "願所有微小而確切的幸福，都在你需要時如期而至。🌌",
    delayBefore: 1200,
  },
  {
    id: 7,
    text: "「生日快樂。願你所期盼的星光，落滿在你眼裡的銀河。」💐",
    delayBefore: 1800,
  }
];

export const GUITAR_PRESET_TUNINGS = [
  { id: 1, frequency: 196.00, label: "G弦", color: "rgba(212, 163, 115, 0.4)" }, // G3
  { id: 2, frequency: 246.94, label: "B弦", color: "rgba(212, 163, 115, 0.6)" }, // B3
  { id: 3, frequency: 329.63, label: "E弦", color: "rgba(212, 163, 115, 0.8)" }, // E4
  { id: 4, frequency: 392.00, label: "G'弦", color: "rgba(212, 163, 115, 0.9)" }, // G4
  { id: 5, frequency: 493.88, label: "B'弦", color: "rgba(212, 163, 115, 1.0)" }, // B4
  { id: 6, frequency: 659.25, label: "e弦", color: "rgba(212, 163, 115, 0.7)" }  // E5
];
