import { Link } from 'react-router-dom';
import Card, { CardContent, CardHeader } from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
const AdminPlaceholder = ({ title }) => <main className="animate-fade-in" style={{ display: 'grid', gap: '1.25rem' }}><Badge variant="secondary">NOT CONNECTED</Badge><h1>{title}</h1><Card><CardHeader title="Backend support"/><CardContent><p>This section is retained in the interface, but the current backend does not provide data or actions for it. The connected admin features are drop metrics and the fair allocation action.</p><Link to="/admin"><Button variant="primary">Return to admin overview</Button></Link></CardContent></Card></main>;
export default AdminPlaceholder;
