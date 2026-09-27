import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

import { seedInitialData } from './db/seed';

// Placeholders for pages
import Dashboard from './pages/Dashboard';
import Workout from './pages/Workout';
import PlanEditor from './pages/PlanEditor';
import History from './pages/History';
import Settings from './pages/Settings';
import Layout from './components/Layout';

function App() {
  useEffect(() => {
    seedInitialData().catch(console.error);
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="workout/:dayId" element={<Workout />} />
          <Route path="plan-editor" element={<PlanEditor />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
