import Card, { CardContent, CardHeader } from '../../components/Card';
import Badge from '../../components/Badge';
import { Link } from 'react-router-dom';
export default function AdminMonitoring(){return <main className="animate-fade-in" style={{display:'grid',gap:'1.25rem'}}><Badge variant="secondary">ADMIN WORKSPACE</Badge><h1>Traffic monitoring</h1><Card><CardHeader title="Live simulation"/><CardContent><p>Run authenticated concurrent requests against the current published Drop and review the backend response and measured latency.</p><p>This screen does not receive a live event stream. Start a run from the simulation page to collect request measurements.</p><Link to="/admin/simulation">Open live simulation</Link></CardContent></Card></main>;}
