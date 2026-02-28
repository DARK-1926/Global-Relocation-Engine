import React from 'react';
import { motion } from 'framer-motion';
import type { AnalysisResponse, RankedCountry } from '../types';
import { ShieldAlert, HeartPulse, CloudRain, ShieldCheck, Trophy, Info } from 'lucide-react';

interface Props {
  data: AnalysisResponse;
}

const ScoreBar = ({ label, score, icon: Icon, colorClass }: any) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs mb-1 text-slate-300">
      <span className="flex items-center gap-1.5"><Icon size={12} className={colorClass} /> {label}</span>
      <span className="font-mono">{score}/100</span>
    </div>
    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={`h-full ${colorClass.replace('text-', 'bg-')}`} 
      />
    </div>
  </div>
);

export const ResultsDisplay: React.FC<Props> = ({ data }) => {
  if (!data || !data.results || data.results.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mt-16 space-y-6 z-10 relative pb-20">
      {/* Metadata Banner */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-400 justify-center">
        <span>Analysis completed in {data.metadata.processingTimeMs}ms</span>
        <span>•</span>
        <span>Cache: {data.metadata.cacheHits} hits, {data.metadata.cacheMisses} misses</span>
      </div>

      {data.metadata.failures.length > 0 && (
        <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-200 text-sm flex gap-3 items-start">
          <ShieldAlert className="shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-semibold mb-1">Partial Data Warning</p>
            <p className="text-yellow-200/80">Some data sources were unavailable. Scores were computed using available data for: {data.metadata.failures.map(f => f.country).join(', ')}</p>
          </div>
        </div>
      )}

      {/* Ranked Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {data.results.map((country: RankedCountry, index: number) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={country.countryCode}
            className={`glass rounded-2xl p-6 relative overflow-hidden border ${index === 0 ? 'border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20' : 'border-white/10 hover:border-white/20'}`}
          >
            {index === 0 && (
              <div className="absolute top-0 right-0 bg-gradient-to-bl from-blue-500 to-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-lg flex items-center gap-1.5">
                <Trophy size={14} /> Top Pick
              </div>
            )}
            
            <div className="flex items-end gap-3 mb-6 mt-2">
              <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 leading-none">#{country.rank}</span>
              <h3 className="text-xl font-semibold text-slate-100 truncate pb-1" title={country.name}>{country.name}</h3>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-slate-900/50 border border-black/20">
              <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-semibold">Overall Match Score</div>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-200">
                {country.weightedScore}<span className="text-lg text-slate-600 font-normal">/100</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <ScoreBar label="Travel Risk Safety" score={country.travelRisk} icon={ShieldCheck} colorClass="text-emerald-400" />
              <ScoreBar label="Health Infrastructure" score={country.healthInfrastructure} icon={HeartPulse} colorClass="text-rose-400" />
              <ScoreBar label="Environmental Stability" score={country.environmentalStability} icon={CloudRain} colorClass="text-sky-400" />
            </div>

            <div className="p-3.5 bg-blue-900/10 rounded-xl border border-blue-500/10 text-sm font-medium text-slate-300 leading-relaxed shadow-inner">
              <Info size={16} className="inline mr-1.5 text-blue-400 relative -top-0.5" />
              {country.reasoning}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
