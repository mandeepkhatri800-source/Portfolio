import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import watermarkImg from '../assets/watermark.png';
import heroCharacterImg from '../assets/hero-character.png';
import { ACanvas } from './ACanvas';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.2,
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const navItems = [
  { name: 'ABOUT', href: '#about' },
  { name: 'PROJECTS', href: '#work' },
  { name: 'SKILLS', href: '#skills' },
  { name: 'EXPERIENCE', href: '#experience' },
  { name: 'CONTACT', href: '#contact' },
];

/**
 * HeroSection Component
 * 
 * Cinematic portfolio hero section featuring:
 * - AntiGravityCanvas physics layer with interactive floating tech elements & orbs
 * - Fully responsive layout (mobile, tablet, desktop)
 * - Mobile touch drag & fling support with `touch-action: none`
 * - Strict UI hierarchy ensuring overlay text and CTA action buttons remain
 *   crisp, legible, and directly clickable above floating physics bodies
 */
export const HeroSection: React.FC = () => {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch-capable devices to disable custom cursor overhead on mobile
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
    }

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative w-full min-h-[620px] h-[100dvh] md:h-screen overflow-hidden bg-black text-[#E8DFD8] font-sans selection:bg-[#cbb59d] selection:text-black md:cursor-none">
      
      {/* ================= 1. MINIMAL CUSTOM CURSOR (DESKTOP ONLY) ================= */}
      {!isTouchDevice && cursorPos.x >= 0 && (
        <motion.div
          className="hidden md:flex fixed top-0 left-0 pointer-events-none z-50 rounded-full border border-[#D4AF37]/40 items-center justify-center backdrop-blur-[1px]"
          animate={{
            x: cursorPos.x - (isHovered ? 24 : 5),
            y: cursorPos.y - (isHovered ? 24 : 5),
            width: isHovered ? 48 : 10,
            height: isHovered ? 48 : 10,
            backgroundColor: isHovered ? 'rgba(212, 175, 55, 0.1)' : 'rgba(235, 215, 195, 0.95)',
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 0.5 }}
        />
      )}

      {/* ================= 2. CINEMATIC BACKGROUND & CHARACTER LAYER ================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-black flex items-center justify-end">
        {/* Ambient Gold Glow Behind Character */}
        <div className="absolute top-1/4 right-1/4 w-[20rem] sm:w-[28rem] h-[20rem] sm:h-[28rem] bg-[#D4AF37]/12 rounded-full blur-[140px] pointer-events-none" />

        {/* Hero Character Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-full w-full flex items-center justify-end"
        >
          <motion.img
            src={heroCharacterImg}
            alt="Mandeep Khatri Hero Character"
            animate={{
              y: [-4, 4, -4],
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="h-full w-full object-cover object-[72%_center] lg:object-[68%_center] xl:object-[60%_center] opacity-40 sm:opacity-65 md:opacity-90 lg:opacity-100 filter contrast-[1.04] brightness-[1.02]"
          />
        </motion.div>

        {/* Left Edge Dark Gradient Blend so Text Pops with High Contrast */}
        <div className="absolute inset-y-0 left-0 w-full sm:w-3/4 md:w-3/5 lg:w-1/2 bg-gradient-to-r from-black via-black/85 to-transparent pointer-events-none z-[1]" />

        {/* Top & Bottom Vignettes */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black via-black/70 to-transparent pointer-events-none z-[1]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-[1]" />

        {/* ================= 3. ANIMATED WATERMARK EMBLEM ================= */}
        <div className="absolute bottom-6 right-6 lg:bottom-10 lg:right-12 pointer-events-none flex items-center justify-center z-[2]">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-28 sm:w-36 h-28 sm:h-36 bg-black/85 rounded-full blur-xl" />

            <motion.div
              animate={{
                y: [-3, 3, -3],
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative flex items-center justify-center"
            >
              <img
                src={watermarkImg}
                alt="Insignia"
                className="w-20 sm:w-28 lg:w-32 h-20 sm:h-28 lg:h-32 object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.25)]"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ================= 4. ANTI-GRAVITY FLOATING PHYSICS CANVAS LAYER ================= */}
      {/* 
        - Responsive container scaling (adapts automatically on orientation change / resize)
        - Mobile: reduced particle counts (10-15), scaled radius & reduced velocity
        - Desktop: full physics density
        - touch-action: none to prevent accidental scrolling while dragging objects
        - Placed behind the UI overlay elements for crisp accessibility
      */}
      <div className="absolute inset-0 w-full h-full z-[5] pointer-events-auto">
        <ACanvas
          className="w-full h-full"
          showHint={true}
        />
      </div>

      {/* ================= 5. UI CONTENT & NAVIGATION OVERLAY LAYER ================= */}
      {/* 
        - Strictly elevated at z-20/z-30 above floating physics canvas elements
        - Action buttons and navigation links retain full click/touch responsiveness
        - Backdrop protection ensures complete legibility on mobile viewports
      */}
      <div className="relative z-20 flex flex-col justify-between h-full w-full px-5 sm:px-12 lg:px-16 pt-5 sm:pt-6 pb-7 sm:pb-8 pointer-events-none">
        
        {/* Navigation Bar */}
        <header className="relative flex items-center justify-between w-full pointer-events-auto z-30">
          <a
            href="#"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="text-xs sm:text-sm font-semibold tracking-[0.35em] uppercase text-[#EAD8C7] hover:opacity-75 transition-opacity drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            MANDEEP KHATRI.
          </a>

          {/* Navigation Links (Desktop) */}
          <nav
            className="hidden md:flex items-center space-x-8 lg:space-x-10 text-[11px] tracking-[0.28em] font-light uppercase text-[#C4B5A5] absolute left-1/2 -translate-x-1/2 bg-black/40 px-6 py-1.5 rounded-full backdrop-blur-md border border-[#8C6D4F]/20"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative group py-1 transition-colors duration-300 hover:text-[#FFF5EB]"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37]/50 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right Action */}
          <a
            href="#contact"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group flex items-center space-x-2 text-[10px] sm:text-[11px] tracking-[0.24em] font-light uppercase py-2 px-3.5 sm:px-4 border border-[#8C6D4F]/60 hover:border-[#D4AF37] text-[#EAD8C7] transition-all duration-300 bg-black/60 backdrop-blur-md ml-auto md:ml-0 shadow-sm"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <span>LET&apos;S TALK</span>
            <span className="transform transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-xs">
              ↗
            </span>
          </a>
        </header>

        {/* Main Hero Row */}
        <div className="relative flex flex-col md:flex-row items-center justify-between w-full pt-2 sm:pt-4 pb-2 my-auto">
          
          {/* LEFT: Balanced Headline & Actions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-[37rem] xl:max-w-[40rem] pointer-events-auto z-30"
          >
            {/* Massive Condensed Headline */}
            <motion.div variants={fadeUpVariants} className="relative mb-3.5 select-none">
              <h1
                className="text-[3.25rem] sm:text-7xl md:text-8xl lg:text-[7.2rem] xl:text-[7.8rem] tracking-tight uppercase leading-[0.85] sm:leading-[0.83]"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {/* Line 1: I BUILD */}
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#D5CBC0] to-[#605448] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  I BUILD
                </span>

                {/* Line 2: DIGITAL */}
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#F7E7C4] via-[#C99E5D] to-[#543B1A] drop-shadow-[0_8px_25px_rgba(201,158,93,0.35)]">
                  SYSTEMS &amp;
                </span>

                {/* Line 3: EXPERIENCES */}
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#DFBE8A] via-[#9B7640] to-[#342410] drop-shadow-[0_10px_30px_rgba(155,118,64,0.4)]">
                  CLOUD INFRA
                </span>
              </h1>
            </motion.div>

            {/* Subtitle Technologies */}
            <motion.div variants={fadeUpVariants} className="mb-3.5 sm:mb-4">
              <p
                className="text-[9.5px] sm:text-[11px] md:text-xs font-normal tracking-[0.24em] sm:tracking-[0.28em] uppercase text-[#C4B29E] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                CLOUD ENGINEERING <span className="text-[#8C6D4F] mx-1">•</span> NETWORKING &amp; SYSTEMS <span className="text-[#8C6D4F] mx-1">•</span> PYTHON &amp; DEVOPS
              </p>
            </motion.div>

            {/* 3-Line Description */}
            <motion.div
              variants={fadeUpVariants}
              className="text-xs sm:text-sm md:text-[13.5px] font-light text-[#A8988B] leading-[1.75] sm:leading-[1.8] tracking-wide max-w-lg mb-6 space-y-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <p>
                I am an Information Technology student passionate about Cloud Computing, Networking, Linux, and practical system architectures.
                <br />
                Building scalable services and hands-on real-world engineering solutions.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUpVariants}
              className="flex flex-row flex-wrap items-center gap-3.5 sm:gap-6"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {/* Explore My Work CTA */}
              <motion.a
                href="#work"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative inline-flex items-center space-x-2 sm:space-x-3 px-5 sm:px-7 py-3 sm:py-3.5 border border-[#8C6D4F] bg-[#120F0C]/90 hover:border-[#D4AF37] text-[#EAD8C7] hover:text-[#FFF5EB] text-[10.5px] sm:text-[11px] font-medium tracking-[0.22em] sm:tracking-[0.24em] uppercase transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.18)] backdrop-blur-md"
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8D7C5]/40 to-transparent pointer-events-none" />
                <span>EXPLORE MY WORK</span>
                <span className="transform transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-xs">
                  ↗
                </span>
              </motion.a>

              {/* Download Resume Button */}
              <motion.a
                href="/Mandeep-Khatri-CV.pdf"
                download="Mandeep-Khatri-CV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative inline-flex items-center space-x-2 px-5 sm:px-7 py-3 sm:py-3.5 border border-[#8C6D4F]/50 hover:border-[#8C6D4F] text-[#BFA895] hover:text-[#EAD8C7] text-[10.5px] sm:text-[11px] font-medium tracking-[0.22em] sm:tracking-[0.24em] uppercase transition-all duration-300 bg-[#120F0C]/80 backdrop-blur-md"
              >
                <span>DOWNLOAD RESUME</span>
                <span className="transform transition-transform duration-300 group-hover:translate-y-0.5 text-xs">
                  ↓
                </span>
              </motion.a>
            </motion.div>
          </motion.div>

          {/* RIGHT: Floating Quote & Signature Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex flex-col items-start pointer-events-auto pr-24 xl:pr-36 mr-4 z-30 select-none"
          >
            {/* 1. Quote Mark */}
            <span className="text-xl text-[#C99E5D] leading-none font-serif mb-2">
              “
            </span>

            {/* 2. Compact Two-Line Statement */}
            <div 
              className="text-[9.5px] font-medium tracking-[0.24em] uppercase text-[#E0D3C5] space-y-1 mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <p>SYSTEMS ARE MY CANVAS.</p>
              <p>CLOUD IS MY DOMAIN.</p>
            </div>

            {/* 3. Gold Accent Line */}
            <div className="w-28 h-[1px] bg-gradient-to-r from-[#D4AF37] via-[#E8D7C5]/70 to-transparent shadow-[0_0_8px_rgba(212,175,55,0.4)] mb-2" />

            {/* 4. Fine Monoline Calligraphy Signature */}
            <div 
              className="text-[2.2rem] text-[#D8AB64] font-normal leading-none -ml-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              style={{ 
                fontFamily: "'Herr Von Muellerhoff', 'Allura', cursive",
                letterSpacing: '0.04em',
              }}
            >
              Mandeep
            </div>
          </motion.div>
        </div>

        {/* Bottom Navigation Cue / Status */}
        <div className="h-2 flex items-center justify-between text-[10px] text-[#A8988B] tracking-[0.2em] font-mono pointer-events-none">
          <span className="hidden sm:inline-block">CLOUD • NETWORKING • DEVOPS</span>
          <span className="ml-auto opacity-70">SCROLL TO DISCOVER ↓</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;