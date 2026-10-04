import { useState } from 'react';
import { NavLink, Outlet, Link, Navigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { isAdminUser } from '../api/api';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!sessionStorage.getItem('fairDropAccessToken')) return <Navigate to="/login" replace />;
  if (!isAdminUser()) return <Navigate to="/dashboard" replace />;

  return (
    <div className="admin-layout">
      {/* Sidebar Backdrop on Mobile */}
      {isSidebarOpen && (
        <div 
          className="admin-sidebar-backdrop" 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo-link">
            <div className="admin-logo-badge">
              <Icon name="shield-check" size={18} />
            </div>
            <div>
              <div className="admin-logo-title">Fair-Drop</div>
              <div className="admin-logo-sub">AUTHORITY PORTAL</div>
            </div>
          </Link>
        </div>
        
        <nav className="admin-nav" aria-label="Admin Portal Navigation">
          <NavLink to="/admin" end className={({isActive}) => isActive ? "admin-nav-link active" : "admin-nav-link"} onClick={() => setIsSidebarOpen(false)}>
            <Icon name="bar-chart" size={18} />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/admin/applications" className={({isActive}) => isActive ? "admin-nav-link active" : "admin-nav-link"} onClick={() => setIsSidebarOpen(false)}>
            <Icon name="user" size={18} />
            <span>Applications</span>
          </NavLink>
          <NavLink to="/admin/verification" className={({isActive}) => isActive ? "admin-nav-link active" : "admin-nav-link"} onClick={() => setIsSidebarOpen(false)}>
            <Icon name="shield-check" size={18} />
            <span>Verification</span>
          </NavLink>
          <NavLink to="/admin/allocation" className={({isActive}) => isActive ? "admin-nav-link active" : "admin-nav-link"} onClick={() => setIsSidebarOpen(false)}>
            <Icon name="layers" size={18} />
            <span>Allocation</span>
          </NavLink>
          <NavLink to="/admin/queue" className={({isActive}) => isActive ? "admin-nav-link active" : "admin-nav-link"} onClick={() => setIsSidebarOpen(false)}>
            <Icon name="clock" size={18} />
            <span>Queue Monitor</span>
          </NavLink>
          <NavLink to="/admin/simulation" className={({isActive}) => isActive ? "admin-nav-link active" : "admin-nav-link"} onClick={() => setIsSidebarOpen(false)}>
            <Icon name="play" size={18} />
            <span>Live Simulator</span>
          </NavLink>
          <NavLink to="/admin/reports" className={({isActive}) => isActive ? "admin-nav-link active" : "admin-nav-link"} onClick={() => setIsSidebarOpen(false)}>
            <Icon name="activity" size={18} />
            <span>Transparency Audit</span>
          </NavLink>
          <NavLink to="/admin/system" className={({isActive}) => isActive ? "admin-nav-link active" : "admin-nav-link"} onClick={() => setIsSidebarOpen(false)}>
            <Icon name="database" size={18} />
            <span>System Status</span>
          </NavLink>
          <NavLink to="/admin/settings" className={({isActive}) => isActive ? "admin-nav-link active" : "admin-nav-link"} onClick={() => setIsSidebarOpen(false)}>
            <Icon name="lock" size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>
        
        {/* User Card in Sidebar */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">AD</div>
            <div>
              <p className="admin-user-name">Fair Drop Admin</p>
              <p className="admin-user-role">Drop operations</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main Admin Content Canvas */}
      <main className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="admin-mobile-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Navigation Sidebar"
            >
              ☰
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="admin-system-dot"></span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                System Secure & Nominal
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/">
              <button className="btn btn-secondary btn-sm">
                ← Exit to Public Site
              </button>
            </Link>
          </div>
        </header>
        
        <div className="admin-content animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
