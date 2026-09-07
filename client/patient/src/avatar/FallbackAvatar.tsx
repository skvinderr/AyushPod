"use client";

import React from 'react';
import { useAvatar } from '../store/useAvatar';
import { motion } from 'framer-motion';

/*
 * 2D fallback for Aaya (WebGL unavailable / low-power kiosk). Same identity as
 * the 3D character: a female doctor in a white coat over teal scrubs, dark hair
 * in a bun with a bindi, a stethoscope, blinking-style eyes, a mouth that opens
 * while talking, and two arms that swing into the same gesture poses so the
 * no-WebGL path still reads as "Aaya guiding with her hands".
 */

const SKIN = '#f2c9a0';
const COAT = '#f6f4ef';
const TEAL = '#2a9d8f';
const TEAL_DEEP = '#1f7a6e';
const HAIR = '#2b2320';
const NAVY = '#33415c';

export function FallbackAvatar() {
  const { state, mouth, gesture } = useAvatar();

  const bodyAnim = (): any => {
    switch (state) {
      case 'idle':
        return { y: [0, -5, 0], transition: { repeat: Infinity, duration: 2.6, ease: 'easeInOut' } };
      case 'happy':
        return { y: [0, -9, 0], transition: { repeat: Infinity, duration: 0.7 } };
      case 'listening':
        return { rotate: 5, transition: { type: 'spring', stiffness: 120 } };
      case 'concerned':
        return { rotate: -3, y: 2 };
      default:
        return {};
    }
  };

  const mouthHeight =
    state === 'talking' ? 6 + mouth * 20 : state === 'happy' ? 20 : state === 'concerned' ? 4 : 8;
  const mouthWidth = state === 'concerned' ? 22 : 30;

  // Arm rotation targets per gesture (degrees). Arms pivot at the shoulder
  // (transform-origin top), hanging down at rest.
  const arms = (): { l: any; r: any } => {
    switch (gesture) {
      case 'wave':
        return {
          l: { rotate: 8 },
          r: { rotate: [-148, -168, -148], transition: { repeat: Infinity, duration: 0.6 } },
        };
      case 'welcome':
        return { l: { rotate: 52 }, r: { rotate: -52 } };
      case 'present':
        return { l: { rotate: 36 }, r: { rotate: -36 } };
      case 'point-right':
        return { l: { rotate: 8 }, r: { rotate: -96 } };
      case 'point-down':
        return { l: { rotate: 8 }, r: { rotate: -30 } };
      default:
        return { l: { rotate: 8 }, r: { rotate: -8 } };
    }
  };

  const armPose = arms();
  const armSpring = { type: 'spring', stiffness: 120, damping: 12 } as any;

  const Arm = ({ side, anim }: { side: 'l' | 'r'; anim: any }) => (
    <motion.div
      className="absolute top-[150px] w-[26px] h-[140px] rounded-full origin-top z-20"
      style={{ background: COAT, [side === 'l' ? 'left' : 'right']: 26 } as any}
      animate={anim}
      transition={armSpring}
    >
      {/* teal cuff */}
      <div className="absolute bottom-6 left-0 right-0 h-2 rounded-full" style={{ background: TEAL }} />
      {/* hand */}
      <div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full"
        style={{ background: SKIN }}
      />
    </motion.div>
  );

  return (
    <div className="w-full h-full flex items-end justify-center pb-2">
      <motion.div animate={bodyAnim()} className="relative w-[240px] h-[360px]">
        {/* ===== arms (behind coat, above via z) ===== */}
        <Arm side="l" anim={armPose.l} />
        <Arm side="r" anim={armPose.r} />

        {/* ===== white coat ===== */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[196px] h-[220px] rounded-t-[80px] rounded-b-[28px] z-10 shadow-inner"
          style={{ background: COAT }}
        />
        {/* teal scrubs V in the coat opening */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[150px] w-0 h-0 z-10"
          style={{
            borderLeft: '34px solid transparent',
            borderRight: '34px solid transparent',
            borderTop: `70px solid ${TEAL}`,
          }}
        />
        {/* teal collar */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[138px] w-[70px] h-8 rounded-b-full z-10"
          style={{ background: TEAL_DEEP }}
        />
        {/* stethoscope */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[150px] w-[96px] h-[70px] rounded-b-full border-[5px] border-t-0 z-10"
          style={{ borderColor: NAVY }}
        />
        <div
          className="absolute left-[86px] top-[214px] w-5 h-5 rounded-full z-10 border-2"
          style={{ background: '#c9ced6', borderColor: NAVY }}
        />

        {/* neck */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[112px] w-11 h-12 z-0"
          style={{ background: SKIN }}
        />

        {/* ===== hair (behind head) ===== */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-1 w-[140px] h-[96px] rounded-t-full z-0"
          style={{ background: HAIR }}
        />
        {/* bun */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[70px] w-[70px] h-[70px] rounded-full z-0"
          style={{ background: HAIR }}
        />

        {/* ===== head ===== */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-2 w-[120px] h-[120px] rounded-full z-10"
          style={{ background: SKIN }}
        />
        {/* side locks */}
        <div className="absolute left-[52px] top-[26px] w-3.5 h-[74px] rounded-full z-10" style={{ background: HAIR }} />
        <div className="absolute right-[52px] top-[26px] w-3.5 h-[74px] rounded-full z-10" style={{ background: HAIR }} />
        {/* bindi */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[34px] w-2.5 h-2.5 rounded-full z-20" style={{ background: '#8e1d3a' }} />
        {/* eyes */}
        <div className="absolute top-[58px] left-1/2 -translate-x-1/2 flex gap-5 z-20">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#3a3330' }} />
          </div>
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#3a3330' }} />
          </div>
        </div>
        {/* cheeks */}
        <div className="absolute top-[82px] left-[64px] w-4 h-3 rounded-full z-20 bg-[#e8896f]/40" />
        <div className="absolute top-[82px] right-[64px] w-4 h-3 rounded-full z-20 bg-[#e8896f]/40" />
        {/* mouth */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full z-20 transition-all duration-75"
          style={{ top: 92, width: mouthWidth, height: mouthHeight, background: '#a5432f' }}
        />
      </motion.div>
    </div>
  );
}
