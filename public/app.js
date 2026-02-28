/**
 * Global Relocation Intelligence Engine — Frontend Application
 *
 * Single POST to /api/analyze
 * Features: chip-based country input, loading states, duplicate prevention,
 * dynamic card rendering, score bars, reasoning display, partial data handling.
 */

(function () {
  'use strict';

  // --- DOM Elements ---
  const form = document.getElementById('analyzeForm');
  const countryInput = document.getElementById('countryInput');
  const chipsList = document.getElementById('chipsList');
  const chipsContainer = document.getElementById('chipsContainer');
  const countryHelper = document.getElementById('countryHelper');
  const btnAnalyze = document.getElementById('btnAnalyze');
  const errorBanner = document.getElementById('errorBanner');
  const errorMessage = document.getElementById('errorMessage');
  const resultsSection = document.getElementById('resultsSection');
  const resultsMeta = document.getElementById('resultsMeta');
  const weightProfile = document.getElementById('weightProfile');
  const failedBanner = document.getElementById('failedBanner');
  const cardsGrid = document.getElementById('cardsGrid');
  const activityLog = document.getElementById('activityLog');
  const activityEvents = document.getElementById('activityEvents');
  const activityToggle = document.getElementById('activityToggle');
  const activityToggleIcon = document.getElementById('activityToggleIcon');
  const activityBody = document.getElementById('activityBody');
  const autocompleteList = document.getElementById('autocompleteList');
  const personaChips = document.querySelectorAll('.persona-chip');

  // --- State ---
  let countries = [];
  let allCountries = [];
  let isLoading = false;
  let activePersona = null;

  const PERSONA_CONFIGS = {
    nomad: { risk: 'low', duration: 'long-term' },
    retiree: { risk: 'low', duration: 'long-term' },
    adventure: { risk: 'high', duration: 'short-term' },
    business: { risk: 'moderate', duration: 'short-term' }
  };

  // --- Initialize Particles ---
  function initParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (8 + Math.random() * 12) + 's';
      p.style.animationDelay = Math.random() * 10 + 's';
      p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
      container.appendChild(p);
    }
  }

  // --- Chip Management ---
  function addCountry(name) {
    const clean = name.trim();
    if (!clean) return;
    const lower = clean.toLowerCase();
    if (countries.some(c => c.toLowerCase() === lower)) return; // no dupes
    countries.push(clean);
    renderChips();
    updateButtonState();
    countryInput.value = '';
    countryInput.focus();
  }

  function removeCountry(index) {
    countries.splice(index, 1);
    renderChips();
    updateButtonState();
  }

  function renderChips() {
    chipsList.innerHTML = countries.map((c, i) => `
      <span class="chip">
        ${escapeHtml(c)}
        <button type="button" class="chip-remove" data-index="${i}" aria-label="Remove ${escapeHtml(c)}">×</button>
      </span>
    `).join('');

    chipsList.querySelectorAll('.chip-remove').forEach(btn => {
      btn.addEventListener('click', () => removeCountry(parseInt(btn.dataset.index)));
    });

    countryHelper.textContent = countries.length < 1
      ? 'Add at least 1 country'
      : `${countries.length} ${countries.length === 1 ? 'country' : 'countries'} selected ✓`;
    countryHelper.style.color = countries.length >= 1 ? '#10b981' : '';
  }

  function updateButtonState() {
    btnAnalyze.disabled = countries.length < 1 || isLoading;
  }

  // --- Input Events ---
  countryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      const val = countryInput.value.replace(/,/g, '').trim();
      if (val) addCountry(val);
    }
    if (e.key === 'Backspace' && countryInput.value === '' && countries.length > 0) {
      removeCountry(countries.length - 1);
    }
  });

  // --- Autocomplete Logic ---
  async function fetchCountryList() {
    try {
      const response = await fetch('/api/countries');
      const result = await response.json();
      if (result.success) {
        allCountries = result.data;
      }
    } catch (err) {
      console.error('Failed to fetch country list', err);
    }
  }

  countryInput.addEventListener('input', () => {
    const val = countryInput.value.trim().toLowerCase();
    if (val.length < 2) {
      autocompleteList.style.display = 'none';
      return;
    }

    const matches = allCountries.filter(c =>
      c.name.toLowerCase().includes(val) ||
      c.cca2.toLowerCase() === val ||
      c.cca3.toLowerCase() === val
    ).slice(0, 8);

    if (matches.length > 0) {
      renderAutocomplete(matches);
      autocompleteList.style.display = 'block';
    } else {
      autocompleteList.style.display = 'none';
    }
  });

  function renderAutocomplete(matches) {
    autocompleteList.innerHTML = matches.map(c => `
      <div class="autocomplete-item" data-name="${c.name}">
        <span class="autocomplete-flag">${c.flag}</span>
        <span class="autocomplete-name">${escapeHtml(c.name)}</span>
        <span class="autocomplete-code">${c.cca3}</span>
      </div>
    `).join('');

    autocompleteList.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', () => {
        addCountry(item.dataset.name);
        autocompleteList.style.display = 'none';
      });
    });
  }

  document.addEventListener('click', (e) => {
    if (!chipsContainer.contains(e.target)) {
      autocompleteList.style.display = 'none';
    }
  });

  // --- Persona Selection ---
  personaChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const persona = chip.dataset.persona;

      // Toggle active state
      personaChips.forEach(c => c.classList.remove('active'));
      if (activePersona === persona) {
        activePersona = null;
      } else {
        activePersona = persona;
        chip.classList.add('active');

        // Auto-configure options
        const config = PERSONA_CONFIGS[persona];
        document.getElementById('riskTolerance').value = config.risk;
        document.getElementById('duration').value = config.duration;
      }
    });
  });

  // Also add chip when user pastes comma-separated list
  countryInput.addEventListener('input', (e) => {
    const val = countryInput.value;
    if (val.includes(',')) {
      const parts = val.split(',').map(s => s.trim()).filter(Boolean);
      parts.forEach(p => addCountry(p));
      countryInput.value = '';
    }
  });

  // Auto-add chip when user clicks away from input
  countryInput.addEventListener('blur', () => {
    const val = countryInput.value.trim();
    if (val) addCountry(val);
  });

  chipsContainer.addEventListener('click', () => countryInput.focus());

  // --- Form Submit ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Auto-add any leftover text in the input as a country
    const leftover = countryInput.value.trim();
    if (leftover) addCountry(leftover);
    if (countries.length < 1 || isLoading) return;
    await analyze();
  });

  // --- API Call ---
  async function analyze() {
    isLoading = true;
    updateButtonState();
    showLoading(true);
    hideError();
    resultsSection.style.display = 'none';

    const payload = {
      countries: [...countries],
      riskTolerance: document.getElementById('riskTolerance').value,
      duration: document.getElementById('duration').value
    };

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errMsg = result.errors
          ? result.errors.join('. ')
          : result.error || 'Analysis failed';
        showError(errMsg);
        return;
      }

      renderResults(result);
    } catch (err) {
      showError('Network error. Please check your connection and try again.');
    } finally {
      isLoading = false;
      updateButtonState();
      showLoading(false);
    }
  }

  // --- Activity Log Toggle ---
  activityToggle.addEventListener('click', () => {
    activityBody.classList.toggle('collapsed');
    activityToggleIcon.classList.toggle('collapsed');
  });

  // --- UI Helpers ---
  function showLoading(on) {
    btnAnalyze.querySelector('.btn-text').style.display = on ? 'none' : '';
    btnAnalyze.querySelector('.btn-loading').style.display = on ? 'inline-flex' : 'none';
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.style.display = 'flex';
  }

  function hideError() {
    errorBanner.style.display = 'none';
  }

  // --- Render Results ---
  function renderResults(result) {
    const { data, failedCountries, performance } = result;
    const { rankings, weights, metadata } = data;

    // Meta info
    resultsMeta.innerHTML = `
      <span class="meta-tag">🎯 ${metadata.riskTolerance} risk</span>
      <span class="meta-tag">⏱️ ${metadata.duration}</span>
      <span class="meta-tag">🌐 ${metadata.totalCountries} countries</span>
      <span class="meta-tag">⚡ ${performance.responseTimeMs}ms</span>
    `;

    // Weight profile
    weightProfile.innerHTML = `
      <h3>Dynamic Weight Profile</h3>
      <div class="weight-bars">
        ${renderWeightBar('Travel Risk', weights.travelRisk, '#ef4444')}
        ${renderWeightBar('Health Infra', weights.healthInfra, '#10b981')}
        ${renderWeightBar('Env Stability', weights.envStability, '#3b82f6')}
      </div>
    `;

    // Failed countries
    if (failedCountries && failedCountries.length > 0) {
      failedBanner.style.display = 'block';
      failedBanner.innerHTML = `⚠️ Could not analyze: ${failedCountries.map(f => `<strong>${escapeHtml(f.name)}</strong> (${escapeHtml(f.reason)})`).join(', ')}`;
    } else {
      failedBanner.style.display = 'none';
    }

    // Backend Activity Log
    if (result.activityLog && result.activityLog.length > 0) {
      activityLog.style.display = 'block';
      activityEvents.innerHTML = result.activityLog.map(event => renderActivityEvent(event)).join('');
      // Start collapsed for cleaner UX unless user wants to see it
      activityBody.classList.add('collapsed');
      activityToggleIcon.classList.add('collapsed');
    } else {
      activityLog.style.display = 'none';
    }

    // Country cards
    cardsGrid.innerHTML = rankings.map(c => renderCountryCard(c, result.exchangeRates)).join('');

    // Animate score bars
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.querySelectorAll('.score-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.width;
        });
        document.querySelectorAll('.weight-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.width;
        });
      }, 100);
    });

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderWeightBar(label, value, color) {
    const pct = Math.round(value * 100);
    return `
      <div class="weight-bar-group">
        <div class="weight-bar-label">
          <span>${label}</span>
          <span>${pct}%</span>
        </div>
        <div class="weight-bar">
          <div class="weight-bar-fill" style="width:0;background:${color};" data-width="${pct}%"></div>
        </div>
      </div>
    `;
  }

  function renderCountryCard(c, exchangeRates) {
    const rankClass = c.rank <= 3 ? `rank-${c.rank}` : 'rank-other';

    // Score colors
    const travelRiskColor = getScoreColor(100 - (c.scores.travelRisk.score || 0)); // inverted
    const healthColor = getScoreColor(c.scores.healthInfra.score);
    const envColor = getScoreColor(c.scores.envStability.score);

    const travelRiskDisplay = c.scores.travelRisk.score !== null ? c.scores.travelRisk.score.toFixed(1) : 'N/A';
    const healthDisplay = c.scores.healthInfra.score !== null ? c.scores.healthInfra.score.toFixed(1) : 'N/A';
    const envDisplay = c.scores.envStability.score !== null ? c.scores.envStability.score.toFixed(1) : 'N/A';

    const travelRiskBar = c.scores.travelRisk.score !== null ? c.scores.travelRisk.score : 0;
    const healthBar = c.scores.healthInfra.score !== null ? c.scores.healthInfra.score : 0;
    const envBar = c.scores.envStability.score !== null ? c.scores.envStability.score : 0;

    return `
      <div class="country-card">
        <div class="card-header">
          <div class="card-rank-badge ${rankClass}">#${c.rank}</div>
          <div class="card-country-name">
            <span class="card-country-flag">${c.flagEmoji || '🏳️'}</span>
            ${escapeHtml(c.countryName)}
          </div>
          <div class="card-country-details">
            <span>📍 ${escapeHtml(c.capital)}</span>
            <span>🌍 ${escapeHtml(c.region)}</span>
            <span>👥 ${formatPopulation(c.population)}</span>
            ${c.currencies && c.currencies.length > 0 ? `<span>💰 ${escapeHtml(c.currencies[0].code)} ${renderFinancialBadge(c.currencies[0].code, exchangeRates)}</span>` : ''}
          </div>
          <div class="card-composite-score">
            <div class="composite-value">${c.compositeScore !== null ? c.compositeScore.toFixed(1) : 'N/A'}</div>
            <div class="composite-label">Overall Score</div>
          </div>
        </div>
        <div class="card-body">
          <div class="scores-grid">
            <div class="score-item">
              <div class="score-label">🛡️ Travel Risk</div>
              <div class="score-bar-container">
                <div class="score-bar">
                  <div class="score-bar-fill" style="width:0;background:${travelRiskColor};" data-width="${travelRiskBar}%"></div>
                </div>
                <span class="score-value" style="color:${travelRiskColor}">${travelRiskDisplay}</span>
              </div>
            </div>
            <div class="score-item">
              <div class="score-label">🏥 Health Infrastructure</div>
              <div class="score-bar-container">
                <div class="score-bar">
                  <div class="score-bar-fill" style="width:0;background:${healthColor};" data-width="${healthBar}%"></div>
                </div>
                <span class="score-value" style="color:${healthColor}">${healthDisplay}</span>
              </div>
            </div>
            <div class="score-item">
              <div class="score-label">🌿 Env Stability</div>
              <div class="score-bar-container">
                <div class="score-bar">
                  <div class="score-bar-fill" style="width:0;background:${envColor};" data-width="${envBar}%"></div>
                </div>
                <span class="score-value" style="color:${envColor}">${envDisplay}</span>
              </div>
            </div>
          </div>

          <div class="conditions-row">
            ${c.currentConditions.temperature !== null ? `<span class="condition-badge">🌡️ ${c.currentConditions.temperature}°C</span>` : ''}
            ${c.currentConditions.weatherDescription !== 'N/A' ? `<span class="condition-badge">☁️ ${escapeHtml(c.currentConditions.weatherDescription)}</span>` : ''}
            ${c.currentConditions.humidity !== null ? `<span class="condition-badge">💧 ${c.currentConditions.humidity}%</span>` : ''}
            ${c.currentConditions.windSpeed !== null ? `<span class="condition-badge">💨 ${c.currentConditions.windSpeed} km/h</span>` : ''}
            ${c.currentConditions.aqi !== null ? `<span class="condition-badge" style="border-color:${c.currentConditions.aqiColor}40">🫁 AQI ${c.currentConditions.aqi} (${escapeHtml(c.currentConditions.aqiCategory)})</span>` : ''}
          </div>

          <div class="reasoning-box">
            <div class="reasoning-label">💡 Analysis Reasoning</div>
            <p>${escapeHtml(c.reasoning.summary)}</p>
          </div>

          ${c.hasPartialData ? `
            <div class="partial-warning">
              ⚠️ Partial data: ${c.errors.map(e => escapeHtml(e.api)).join(', ')} unavailable.
              Scores may be affected.
            </div>
          ` : ''}

          <!-- Visuals: Radar Chart & Mini Map -->
          <div class="card-visuals">
            <div class="visual-item">
              <span class="visual-label">Intelligence Profile</span>
              <div class="radar-container" id="radar-${c.cca3}">
                ${renderRadarChart(c)}
              </div>
            </div>
            <div class="visual-item">
              <span class="visual-label">Location</span>
              <div class="map-container">
                ${renderMiniMap(c.latlng)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- Utilities ---
  function getScoreColor(score) {
    if (score === null || score === undefined) return '#888';
    if (score >= 75) return '#10b981';
    if (score >= 50) return '#3b82f6';
    if (score >= 30) return '#f59e0b';
    return '#ef4444';
  }

  function formatPopulation(pop) {
    if (!pop) return 'N/A';
    if (pop >= 1e9) return (pop / 1e9).toFixed(1) + 'B';
    if (pop >= 1e6) return (pop / 1e6).toFixed(1) + 'M';
    if (pop >= 1e3) return (pop / 1e3).toFixed(1) + 'K';
    return pop.toString();
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderActivityEvent(event) {
    const time = new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const metaStr = event.meta ? renderEventMeta(event.category, event.meta) : '';

    return `
      <div class="activity-event level-${event.level}">
        <span class="event-time">${time}</span>
        <span class="event-icon">${event.icon}</span>
        <span class="event-category cat-${event.category}">${event.category}</span>
        <span class="event-message">${escapeHtml(event.message)}</span>
        <span class="event-meta">${metaStr}</span>
      </div>
    `;
  }

  function renderEventMeta(category, meta) {
    if (category === 'API_CALL') {
      return `<span class="duration">${meta.durationMs}ms</span>`;
    }
    if (category === 'CACHE') {
      const isHit = meta.hit !== undefined ? meta.hit : true;
      return `<span class="cache-${isHit ? 'hit' : 'miss'}">${isHit ? 'HIT' : 'MISS'}</span>`;
    }
    return '';
  }

  function renderRadarChart(c) {
    const size = 160;
    const center = size / 2;
    const radius = 60;

    // Normalize scores to 0-1 (inverse travel risk)
    const s1 = (100 - (c.scores.travelRisk || 100)) / 100; // Safety
    const s2 = (c.scores.healthInfra || 0) / 100;
    const s3 = (c.scores.envStability || 0) / 100;

    // Triangle Coordinates
    const points = [
      { x: center, y: center - radius * s1 }, // Top (Safety)
      { x: center + radius * s2 * Math.cos(Math.PI / 6), y: center + radius * s2 * Math.sin(Math.PI / 6) }, // Bottom Right (Health)
      { x: center - radius * s3 * Math.cos(Math.PI / 6), y: center + radius * s3 * Math.sin(Math.PI / 6) }  // Bottom Left (Env)
    ];

    const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');

    return `
      <svg viewBox="0 0 ${size} ${size}" class="radar-svg">
        <!-- Background Spokes -->
        <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
        <circle cx="${center}" cy="${center}" r="${radius * 0.66}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
        <circle cx="${center}" cy="${center}" r="${radius * 0.33}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
        
        <line x1="${center}" y1="${center}" x2="${center}" y2="${center - radius}" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        <line x1="${center}" y1="${center}" x2="${center + radius * Math.cos(Math.PI / 6)}" y2="${center + radius * Math.sin(Math.PI / 6)}" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        <line x1="${center}" y1="${center}" x2="${center - radius * Math.cos(Math.PI / 6)}" y2="${center + radius * Math.sin(Math.PI / 6)}" stroke="rgba(255,255,255,0.1)" stroke-width="1" />

        <!-- Data Polygon -->
        <polygon points="${polyPoints}" fill="rgba(99, 102, 241, 0.4)" stroke="var(--accent-primary)" stroke-width="2" />
        
        <!-- Legend Labels -->
        <text x="${center}" y="${center - radius - 5}" text-anchor="middle" font-size="8" fill="var(--text-muted)">SHIELDS</text>
        <text x="${center + radius}" y="${center + radius / 2}" text-anchor="start" font-size="8" fill="var(--text-muted)">HEALTH</text>
        <text x="${center - radius}" y="${center + radius / 2}" text-anchor="end" font-size="8" fill="var(--text-muted)">ENV</text>
      </svg>
    `;
  }

  function renderMiniMap(latlng) {
    if (!latlng || latlng.length < 2) return '';
    const [lat, lng] = latlng;
    // Using OpenStreetMap Embed (Leaflet-based)
    return `
      <iframe 
        class="map-iframe"
        src="https://www.openstreetmap.org/export/embed.html?bbox=${lng - 1}%2C${lat - 1}%2C${lng + 1}%2C${lat + 1}&layer=mapnik&marker=${lat}%2C${lng}"
        loading="lazy"
      ></iframe>
    `;
  }

  function renderFinancialBadge(currencyCode, ratesData) {
    if (!ratesData || !ratesData.rates || !ratesData.rates[currencyCode]) return '';
    const rate = ratesData.rates[currencyCode];
    return `<span class="financial-info">1 USD = ${rate.toFixed(2)} ${currencyCode}</span>`;
  }

  // --- Init ---
  initParticles();
  updateButtonState();
  fetchCountryList();
})();
