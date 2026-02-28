import React from 'react';
import { Shield, Clock, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export type RiskLevel = 'Low' | 'Moderate' | 'High';
export type DurationLevel = 'Short-term' | 'Long-term';

interface Props {
  riskTolerance: RiskLevel;
  setRiskTolerance: (val: RiskLevel) => void;
  duration: DurationLevel;
  setDuration: (val: DurationLevel) => void;
}

export const PreferencesForm: React.FC<Props> = ({ riskTolerance, setRiskTolerance, duration, setDuration }) => {
  return (
    <div className="w-full max-w-md space-y-6 mt-6 z-10 relative">
      <div>
        <label className="block text-sm font-medium text-blue-200 mb-3">Risk Tolerance</label>
        <div className="grid grid-cols-3 gap-3">
          {(['Low', 'Moderate', 'High'] as const).map(level => {
            const isSelected = riskTolerance === level;
            return (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={level}
                onClick={() => setRiskTolerance(level)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${isSelected ? 'bg-blue-600/30 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'glass hover:bg-white/5 border-white/10 text-slate-400'}`}
              >
                {level === 'Low' && <ShieldCheck size={20} className="mb-2" />}
                {level === 'Moderate' && <Shield size={20} className="mb-2" />}
                {level === 'High' && <ShieldAlert size={20} className="mb-2" />}
                <span className="text-xs font-medium">{level}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-200 mb-3">Duration of Stay</label>
        <div className="grid grid-cols-2 gap-3">
          {(['Short-term', 'Long-term'] as const).map(term => {
            const isSelected = duration === term;
            return (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={term}
                onClick={() => setDuration(term)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${isSelected ? 'bg-blue-600/30 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'glass hover:bg-white/5 border-white/10 text-slate-400'}`}
              >
                <Clock size={16} />
                <span className="text-sm font-medium">{term}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  );
};
