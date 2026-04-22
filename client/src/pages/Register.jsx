import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', membershipCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.membershipCode);
      navigate('/members');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-eyebrow">Members Portal</span>
        <h1 className="auth-title">Create Account</h1>

        <div className="auth-notice">
          <p>A unique <strong>membership code</strong> is required to register. Codes are distributed at events or by invitation from the foundation.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handle}>
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <input className="auth-input" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required />
          </div>
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input className="auth-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input className="auth-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" required minLength={6} />
          </div>
          <div className="auth-field">
            <label className="auth-label">Membership Code</label>
            <input
              className="auth-input auth-input--code"
              type="text"
              value={form.membershipCode}
              onChange={e => setForm({ ...form, membershipCode: e.target.value.toUpperCase() })}
              placeholder="XXXXXXXX"
              required
            />
          </div>
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
