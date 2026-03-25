import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopProps {
  activePage?: string;
  activeTab?: string;
}

export default function ScrollToTop({ activePage, activeTab }: ScrollToTopProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, activePage, activeTab]);

  return null;
}
