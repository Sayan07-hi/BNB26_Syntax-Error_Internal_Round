import { Link } from 'react-router-dom';
import Icon from './Icon';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-badge">
              <Icon name="shield-check" size={18} />
            </div>
            <span className="footer-brand-name">Fair-Drop</span>
          </div>
          <p className="footer-tagline">
            A registration and randomized allocation project for high-demand online drops.
          </p>
          <div className="footer-status-indicator">
            <span className="footer-status-dot"></span>
            <span className="footer-status-text">Web / App PS 3 · Fair Drop</span>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>Protocol</h4>
            <ul>
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/transparency">Transparency Analytics</Link></li>
              <li><Link to="/about">Mission & Integrity</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Participant</h4>
            <ul>
              <li><Link to="/allocations">Allocation Controls</Link></li>
              <li><Link to="/eligibility">Entry Requirements</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/verification">Entry Validation</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Assistance & Portal</h4>
            <ul>
              <li><Link to="/faq">Frequently Asked Questions</Link></li>
              <li><Link to="/contact">Support Center</Link></li>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/admin" className="admin-footer-link">Admin ↗</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="container footer-bottom-inner">
          <p>&copy; {new Date().getFullYear()} Fair Drop</p>
          <div className="footer-meta-links">
            <span className="privacy-pill">Registration & allocation demo</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
