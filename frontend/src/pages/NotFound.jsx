import { Link } from 'react-router-dom';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Badge from '../components/Badge';

const NotFound = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh', padding: '1rem' }}>
      <Card style={{ maxWidth: '520px', width: '100%', textAlign: 'center', borderTop: '4px solid var(--color-primary)' }}>
        <CardContent style={{ padding: '3.5rem 2rem' }}>
          <Badge variant="secondary" style={{ marginBottom: '1rem' }}>ERROR 404 • ROUTE NOT FOUND</Badge>
          <div style={{ fontSize: '4.5rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1, letterSpacing: '-0.04em', marginBottom: '0.75rem' }}>
            404
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Page not found</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            This Fair Drop page could not be found.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/">
              <Button variant="primary" icon={<Icon name="arrow-right" size={16} />}>
                Return to Home
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="secondary">
                My Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
