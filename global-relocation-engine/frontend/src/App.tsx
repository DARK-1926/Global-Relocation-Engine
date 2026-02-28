import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CountrySelector } from './components/CountrySelector'; 
import { PreferencesForm } from './components/PreferencesForm';
import type { RiskLevel, DurationLevel } from './components/PreferencesForm';
import { Search, Loader2, ArrowLeft } from 'lucide-react';
import { analyzeCountries } from './services/api';
import type { AnalysisResponse, AnalysisRequest } from './types';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LandingPage } from './LandingPage';

function App() {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<RiskLevel>('Moderate');
  const [duration, setDuration] = useState<DurationLevel>('Short-term');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (countries.length < 3) {
      setError('Please select at least 3 countries to compare.');
      return;
    }
    setError(null);
    setLoading(true);
    setResults(null);

    const req: AnalysisRequest = {
      countries,
      riskTolerance,
      duration
    };

    try {
      const data = await analyzeCountries(req);
      setResults(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'An unexpected error occurred connecting to the Engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage onStartJourney={() => navigate('/dashboard')} />} />
      <Route path="/dashboard" element={
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="min-h-screen bg-slate-950 relative overflow-x-hidden selection:bg-blue-500/30">
          <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none" />

      <main className="container mx-auto px-4 py-16 flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative z-10"
        >
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            Decision Intelligence
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 mb-6 tracking-tight drop-shadow-sm">
            Global Relocation Engine
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed font-medium">
            Multi-factor comparative analysis for intelligent relocation and travel destination ranking.
          </p>
        </motion.div>

        {!results && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md flex flex-col items-center z-10 relative"
          >
            <CountrySelector selected={countries} onChange={setCountries} />
            <PreferencesForm 
              riskTolerance={riskTolerance} setRiskTolerance={setRiskTolerance}
              duration={duration} setDuration={setDuration}
            />

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="w-full mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm font-medium text-center shadow-[0_0_15px_rgba(239,68,68,0.1)]"
              >
                {error}
              </motion.div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || countries.length < 3}
              className="mt-8 w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:ring-4 focus:ring-blue-500/30 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg disabled:hover:scale-100 hover:scale-[1.02] transform"
            >
              {loading ? (
                <><Loader2 className="animate-spin" /> Computing Intelligence...</>
              ) : (
                <><Search size={20} /> Analyze Destinations</>
              )}
            </button>
          </motion.div>
        )}

        {loading && results === null && (
          <div className="mt-24 flex flex-col items-center z-10">
            <div className="relative w-28 h-28 mb-8 shadow-[0_0_30px_rgba(59,130,246,0.2)] rounded-full">
              <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-[spin_1s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full border-r-2 border-indigo-400 animate-[spin_1.5s_linear_infinite_reverse]" />
              <div className="absolute inset-4 rounded-full border-b-2 border-sky-300 animate-[spin_2s_linear_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <Search className="text-blue-400 animate-pulse" size={28} />
              </div>
            </div>
            <p className="text-blue-300 font-semibold tracking-wide animate-pulse text-lg">Aggregating Global APIs...</p>
          </div>
        )}

        {results && !loading && (
          <motion.div className="w-full flex justify-center z-10 relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20">
              <button 
                onClick={() => setResults(null)}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-sm font-medium text-slate-300 transition-all border border-white/10 hover:border-white/20 hover:text-white"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Start New Analysis
              </button>
            </div>
            <ResultsDisplay data={results} />
          </motion.div>
        )}

          </main>
        </motion.div>
      } />
    </Routes>
  );
}

export default App;
