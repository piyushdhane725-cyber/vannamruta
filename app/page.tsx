"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [phase, setPhase] = useState<1 | 3>(1);
  const [showContent, setShowContent] = useState(false);

  // Shopify integration states
  const [productData, setProductData] = useState<{
    price: string;
    currency: string;
    available: boolean;
  } | null>(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // References to videos
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  // Fetch product dynamically from Shopify Storefront API using private token header
  useEffect(() => {
    async function fetchProduct() {
      try {
        const domain = "ezt0bc-df.myshopify.com";
        const token = process.env.NEXT_PUBLIC_SHOPIFY_TOKEN;
        const url = `https://${domain}/api/2024-01/graphql.json`;

        const query = `
          query {
            product(handle: "kumkumadi-taila") {
              variants(first: 1) {
                edges {
                  node {
                    availableForSale
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        `;

        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Shopify-Storefront-Private-Token": token,
          },
          body: JSON.stringify({ query }),
        });

        const json = await res.json();
        const product = json?.data?.product;
        if (product && product.variants.edges.length > 0) {
          const variant = product.variants.edges[0].node;
          setProductData({
            price: parseFloat(variant.price.amount).toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            }),
            currency: variant.price.currencyCode === "INR" ? "₹" : variant.price.currencyCode + " ",
            available: variant.availableForSale,
          });
        }
      } catch (err) {
        console.error("Failed to fetch product from Shopify:", err);
      } finally {
        setIsFetchingProduct(false);
      }
    }

    if (phase === 3) {
      fetchProduct();
    }
  }, [phase]);

  // Handle high-end cinematic checkout redirect
  const handleAcquireNow = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      window.location.href = "https://ezt0bc-df.myshopify.com/cart/51823894954280:1";
    }, 2200);
  };

  useEffect(() => {
    // Start intro video when mounted
    const introVideo = introVideoRef.current;
    if (introVideo && phase === 1) {
      introVideo.currentTime = 3; // Cut the starting part by 3 seconds
      introVideo.playbackRate = 1.8; // Set a steady, slightly faster speed for smoothness
      introVideo.play().catch(e => console.log("Intro play error:", e));

      const handleEnded = () => setPhase(3);
      introVideo.addEventListener("ended", handleEnded);

      return () => {
        introVideo.removeEventListener("ended", handleEnded);
      };
    }
  }, [phase]);

  useEffect(() => {
    const heroVideo = heroVideoRef.current;
    if (heroVideo && phase === 3) {
      if (introVideoRef.current) introVideoRef.current.pause();

      heroVideo.currentTime = 0;
      heroVideo.play().catch(e => console.log("Hero play error:", e));
      setShowContent(true); // Trigger product appearance immediately
    }
  }, [phase]);

  return (
    <>
      <main
        className="relative w-full bg-[#050505] text-white font-sans selection:bg-yellow-900 selection:text-yellow-100 cursor-default"
      >
        {/* FIXED BACKGROUND VIDEOS (CONDITIONAL MOUNTING TO ELIMINATE LAG) */}
        <div className="fixed inset-0 z-0 h-full w-full overflow-hidden bg-black">
          <motion.div className="absolute inset-0 h-full w-full">
            {phase === 1 && (
              <video
                ref={introVideoRef}
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1000ms] ease-in-out opacity-100 z-10"
              >
                <source src="/videos/gold-particles.mp4" type="video/mp4" />
              </video>
            )}

            {phase === 3 && (
              <video
                ref={heroVideoRef}
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out opacity-90 z-10"
              >
                <source src="/videos/hero-bg.mp4" type="video/mp4" />
              </video>
            )}
          </motion.div>

          {/* Dark gradient overlay: vignette on mobile, left-fade on desktop to protect text */}
          <div className={`absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 md:bg-gradient-to-r md:from-black/90 md:via-black/40 md:to-transparent z-20 pointer-events-none transition-opacity duration-[3000ms] ${phase === 3 ? "opacity-100" : "opacity-0"}`} />
        </div>

        {/* FIXED HEADER */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: phase === 3 ? 1 : 0 }}
          transition={{ duration: 1.5, delay: 1 }}
          className="fixed top-0 left-0 w-full p-6 md:p-12 flex justify-between items-center z-50 pointer-events-none"
        >
          <div className="text-xs md:text-sm tracking-[0.4em] text-yellow-500/90 uppercase">Vannamruta</div>
          <div
            className="text-[10px] md:text-xs tracking-[0.2em] text-white/60 hover:text-white transition-colors cursor-pointer pointer-events-auto"
            onClick={() => {
              // Direct smooth scroll to shop
              document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            SHOP
          </div>
        </motion.header>

        {/* INITIAL SCREEN FOR PHASE 1 (Tagline) */}
        <div className="absolute inset-0 z-30 min-h-[100dvh] w-full flex items-center justify-center pointer-events-none">
          <AnimatePresence>
            {phase === 1 && (
              <motion.div
                key="intro-tagline"
                initial={{ opacity: 0, y: 15 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: phase === 1 ? 0.3 : 0, ease: "easeOut" }}
                className="mt-[calc(16rem+7cm)]"
              >
                <p className="text-[10px] md:text-base tracking-[0.4em] md:tracking-[0.8em] text-yellow-500/90 uppercase font-light drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                  The Elixir of Life
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* HERO CONTENT */}
        <div className="relative z-30 min-h-[100dvh] w-full flex items-center pointer-events-none">
          <AnimatePresence>
            {phase === 3 && showContent && (
              <motion.div
                key="hero-content"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute inset-0 md:relative md:inset-auto w-full h-full md:h-auto max-w-[1400px] mx-auto px-6 md:px-16 flex flex-col justify-between pt-[14vh] pb-[12vh] md:py-0 md:justify-center pointer-events-auto"
              >
                <motion.div
                  className="w-full h-full md:h-auto max-w-xl xl:max-w-2xl flex flex-col justify-between md:justify-start items-center text-center md:items-start md:text-left mx-auto md:mx-0"
                >
                  {/* TOP GROUP (Title) */}
                  <motion.div
                    className="flex flex-col items-center md:items-start w-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  >
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 1.2, delay: 0.1 }}
                      className="text-[10px] md:text-xs tracking-[0.5em] text-yellow-500/90 mb-4 md:mb-8 uppercase font-light"
                    >
                      The Legendary Ayurvedic Elixir
                    </motion.p>

                    <motion.h1
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 1.5, delay: 0.2 }}
                      className="text-5xl md:text-8xl lg:text-[100px] font-light tracking-wide text-white leading-[1.05] drop-shadow-2xl font-serif"
                    >
                      Kumkumadi<br />
                      <span className="italic text-yellow-100/90 ml-0 md:ml-16 block md:inline">Taila</span>
                    </motion.h1>
                  </motion.div>

                  {/* BOTTOM GROUP (Description, Button) */}
                  <motion.div
                    className="flex flex-col items-center md:items-start w-full mt-auto md:mt-10"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.5 }}
                  >
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                      className="w-24 md:w-32 h-[1px] bg-gradient-to-r from-yellow-600/80 to-transparent mb-6 md:mb-10 origin-center md:origin-left mx-auto md:mx-0"
                    />

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1.2, delay: 0.4 }}
                      className="text-white text-sm md:text-lg tracking-[0.05em] font-medium leading-relaxed max-w-md mb-8 md:mb-14 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]"
                    >
                      Handcrafted with rare saffron and pristine lotus extracts.
                      Indulge in an ageless ritual for timeless, luminous radiance.
                    </motion.p>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 1.2, delay: 0.5 }}
                      className="w-full flex justify-center md:justify-start"
                    >
                      <button
                        onClick={() => {
                          document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="group relative overflow-hidden px-10 md:px-14 py-4 md:py-5 border border-yellow-600/50 bg-transparent text-[10px] md:text-[11px] tracking-[0.3em] text-yellow-500 transition-all duration-700 hover:border-yellow-500 hover:text-white w-fit cursor-pointer"
                      >
                        <span className="relative z-10 pointer-events-none">DISCOVER COLLECTION</span>
                        <div className="absolute inset-0 h-full w-full translate-y-full bg-yellow-900/40 transition-transform duration-700 ease-out group-hover:translate-y-0 pointer-events-none"></div>
                      </button>
                    </motion.div>
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
          <div className="relative z-30 w-full bg-[#030303] pointer-events-auto border-t border-white/5">
            {/* Section 1: The Collection (Boutique) */}
            <div id="collection" className="min-h-[100dvh] w-full py-24 md:py-32 px-6 border-b border-white/5 bg-[#030303]">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5 }}
                viewport={{ once: true, margin: "-100px" }}
                className="max-w-7xl mx-auto"
              >
                <div className="text-center mb-20 md:mb-32">
                  <p className="text-yellow-500/80 tracking-[0.4em] text-xs uppercase mb-6 font-light">The Boutique</p>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-10 font-serif">
                    Curated Masterpieces
                  </h2>
                  <div className="w-12 h-[1px] bg-yellow-600/50 mx-auto" />
                </div>

                {/* Grid of Products */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
                  {/* Product 1: Kumkumadi Taila (Real Shopify Product) */}
                  <div className="flex flex-col items-center text-center group cursor-pointer">
                    <div className="w-full aspect-[3/4] bg-[#0a0a0a] border border-white/5 relative overflow-hidden mb-8 flex items-center justify-center group-hover:border-yellow-600/30 transition-colors duration-700">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                      <img
                        src="/images/product.png"
                        alt="Kumkumadi Taila"
                        className="absolute inset-0 w-full h-full object-contain p-4 z-0 transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="text-xl md:text-2xl font-light text-white mb-4 font-serif">Kumkumadi Taila</h3>
                    <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase mb-6 h-8">The Legendary Saffron Elixir</p>

                    <div className="flex flex-col items-center gap-4">
                      <span className="text-sm md:text-base tracking-[0.2em] text-yellow-100/90 font-light min-h-[24px] flex items-center">
                        {isFetchingProduct ? (
                          // Luxurious pulse loading skeleton
                          <span className="w-16 h-4 bg-yellow-600/20 rounded animate-pulse inline-block" />
                        ) : (
                          `${productData?.currency || "₹"}${productData?.price || "4,999"}`
                        )}
                      </span>

                      <button
                        onClick={handleAcquireNow}
                        className="px-8 py-3 border border-yellow-600/30 text-[9px] tracking-[0.3em] text-yellow-500 hover:bg-yellow-900/20 hover:border-yellow-500 hover:text-white transition-all duration-500 mt-2 cursor-pointer font-light"
                      >
                        ACQUIRE NOW
                      </button>
                    </div>
                  </div>

                  {/* Product 2: Placeholder */}
                  <div className="flex flex-col items-center text-center group opacity-60">
                    <div className="w-full aspect-[3/4] bg-[#0a0a0a] border border-white/5 relative overflow-hidden mb-8 flex items-center justify-center">
                      <span className="text-white/20 tracking-[0.3em] text-xs font-light uppercase">Sacred Woods</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-light text-white mb-4 font-serif">Sacred Woods</h3>
                    <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase mb-6 h-8">Sandalwood Rejuvenation</p>
                    <span className="text-xs tracking-[0.3em] text-yellow-600/50 uppercase mt-auto font-light">Coming Soon</span>
                  </div>

                  {/* Product 3: Placeholder */}
                  <div className="flex flex-col items-center text-center group opacity-60">
                    <div className="w-full aspect-[3/4] bg-[#0a0a0a] border border-white/5 relative overflow-hidden mb-8 flex items-center justify-center">
                      <span className="text-white/20 tracking-[0.3em] text-xs font-light uppercase">Radiance Nectar</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-light text-white mb-4 font-serif">Radiance Nectar</h3>
                    <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase mb-6 h-8">Lotus & Gold Essence</p>
                    <span className="text-xs tracking-[0.3em] text-yellow-600/50 uppercase mt-auto font-light">Coming Soon</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Section 2: The Legacy */}
            <div className="min-h-[100dvh] w-full flex items-center justify-center px-6 border-b border-white/5">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center max-w-4xl mx-auto"
              >
                <p className="text-yellow-500/80 tracking-[0.4em] text-xs uppercase mb-6 font-light">The Legacy</p>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-10 font-serif">
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
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20">
                {/* Contact Info */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.5 }}
                  viewport={{ once: true }}
                  className="flex flex-col justify-center items-center text-center md:items-start md:text-left"
                >
                  <h3 className="text-3xl md:text-5xl font-light text-white mb-8 font-serif">
                    Connect With Us
                  </h3>
                  <div className="w-12 h-[1px] bg-yellow-600/50 mb-10 mx-auto md:mx-0" />
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
                  <form className="flex flex-col gap-10" onSubmit={e => e.preventDefault()}>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="YOUR NAME"
                        className="w-full bg-transparent border-b border-white/20 pb-4 text-[10px] md:text-xs tracking-[0.3em] text-white focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-white/30 font-light"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="EMAIL ADDRESS"
                        className="w-full bg-transparent border-b border-white/20 pb-4 text-[10px] md:text-xs tracking-[0.3em] text-white focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-white/30 font-light"
                      />
                    </div>
                    <div className="relative">
                      <textarea
                        placeholder="YOUR MESSAGE"
                        rows={3}
                        className="w-full bg-transparent border-b border-white/20 pb-4 text-[10px] md:text-xs tracking-[0.3em] text-white focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-white/30 resize-none font-light"
                      />
                    </div>
                    <button className="group relative overflow-hidden px-12 py-5 border border-yellow-600/50 bg-transparent text-[10px] tracking-[0.3em] text-yellow-500 transition-all duration-700 hover:border-yellow-500 hover:text-white w-max mt-4 mx-auto md:mx-0 cursor-pointer font-light">
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

      {/* CINEMATIC CHECKOUT MODAL */}
      <AnimatePresence>
        {isCheckingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
          >
            {/* Spinning/pulsing golden luxury ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="w-20 h-20 border-2 border-yellow-600/20 border-t-yellow-500 rounded-full mb-8 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]"
            />
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-yellow-500/90 text-xs md:text-sm tracking-[0.5em] uppercase font-light drop-shadow-md text-center px-6"
            >
              Securing Your Elixir
            </motion.p>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 0.6 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="text-white/60 text-[10px] tracking-[0.2em] uppercase font-light mt-3 text-center px-6"
            >
              Connecting to secure luxury checkout
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
