import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import { LoadingScreen } from './components/LoadingScreen';

// Create a React-friendly reference to the Web Component
const SplineViewer = 'spline-viewer' as any;

interface LandingPageProps {
  onStartJourney: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartJourney }) => {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 250]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>
      <div ref={containerRef} className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased selection:bg-primary selection:text-background-dark overflow-x-hidden">
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl animate-pulse">language</span>
            <span className="text-xl font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Aetheris</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium text-slate-400 hover:text-primary transition-colors relative group" href="#">
              Intelligence
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a className="text-sm font-medium text-slate-400 hover:text-primary transition-colors relative group" href="#">
              Locations
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a className="text-sm font-medium text-slate-400 hover:text-primary transition-colors relative group" href="#">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>
          <div className="flex items-center gap-6">
            <a className="hidden md:block text-sm font-bold text-white hover:text-primary transition-colors" href="#">Log In</a>
            <button className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/50 hover:border-primary hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] px-6 py-2 rounded-full text-sm font-bold transition-all duration-300">
              Get Access
            </button>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden perspective-1000">
        <div className="absolute inset-0 z-0 bg-background-dark">
          <SplineViewer loading-anim-type="spinner-small-dark" url="https://prod.spline.design/jdz9ONn7NhYUhoMy/scene.splinecode"></SplineViewer>
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-background-dark/80 via-transparent to-background-dark/80 z-10 pointer-events-none"></div>
          <div className="absolute inset-0 bg-background-dark/20 z-10 pointer-events-none"></div>
        </div>

        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-30 container mx-auto px-6 text-center flex flex-col items-center gap-8 pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-black/40 backdrop-blur-xl mb-4 animate-fade-up neon-badge pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#00f0ff]"></span>
            <span className="text-xs font-medium tracking-widest text-primary uppercase shadow-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">System Online v2.4</span>
          </div>

          <div className="relative p-6 md:p-12 rounded-3xl glass-text-overlay animate-fade-up delay-100">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white leading-[0.9]">
              DECIDE<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-secondary bg-[length:200%_auto] animate-[pulse_5s_ease-in-out_infinite] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">WHERE NEXT</span>
            </h1>
          </div>

          <p className="max-w-xl text-lg md:text-xl text-slate-200 font-serif italic mt-6 animate-fade-up delay-200 drop-shadow-lg bg-black/10 backdrop-blur-md p-4 rounded-xl border border-white/5 pointer-events-auto">
            Global relocation intelligence for the modern era. Navigate complexity with precision.
          </p>

          <div className="mt-8 flex flex-col md:flex-row gap-6 animate-fade-up delay-300 pointer-events-auto">
            <button 
              onClick={onStartJourney}
              className="group relative px-10 py-5 bg-black/20 border border-primary/40 text-white font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:border-primary hover:scale-105 backdrop-blur-xl"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <span className="relative z-10 flex items-center gap-3 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
                Start Your Journey
                <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1 text-primary drop-shadow-[0_0_5px_rgba(0,240,255,1)]">arrow_forward</span>
              </span>
            </button>
          </div>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-80 z-30 pointer-events-none">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]">Scroll to Explore</span>
          <span className="material-symbols-outlined text-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]">keyboard_arrow_down</span>
        </div>
      </section>

      <section className="relative py-32 overflow-hidden bg-background-dark">
        <div className="absolute top-0 right-0 w-2/3 h-full opacity-20 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-l from-primary/10 to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-8 scroll-reveal">
              <span className="text-primary text-sm font-mono tracking-widest uppercase border-l-2 border-primary pl-4 shadow-[0_0_10px_rgba(0,240,255,0.2)]">01. Environmental Stability</span>
              <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-none">
                MULTI-FACTOR<br />
                <span className="font-serif font-normal italic text-slate-400 bg-gradient-to-r from-slate-200 to-slate-500 bg-clip-text text-transparent">Decision Engine</span>
              </h2>
              <p className="text-xl text-slate-400 font-light max-w-md leading-relaxed">
                Navigate the complexities of global climate. Our engine processes terabytes of atmospheric data to predict stability, air quality, and seasonal shifts before you arrive.
              </p>
              <div className="flex flex-col gap-4 mt-4">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
                  className="flex items-center gap-4 text-slate-300 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                >
                  <span className="material-symbols-outlined text-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]">eco</span>
                  <span className="font-mono text-sm">AQI Forecasting Model</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex items-center gap-4 text-slate-300 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                >
                  <span className="material-symbols-outlined text-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]">water_drop</span>
                  <span className="font-mono text-sm">Water Security Index</span>
                </motion.div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative h-[600px] w-full rounded-2xl overflow-hidden group perspective-1000 delay-200"
            >
              <div className="absolute inset-0 bg-background-dark">
                <img alt="Volumetric foggy mountain landscape" className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:blur-sm opacity-80 mix-blend-luminosity hover:mix-blend-normal" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCz7QOhT91lBoQdPBXxhA32-5k8Di1tEUntxV3n_yf1lu_3xcARqavdFaHKLm7GezVm_BwgLIk7vLDGAin5rwpY4VN6LnqWwdZ-1Pm3t-Y847excQV1T1qpd8U83zs4YZPKtW1rqSlgUYtDO6h0IC-Szi9nlKDHUTKOp958lI48AZSHyZ4P8WoVUH_Rpqzdu57RaQI70FCAlbnLctaU-EqoybciGGEzDvET8Y5rqsQBeL14VH4JCoGRJdrYybwb1RGZ9TwRoNyjNOE" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-primary/5 to-transparent mix-blend-overlay"></div>
              </div>
              <div className="absolute bottom-12 left-8 right-8 p-6 glass-card rounded-xl transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(0,240,255,0.15)] group-hover:scale-105 group-hover:bg-black/60">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs text-primary uppercase tracking-wider mb-1">Location Analysis</p>
                    <h4 className="text-xl text-white font-bold">Nordic Highlands</h4>
                  </div>
                  <span className="text-primary font-mono text-2xl font-bold shadow-cyan-500/50 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">98.2%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-accent-blue h-1 rounded-full w-[98%] shadow-[0_0_15px_rgba(0,240,255,0.8)] animate-[pulse_2s_infinite]"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-32 bg-surface-dark border-t border-white/5">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, ease: "easeOut" }}
              className="relative h-[600px] w-full rounded-2xl overflow-hidden group order-2 lg:order-1 perspective-1000"
            >
              <div className="absolute inset-0 bg-background-dark">
                <img alt="Futuristic cityscape 3D render" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 hue-rotate-15 contrast-125" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALp8OndqDguD7Nhr68GnwkvySLkquWm9oNCIMXPGu-j0wmOS5QcfigfXZ40zs2y219_MnnQWDIVx7mHKlZCnWDGqKpqNicMZf9M4GDOCLX2Qc103AIdbghM0JZBqtWAvxGP2rjFluOVdkp2fgNLgRgZfMvfTloG9y6jiNvEGlmsDbS3mdz5sHiffmoFaRHNbPVtHG2LYwynStLqLY8OFy2QBH6RxuM_9M_TVIsKjEA_N1CG-h8PIL0xZYhcjkRMA-dbBeJOWfKYWo" />
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-primary/10 mix-blend-color-dodge"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-dark"></div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-primary/30 rounded-full animate-[spin_10s_linear_infinite] group-hover:border-primary/60 transition-colors"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-dashed border-secondary/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-xs text-primary font-mono animate-pulse">Scanning...</span>
              </div>
            </motion.div>
            
            <div className="flex flex-col gap-8 order-1 lg:order-2 scroll-reveal delay-200">
              <span className="text-primary text-sm font-mono tracking-widest uppercase border-l-2 border-primary pl-4 shadow-[0_0_10px_rgba(0,240,255,0.2)]">02. Infrastructure Grade</span>
              <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-none">
                REAL-TIME<br />
                <span className="font-serif font-normal italic text-slate-400 bg-gradient-to-r from-slate-200 to-slate-500 bg-clip-text text-transparent">Intelligence</span>
              </h2>
              <p className="text-xl text-slate-400 font-light max-w-md leading-relaxed">
                Beyond the tourist maps. Analyze internet speeds, healthcare accessibility, and transit efficiency with military-grade precision.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-6 border border-white/10 rounded-lg bg-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-default group">
                  <span className="material-symbols-outlined text-primary mb-3 group-hover:scale-110 transition-transform">wifi</span>
                  <h3 className="text-white font-bold text-lg group-hover:text-primary transition-colors">Connectivity</h3>
                  <p className="text-xs text-slate-500 mt-1">Fiber &amp; 5G Mapping</p>
                </div>
                <div className="p-6 border border-white/10 rounded-lg bg-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-default group">
                  <span className="material-symbols-outlined text-primary mb-3 group-hover:scale-110 transition-transform">medical_services</span>
                  <h3 className="text-white font-bold text-lg group-hover:text-primary transition-colors">Healthcare</h3>
                  <p className="text-xs text-slate-500 mt-1">Facility Density</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-background-dark relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] animate-pulse-glow delay-1000"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="mb-20 text-center scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">The Aetheris Advantage</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, delay: 0.1 }}
              className="group relative h-[450px] rounded-2xl overflow-hidden neon-card border border-white/5 bg-glass-neon transition-all duration-500"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-500 mix-blend-overlay scale-110 group-hover:scale-100 transition-transform"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')" }}
              ></div>
              <div className="relative h-full p-8 flex flex-col justify-end z-10">
                <div className="mb-auto opacity-100 transform translate-y-0 transition-all duration-500 bg-white/5 p-4 rounded-full w-fit backdrop-blur-sm border border-white/10 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  <span className="material-symbols-outlined text-primary text-3xl">monitoring</span>
                </div>
                <div className="transform group-hover:-translate-y-2 transition-transform duration-300">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">Predictive Analytics</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 group-hover:text-slate-200 transition-colors">
                    Forecast cost of living trends and currency fluctuations 12 months in advance with AI-driven models.
                  </p>
                </div>
                <div className="w-full bg-slate-700 h-[1px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, delay: 0.3 }}
              className="group relative h-[450px] rounded-2xl overflow-hidden neon-card border border-white/5 bg-glass-neon transition-all duration-500"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-500 mix-blend-overlay scale-110 group-hover:scale-100 transition-transform"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop')" }}
              ></div>
              <div className="relative h-full p-8 flex flex-col justify-end z-10">
                <div className="mb-auto opacity-100 transform translate-y-0 transition-all duration-500 bg-white/5 p-4 rounded-full w-fit backdrop-blur-sm border border-white/10 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  <span className="material-symbols-outlined text-primary text-3xl">shield</span>
                </div>
                <div className="transform group-hover:-translate-y-2 transition-transform duration-300">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">Safety Index</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 group-hover:text-slate-200 transition-colors">
                    Hyper-local crime statistics and geopolitical stability scores updated hourly via satellite telemetry.
                  </p>
                </div>
                <div className="w-full bg-slate-700 h-[1px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, delay: 0.5 }}
              className="group relative h-[450px] rounded-2xl overflow-hidden neon-card border border-white/5 bg-glass-neon transition-all duration-500"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-500 mix-blend-overlay scale-110 group-hover:scale-100 transition-transform"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop')" }}
              ></div>
              <div className="relative h-full p-8 flex flex-col justify-end z-10">
                <div className="mb-auto opacity-100 transform translate-y-0 transition-all duration-500 bg-white/5 p-4 rounded-full w-fit backdrop-blur-sm border border-white/10 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  <span className="material-symbols-outlined text-primary text-3xl">hub</span>
                </div>
                <div className="transform group-hover:-translate-y-2 transition-transform duration-300">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">Digital Nomad Visa</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 group-hover:text-slate-200 transition-colors">
                    Automated eligibility checking and smart application tracking for 50+ countries worldwide.
                  </p>
                </div>
                <div className="w-full bg-slate-700 h-[1px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-40 flex items-center justify-center bg-background-dark overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary to-secondary opacity-10 rounded-full blur-[100px] animate-pulse-glow"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>
        <div className="relative z-10 text-center px-6 scroll-reveal">
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">Ready to Depart?</h2>
          <button 
            onClick={onStartJourney}
            className="group relative inline-flex items-center justify-center gap-4 bg-transparent border border-primary text-primary hover:text-white text-xl font-bold py-6 px-12 rounded-lg transition-all duration-300 overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_40px_rgba(0,240,255,0.6)]"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10 tracking-widest uppercase flex items-center gap-3">
              Try The Engine
              <span className="material-symbols-outlined text-2xl transition-transform group-hover:translate-x-2">arrow_forward</span>
            </span>
          </button>
          <p className="mt-8 text-slate-500 text-sm uppercase tracking-widest animate-pulse">
            Access Phase I Dashboard <span className="text-primary">•</span> Live Data
          </p>
        </div>
      </section>

      <footer className="bg-[#0b1016] border-t border-white/5 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">language</span>
              <span className="text-white font-bold text-lg tracking-widest">AETHERIS</span>
            </div>
            <div className="flex gap-8">
              <a className="text-slate-400 hover:text-primary text-sm transition-colors hover:underline decoration-primary decoration-1 underline-offset-4" href="#">Privacy Policy</a>
              <a className="text-slate-400 hover:text-primary text-sm transition-colors hover:underline decoration-primary decoration-1 underline-offset-4" href="#">Terms of Service</a>
              <a className="text-slate-400 hover:text-primary text-sm transition-colors hover:underline decoration-primary decoration-1 underline-offset-4" href="#">Contact</a>
            </div>
            <div className="text-slate-500 text-sm">
              © 2023 Aetheris Intelligence.
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};
