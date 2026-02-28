/**
 * Global Relocation & Travel Decision Intelligence Engine
 * Server Entry Point
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeHandler } from './routes/analyze.js';
import { fetchAllCountries } from './apis/restCountries.js';
import cache from './cache.js';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env['PORT'] || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));



// API Routes
app.post('/api/analyze', analyzeHandler as any);

// Countries list for autocomplete
app.get('/api/countries', async (req, res) => {
    try {
        const countriesResult = await cache.getOrFetch('all_countries', fetchAllCountries);
        res.json({ success: true, data: countriesResult.data });
    } catch (error: any) {
        logger.error('SERVER', 'Failed to fetch country list', { error: error.message });
        res.status(500).json({ success: false, error: 'Failed to fetch countries' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});



// Start server
app.listen(PORT, () => {
    logger.info('SERVER', `Global Relocation Engine running on http://localhost:${PORT}`);
    logger.info('SERVER', `API endpoint: POST http://localhost:${PORT}/api/analyze`);
});
