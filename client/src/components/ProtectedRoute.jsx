import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#1A1714',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: '0.2em', color: 'rgba(245,240,232,0.4)', textTransform: 'uppercase', fontSize: '0.8rem' }}>
          Loading...
        </p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/members" replace />;
  return children;
};

export default ProtectedRoute;
