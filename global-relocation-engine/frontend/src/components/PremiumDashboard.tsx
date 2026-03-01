import React, { useState, useRef, useEffect } from 'react';
import './PremiumDashboard.css';
import type { AnalysisResponse } from '../types';
import { analyzeCountries } from '../services/api';
import { PremiumResultsDisplay } from './PremiumResultsDisplay';

// Create a React-friendly reference to the Web Component
const SplineViewer = 'spline-viewer' as any;


export const PremiumDashboard: React.FC = () => {
  const [countries, setCountries] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [allCountries, setAllCountries] = useState<any[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  
  const [riskTolerance, setRiskTolerance] = useState('Moderate');
  const [duration, setDuration] = useState('Short-term');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch all countries for autocomplete
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flags');
        const data = await res.json();
        const formatted = data.map((c: any) => ({
          name: c.name.common,
          flag: c.flags.emoji || '🏳️',
          cca3: c.cca3
        })).sort((a: any, b: any) => a.name.localeCompare(b.name));
        setAllCountries(formatted);
      } catch (err) {
        console.error('Failed to load countries', err);
      }
    };
    fetchCountries();

    const handleClickOutside = (e: MouseEvent) => {
      if (
        autocompleteRef.current && 
        !autocompleteRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilteredCountries = () => {
    const val = inputValue.trim().toLowerCase();
    if (val.length < 2) return [];
    
    // Exact match override to prevent minor islands from overtaking the main USA
    if (val === 'united states' || val === 'usa' || val === 'us') {
      const usa = allCountries.find(c => c.cca3 === 'USA');
      if (usa) return [usa];
    }
    
    return allCountries.filter(c => 
      c.name.toLowerCase().includes(val) || 
      c.cca3.toLowerCase() === val || 
      c.cca2?.toLowerCase() === val
    ).slice(0, 8);
  };
  
  const filteredCountries = getFilteredCountries();

  // Focus input anywhere on the wrapper
  const handleWrapperClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      // If autocomplete is open and has exact match, use it. Otherwise use input value.
      if (showAutocomplete && filteredCountries.length > 0) {
        handleAddCountry(filteredCountries[0].name);
      } else {
        handleAddCountry(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && countries.length > 0) {
      setCountries(countries.slice(0, -1));
    }
  };

  const handleAddCountry = (name: string) => {
    const val = name.trim().replace(/,/g, '');
    const isDuplicate = countries.some(c => c.toLowerCase() === val.toLowerCase());
    
    if (val && !isDuplicate && countries.length < 5) {
      setCountries([...countries, val]);
      setInputValue('');
      setShowAutocomplete(false);
    }
  };

  const handleRemove = (index: number) => {
    setCountries(countries.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (countries.length < 1) {
      setError('Please enter at least 1 country to analyze.');
      return;
    }
    
    setError(null);
    setIsLoading(true);

    try {
      const data = await analyzeCountries({
        countries,
        riskTolerance: riskTolerance as any,
        duration: duration as any
      });
      setResults(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect to Intelligence Engine. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-dark font-display text-slate-100 antialiased selection:bg-primary selection:text-background-dark overflow-x-hidden min-h-screen relative">
      <div className="fixed inset-0 z-0 bg-background-dark pointer-events-none">
        <SplineViewer loading-anim-type="spinner-small-dark" url="https://prod.spline.design/jdz9ONn7NhYUhoMy/scene.splinecode"></SplineViewer>
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/80 via-transparent to-background-dark/80 z-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-background-dark/40 z-10 pointer-events-none"></div>
      </div>

      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl animate-pulse">language</span>
            <span className="text-xl font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Aetheris</span>
            <span className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-black/40 backdrop-blur-xl ml-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#00f0ff]"></span>
              <span className="text-[10px] font-medium tracking-widest text-primary uppercase">Dashboard</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-sm font-bold text-slate-400 hover:text-white transition-colors" onClick={() => window.location.reload()}>Exit</button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 animate-fade-up">
            <span className="text-xl">⚠️</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {!results && (
          <section className="relative p-8 md:p-12 rounded-3xl animate-fade-up backdrop-blur-3xl bg-black/40 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] mb-12" id="inputSection">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-primary text-2xl drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">📊</span>
              Analyze Destinations
            </h2>
            <p className="text-slate-400 font-light mb-8">Enter one or more countries to receive an AI-powered comparative analysis.</p>

            <div className="mb-8">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 block">Quick Presets:</span>
              <div className="flex flex-wrap gap-3">
                <button type="button" className={`px-4 py-2 rounded-full text-sm font-medium border border-white/10 bg-white/5 text-slate-300 hover:bg-primary/20 hover:border-primary/50 hover:text-white transition-all`} onClick={() => { setRiskTolerance('Low'); setDuration('Long-term'); }}>💻 Digital Nomad</button>
                <button type="button" className={`px-4 py-2 rounded-full text-sm font-medium border border-white/10 bg-white/5 text-slate-300 hover:bg-primary/20 hover:border-primary/50 hover:text-white transition-all`} onClick={() => { setRiskTolerance('Low'); setDuration('Long-term'); }}>🏡 Retiree</button>
                <button type="button" className={`px-4 py-2 rounded-full text-sm font-medium border border-white/10 bg-white/5 text-slate-300 hover:bg-primary/20 hover:border-primary/50 hover:text-white transition-all`} onClick={() => { setRiskTolerance('High'); setDuration('Short-term'); }}>🌋 Adventurer</button>
                <button type="button" className={`px-4 py-2 rounded-full text-sm font-medium border border-white/10 bg-white/5 text-slate-300 hover:bg-primary/20 hover:border-primary/50 hover:text-white transition-all`} onClick={() => { setRiskTolerance('Moderate'); setDuration('Short-term'); }}>💼 Business</button>
              </div>
            </div>

            <form id="analyzeForm" autoComplete="off" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="countryInput" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Countries</label>
                <div className="relative flex flex-wrap items-center gap-2 p-3 min-h-[56px] bg-black/40 border border-white/10 rounded-xl focus-within:border-primary/60 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all cursor-text" id="chipsContainer" onClick={handleWrapperClick}>
                  <div className="flex flex-wrap gap-2" id="chipsList">
                    {countries.map((c, idx) => (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium rounded-full animate-fade-up shadow-[0_0_10px_rgba(0,240,255,0.3)]" key={idx}>
                        {c}
                        <button type="button" className="hover:text-black/50 hover:scale-110 transition-all font-bold" onClick={() => handleRemove(idx)}>×</button>
                      </span>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    id="countryInput" 
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setShowAutocomplete(e.target.value.length >= 2);
                    }}
                    onFocus={() => setShowAutocomplete(inputValue.length >= 2)}
                    onKeyDown={handleKeyDown}
                    placeholder={countries.length === 0 ? "Type a country and press Enter..." : ""} 
                    className="flex-1 min-w-[180px] bg-transparent border-none outline-none text-white text-sm placeholder-slate-500 py-1" 
                  />
                  
                  {showAutocomplete && filteredCountries.length > 0 && (
                    <div className="absolute top-[105%] left-0 w-full bg-surface-dark border border-white/10 rounded-xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-50 autocomplete-list" ref={autocompleteRef} style={{ display: 'block' }}>
                      {filteredCountries.map((c, idx) => (
                        <div 
                          className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-primary/15 transition-colors" 
                          key={idx}
                          onClick={() => handleAddCountry(c.name)}
                        >
                          <span className="text-xl">{c.flag}</span>
                          <span className="flex-1 text-slate-200 text-sm">{c.name}</span>
                          <span className="text-xs text-slate-500 font-mono tracking-wider">{c.cca3}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="block text-xs mt-2 transition-colors" id="countryHelper" style={{ color: countries.length >= 1 ? '#00f0ff' : '#64748b' }}>
                  {countries.length >= 1 ? `${countries.length} selected ✓` : `Select at least 1 country (${countries.length}/1)`}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="riskTolerance" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Risk Tolerance</label>
                  <div className="relative">
                    <select id="riskTolerance" value={riskTolerance} onChange={(e) => setRiskTolerance(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl text-white text-sm py-3 px-4 appearance-none focus:outline-none focus:border-primary/60 focus:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all cursor-pointer">
                      <option value="Low">🛡️ Low — Safety First</option>
                      <option value="Moderate">⚖️ Moderate — Balanced</option>
                      <option value="High">🚀 High — Adventurous</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="duration" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Duration of Stay</label>
                  <div className="relative">
                    <select id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl text-white text-sm py-3 px-4 appearance-none focus:outline-none focus:border-primary/60 focus:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all cursor-pointer">
                      <option value="Short-term">📅 Short-term</option>
                      <option value="Long-term">🏡 Long-term</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="group relative w-full flex items-center justify-center gap-3 bg-black/40 border border-primary/40 text-white font-bold text-lg py-4 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:border-primary/40 mt-4" disabled={isLoading || countries.length < 1}>
                {isLoading ? (
                  <span className="relative z-10 flex items-center justify-center gap-3 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Analyzing...
                  </span>
                ) : (
                  <>
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="relative z-10 tracking-widest uppercase drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] flex flex-row items-center justify-center gap-3">
                      Analyze Destinations
                      <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </span>
                  </>
                )}
              </button>
            </form>
          </section>
        )}

        {results && !isLoading && (
          <section className="results-section show" id="resultsSection">
            <div className="flex justify-center mb-12">
              <button 
                onClick={() => setResults(null)}
                className="group relative inline-flex items-center gap-2 px-6 py-3 bg-black/40 border border-white/20 text-slate-300 hover:text-white rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              >
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <span className="text-sm font-semibold tracking-wide uppercase">Start New Analysis</span>
              </button>
            </div>
            
            <PremiumResultsDisplay data={results} />
          </section>
        )}
      </main>

      <footer className="relative z-10 w-full mt-auto py-8 text-center text-slate-500 border-t border-white/5 bg-background-dark/80 backdrop-blur-md">
        <p className="text-sm">Powered by REST Countries, Open-Meteo Weather & Air Quality APIs</p>
        <p className="text-xs mt-2 text-slate-600 uppercase tracking-widest">Real-time data • No mock data • Intelligent scoring</p>
      </footer>
    </div>
  );
};
