import React, { useState } from 'react';
import type { AnalysisResponse } from '../types';

interface PremiumResultsDisplayProps {
  data: AnalysisResponse;
}

const getScoreColor = (score: number | null | undefined) => {
  if (score === null || score === undefined) return '#888';
  if (score >= 75) return '#10b981';
  if (score >= 50) return '#3b82f6';
  if (score >= 30) return '#f59e0b';
  return '#ef4444';
};

const formatPopulation = (pop: number | undefined) => {
  if (!pop) return 'N/A';
  if (pop >= 1e9) return (pop / 1e9).toFixed(1) + 'B';
  if (pop >= 1e6) return (pop / 1e6).toFixed(1) + 'M';
  if (pop >= 1e3) return (pop / 1e3).toFixed(1) + 'K';
  return pop.toString();
};

export const PremiumResultsDisplay: React.FC<PremiumResultsDisplayProps> = ({ data: apiResponse }) => {
  const [logsOpen, setLogsOpen] = useState(false);

  if (!apiResponse || !apiResponse.data || !apiResponse.data.rankings) {
    return <div className="text-center text-slate-400 mt-8">No analysis data available.</div>;
  }

  const { data, failedCountries, performance, activityLog, exchangeRates } = apiResponse;
  const { rankings, weights, metadata } = data;

  const renderRadarChart = (c: any) => {
    const size = 160;
    const center = size / 2;
    const radius = 60;

    const s1 = (100 - (c.scores.travelRisk.score || 100)) / 100;
    const s2 = (c.scores.healthInfra.score || 0) / 100;
    const s3 = (c.scores.envStability.score || 0) / 100;

    const points = [
      { x: center, y: center - radius * s1 },
      { x: center + radius * s2 * Math.cos(Math.PI / 6), y: center + radius * s2 * Math.sin(Math.PI / 6) },
      { x: center - radius * s3 * Math.cos(Math.PI / 6), y: center + radius * s3 * Math.sin(Math.PI / 6) }
    ];

    const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="radar-svg">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <circle cx={center} cy={center} r={radius * 0.66} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <circle cx={center} cy={center} r={radius * 0.33} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        
        <line x1={center} y1={center} x2={center} y2={center - radius} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1={center} y1={center} x2={center + radius * Math.cos(Math.PI / 6)} y2={center + radius * Math.sin(Math.PI / 6)} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1={center} y1={center} x2={center - radius * Math.cos(Math.PI / 6)} y2={center + radius * Math.sin(Math.PI / 6)} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        <polygon points={polyPoints} fill="rgba(99, 102, 241, 0.4)" stroke="var(--accent-primary)" strokeWidth="2" />
        
        <text x={center} y={center - radius - 5} textAnchor="middle" fontSize="8" fill="var(--text-muted)">SHIELDS</text>
        <text x={center + radius} y={center + radius / 2} textAnchor="start" fontSize="8" fill="var(--text-muted)">HEALTH</text>
        <text x={center - radius} y={center + radius / 2} textAnchor="end" fontSize="8" fill="var(--text-muted)">ENV</text>
      </svg>
    );
  };

  return (
    <div className="premium-results">
      <div className="results-header">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-primary">🏆</span> Rankings
          </h2>
          <div className="results-meta mt-2">
            <span className="meta-tag">🎯 {metadata.riskTolerance} risk</span>
            <span className="meta-tag">⏱️ {metadata.duration}</span>
            <span className="meta-tag">🌐 {metadata.totalCountries} countries</span>
            <span className="meta-tag">⚡ {performance.responseTimeMs}ms</span>
          </div>
        </div>
      </div>

      <div className="weight-profile glass-card">
        <h3>Dynamic Weight Profile</h3>
        <div className="weight-bars">
          <div className="weight-bar-group">
            <div className="weight-bar-label">
               <span>Travel Risk</span>
               <span>{Math.round(weights.travelRisk * 100)}%</span>
            </div>
            <div className="weight-bar">
               <div className="weight-bar-fill" style={{ width: `${Math.round(weights.travelRisk * 100)}%`, background: '#ef4444' }}></div>
            </div>
          </div>
          <div className="weight-bar-group">
            <div className="weight-bar-label">
               <span>Health Infra</span>
               <span>{Math.round(weights.healthInfra * 100)}%</span>
            </div>
            <div className="weight-bar">
               <div className="weight-bar-fill" style={{ width: `${Math.round(weights.healthInfra * 100)}%`, background: '#10b981' }}></div>
            </div>
          </div>
          <div className="weight-bar-group">
            <div className="weight-bar-label">
               <span>Env Stability</span>
               <span>{Math.round(weights.envStability * 100)}%</span>
            </div>
            <div className="weight-bar">
               <div className="weight-bar-fill" style={{ width: `${Math.round(weights.envStability * 100)}%`, background: '#3b82f6' }}></div>
            </div>
          </div>
        </div>
      </div>

      {failedCountries && failedCountries.length > 0 && (
        <div className="failed-banner" style={{ display: 'block' }}>
          ⚠️ Could not analyze: {failedCountries.map(f => <span key={f.name}><strong>{f.name}</strong> ({f.reason}) </span>)}
        </div>
      )}

      {activityLog && activityLog.length > 0 && (
        <div className="activity-log glass-card mt-8">
          <div className="activity-header" onClick={() => setLogsOpen(!logsOpen)}>
            <h3><span className="text-primary">⚡</span> Live Engine Activity</h3>
            <span className={`activity-toggle-icon material-symbols-outlined ${!logsOpen ? 'collapsed' : ''}`}>expand_more</span>
          </div>
          <div className={`activity-body ${!logsOpen ? 'collapsed' : ''}`}>
            <div className="activity-events">
              {activityLog.map((log: any, i: number) => {
                const isHit = log.meta?.hit !== undefined ? log.meta.hit : true;
                return (
                  <div key={i} className={`activity-event level-${log.level}`}>
                    <span className="event-time">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                    <span className="event-icon">{log.icon || (log.level === 'ERROR' ? '🚨' : log.level === 'WARN' ? '⚠️' : '🔹')}</span>
                    <span className={`event-category cat-${log.category}`}>{log.category}</span>
                    <span className="event-message">{log.message}</span>
                    <span className="event-meta">
                      {log.category === 'API_CALL' && log.meta?.durationMs && <span className="duration">{log.meta.durationMs}ms</span>}
                      {log.category === 'CACHE' && <span className={isHit ? 'cache-hit' : 'cache-miss'}>{isHit ? 'HIT' : 'MISS'}</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="cards-grid mt-6">
        {rankings.map((c) => {
          const rankClass = c.rank <= 3 ? `rank-${c.rank}` : 'rank-other';
          
          const travelRiskColor = getScoreColor(100 - (c.scores.travelRisk.score || 0));
          const healthColor = getScoreColor(c.scores.healthInfra.score);
          const envColor = getScoreColor(c.scores.envStability.score);

          return (
            <div className="country-card" key={c.cca3}>
              <div className="card-header">
                <div className={`card-rank-badge ${rankClass}`}>#{c.rank}</div>
                <div className="card-country-name">
                  <span className="card-country-flag">{c.flagEmoji || '🏳️'}</span>
                  {c.countryName}
                </div>
                <div className="card-country-details font-mono">
                  <span>📍 {c.capital}</span>
                  <span>🌍 {c.region}</span>
                  <span>👥 {formatPopulation(c.population)}</span>
                  {c.currencies && c.currencies.length > 0 && (
                    <span>💰 {c.currencies[0].code} 
                       {exchangeRates && exchangeRates.rates && exchangeRates.rates[c.currencies[0].code] && (
                          <span className="financial-info inline-block ml-2">1 USD = {exchangeRates.rates[c.currencies[0].code].toFixed(2)} {c.currencies[0].code}</span>
                       )}
                    </span>
                  )}
                </div>
                <div className="card-composite-score">
                  <div className="composite-value">{c.compositeScore !== null ? c.compositeScore.toFixed(1) : 'N/A'}</div>
                  <div className="composite-label">Overall Score</div>
                </div>
              </div>
              
              <div className="card-body">
                <div className="scores-grid">
                  <div className="score-item">
                    <div className="score-label">🛡️ Travel Risk</div>
                    <div className="score-bar-container">
                      <div className="score-bar">
                        <div className="score-bar-fill" style={{ width: `${c.scores.travelRisk.score || 0}%`, background: travelRiskColor }}></div>
                      </div>
                      <span className="score-value" style={{ color: travelRiskColor }}>{c.scores.travelRisk.score?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="score-item">
                    <div className="score-label">🏥 Health Infrastructure</div>
                    <div className="score-bar-container">
                      <div className="score-bar">
                        <div className="score-bar-fill" style={{ width: `${c.scores.healthInfra.score || 0}%`, background: healthColor }}></div>
                      </div>
                      <span className="score-value" style={{ color: healthColor }}>{c.scores.healthInfra.score?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="score-item">
                    <div className="score-label">🌿 Env Stability</div>
                    <div className="score-bar-container">
                      <div className="score-bar">
                        <div className="score-bar-fill" style={{ width: `${c.scores.envStability.score || 0}%`, background: envColor }}></div>
                      </div>
                      <span className="score-value" style={{ color: envColor }}>{c.scores.envStability.score?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="conditions-row">
                  {c.currentConditions.temperature !== null && <span className="condition-badge">🌡️ {c.currentConditions.temperature}°C</span>}
                  {c.currentConditions.weatherDescription !== 'N/A' && <span className="condition-badge">☁️ {c.currentConditions.weatherDescription}</span>}
                  {c.currentConditions.humidity !== null && <span className="condition-badge">💧 {c.currentConditions.humidity}%</span>}
                  {c.currentConditions.windSpeed !== null && <span className="condition-badge">💨 {c.currentConditions.windSpeed} km/h</span>}
                  {c.currentConditions.aqi !== null && (
                    <span className="condition-badge" style={{ borderColor: `${c.currentConditions.aqiColor}40` }}>
                      🫁 AQI {c.currentConditions.aqi} ({c.currentConditions.aqiCategory})
                    </span>
                  )}
                </div>

                <div className="reasoning-box">
                  <div className="reasoning-label">💡 Analysis Reasoning</div>
                  <p>{c.reasoning.summary}</p>
                </div>

                {c.hasPartialData && (
                  <div className="partial-warning text-yellow-300">
                    ⚠️ Partial data: {c.errors.map((e: any) => e.api).join(', ')} unavailable. Scores may be affected.
                  </div>
                )}

                <div className="card-visuals">
                  <div className="visual-item">
                    <span className="visual-label">Intelligence Profile</span>
                    <div className="radar-container">
                      {renderRadarChart(c)}
                    </div>
                  </div>
                  <div className="visual-item">
                    <span className="visual-label">Location</span>
                    <div className="map-container">
                      {c.latlng && c.latlng.length >= 2 && (
                        <iframe 
                          className="map-iframe"
                          title="country map"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${c.latlng[1] - 1}%2C${c.latlng[0] - 1}%2C${c.latlng[1] + 1}%2C${c.latlng[0] + 1}&layer=mapnik&marker=${c.latlng[0]}%2C${c.latlng[1]}`}
                          loading="lazy"
                        ></iframe>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
