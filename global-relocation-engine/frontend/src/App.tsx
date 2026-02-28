import { Routes, Route, useNavigate } from 'react-router-dom';
import { LandingPage } from './LandingPage';
import { PremiumDashboard } from './components/PremiumDashboard';

function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<LandingPage onStartJourney={() => navigate('/dashboard')} />} />
      <Route path="/dashboard" element={<PremiumDashboard />} />
    </Routes>
  );
}

export default App;
