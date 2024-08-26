import React, { FC, useEffect } from 'react';
import { useLocation, HashRouter, Routes, Route } from 'react-router-dom';
import ArcadeCenterPage from './pages/ArcadeCenterPage';

/**
 * Main App routes.
 */
const AppRoutes: FC = () => {
  const { pathname } = useLocation();
  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<ArcadeCenterPage />} />
    </Routes>
  );
};

const routing = function createRouting() {
  return (
      <AppRoutes />
  );
};

export default routing;
