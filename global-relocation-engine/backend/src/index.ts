import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { IntelligenceEngine } from './modules/IntelligenceEngine';
import { RequestValidator } from './modules/RequestValidator';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const engine = new IntelligenceEngine();
const validator = new RequestValidator();

app.post('/api/analyze', async (req, res) => {
  try {
    const validation = validator.validate(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Validation Error', details: validation.errors });
    }

    const response = await engine.analyze(req.body);
    res.status(200).json(response);
  } catch (error: any) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Global Relocation Intelligence Engine backend running on port ${PORT}`);
});
