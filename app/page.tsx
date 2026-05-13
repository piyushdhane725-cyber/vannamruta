"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [showContent, setShowContent] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // References to videos
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const transitionVideoRef = useRef<HTMLVideoElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  // Smooth scroll
  useEffect(() => {
    let lenis: any;
    let animationFrameId: number;

    const initLenis = async () => {
      try {
        const Lenis = (await import('lenis')).default;
        lenis = new Lenis();
        function raf(time: number) {
          lenis.raf(time);
          animationFrameId = requestAnimationFrame(raf);
        }
        animationFrameId = requestAnimationFrame(raf);
      } catch (e) {
        console.log("Lenis not found, skipping smooth scroll");
      }
    };
    initLenis();

    return () => {
      if (lenis) lenis.destroy();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    // Start intro video when mounted
    const introVideo = introVideoRef.current;
    if (introVideo && phase === 1) {
      introVideo.playbackRate = 1.0; // Base speed (Luxurious & smooth)
      introVideo.play().catch(e => console.log("Intro play error:", e));
      
      const handleEnded = () => setPhase(2);
      introVideo.addEventListener('ended', handleEnded);

      // Smoothly adjust playback rate (sweeping effect)
      let targetPlaybackRate = 1.0;
      let currentPlaybackRate = 1.0;
      let animationFrameId: number;
      let scrollTimeout: NodeJS.Timeout;

      const updatePlaybackRate = () => {
        if (!introVideo) return;
        
        // Slower lerp (0.05) for a much smoother, unhurried sweep
        currentPlaybackRate += (targetPlaybackRate - currentPlaybackRate) * 0.05;
        
        // Safety bounds
        if (currentPlaybackRate < 1.0) currentPlaybackRate = 1.0;
        if (currentPlaybackRate > 4.0) currentPlaybackRate = 4.0;
        
        introVideo.playbackRate = currentPlaybackRate;
        animationFrameId = requestAnimationFrame(updatePlaybackRate);
      };
      
      animationFrameId = requestAnimationFrame(updatePlaybackRate);

      const handleWheel = (e: WheelEvent) => {
        // Increase target playback rate gently as they scroll (max 3.5x for elegance)
        targetPlaybackRate = Math.min(targetPlaybackRate + 0.3, 3.5);
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          targetPlaybackRate = 1.0; // Target returns to normal smoothly
        }, 200);
      };
      
      window.addEventListener('wheel', handleWheel);

      return () => {
        introVideo.removeEventListener('ended', handleEnded);
        window.removeEventListener('wheel', handleWheel);
        clearTimeout(scrollTimeout);
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [phase]);

  useEffect(() => {
    const transitionVideo = transitionVideoRef.current;
    if (transitionVideo && phase === 2) {
      transitionVideo.currentTime = 0;
      transitionVideo.playbackRate = 4.0; // Increased speed so the 8-second segment plays in ~2 seconds
      transitionVideo.play().catch(e => console.log("Transition play error:", e));
      
      const handleTimeUpdate = () => {
        if (transitionVideo.currentTime >= 8) {
          setPhase(3);
        }
      };
      const handleEnded = () => {
        setPhase(3);
      };
      
      transitionVideo.addEventListener('timeupdate', handleTimeUpdate);
      transitionVideo.addEventListener('ended', handleEnded);
      
      return () => {
        transitionVideo.removeEventListener('timeupdate', handleTimeUpdate);
        transitionVideo.removeEventListener('ended', handleEnded);
      };
    }
  }, [phase]);

  useEffect(() => {
    const heroVideo = heroVideoRef.current;
    if (heroVideo && phase === 3) {
      heroVideo.currentTime = 0;
      heroVideo.play().catch(e => console.log("Hero play error:", e));
      // Delay content appearance slightly for dramatic effect
      setTimeout(() => setShowContent(true), 1500);
    }
  }, [phase]);

  const handleMouseMove = (e: React.MouseEvent) => {
    // Calculate normalized mouse position (-1 to 1)
    const x = (e.clientX / (typeof window !== 'undefined' ? window.innerWidth : 1000)) * 2 - 1;
    const y = (e.clientY / (typeof window !== 'undefined' ? window.innerHeight : 1000)) * 2 - 1;
    setMousePos({ x, y });
  };

  return (
    <main 
      className="relative w-full bg-[#050505] text-white font-sans selection:bg-yellow-900 selection:text-yellow-100 cursor-default"
      onMouseMove={handleMouseMove}
    >
      {/* FIXED BACKGROUND VIDEOS */}
      <div className="fixed inset-0 z-0 h-full w-full overflow-hidden bg-black">
        <motion.div 
          className="absolute inset-0 h-full w-full"
          animate={{
            x: mousePos.x * -15, // Subtle parallax
            y: mousePos.y * -15,
            scale: 1.03
          }}
          transition={{ type: "tween", ease: "easeOut", duration: 0.5 }}
        >
          <video
            ref={introVideoRef}
            muted
            playsInline
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[2000ms] ease-in-out ${phase === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <source src="/videos/gold-particles.mp4" type="video/mp4" />
          </video>

          <video
            ref={transitionVideoRef}
            muted
            playsInline
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[2000ms] ease-in-out ${phase === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <source src="/videos/transition-bg.mp4" type="video/mp4" />
          </video>

          <video
            ref={heroVideoRef}
            muted
            loop
            playsInline
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[3000ms] ease-in-out ${phase === 3 ? 'opacity-90 z-10' : 'opacity-0 z-0'}`}
          >
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
          </video>
        </motion.div>
        
        {/* Dark gradient overlay to make left-aligned text easily readable, regardless of video brightness */}
        <div className={`absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-20 pointer-events-none transition-opacity duration-[3000ms] ${phase === 3 ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* FIXED HEADER */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: phase === 3 ? 1 : 0 }}
        transition={{ duration: 1.5, delay: 1 }}
        className="fixed top-0 left-0 w-full p-8 md:p-12 flex justify-between items-center z-50 pointer-events-none"
      >
        <div className="text-xs md:text-sm tracking-[0.4em] text-yellow-500/90 uppercase">Vannamruta</div>
        <div className="text-[10px] md:text-xs tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer pointer-events-auto">CART (0)</div>
      </motion.header>

      {/* INITIAL SCREEN FOR PHASE 1 & 2 (Tagline) */}
      <div className="absolute inset-0 z-30 min-h-screen w-full flex items-center justify-center pointer-events-none">
        <AnimatePresence>
          {(phase === 1 || phase === 2) && (
            <motion.div
              key="intro-tagline"
              initial={{ opacity: 0, y: 15, filter: "blur(5px)" }}
              animate={{ 
                opacity: phase === 1 ? 1 : 0, 
                y: phase === 1 ? 0 : -15,
                filter: phase === 1 ? "blur(0px)" : "blur(5px)" 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: phase === 1 ? 1.2 : 0, ease: "easeInOut" }}
              className="mt-[calc(16rem+7cm)]" /* Pushed exactly 7cm further down from its previous mt-64 position */
            >
              <p className="text-xs md:text-base tracking-[0.8em] text-yellow-500/90 uppercase font-light drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                The Elixir of Life
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* HERO CONTENT - Left Aligned */}
      <div className="relative z-30 min-h-screen w-full flex items-center pointer-events-none">
        <AnimatePresence>
          {phase === 3 && showContent && (
            <motion.div
              key="hero-content"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="w-full max-w-[1400px] mx-auto px-8 md:px-16 flex flex-col justify-center pointer-events-auto"
            >
              
              <motion.div 
                className="max-w-xl xl:max-w-2xl"
                animate={{
                  x: mousePos.x * 12,
                  y: mousePos.y * 12,
                }}
                transition={{ type: "tween", ease: "easeOut", duration: 0.8 }}
              >
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="text-[10px] md:text-xs tracking-[0.5em] text-yellow-500/90 mb-8 uppercase"
                >
                  The Legendary Ayurvedic Elixir
                </motion.p>
                
                <motion.h1 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 2, delay: 0.8 }}
                  className="text-6xl md:text-8xl lg:text-[100px] font-light tracking-wide text-white mb-10 leading-[1.05] drop-shadow-2xl"
                  style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                >
                  Kumkumadi<br/>
                  <span className="italic text-yellow-100/90 ml-8 md:ml-16">Taila</span>
                </motion.h1>

                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 2, delay: 1.5 }}
                  className="w-24 md:w-32 h-[1px] bg-gradient-to-r from-yellow-600/80 to-transparent mb-10 origin-left"
                />

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2, delay: 1.8 }}
                  className="text-white/80 text-sm md:text-lg tracking-[0.1em] font-light leading-relaxed max-w-md mb-14 drop-shadow-md"
                >
                  Handcrafted with rare saffron and pristine lotus extracts.
                  Indulge in an ageless ritual for timeless, luminous radiance.
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 2.2 }}
                  className="flex flex-col md:flex-row md:items-center gap-8 md:gap-14"
                >
                  <button className="group relative overflow-hidden px-10 md:px-14 py-4 md:py-5 border border-yellow-600/50 bg-transparent text-[10px] md:text-[11px] tracking-[0.3em] text-yellow-500 transition-all duration-700 hover:border-yellow-500 hover:text-white w-fit">
                    <span className="relative z-10">ACQUIRE NOW</span>
                    <div className="absolute inset-0 h-full w-full translate-y-full bg-yellow-900/40 transition-transform duration-700 ease-out group-hover:translate-y-0" />
                  </button>

                  <span className="text-xl md:text-2xl tracking-[0.2em] text-yellow-100/90 font-light md:border-l md:border-yellow-600/30 md:pl-14">
                    INR 1,999
                  </span>
                </motion.div>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Scroll indicator */}
      <AnimatePresence>
        {phase === 3 && showContent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-40"
          >
            <span className="text-[9px] tracking-[0.4em] text-white/50 uppercase">Discover</span>
            <motion.div 
              animate={{ y: [0, 15, 0], opacity: [0.3, 1, 0.3] }} 
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="w-[1px] h-16 bg-gradient-to-b from-white/60 to-transparent"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MORE CONTENT TO SCROLL TO */}
      {phase === 3 && showContent && (
        <div className="relative z-30 w-full bg-black/90 backdrop-blur-md pointer-events-auto border-t border-white/5">
          
          {/* Section 1: The Legacy */}
          <div className="min-h-[100vh] w-full flex items-center justify-center px-6 border-b border-white/5">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center max-w-4xl mx-auto"
            >
              <p className="text-yellow-500/80 tracking-[0.4em] text-xs uppercase mb-6">The Legacy</p>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-10" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                The Ritual of Royalty
              </h2>
              <div className="w-12 h-[1px] bg-yellow-600/50 mx-auto mb-10" />
              <p className="text-white/60 tracking-[0.1em] text-base md:text-xl font-light leading-loose md:leading-loose">
                For centuries, Kumkumadi Taila has been the best-kept secret of Indian royalty. 
                A precise formulation of 21 rare herbs, goat's milk, and pure Kashmiri saffron,
                slow-cooked to perfection over days to capture the essence of youth.
              </p>
            </motion.div>
          </div>

          {/* Section 2: Contact & Footer */}
          <div className="w-full bg-[#030303] py-24 md:py-32 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
              
              {/* Contact Info */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.5 }}
                viewport={{ once: true }}
                className="flex flex-col justify-center"
              >
                <h3 className="text-3xl md:text-5xl font-light text-white mb-8" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                  Connect With Us
                </h3>
                <div className="w-12 h-[1px] bg-yellow-600/50 mb-10" />
                <p className="text-white/50 tracking-wider font-light leading-relaxed mb-8 max-w-sm">
                  Experience the pinnacle of Ayurvedic luxury. Reach out to our concierge for personalized skincare rituals and inquiries.
                </p>
                <div className="space-y-4 text-xs tracking-[0.2em] text-yellow-100/70 font-light uppercase">
                  <p className="hover:text-yellow-500 transition-colors cursor-pointer">concierge@vannamruta.com</p>
                  <p>+91 800 123 4567</p>
                  <p>Mumbai, India</p>
                </div>
              </motion.div>

              {/* Inquiry Form (Minimalist) */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col justify-center"
              >
                <form className="flex flex-col gap-10" onSubmit={(e) => e.preventDefault()}>
                  <div className="relative">
                    <input type="text" placeholder="YOUR NAME" className="w-full bg-transparent border-b border-white/20 pb-4 text-[10px] md:text-xs tracking-[0.3em] text-white focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-white/30" />
                  </div>
                  <div className="relative">
                    <input type="email" placeholder="EMAIL ADDRESS" className="w-full bg-transparent border-b border-white/20 pb-4 text-[10px] md:text-xs tracking-[0.3em] text-white focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-white/30" />
                  </div>
                  <div className="relative">
                    <textarea placeholder="YOUR MESSAGE" rows={3} className="w-full bg-transparent border-b border-white/20 pb-4 text-[10px] md:text-xs tracking-[0.3em] text-white focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-white/30 resize-none" />
                  </div>
                  <button className="group relative overflow-hidden px-12 py-5 border border-yellow-600/50 bg-transparent text-[10px] tracking-[0.3em] text-yellow-500 transition-all duration-700 hover:border-yellow-500 hover:text-white w-max mt-4">
                    <span className="relative z-10">SEND INQUIRY</span>
                    <div className="absolute inset-0 h-full w-full translate-y-full bg-yellow-900/40 transition-transform duration-700 ease-out group-hover:translate-y-0" />
                  </button>
                </form>
              </motion.div>
            </div>

            {/* Footer Bottom */}
            <div className="max-w-7xl mx-auto mt-32 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-xs tracking-[0.5em] text-yellow-500/80 uppercase">Vannamruta</div>
              <div className="flex gap-8 text-[9px] md:text-[10px] tracking-[0.2em] text-white/40">
                <a href="#" className="hover:text-white transition-colors">INSTAGRAM</a>
                <a href="#" className="hover:text-white transition-colors">FACEBOOK</a>
                <a href="#" className="hover:text-white transition-colors">PRIVACY POLICY</a>
              </div>
              <div className="text-[9px] md:text-[10px] tracking-[0.2em] text-white/30 uppercase">
                &copy; {new Date().getFullYear()} All Rights Reserved.
              </div>
            </div>
          </div>

        </div>
      )}

    </main>
  );
}
