import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo-icon">✓</span>
          <span className="navbar-logo-text">TaskSync</span>
        </Link>

        {user && (
          <div className="navbar-menu">
            <div className="navbar-links">
              <Link
                to="/"
                className={`navbar-link-item ${location.pathname === '/' ? 'active' : ''}`}
              >
                My Tasks
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`navbar-link-item ${location.pathname === '/admin' ? 'active' : ''}`}
                >
                  Admin Panel
                </Link>
              )}
            </div>

            <div className="navbar-user-info">
              <span className="navbar-welcome">Welcome, </span>
              <span className="navbar-username">{user.name}</span>
              <span className={`role-badge role-${user.role}`}>
                {user.role}
              </span>
            </div>
            
            <button type="button" className="btn btn-outline btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
