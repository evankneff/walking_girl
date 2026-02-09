import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Dashboard from './components/Dashboard';
import EntryForm from './components/EntryForm';
import AdminPanel from './components/AdminPanel';
import HistoryPage from './components/HistoryPage';
import SideMenu from './components/SideMenu';
import Fab from './components/Fab';
import SaviorIcon from './components/SaviorIcon';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Router>
      <div className="app">
        <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
          <div className="nav-container">
            <div className="nav-left">
              <Link to="/" className="nav-logo-icon">
                <SaviorIcon size={36} />
              </Link>
              <Link to="/" className="nav-title">
                Walking with our Savior
              </Link>
            </div>

            <button
              className="menu-btn"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            <div className="nav-links desktop-only">
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/entry" className="nav-link">Enter Time</Link>
            </div>
          </div>
        </nav>

        <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/entry" element={<EntryForm />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>

        <Fab />
      </div>
    </Router>
  );
}

export default App;
