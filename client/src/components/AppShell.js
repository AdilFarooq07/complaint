import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AppShell.css';

const BrandIcon = () => (
  <span className="us-brandIcon" aria-hidden="true">
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="14" rx="4" fill="white" fillOpacity="0.12" />
      <path
        d="M6.2 7.4h7.6c.66 0 1.2.54 1.2 1.2v3.8c0 .66-.54 1.2-1.2 1.2H8.6l-2.4 2v-2H6.2c-.66 0-1.2-.54-1.2-1.2V8.6c0-.66.54-1.2 1.2-1.2Z"
        stroke="white"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M13.73 21a2 2 0 01-3.46 0"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const UserPill = ({ name, role }) => (
  <div className="us-userPill">
    <span className="us-avatar" aria-hidden="true">
      {String(name || 'U').trim().slice(0, 1).toUpperCase()}
    </span>
    <div className="us-userText">
      <div className="us-userName">{name || 'User'}</div>
      <div className="us-userRole">({role || 'student'})</div>
    </div>
  </div>
);

export default function AppShell({ active, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="us-shell">
      <header className="us-topbar">
        <div className="us-topbarInner">
          <div className="us-brand" role="button" tabIndex={0} onClick={() => navigate('/dashboard')}>
            <BrandIcon />
            <div className="us-brandText">
              <div className="us-brandName">UniVoice</div>
              <div className="us-brandSub">Complaint Management</div>
            </div>
          </div>

          <nav className="us-nav" aria-label="Primary">
            <NavLink className={({ isActive }) => `us-navItem ${isActive ? 'isActive' : ''}`} to="/dashboard">
              Dashboard
            </NavLink>
            <NavLink className={({ isActive }) => `us-navItem ${isActive ? 'isActive' : ''}`} to="/complaints">
              Complaints
            </NavLink>
            <button className="us-navNew" type="button" onClick={() => navigate('/complaints/create')}>
              + New
            </button>
          </nav>

          <div className="us-actions">
            <button className="us-iconBtn" type="button" aria-label="Notifications">
              <BellIcon />
            </button>
            <UserPill name={user?.name || 'User'} role={user?.role} />
            <button className="us-logoutBtn" type="button" onClick={logout} aria-label="Logout">
              ↪
            </button>
          </div>
        </div>
      </header>

      <main className={`us-main ${active ? `is-${active}` : ''}`}>{children}</main>
    </div>
  );
}

