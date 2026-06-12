"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

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

  // Preload hero video for seamless transition
  useEffect(() => {
    const heroVideo = heroVideoRef.current;

    if (heroVideo) {
      heroVideo.load();
    }
  }, []);

  // Fetch product dynamically from Shopify Storefront API using private token header
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/shopify-product?handle=kumkumadi-taila`, {
          method: "GET",
          cache: "no-store",
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

  // Handle high-end cinematic checkout redirect while keeping the user on-site
  const handleAcquireNow = useCallback(() => {
    setIsCheckingOut(true);

    window.setTimeout(() => {
      window.open(
        "https://ezt0bc-df.myshopify.com/cart/add?id=51823894954280&quantity=1",
        "_blank",
        "noopener,noreferrer"
      );
    }, 1200);
  }, []);

  useEffect(() => {
    // Start intro video when mounted
    const introVideo = introVideoRef.current;
    if (introVideo && phase === 1) {
      introVideo.currentTime = 3; // Cut the starting part by 3 seconds
      introVideo.playbackRate = 1.08; // Set a steady, slightly faster speed for smoothness
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
        suppressHydrationWarning
        className="relative w-full bg-[#050505] text-white font-sans selection:bg-yellow-900 selection:text-yellow-100 cursor-default overflow-x-hidden"
      >
        {/* FIXED BACKGROUND VIDEOS (CONDITIONAL MOUNTING TO ELIMINATE LAG) */}
        <div className="fixed inset-0 z-0 h-full w-full overflow-hidden bg-black">
          <motion.div className="absolute inset-0 h-full w-full">
            {phase === 1 && (
              <video
                ref={introVideoRef}
                autoPlay
                muted
                playsInline
                preload="auto"
                poster="/images/luxury-bg.jpg"
                disablePictureInPicture
                style={{ backfaceVisibility: "hidden" }}
                className="absolute inset-0 h-full w-full object-cover transform-gpu will-change-transform will-change-opacity transition-opacity duration-[1200ms] ease-in-out opacity-100 z-10"
              >
                <source src="/videos/gold-particles.mp4" type="video/mp4" />
              </video>
            )}

            {phase === 3 && (
              <video
                ref={heroVideoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/images/luxury-bg.jpg"
                disablePictureInPicture
                style={{ backfaceVisibility: "hidden" }}
                className="absolute inset-0 h-full w-full object-cover transform-gpu will-change-transform will-change-opacity transition-opacity duration-[1800ms] ease-in-out opacity-90 z-10"
              >
                <source src="/videos/hero-bg.mp4" type="video/mp4" />
              </video>
            )}
          </motion.div>
          {/* Dark gradient overlay: vignette on mobile, left-fade on desktop to protect text */}
          <div className={`absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 md:bg-gradient-to-r md:from-black md:via-black/50 md:to-transparent z-20 pointer-events-none transition-opacity duration-[3000ms] ${phase === 3 ? "opacity-100" : "opacity-0"}`} />
        </div>

        {/* FIXED HEADER */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: phase === 3 ? 1 : 0 }}
          transition={{ duration: 1.6, delay: 0.8, ease: "easeOut" }}
          className="fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-50 pointer-events-none"
        >
          <div className="text-sm md:text-xl tracking-[0.45em] text-yellow-500/90 uppercase font-semibold drop-shadow-[0_0_18px_rgba(255,215,0,0.18)]">Vannamruta</div>
          <button
            type="button"
            aria-label="Open collection"
            className="pointer-events-auto rounded-full border border-white/10 bg-black/40 p-3 text-white/80 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-yellow-500/40 hover:bg-yellow-500/10 hover:text-white"
            onClick={() => {
              document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
          </button>
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
                transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 md:relative md:inset-auto w-full h-full md:h-auto max-w-[1400px] mx-auto px-6 md:px-16 flex flex-col justify-between pt-[14vh] pb-[12vh] md:py-0 md:justify-center pointer-events-auto"
              >
                <motion.div
                  className="w-full h-full md:h-auto max-w-6xl mx-auto flex flex-col justify-between md:justify-start items-center text-center md:items-start md:text-left"
                >
                  {/* TOP GROUP (Title) */}
                  <motion.div
                    className="flex flex-col items-center md:items-start w-full"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 1.2, delay: 0.1 }}
                      className="text-[10px] md:text-xs tracking-[0.45em] text-yellow-500/90 mb-4 md:mb-6 uppercase font-light"
                    >
                      The Legendary Ayurvedic Elixir
                    </motion.p>

                    <motion.h1
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 1.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="text-[56px] md:text-[84px] lg:text-[110px] font-semibold tracking-[0.18em] text-white leading-[1.02] drop-shadow-[0_0_40px_rgba(255,255,255,0.18)] font-serif uppercase"
                    >
                      Kumkumadi
                      <span className="block md:inline italic text-yellow-100/95 md:ml-5">Taila</span>
                    </motion.h1>
                  </motion.div>

                  {/* BOTTOM GROUP (Description, Proof, Product Preview) */}
                  <motion.div
                    className="flex flex-col items-center md:items-start w-full mt-auto md:mt-10"
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
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
                      className="text-white text-sm md:text-lg tracking-[0.05em] font-medium leading-relaxed max-w-md mb-6 md:mb-8 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]"
                    >
                      Handcrafted with rare saffron and pristine lotus extracts.
                      A luminous ritual designed to bring back softness, glow, and calm confidence.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, delay: 0.45 }}
                      className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-white/80 mb-8 md:mb-10"
                    >
                      <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">★ 4.9 / 5</span>
                      <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">Trusted by 5,000+ rituals</span>
                      <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">100% Ayurvedic formulation</span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, delay: 0.52 }}
                      className="mb-8 flex flex-wrap items-center justify-center gap-3 border border-white/8 bg-black/30 px-4 py-3 text-[10px] uppercase tracking-[0.35em] text-white/55 md:justify-start backdrop-blur-xl"
                    >
                      <span>Featured in</span>
                      <span className="text-white/75">VOGUE</span>
                      <span className="text-white/60">•</span>
                      <span className="text-white/75">ELLE</span>
                      <span className="text-white/60">•</span>
                      <span className="text-white/75">COSMOPOLITAN</span>
                    </motion.div>

                    <div className="w-full grid gap-8 md:grid-cols-[1fr_420px] md:items-center">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1.4, delay: 0.5, ease: "easeOut" }}
                        className="w-full flex flex-col items-center md:items-start"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="group relative overflow-hidden px-10 md:px-14 py-4 md:py-5 border border-yellow-600/50 bg-transparent text-[10px] md:text-[11px] tracking-[0.3em] text-yellow-500 transition-all duration-700 hover:bg-yellow-900/30 hover:border-yellow-400 hover:text-white hover:shadow-[0_0_30px_rgba(234,179,8,0.18)] w-fit cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                          <span className="relative z-10 pointer-events-none">SHOP KUMKUMADI TAILA</span>
                          <div className="absolute inset-0 h-full w-full translate-y-full bg-yellow-900/40 transition-transform duration-700 ease-out group-hover:translate-y-0 pointer-events-none"></div>
                        </button>

                        <p className="mt-5 max-w-sm text-sm md:text-[13px] leading-6 text-white/65 tracking-[0.08em] uppercase text-center md:text-left">
                          Visible results, premium ritual, and concierge guidance from first click to checkout.
                        </p>
                      </motion.div>

                      <motion.article
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.1, delay: 0.6, ease: "easeOut" }}
                        whileHover={{ y: -4, scale: 1.01 }}
                        className="mx-auto w-full max-w-sm rounded-[30px] border border-white/10 bg-black/45 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl md:ml-auto md:mr-0"
                      >
                        <p className="text-[10px] uppercase tracking-[0.35em] text-yellow-500/80">Featured Elixir</p>
                        <div className="mt-4 rounded-[24px] border border-white/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
                          <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] border border-white/8 bg-[linear-gradient(145deg,#131313,#060606)]">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%)]" />
                            <img
                              src="/images/product.png"
                              alt="Kumkumadi Taila bottle"
                              className="relative z-10 h-full w-full object-contain p-4 drop-shadow-[0_18px_35px_rgba(255,215,0,0.18)]"
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.35em] text-yellow-500/70">Kumkumadi Taila</p>
                            <h3 className="mt-2 text-xl md:text-2xl font-serif text-white">Royal Saffron Ritual</h3>
                          </div>
                          <div className="text-right">
                            <p className="text-lg md:text-xl text-yellow-100">₹{productData?.price || "4,999"}</p>
                            <p className="text-[9px] uppercase tracking-[0.25em] text-white/45">{productData?.available === false ? "Currently unavailable" : "In stock"}</p>
                          </div>
                        </div>

                        <p className="mt-4 text-sm text-white/72 leading-6">
                          A rare blend of saffron, lotus, sandalwood, and Ayurvedic botanicals for luminous, velvety skin.
                        </p>

                        <button
                          type="button"
                          onClick={handleAcquireNow}
                          className="mt-5 w-full border border-yellow-600/40 bg-yellow-500/8 px-4 py-3 text-[10px] uppercase tracking-[0.35em] text-yellow-100 transition-all duration-500 hover:bg-yellow-900/30 hover:border-yellow-400 hover:text-white hover:shadow-[0_0_24px_rgba(234,179,8,0.18)] cursor-pointer"
                        >
                          {isCheckingOut ? "PREPARING CHECKOUT" : "ADD TO CART"}
                        </button>
                      </motion.article>
                    </div>
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
                animate={{ y: [0, 12, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
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
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, margin: "-100px" }}
                className="max-w-7xl mx-auto"
              >
                <div className="text-center mb-20 md:mb-32">
                  <p className="text-yellow-500/80 tracking-[0.4em] text-xs uppercase mb-6 font-light">The Boutique</p>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-10 font-serif">
                    Curated Masterpieces
                  </h2>
                  <div className="w-12 h-[1px] bg-yellow-600/50 mx-auto" />
                  <p className="mt-8 max-w-3xl mx-auto text-white/65 text-sm md:text-base leading-relaxed tracking-[0.08em] uppercase">
                    A refined ritual experience with real-time product availability, luxury packaging, and concierge support.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20">
                  {[
                    ["Saffron-Infused", "Rare Kashmiri saffron blended with botanical oils for luminous, balanced glow."],
                    ["Fast Concierge", "Personalized guidance for rituals, gifting, and order assistance in under one day."],
                    ["Authentic Luxury", "Small-batch craftsmanship with premium packaging and a polished checkout flow."],
                  ].map(([title, text]) => (
                    <article key={title} className="rounded-2xl border border-white/8 bg-white/4 p-6 text-left shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                      <p className="text-[10px] tracking-[0.35em] text-yellow-500/90 uppercase mb-4">{title}</p>
                      <p className="text-sm text-white/70 leading-6">{text}</p>
                    </article>
                  ))}
                </div>

                {/* Grid of Products */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
                  {/* Product 1: Kumkumadi Taila (Real Shopify Product) */}
                  <motion.div
                    whileHover={{ y: -8, rotateX: 1, rotateY: -1 }}
                    transition={{ type: "spring", stiffness: 180, damping: 18 }}
                    className="flex flex-col items-center text-center group cursor-pointer"
                  >
                    <div className="relative w-full aspect-[3/4] bg-[#0a0a0a] border border-white/5 overflow-hidden mb-8 flex items-center justify-center group-hover:border-yellow-600/30 transition-colors duration-700">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                      <img
                        src="/images/product.png"
                        alt="Kumkumadi Taila"
                        className="h-full w-full object-contain p-4 z-0 transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="text-xl md:text-2xl font-light text-white mb-4 font-serif">Kumkumadi Taila</h3>
                    <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase mb-6 h-8">The Legendary Saffron Elixir</p>

                    <div className="flex flex-col items-center gap-4">
                      <div className="text-center" aria-live="polite">
                        <span className="text-sm md:text-base tracking-[0.2em] text-yellow-100/90 font-light min-h-[24px] flex items-center justify-center gap-2">
                          {isFetchingProduct ? (
                            <span className="w-16 h-4 bg-yellow-600/20 rounded animate-pulse inline-block" />
                          ) : (
                            `${productData?.currency || "₹"}${productData?.price || "4,999"}`
                          )}
                        </span>
                        <p className="mt-2 text-[9px] uppercase tracking-[0.25em] text-white/45">
                          {productData?.available === false ? "Currently unavailable" : "In stock • secure checkout"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAcquireNow}
                        className="px-8 py-3 border border-yellow-600/30 text-[9px] tracking-[0.3em] text-yellow-500 hover:bg-yellow-900/30 hover:border-yellow-400 hover:text-white hover:shadow-[0_0_30px_rgba(234,179,8,0.18)] transition-all duration-500 mt-2 cursor-pointer font-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      >
                        {isCheckingOut ? "PREPARING CHECKOUT" : "ACQUIRE NOW"}
                      </button>
                    </div>
                  </motion.div>

                  {/* Product 2: Ritual Benefits */}
                  <motion.article
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 160, damping: 16 }}
                    className="flex flex-col items-center text-center group rounded-3xl border border-white/8 bg-white/4 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-transform duration-700 hover:border-yellow-600/30"
                  >
                    <div className="w-full aspect-[3/4] bg-[linear-gradient(145deg,#111111,#070707)] border border-white/5 relative overflow-hidden mb-8 flex items-center justify-center">
                      <span className="text-white/20 tracking-[0.3em] text-xs font-light uppercase">Luminous Glow</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-light text-white mb-4 font-serif">Luminous Radiance</h3>
                    <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase mb-5">Softens • Brightens • Revives</p>
                    <p className="text-sm text-white/65 leading-6">A velvet finish with a visibly brighter, calmer complexion through daily ritual use.</p>
                  </motion.article>

                  {/* Product 3: Ritual Benefits */}
                  <motion.article
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 160, damping: 16 }}
                    className="flex flex-col items-center text-center group rounded-3xl border border-white/8 bg-white/4 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-transform duration-700 hover:border-yellow-600/30"
                  >
                    <div className="w-full aspect-[3/4] bg-[linear-gradient(145deg,#151515,#080808)] border border-white/5 relative overflow-hidden mb-8 flex items-center justify-center">
                      <span className="text-white/20 tracking-[0.3em] text-xs font-light uppercase">Night Ritual</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-light text-white mb-4 font-serif">Velvet Hydration</h3>
                    <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase mb-5">Deeply Nourishing • Cooling • Restorative</p>
                    <p className="text-sm text-white/65 leading-6">A slow, indulgent overnight ritual that leaves skin supple, smooth, and comforted.</p>
                  </motion.article>
                </div>
              </motion.div>
            </div>

            {/* Section 2: The Legacy */}
            <div className="min-h-[100dvh] w-full flex items-center justify-center px-6 border-b border-white/5">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
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
                  A precise formulation of 21 rare herbs, goat&apos;s milk, and pure Kashmiri saffron,
                  slow-cooked to perfection over days to capture the essence of youth.
                </p>
              </motion.div>
            </div>

            {/* Section 3: Benefits */}
            <div className="w-full py-24 md:py-32 px-6 border-b border-white/5 bg-[#040404]">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, margin: "-100px" }}
                className="max-w-7xl mx-auto"
              >
                <div className="mb-14 text-center md:text-left">
                  <p className="text-yellow-500/80 tracking-[0.35em] text-xs uppercase mb-5 font-light">Why it works</p>
                  <h2 className="text-3xl md:text-5xl font-light text-white font-serif">Benefits that make the ritual feel essential</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {[
                    ["Radiance", "A luminous glow that feels refined, not flashy."],
                    ["Hydration", "Deep comfort and softness for dry, tired skin."],
                    ["Even Tone", "A balanced finish that enhances natural clarity."],
                    ["Anti-Aging", "Botanical support for a smoother, more youthful feel."],
                  ].map(([title, text]) => (
                    <article key={title} className="rounded-3xl border border-white/8 bg-white/4 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-1 hover:border-yellow-600/30">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-yellow-500/80">{title}</p>
                      <p className="mt-4 text-sm text-white/70 leading-6">{text}</p>
                    </article>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Section 4: Ingredients */}
            <div className="w-full py-24 md:py-32 px-6 border-b border-white/5 bg-[#020202]">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, margin: "-100px" }}
                className="max-w-7xl mx-auto"
              >
                <div className="mb-14 text-center md:text-left">
                  <p className="text-yellow-500/80 tracking-[0.35em] text-xs uppercase mb-5 font-light">Ingredients</p>
                  <h2 className="text-3xl md:text-5xl font-light text-white font-serif">A careful blend of rare botanicals</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {[
                    ["Kashmiri Saffron", "A luminous, golden note that gives the formula its signature glow."],
                    ["Lotus Extract", "Known for softness, calmness, and a silky finish."],
                    ["Sandalwood", "A grounding ingredient with a warm, velvety aromatic profile."],
                    ["Goat&apos;s Milk", "Traditionally used to nurture and support skin comfort."],
                  ].map(([title, text]) => (
                    <article key={title} className="rounded-3xl border border-white/8 bg-white/4 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-700 hover:-translate-y-1 hover:border-yellow-600/30">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-yellow-500/80">{title}</p>
                      <p className="mt-4 text-sm text-white/70 leading-6">{text}</p>
                    </article>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Section 5: Reviews + FAQ */}
            <div className="w-full py-24 md:py-32 px-6 border-b border-white/5 bg-[#030303]">
              <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="rounded-[30px] border border-white/8 bg-white/4 p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                >
                  <p className="text-yellow-500/80 tracking-[0.35em] text-xs uppercase mb-5 font-light">Reviews</p>
                  <h2 className="text-3xl md:text-5xl font-light text-white font-serif">What ritual lovers notice first</h2>
                  <div className="mt-8 space-y-6">
                    {[
                      ['“The glow feels luxurious, but also deeply calming. It feels like a ritual rather than a routine.”', '— Asha, Mumbai'],
                      ['“The bottle and the experience are beautiful, but the finish is what keeps me coming back.”', '— Naina, Bengaluru'],
                    ].map(([quote, name]) => (
                      <article key={quote} className="rounded-3xl border border-white/8 bg-black/40 p-6">
                        <p className="text-white/80 text-sm md:text-base leading-7">{quote}</p>
                        <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-yellow-500/80">{name}</p>
                      </article>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="rounded-[30px] border border-white/8 bg-white/4 p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                >
                  <p className="text-yellow-500/80 tracking-[0.35em] text-xs uppercase mb-5 font-light">Faq</p>
                  <h2 className="text-3xl md:text-5xl font-light text-white font-serif">Quick answers for first-time buyers</h2>
                  <div className="mt-8 space-y-4 text-sm text-white/75">
                    {[
                      ['How do I use it?', 'Apply a few drops to clean skin in the evening and massage gently until absorbed.'],
                      ['Is it suitable for all skin types?', 'It is designed for normal, dry, and combination skin and is best used as a nightly ritual.'],
                      ['How soon can I expect results?', 'Many users notice immediate softness, with a luminous finish that builds with consistent use.'],
                    ].map(([q, a]) => (
                      <article key={q} className="rounded-3xl border border-white/8 bg-black/40 p-5">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-yellow-500/80">{q}</p>
                        <p className="mt-3 text-sm text-white/75 leading-6">{a}</p>
                      </article>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Section 2: Contact & Footer */}
            <div className="w-full bg-[#030303] py-24 md:py-32 px-6">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20">
                {/* Contact Info */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
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
                  transition={{ duration: 0.8, delay: 0.2 }}
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
                    <button className="group relative overflow-hidden px-12 py-5 border border-yellow-600/50 bg-transparent text-[10px] tracking-[0.3em] text-yellow-500 transition-all duration-700 hover:bg-yellow-900/30 hover:border-yellow-400 hover:text-white hover:shadow-[0_0_30px_rgba(234,179,8,0.18)] w-max mt-4 mx-auto md:mx-0 cursor-pointer font-light">
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
                  &copy; 2026 All Rights Reserved.
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
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95"
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
