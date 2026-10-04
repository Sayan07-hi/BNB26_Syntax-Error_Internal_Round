import { useState } from 'react';
import Card, { CardHeader, CardContent } from '../components/Card';
import Button from '../components/Button';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', topic: 'Verification Issue', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Please enter your name and email address.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Contact Support</h1>
      <p style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--color-text-secondary)' }}>
        Use this page to draft feedback about the demo. The form is local and does not send a message.
      </p>

      {submitted ? (
        <Card style={{ borderTop: '4px solid var(--color-success)' }}>
          <CardContent style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dcfce7', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              ✓
            </div>
            <h2 style={{ marginBottom: '0.75rem' }}>Draft saved on this page</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Thanks, <strong>{formData.name}</strong>. This is only a local confirmation; no ticket was created and no message was sent.
            </p>
            <Button variant="outline" onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', topic: 'Verification Issue', message: '' }); }}>
              Submit Another Inquiry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader title="Submit a Request" />
          <CardContent>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} 
                  placeholder="Jane Doe" 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} 
                  placeholder="jane@example.com" 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Topic</label>
                <select 
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
                >
                  <option>Verification Issue</option>
                  <option>Missing Allocation</option>
                  <option>Account Recovery</option>
                  <option>General Inquiry</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Message</label>
                <textarea 
                  rows="5" 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit' }} 
                  placeholder="Describe your issue..."
                ></textarea>
              </div>
              <Button variant="primary" fullWidth type="submit">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      )}
      
      <div style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
        <p style={{ margin: 0 }}>This demo has no connected support service.</p>
      </div>
    </div>
  );
};

export default Contact;
