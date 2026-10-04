import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { login } from '../api/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh', padding: '1rem' }}>
      <Card style={{ width: '100%', maxWidth: '440px', borderTop: '4px solid var(--color-primary)' }}>
        <CardContent style={{ padding: '2.5rem' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 2px 10px rgba(37, 99, 235, 0.35)' }}>
              <Icon name="shield-check" size={24} />
            </div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Candidate Sign In</h1>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.9rem' }}>
              Sign in to register for a drop and review your allocation result.
            </p>
          </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>
                  Email Address
                </label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.9rem' }} 
                  placeholder="you@example.com" autoComplete="email" 
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Password</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset is not configured yet.'); }} style={{ fontSize: '0.75rem' }}>
                    Forgot password?
                  </a>
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.9rem' }} 
                  placeholder="••••••••••••" 
                />
              </div>
              
              <Button variant="primary" fullWidth size="lg" type="submit" loading={loading} style={{ marginTop: '0.5rem' }}>
                Sign In to Dashboard →
              </Button>
            </form>

          {error && <p role="alert" style={{ color: '#b91c1c', fontSize: '0.85rem', margin: '1rem 0 0' }}>{error}</p>}

          <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Don&apos;t have an account yet? <Link to="/register" style={{ fontWeight: 700 }}>Register here</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;



