import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronsUpDown, X } from 'lucide-react';

const COUNTRIES = [
  { code: 'usa', name: 'United States' },
  { code: 'gbr', name: 'United Kingdom' },
  { code: 'can', name: 'Canada' },
  { code: 'aus', name: 'Australia' },
  { code: 'deu', name: 'Germany' },
  { code: 'fra', name: 'France' },
  { code: 'jpn', name: 'Japan' },
  { code: 'sgp', name: 'Singapore' },
  { code: 'are', name: 'United Arab Emirates' },
  { code: 'che', name: 'Switzerland' },
  { code: 'esp', name: 'Spain' },
  { code: 'ita', name: 'Italy' },
  { code: 'tha', name: 'Thailand' },
  { code: 'idn', name: 'Indonesia' },
  { code: 'vnm', name: 'Vietnam' },
  { code: 'mys', name: 'Malaysia' },
  { code: 'mex', name: 'Mexico' },
  { code: 'bra', name: 'Brazil' },
  { code: 'zaf', name: 'South Africa' },
  { code: 'nzl', name: 'New Zealand' },
];

interface Props {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const CountrySelector: React.FC<Props> = ({ selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const toggleCountry = (code: string) => {
    if (selected.includes(code)) {
      onChange(selected.filter(c => c !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  const removeCountry = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter(c => c !== code));
  };

  const filtered = COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full max-w-md z-50">
      <label className="block text-sm font-medium text-blue-200 mb-2">Select Destinations (Min 3)</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="glass min-h-[50px] rounded-xl flex items-center justify-between p-2 cursor-pointer border border-white/10 hover:border-white/20 transition-all"
      >
        <div className="flex flex-wrap gap-2 flex-1 items-center">
          {selected.length === 0 && (
            <span className="text-slate-400 pl-2 text-sm pointer-events-none">Search countries...</span>
          )}
          {selected.map(code => {
            const country = COUNTRIES.find(c => c.code === code);
            return (
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={code} 
                className="bg-blue-600/30 text-blue-100 border border-blue-500/30 text-xs px-3 py-1.5 rounded-full flex items-center gap-2"
              >
                {country?.name || code}
                <X size={12} className="cursor-pointer hover:text-white" onClick={(e) => removeCountry(code, e)} />
              </motion.span>
            )
          })}
        </div>
        <ChevronsUpDown size={16} className="text-slate-400 mr-2 shrink-0" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 glass rounded-xl overflow-hidden shadow-2xl border border-white/10"
          >
            <div className="p-2 border-b border-white/10">
              <input 
                type="text" 
                placeholder="Type to search..." 
                className="w-full bg-transparent border-none outline-none text-white text-sm px-2 py-1 placeholder-slate-400"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
              {filtered.map(country => {
                const isSelected = selected.includes(country.code);
                return (
                  <div 
                    key={country.code}
                    onClick={() => toggleCountry(country.code)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm transition-colors ${isSelected ? 'bg-blue-600/20 text-white' : 'hover:bg-white/5 text-slate-300'}`}
                  >
                    {country.name}
                    {isSelected && <Check size={14} className="text-blue-400" />}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
