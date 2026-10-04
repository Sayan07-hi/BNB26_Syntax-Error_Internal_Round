import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';
import Icon from './Icon';
import { clearTokens, isAdminUser } from '../api/api';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(sessionStorage.getItem('fairDropAccessToken')));
  const [isAdmin, setIsAdmin] = useState(() => isAdminUser());
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const syncAuthentication = () => {
      setIsAuthenticated(Boolean(sessionStorage.getItem('fairDropAccessToken')));
      setIsAdmin(isAdminUser());
    };
    window.addEventListener('fairdrop-auth-change', syncAuthentication);
    window.addEventListener('storage', syncAuthentication);
    return () => {
      window.removeEventListener('fairdrop-auth-change', syncAuthentication);
      window.removeEventListener('storage', syncAuthentication);
    };
  }, []);

  const handleLogout = () => {
    clearTokens();
    navigate('/login');
  };

  // Track scroll for enhanced glass shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo" aria-label="Fair-Drop Home">
          <div className="logo-badge">
            <Icon name="shield-check" size={20} />
          </div>
          <span className="logo-text">Fair-Drop</span>
          <span className="logo-tag">PROTOCOL</span>
        </Link>
        
        {/* Desktop Menu */}
        <nav className="navbar-menu desktop-only" aria-label="Main Navigation">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            Dashboard
          </NavLink>
          <NavLink to="/how-it-works" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            How It Works
          </NavLink>
          <NavLink to="/eligibility" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            Eligibility
          </NavLink>
          <NavLink to="/allocations" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            Allocations
          </NavLink>
          <NavLink to="/transparency" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            Transparency
          </NavLink>
          {isAdmin && <NavLink to="/admin/simulation" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Simulation</NavLink>}
          {isAdmin && <NavLink to="/admin" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Admin</NavLink>}
          <NavLink to="/about" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            About
          </NavLink>
          
          <div className="navbar-actions">
            {isAuthenticated ? (
              <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>Register</Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-toggle" 
          onClick={toggleMenu} 
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
        >
          <span className={`hamburger ${isOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="mobile-menu animate-slide-down">
          <div className="container mobile-menu-inner">
            <NavLink to="/dashboard" className="mobile-nav-link">Dashboard</NavLink>
            <NavLink to="/how-it-works" className="mobile-nav-link">How It Works</NavLink>
            <NavLink to="/eligibility" className="mobile-nav-link">Eligibility</NavLink>
            <NavLink to="/allocations" className="mobile-nav-link">Allocations</NavLink>
            <NavLink to="/transparency" className="mobile-nav-link">Transparency</NavLink>
            {isAdmin && <NavLink to="/admin/simulation" className="mobile-nav-link">Simulation</NavLink>}
            {isAdmin && <NavLink to="/admin" className="mobile-nav-link">Admin Dashboard</NavLink>}
            <NavLink to="/about" className="mobile-nav-link">About</NavLink>
            
            <div className="mobile-actions">
              {isAuthenticated ? (
                <Button variant="secondary" fullWidth onClick={handleLogout}>Logout</Button>
              ) : (
                <>
                  <Button variant="secondary" fullWidth onClick={() => navigate('/login')}>Sign In</Button>
                  <Button variant="primary" fullWidth onClick={() => navigate('/register')}>Register</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
