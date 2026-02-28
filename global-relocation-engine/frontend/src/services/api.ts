import axios from 'axios';
import type { AnalysisRequest, AnalysisResponse } from '../types';

const API_URL = 'http://localhost:3000/api';

export const analyzeCountries = async (request: AnalysisRequest): Promise<AnalysisResponse> => {
  const response = await axios.post<AnalysisResponse>(`${API_URL}/analyze`, request);
  return response.data;
};
