import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar, BottomNav } from './components/Navigation';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { RosterPage } from './pages/RosterPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { CommunicationPage } from './pages/CommunicationPage';
import { RecoveryPage } from './pages/RecoveryPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function MainLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#020617] transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

export default function App() {
  const [onboarded, setOnboarded] = React.useState(() => {
    return localStorage.getItem('injuryiq_onboarded') === 'true';
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem('injuryiq_onboarded', 'true');
    setOnboarded(true);
  };

  return (
    <ThemeProvider>
      {!onboarded ? (
        <OnboardingPage onComplete={handleOnboardingComplete} />
      ) : (
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/roster" element={<RosterPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/team" element={<CommunicationPage />} />
              <Route path="/recovery" element={<RecoveryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      )}
    </ThemeProvider>
  );
}
