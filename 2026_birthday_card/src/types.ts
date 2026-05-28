/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppStage = 'intro' | 'transitioning' | 'secret_base';

export interface BlessingParagraph {
  id: number;
  text: string;
  delayBefore?: number; // millisecond delay before typing this paragraph
}

export interface InteractiveSparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
}
