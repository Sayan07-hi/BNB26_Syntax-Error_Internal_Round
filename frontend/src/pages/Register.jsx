import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { apiRequest, login } from '../api/api';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNext = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      setLoading(true);
      setError('');
      try {
        await apiRequest('/auth/register/', { method: 'POST', body: { email: formData.email.trim(), password: formData.password }, auth: false });
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1rem' }}>
      <Card style={{ width: '100%', maxWidth: '520px', borderTop: '4px solid var(--color-primary)' }}>
        <CardContent style={{ padding: '2.5rem' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 2px 10px rgba(37, 99, 235, 0.35)' }}>
              <Icon name="user" size={24} />
            </div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>Create your Fair Drop account</h1>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.9rem' }}>
              Step {step} of 2: {step === 1 ? 'Account details' : 'Review and create account'}
            </p>
          </div>
          
          {/* Step Progress Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
            <div style={{ height: '4px', flex: 1, backgroundColor: 'var(--color-primary)', borderRadius: '2px' }}></div>
            <div style={{ height: '4px', flex: 1, backgroundColor: step === 2 ? 'var(--color-primary)' : 'var(--color-border)', borderRadius: '2px', transition: 'background-color 0.3s' }}></div>
          </div>

          <form onSubmit={handleNext}>
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>First Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      style={{ width: '100%', padding: '0.7rem 0.85rem' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>Last Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      style={{ width: '100%', padding: '0.7rem 0.85rem' }} 
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem 0.85rem' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem 0.85rem' }}
                  />
                </div>

                <Button variant="primary" fullWidth size="lg" type="submit" style={{ marginTop: '0.5rem' }}>
                  Review account details →
                </Button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#166534' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Icon name="lock" size={16} /> Account setup
                  </div>
                  Your account uses the email address as its sign-in identifier. Registration does not include identity or eligibility verification.
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <Button variant="secondary" fullWidth type="button" onClick={() => setStep(1)}>
                    ← Back
                  </Button>
                  <Button variant="primary" fullWidth size="lg" type="submit" loading={loading}>
                    Create account
                  </Button>
                </div>
              </div>
            )}
          </form>

          {error && <p role="alert" style={{ color: '#b91c1c', fontSize: '0.85rem' }}>{error}</p>}

          <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Already registered? <Link to="/login" style={{ fontWeight: 700 }}>Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;

