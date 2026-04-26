import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location]);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => { logout(); navigate('/'); };

  const links = (
    <>
      <Link to="/"           className={`navbar-link ${isActive('/')}`}>Home</Link>
      <Link to="/membership" className={`navbar-link ${isActive('/membership')}`}>Membership</Link>
      <a href="/#causes"     className="navbar-link">Causes</a>
      {user && <Link to="/members" className={`navbar-link ${isActive('/members')}`}>Members</Link>}
      {user && <Link to="/settings" className={`navbar-link ${isActive('/settings')}`}>Settings</Link>}
      {user?.role === 'admin' && <Link to="/admin" className={`navbar-link ${isActive('/admin')}`}>Admin</Link>}
    </>
  );

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="navbar-logo">ALEX STERLING</Link>

        {/* Desktop links */}
        <div className="navbar-links">
          {links}
          {user ? (
            <button className="navbar-btn navbar-btn--signout" onClick={handleLogout}>Sign Out</button>
          ) : (
            <button className="navbar-btn navbar-btn--login" onClick={() => navigate('/login')}>Member Login</button>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`navbar-hamburger ${drawerOpen ? 'open' : ''}`}
          onClick={() => setDrawerOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`navbar-drawer ${drawerOpen ? 'open' : ''}`}>
        {links}
        {user ? (
          <button className="navbar-btn navbar-btn--signout" onClick={handleLogout}>Sign Out</button>
        ) : (
          <button className="navbar-btn navbar-btn--login" onClick={() => navigate('/login')}>Member Login</button>
        )}
      </div>
    </>
  );
}