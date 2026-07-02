"use client";

import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import Lenis from "lenis";
import { ShoppingCart } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

export default function Home() {
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
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
  const goldVideoRef = useRef<HTMLVideoElement>(null);
  const splashVideoRef = useRef<HTMLVideoElement>(null);
  const heroBgVideoRef = useRef<HTMLVideoElement>(null);
  const floatingVideoRef = useRef<HTMLVideoElement>(null);
  const [heroBgDuration, setHeroBgDuration] = useState(0);
  const [floatingDuration, setFloatingDuration] = useState(0);
  const [floatingStage, setFloatingStage] = useState(0);
  const { scrollY, scrollYProgress } = useScroll();

  const backgroundParallax = useTransform(scrollY, [0, 900], [0, -30]);
  const heroLift = useTransform(scrollY, [0, 700], [0, -40]);
  const heroTitleOpacity = useTransform(scrollY, [0, 450], [1, 0.18]);
  const bottleFloat = useTransform(scrollY, [0, 900], [0, -18]);
  const sectionParallax = useTransform(scrollY, [0, 1200], [0, -24]);
  const floatingStageTimes = [0, 0.06, 0.1];

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
  const floatingStageText = [
    {
      // initial (no overlay)
      headline: "",
      description: "",
    },
    {
      // first scroll stop at 0.06s — show left & right complementary copy
      headline: "Saffron Heritage",
      description:
        "Rare Kashmiri saffron and botanical oils for luminous, velvety skin.\n\nCrafted Slowly\n\nSmall-batch formulation with quiet luxury and thoughtful texture.\n\nSecure Checkout\n\nA polished buy flow with concierge support and premium confidence.",
    },
    {
      // second scroll stop at 0.10s — acquisition stage
      headline: "Acquire the Elixir",
      description: "The elixir appears as part of the ritual — tap to buy and begin your ceremony.",
    },
  ][floatingStage];

  useEffect(() => {
    const goldVideo = goldVideoRef.current;
    const heroBgVideo = heroBgVideoRef.current;
    const floatingVideo = floatingVideoRef.current;

    if (goldVideo) goldVideo.load();
    if (heroBgVideo) heroBgVideo.load();
    if (floatingVideo) floatingVideo.load();
  }, []);

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

  const handleAcquireNow = useCallback((isAddToCart = false) => {
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
    const goldVideo = goldVideoRef.current;
    if (goldVideo && phase === 1) {
      goldVideo.currentTime = 0;
      goldVideo.play().catch((e) => console.log("Logo play error:", e));

      const handleLogoEnd = () => {
        setPhase(2);
        setShowContent(true);
      };

      goldVideo.addEventListener("ended", handleLogoEnd);
      return () => goldVideo.removeEventListener("ended", handleLogoEnd);
    }
  }, [phase]);

  useEffect(() => {
    const splashVideo = splashVideoRef.current;
    if (splashVideo && phase === 2) {
      if (goldVideoRef.current) goldVideoRef.current.pause();

      splashVideo.currentTime = 0;
      splashVideo.play().catch((e) => console.log("Splash play error:", e));

      const handleSplashEnd = () => {
        setPhase(3);
      };

      splashVideo.addEventListener("ended", handleSplashEnd);
      return () => splashVideo.removeEventListener("ended", handleSplashEnd);
    }
  }, [phase]);

  useEffect(() => {
    const floatingVideo = floatingVideoRef.current;
    if (!floatingVideo) return;

    const onLoadedMetadata = () => {
      setFloatingDuration(floatingVideo.duration || 0);
    };

    floatingVideo.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => floatingVideo.removeEventListener("loadedmetadata", onLoadedMetadata);
  }, []);

  useEffect(() => {
    const floatingVideo = floatingVideoRef.current;
    if (!floatingVideo) return;

    const handleScroll = () => {
      if (phase !== 3 || floatingDuration <= 0) return;

      const start = window.innerHeight * 0.5;
      const stepHeight = window.innerHeight * 0.8;
      const progress = Math.min(1, Math.max(0, (window.scrollY - start) / (stepHeight * 3)));
      const stage = Math.min(2, Math.max(0, Math.floor(progress * 3)));
      const targetTime = floatingStageTimes[stage] ?? floatingStageTimes[0];

      if (Math.abs(floatingVideo.currentTime - targetTime) > 0.001) {
        floatingVideo.currentTime = targetTime;
      }
      setFloatingStage(stage);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [phase, floatingDuration]);

  return (
    <>
      <main
        suppressHydrationWarning
        className="relative w-full bg-[#050505] text-white font-sans selection:bg-yellow-900 selection:text-yellow-100 cursor-default overflow-x-hidden"
      >
        {/* FIXED BACKGROUND VIDEOS (CONDITIONAL MOUNTING TO ELIMINATE LAG) */}
        <div className="fixed inset-0 z-0 h-full w-full overflow-hidden bg-black">
          <motion.div
            className="absolute inset-0 h-full w-full"
            style={{ y: backgroundParallax }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
          >
            {phase === 1 && (
              <video
                ref={goldVideoRef}
                autoPlay
                muted
                playsInline
                preload="auto"
                poster="/images/hero-poster.jpg"
                disablePictureInPicture
                style={{ backfaceVisibility: "hidden" }}
                className="absolute inset-0 h-full w-full object-cover scale-[1.03] transform-gpu will-change-transform will-change-opacity transition-opacity duration-[1200ms] ease-in-out opacity-100 z-10"
              >
                <source src="/videos/gold-particles.mp4" type="video/mp4" />
              </video>
            )}

            {phase === 2 && (
              <video
                ref={splashVideoRef}
                autoPlay
                muted
                playsInline
                preload="auto"
                poster="/images/hero-poster.jpg"
                disablePictureInPicture
                style={{ backfaceVisibility: "hidden" }}
                className="absolute inset-0 h-full w-full object-cover scale-[1.03] transform-gpu will-change-transform will-change-opacity transition-opacity duration-[1800ms] ease-in-out opacity-95 z-10"
              >
                <source src="/videos/hero-bg.mp4" type="video/mp4" />
              </video>
            )}

            {phase === 3 && (
              <video
                ref={floatingVideoRef}
                muted
                playsInline
                preload="auto"
                poster="/images/hero-poster.jpg"
                disablePictureInPicture
                style={{ backfaceVisibility: "hidden" }}
                className="absolute inset-0 h-full w-full object-cover scale-[1.03] transform-gpu will-change-transform will-change-opacity transition-opacity duration-[1800ms] ease-in-out opacity-95 z-10"
              >
                <source src="/videos/floating annimation.mp4" type="video/mp4" />
              </video>
            )}
          </motion.div>
          {/* Dark gradient overlay: vignette on mobile, left-fade on desktop to protect text */}
          <div className={`absolute inset-0 bg-gradient-to-b from-black/82 via-black/25 to-black/90 md:bg-gradient-to-r md:from-black/90 md:via-black/45 md:to-black/75 z-20 pointer-events-none transition-opacity duration-[3000ms] ${phase === 3 ? "opacity-100" : "opacity-0"}`} />
          <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_24%),linear-gradient(135deg,rgba(0,0,0,0.12),transparent_30%,rgba(0,0,0,0.45))]" />
        </div>

        <div className="fixed top-0 left-0 z-[60] h-[2px] w-full bg-white/5" aria-hidden="true">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-500/90 via-amber-300/80 to-yellow-100"
            style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
            transition={{ type: "spring", stiffness: 70, damping: 24 }}
          />
        </div>

        {/* FIXED HEADER */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          className="fixed top-0 left-0 w-full p-6 md:p-8 flex items-center z-50 pointer-events-none"
        >
          <div className="absolute left-1/2 -translate-x-1/2 text-sm md:text-xl tracking-[0.45em] text-yellow-500/90 uppercase font-semibold drop-shadow-[0_0_18px_rgba(255,215,0,0.18)] pointer-events-none">
            Vanaamruta
          </div>
        </motion.header>

        {/* Right-side product / purchase panel (avoids covering the bottle) */}
        {phase >= 2 && (
          <div className="fixed right-6 top-1/3 z-50 pointer-events-auto max-w-[340px]">
            <div className="rounded-2xl bg-black/60 border border-white/6 p-6 backdrop-blur-2xl shadow-xl text-right">
              <div className="text-xs text-white/70 tracking-wider uppercase">Kumkumadi Taila</div>
              <div className="mt-2 text-2xl font-semibold">{productData ? `${productData.currency}${productData.price}` : isFetchingProduct ? "Loading…" : "—"}</div>
              <div className="mt-3 text-sm text-white/70">A ritual oil for luminous skin. Avoids covering the hero bottle during animation.</div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleAcquireNow(false)}
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-yellow-500/95 px-4 py-2 text-black font-semibold shadow-lg"
                >
                  Buy
                </button>
              </div>
            </div>
          </div>
        )}

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
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
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
          <AnimatePresence mode="wait">
            {phase === 2 && showContent && (
              <motion.div
                key="phase2-hero"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 md:relative md:inset-auto w-full h-full md:h-auto max-w-[1400px] mx-auto px-6 md:px-16 flex flex-col justify-center pt-[14vh] pb-[12vh] md:py-0 md:justify-center pointer-events-auto"
              >
                <div className="relative w-full h-full md:h-auto max-w-6xl mx-auto flex min-h-[82vh] flex-col items-center justify-center text-center">
                  <div className="relative z-10 flex w-full flex-col items-center justify-center gap-6 px-4 md:px-0">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="max-w-3xl"
                    >
                      <p className="text-[10px] uppercase tracking-[0.45em] text-yellow-400/70 mb-4 font-light">A cinematic ritual begins</p>
                      <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-tight">Kumkumadi Taila</h1>
                      <p className="mt-6 text-white/70 text-sm md:text-base leading-8 tracking-[0.04em] max-w-2xl mx-auto">The bottle emerges from shadow, wrapped in saffron light and oil-rich motion. No clutter, no noise—only the feeling of a luxury reveal.</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
                      className="rounded-full border border-white/10 bg-black/35 px-5 py-3 text-[10px] uppercase tracking-[0.35em] text-white/70 backdrop-blur-xl"
                    >
                      Luxury splash • Golden particles • Soft volumetric glow
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 3 && showContent && (
              <motion.div
                key="hero-content"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 md:relative md:inset-auto w-full h-full md:h-auto max-w-[1400px] mx-auto px-6 md:px-16 flex flex-col justify-between pt-[14vh] pb-[12vh] md:py-0 md:justify-center pointer-events-auto"
              >
                <motion.div
                  className="relative w-full h-full md:h-auto max-w-6xl mx-auto flex min-h-[82vh] items-center justify-center text-center"
                  style={{ y: heroLift, opacity: heroTitleOpacity }}
                >
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -top-20 z-0 h-[420px] hidden md:block"
                    style={{ y: backgroundParallax }}
                  >
                    <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-yellow-400/12 blur-3xl" />
                    <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-amber-200/8 blur-3xl" />
                    <div className="absolute left-1/2 top-12 h-[180px] w-[60%] -translate-x-1/2 rounded-full border border-white/8 bg-[linear-gradient(120deg,rgba(255,255,255,0.04),transparent_50%,rgba(255,255,255,0.03))] shadow-[0_0_80px_rgba(255,215,0,0.08)]" />
                  </motion.div>

                  <div className="relative z-10 grid w-full gap-8 xl:grid-cols-[0.62fr_0.38fr] xl:items-center xl:text-left">
                    <div className="relative flex flex-col items-center justify-center px-4 md:px-0 text-center xl:text-left">
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.4, ease: "easeOut" }}
                        className="mb-8 max-w-2xl"
                      >
                        <p className="text-[10px] uppercase tracking-[0.45em] text-yellow-400/70 mb-4 font-light">Scroll-led luxury reveal</p>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-tight">Kumkumadi Taila</h1>
                        <p className="mt-6 text-white/70 text-sm md:text-base leading-8 tracking-[0.04em]">The bottle rotates, lifts and reveals itself through the scroll. Each stage creates breathing room for the ritual, the ingredients, and the purchase decision.</p>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1.3, delay: 0.2, ease: "easeOut" }}
                      className="rounded-[32px] border border-white/10 bg-black/55 p-8 shadow-[0_32px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                    >
                      <p className="text-[10px] uppercase tracking-[0.35em] text-yellow-300/80 mb-3">Scroll stage {floatingStage + 1}</p>
                      <h2 className="text-2xl md:text-3xl font-serif text-white mb-5">{floatingStageText.headline}</h2>
                      <p className="text-sm text-white/70 leading-7">{floatingStageText.description}</p>

                      <div className="mt-6 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.3em] text-white/60">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">{productData?.available ? "In stock" : "Private collection"}</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">{productData ? `${productData.currency}${productData.price}` : "Premium pricing"}</span>
                      </div>

                      {floatingStage === 2 && (
                        <div className="mt-8 grid gap-3 sm:flex sm:justify-start">
                          <button
                            type="button"
                            onClick={() => handleAcquireNow(false)}
                            className="w-full rounded-full border border-yellow-500/80 bg-yellow-500 px-6 py-4 text-[11px] uppercase tracking-[0.35em] text-black transition hover:bg-yellow-400 sm:w-auto"
                          >
                            Acquire Now
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAcquireNow(true)}
                            className="w-full rounded-full border border-white/10 bg-white/10 px-6 py-4 text-[11px] uppercase tracking-[0.35em] text-white transition hover:bg-white/15 sm:w-auto"
                          >
                            Add to Cart
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating video stage overlays (left + right) — appear only during phase 3 */}
          {phase === 3 && (
            <>
              {/* Left ritual / acquisition panel */}
              <div className="fixed left-6 bottom-1/4 z-50 pointer-events-auto max-w-[420px]">
                {floatingStage === 1 && (
                  <div className="rounded-2xl bg-black/60 border border-white/6 p-6 backdrop-blur-2xl shadow-xl text-left">
                    <h3 className="text-xl font-semibold">Saffron Heritage</h3>
                    <p className="mt-3 text-sm text-white/70 whitespace-pre-line">Rare Kashmiri saffron and botanical oils for luminous, velvety skin.\n\nCrafted Slowly\n\nSmall-batch formulation with quiet luxury and thoughtful texture.\n\nSecure Checkout\n\nA polished buy flow with concierge support and premium confidence.</p>
                  </div>
                )}

                {floatingStage === 2 && (
                  <div className="rounded-2xl bg-black/60 border border-white/6 p-6 backdrop-blur-2xl shadow-xl text-left">
                    <h3 className="text-2xl font-semibold">Acquire the Elixir</h3>
                    <p className="mt-3 text-sm text-white/70">The elixir appears as part of the ritual — the left panel becomes the purchase anchor.</p>
                    <div className="mt-4">
                      <button
                        onClick={() => handleAcquireNow(false)}
                        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-yellow-500/95 px-4 py-2 text-black font-semibold shadow-lg"
                      >
                        Buy the Elixir
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right stats panel for the first stage */}
              <div className="fixed right-6 top-1/3 z-50 pointer-events-auto max-w-[220px] text-right">
                {floatingStage === 1 && (
                  <div className="rounded-2xl bg-black/60 border border-white/6 p-4 backdrop-blur-2xl shadow-xl">
                    <div className="text-3xl font-bold">21</div>
                    <div className="text-xs text-white/70">Ayurvedic ingredients</div>
                    <div className="mt-4 text-3xl font-bold">100%</div>
                    <div className="text-xs text-white/70">Natural formulation</div>
                    <div className="mt-4 text-3xl font-bold">500+</div>
                    <div className="text-xs text-white/70">Years of tradition</div>
                  </div>
                )}
              </div>
            </>
          )}
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
              <span className="text-[9px] tracking-[0.4em] text-white/50 uppercase">Scroll Down</span>
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
            {/* Section 0: Bottle Reveal / Story Scene */}
            <section className="min-h-[100dvh] w-full px-6 py-24 md:py-32 border-b border-white/5 bg-[linear-gradient(180deg,#070707_0%,#020202_40%,#050505_100%)]">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, amount: 0.25 }}
                className="mx-auto flex min-h-[80dvh] max-w-7xl flex-col justify-center gap-10"
                style={{ y: sectionParallax }}
              >
                <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="space-y-8">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-yellow-500/80">Stage One</p>
                    <h2 className="max-w-xl text-4xl md:text-6xl font-light text-white font-serif leading-tight">A bottle in the center, the ritual unfolding around it.</h2>
                    <p className="max-w-lg text-sm md:text-base leading-7 text-white/70 tracking-[0.04em]">Slowly rising through cinematic light, the Kumkumadi Taila bottle is the quiet star of a ritual presentation designed to feel calm, premium, and unforgettable.</p>
                    <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.35em] text-white/65">
                      <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">Golden textures</span>
                      <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">Premium pacing</span>
                      <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">Quiet luxury</span>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                    className="relative mx-auto flex aspect-[4/5] w-full max-w-md items-center justify-center rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_25%),linear-gradient(145deg,#121212,#060606)] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.55)] ring-1 ring-white/8"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0], rotate: [1.2, -1.4, 1.2] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0"
                    />
                    <img
                      src="/images/botle.png"
                      alt="Luxury Kumkumadi Taila bottle"
                      className="relative z-10 h-full w-full object-contain drop-shadow-[0_22px_40px_rgba(255,215,0,0.22)]"
                    />
                    <div className="absolute inset-x-8 bottom-6 rounded-full bg-yellow-500/8 px-4 py-2 text-center text-[10px] uppercase tracking-[0.35em] text-yellow-100/90 backdrop-blur-xl">Radiance Reimagined</div>
                  </motion.div>
                </div>
              </motion.div>
            </section>

            {/* Section 1: Luxury Ritual / Brand Statement */}
            <div id="collection" className="min-h-[100dvh] w-full py-24 md:py-32 px-6 border-b border-white/5 bg-[#030303]">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, margin: "-100px" }}
                className="max-w-7xl mx-auto"
                style={{ y: sectionParallax }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8 }}
                  className="text-center mb-20 md:mb-32"
                  style={{ y: sectionParallax }}
                >
                  <p className="text-yellow-500/80 tracking-[0.4em] text-xs uppercase mb-6 font-light">The Ritual</p>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-10 font-serif">
                    A calm procession of texture, scent, and slow gold light.
                  </h2>
                  <div className="w-12 h-[1px] bg-yellow-600/50 mx-auto" />
                  <p className="mt-8 max-w-3xl mx-auto text-white/65 text-sm md:text-base leading-relaxed tracking-[0.08em] uppercase">
                    This is a premium product presentation that puts the bottle center stage and lets the story rise naturally with each scroll.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {[
                    ["Saffron Heritage", "Rare Kashmiri saffron and botanical oils for luminous, velvety skin."],
                    ["Crafted Slowly", "Small-batch formulation with quiet luxury and thoughtful texture."],
                    ["Secure Checkout", "A polished buy flow with concierge support and premium confidence."],
                  ].map(([title, text], index) => (
                    <motion.article
                      key={title}
                      whileInView={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 18 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{ duration: 0.7, delay: index * 0.08 }}
                      className="rounded-[30px] border border-white/8 bg-white/4 p-8 text-left shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                    >
                      <p className="text-[10px] tracking-[0.35em] text-yellow-500/90 uppercase mb-4">{title}</p>
                      <p className="text-sm text-white/70 leading-7">{text}</p>
                    </motion.article>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Section 2: Scroll Story / Brand Statement */}
            <div className="min-h-[100dvh] w-full flex items-center justify-center px-6 border-b border-white/5">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center max-w-4xl mx-auto"
                style={{ y: sectionParallax }}
              >
                <p className="text-yellow-500/80 tracking-[0.4em] text-xs uppercase mb-6 font-light">Crafted for the modern ritual</p>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-10 font-serif">
                  Crafted from 21 Ayurvedic ingredients.
                </h2>
                <div className="w-12 h-[1px] bg-yellow-600/50 mx-auto mb-10" />
                <p className="text-white/60 tracking-[0.1em] text-base md:text-xl font-light leading-loose md:leading-loose">
                  Every drop is shaped by centuries of royal skincare wisdom, rare botanicals, and patient craftsmanship.
                  The result is a luminous ritual that feels as indulgent as it is restorative.
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

            {/* Section 4: Ingredients Story */}
            <div className="w-full py-24 md:py-32 px-6 border-b border-white/5 bg-[#020202]">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, margin: "-100px" }}
                className="max-w-7xl mx-auto"
              >
                <div className="mb-14 text-center md:text-left">
                  <p className="text-yellow-500/80 tracking-[0.35em] text-xs uppercase mb-5 font-light">Ingredients Story</p>
                  <h2 className="text-3xl md:text-5xl font-light text-white font-serif">Every ingredient is chosen for glow, softness, and ritual.</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    ["Kashmiri Saffron", "Golden brilliance and luminous warmth in every drop.", "from-[#2b2215] via-[#1b140d] to-black"],
                    ["Blue Lotus", "A calm, silky finish that feels deeply restorative.", "from-[#18262d] via-[#091016] to-black"],
                    ["Sandalwood", "A soft, grounding note that completes the royal finish.", "from-[#261d12] via-[#120f09] to-black"],
                  ].map(([title, text, gradient], index) => (
                    <motion.article
                      key={title}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ duration: 0.8, delay: index * 0.08 }}
                      className="group rounded-[30px] border border-white/8 bg-white/4 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl overflow-hidden"
                    >
                      <div className={`rounded-[24px] border border-white/8 bg-gradient-to-br ${gradient} p-6 min-h-[260px] flex flex-col justify-between transition-transform duration-700 group-hover:scale-[1.02]`}>
                        <p className="text-[10px] uppercase tracking-[0.35em] text-yellow-500/80">Ingredient {index + 1}</p>
                        <div>
                          <p className="text-2xl md:text-3xl font-serif text-white">{title}</p>
                          <p className="mt-4 max-w-xs text-sm text-white/70 leading-6">{text}</p>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Section 5: Luxury Statistics */}
            <div className="w-full py-24 md:py-32 px-6 border-b border-white/5 bg-[#040404]">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, amount: 0.25 }}
                className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {[
                  ["21", "Ayurvedic ingredients"],
                  ["100%", "Natural formulation"],
                  ["500+", "Years of tradition"],
                ].map(([value, label], index) => (
                  <article key={label} className="rounded-[30px] border border-white/8 bg-white/4 p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl" style={{ transform: `translateY(${index * 4}px)` }}>
                    <p className="text-5xl md:text-6xl font-semibold tracking-[0.12em] text-yellow-100 font-serif">{value}</p>
                    <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-white/60">{label}</p>
                  </article>
                ))}
              </motion.div>
            </div>

            {/* Section 6: Reviews */}
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
                  <h2 className="text-3xl md:text-5xl font-light text-white font-serif">The most luxurious ritual many first-time users keep coming back to.</h2>
                  <div className="mt-8 rounded-[30px] border border-white/8 bg-black/40 p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-yellow-500/80">★★★★★</p>
                    <p className="mt-5 text-white/85 text-xl md:text-2xl leading-9 font-light">“The glow feels rare, calm, and unmistakably luxurious. It looks beautiful on the shelf and feels even better on the skin.”</p>
                    <p className="mt-6 text-[10px] uppercase tracking-[0.35em] text-white/55">— Priya S., Mumbai</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="rounded-[30px] border border-white/8 bg-white/4 p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                >
                  <p className="text-yellow-500/80 tracking-[0.35em] text-xs uppercase mb-5 font-light">Craftsmanship</p>
                  <h2 className="text-3xl md:text-5xl font-light text-white font-serif">A quiet luxury experience from origin to order.</h2>
                  <div className="mt-8 space-y-6 text-sm text-white/75">
                    <p>Formulated with 21 botanicals, refined over time, and presented with the calm of a premium ritual.</p>
                    <p>Every detail is designed to feel elevated without unnecessary noise — from texture to checkout.</p>
                    <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-yellow-500/80 mb-4">Begin your order</p>
                      <button
                        type="button"
                        onClick={() => handleAcquireNow(false)}
                        className="w-full rounded-full border border-yellow-600/50 bg-yellow-500/10 px-6 py-4 text-[10px] uppercase tracking-[0.35em] text-yellow-100 transition-all duration-500 hover:bg-yellow-900/30 hover:border-yellow-400 hover:text-white"
                      >
                        {isCheckingOut ? "PREPARING CHECKOUT" : "ACQUIRE THE ELIXIR"}
                      </button>
                      <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-white/50">Secure luxury checkout with concierge guidance available.</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Section 7: Founder Story */}
            <div className="w-full py-24 md:py-32 px-6 border-b border-white/5 bg-[#020202]">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, amount: 0.25 }}
                className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center"
              >
                <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(145deg,#151515,#080808)] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
                  <p className="text-yellow-500/80 tracking-[0.35em] text-xs uppercase mb-5 font-light">Founder Story</p>
                  <h2 className="text-3xl md:text-5xl font-light text-white font-serif">The origin of Vannamruta</h2>
                  <p className="mt-6 text-white/65 text-sm md:text-base leading-7 tracking-[0.04em]">Vannamruta was born from the idea that radiance should feel ceremonial, not rushed. Every formula is shaped with old-world respect for botanicals and a modern eye for the quiet luxury of the ritual itself.</p>
                </div>
                <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-yellow-500/80">Why it feels premium</p>
                  <ul className="mt-6 space-y-4 text-sm text-white/70 leading-6">
                    <li>• Slow, minimal motion and elegant pacing.</li>
                    <li>• Product-led storytelling with visible bottle focus.</li>
                    <li>• Calm typography and premium spacing throughout.</li>
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Section 8: Contact & Footer */}
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
                    Begin Your Ritual
                  </h3>
                  <div className="w-12 h-[1px] bg-yellow-600/50 mb-10 mx-auto md:mx-0" />
                  <p className="text-white/50 tracking-wider font-light leading-relaxed mb-8 max-w-sm">
                    Speak with our concierge for tailored ritual guidance, gifting recommendations, and the calm confidence of a luxury beauty experience.
                  </p>
                  <div className="space-y-4 text-xs tracking-[0.2em] text-yellow-100/70 font-light uppercase">
                    <p className="hover:text-yellow-500 transition-colors cursor-pointer">concierge@vannamruta.com</p>
                    <p>+91 800 123 4567</p>
                    <p>Mumbai, India</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="rounded-[30px] border border-white/8 bg-white/4 p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                >
                  <p className="text-yellow-500/80 tracking-[0.35em] text-xs uppercase mb-5 font-light">Luxury Checkout</p>
                  <h3 className="text-3xl md:text-5xl font-light text-white font-serif mb-8">Begin your private order</h3>
                  <p className="text-white/65 leading-7 mb-10">Secure your Kumkumadi Taila in a calm, elevated flow designed for premium ritual buyers. This is checkout with quiet confidence and concierge care.</p>
                  <button
                    type="button"
                    onClick={() => handleAcquireNow(false)}
                    className="w-full rounded-full border border-yellow-600/50 bg-yellow-500/10 px-8 py-5 text-[10px] uppercase tracking-[0.35em] text-yellow-100 transition-all duration-500 hover:bg-yellow-900/30 hover:border-yellow-400 hover:text-white"
                  >
                    {isCheckingOut ? "PREPARING CHECKOUT" : "ACQUIRE THE ELIXIR"}
                  </button>
                  <p className="mt-6 text-[10px] uppercase tracking-[0.35em] text-white/50">A premium checkout curated for an intimate launch experience.</p>
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
