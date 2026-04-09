/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { JobProvider } from './context/JobContext';
import { Layout } from './components/layout/Layout';
import { Toaster } from '@/components/ui/sonner';

// Pages (to be created)
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Offers from './pages/Offers';
import ResumeBuilder from './pages/ResumeBuilder';
import AiAvatar from './pages/AiAvatar';
import AiAssistant from './pages/AiAssistant';

export default function App() {
  return (
    <JobProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/resume" element={<ResumeBuilder />} />
            <Route path="/avatar" element={<AiAvatar />} />
            <Route path="/assistant" element={<AiAssistant />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster />
    </JobProvider>
  );
}

