/**
 * Navbar component with responsive design, dark mode toggle, and auth-aware navigation.
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-lg border-b border-border dark:border-border-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/icon.jpg" alt="LeadDesk Logo" className="w-8 h-8 rounded-lg object-cover transform group-hover:scale-110 transition-transform shadow-sm" />
            <span className="text-xl font-bold text-text-primary dark:text-text-dark-primary">
              Lead<span className="text-primary">Desk</span> Mini
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-text-secondary dark:text-text-dark-secondary'
              }`}
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/admin"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/admin') ? 'text-primary' : 'text-text-secondary dark:text-text-dark-secondary'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-danger hover:text-red-600 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/login') ? 'text-primary' : 'text-text-secondary dark:text-text-dark-secondary'
                }`}
              >
                Admin Login
              </Link>
            )}


          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-text-primary dark:text-text-dark-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-border dark:border-border-dark animate-fade-in-up">
            <div className="flex flex-col gap-3 pt-4">
              <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary hover:text-primary px-2 py-1">Home</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary hover:text-primary px-2 py-1">Dashboard</Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="text-sm font-medium text-danger hover:text-red-600 text-left px-2 py-1 cursor-pointer">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary hover:text-primary px-2 py-1">Admin Login</Link>
              )}

            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
