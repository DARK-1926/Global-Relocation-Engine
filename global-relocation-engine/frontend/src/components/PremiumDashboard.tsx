import React, { useState, useRef, useEffect } from 'react';
import './PremiumDashboard.css';
import type { AnalysisResponse } from '../types';
import { analyzeCountries } from '../services/api';
import { PremiumResultsDisplay } from './PremiumResultsDisplay';

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

  // --- Initialize Particles ---
  const renderParticles = () => {
    return Array.from({ length: 30 }).map((_, i) => (
      <div 
        key={i} 
        className="particle" 
        style={{
          left: `${Math.random() * 100}%`,
          animationDuration: `${8 + Math.random() * 12}s`,
          animationDelay: `${Math.random() * 10}s`,
          width: `${2 + Math.random() * 3}px`,
          height: `${2 + Math.random() * 3}px`
        }} 
      />
    ));
  };

  return (
    <div className="premium-dashboard">
      <div className="bg-gradient"></div>
      <div className="bg-particles" id="particles">
        {renderParticles()}
      </div>

      <header className="header">
        <div className="logo">
          <div className="logo-icon">🌍</div>
          <div>
            <h1>RelocateIQ</h1>
            <p className="tagline">Global Decision Intelligence Engine</p>
          </div>
        </div>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-banner mb-6">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
          </div>
        )}

        {!results && (
          <section className="input-section glass-card" id="inputSection">
            <h2 className="section-title">
              <span className="title-icon">📊</span>
              Analyze Destinations
            </h2>
            <p className="section-desc">Enter one or more countries to receive an AI-powered comparative analysis.</p>

            <div className="persona-selection">
              <span className="persona-label">Quick Presets:</span>
              <div className="persona-chips">
                <button type="button" className={`persona-chip`} onClick={() => { setRiskTolerance('Low'); setDuration('Long-term'); }}>💻 Digital Nomad</button>
                <button type="button" className={`persona-chip`} onClick={() => { setRiskTolerance('Low'); setDuration('Long-term'); }}>🏡 Retiree</button>
                <button type="button" className={`persona-chip`} onClick={() => { setRiskTolerance('High'); setDuration('Short-term'); }}>🌋 Adventurer</button>
                <button type="button" className={`persona-chip`} onClick={() => { setRiskTolerance('Moderate'); setDuration('Short-term'); }}>💼 Business</button>
              </div>
            </div>

            <form id="analyzeForm" autoComplete="off" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="countryInput">Countries</label>
                <div className="chips-container" id="chipsContainer" onClick={handleWrapperClick}>
                  <div className="chips-list" id="chipsList">
                    {countries.map((c, idx) => (
                      <span className="chip" key={idx}>
                        {c}
                        <button type="button" className="chip-remove" onClick={() => handleRemove(idx)}>×</button>
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
                    className="chip-input" 
                  />
                  
                  {showAutocomplete && filteredCountries.length > 0 && (
                    <div className="autocomplete-list" ref={autocompleteRef} style={{ display: 'block' }}>
                      {filteredCountries.map((c, idx) => (
                        <div 
                          className="autocomplete-item" 
                          key={idx}
                          onClick={() => handleAddCountry(c.name)}
                        >
                          <span className="autocomplete-flag">{c.flag}</span>
                          <span className="autocomplete-name">{c.name}</span>
                          <span className="autocomplete-code">{c.cca3}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="helper-text" id="countryHelper" style={{ color: countries.length >= 1 ? '#10b981' : '' }}>
                  {countries.length >= 1 ? `${countries.length} selected ✓` : `Select at least 1 country (${countries.length}/1)`}
                </span>
              </div>

              <div className="options-row">
                <div className="form-group">
                  <label htmlFor="riskTolerance">Risk Tolerance</label>
                  <div className="select-wrapper">
                    <select id="riskTolerance" value={riskTolerance} onChange={(e) => setRiskTolerance(e.target.value)}>
                      <option value="Low">🛡️ Low — Safety First</option>
                      <option value="Moderate">⚖️ Moderate — Balanced</option>
                      <option value="High">🚀 High — Adventurous</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="duration">Duration of Stay</label>
                  <div className="select-wrapper">
                    <select id="duration" value={duration} onChange={(e) => setDuration(e.target.value)}>
                      <option value="Short-term">📅 Short-term</option>
                      <option value="Long-term">🏡 Long-term</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-analyze" id="btnAnalyze" disabled={isLoading || countries.length < 1}>
                {isLoading ? (
                  <span className="btn-loading flex items-center justify-center gap-2">
                    <span className="spinner"></span>
                    Analyzing...
                  </span>
                ) : (
                  <span className="btn-text">Analyze Destinations</span>
                )}
              </button>
            </form>
          </section>
        )}

        {results && !isLoading && (
          <section className="results-section show" id="resultsSection">
            <div className="flex justify-center mb-8">
              <button 
                onClick={() => setResults(null)}
                className="btn-analyze"
                style={{ width: 'auto', padding: '10px 24px', fontSize: '0.9rem' }}
              >
                ← Start New Analysis
              </button>
            </div>
            
            <PremiumResultsDisplay data={results} />
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Powered by REST Countries, Open-Meteo Weather & Air Quality APIs</p>
        <p className="footer-sub">Real-time data · No mock data · Intelligent scoring</p>
      </footer>
    </div>
  );
};
