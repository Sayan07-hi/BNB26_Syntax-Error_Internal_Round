import { useCallback, useEffect, useState } from 'react';
import Card, { CardContent, CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { apiRequest, configuredDropId } from '../api/api';
import './TransparencyAnalytics.css';

export default function TransparencyAnalytics() {
  const [dropId, setDropId] = useState(localStorage.getItem('fairDropDropId') || configuredDropId);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    if (!dropId) { setError('Set a drop ID to load metrics.'); return; }
    setLoading(true); setError('');
    try { setMetrics(await apiRequest(`/allocations/metrics/${dropId}/`)); }
    catch (requestError) { setMetrics(null); setError(requestError.message); }
    finally { setLoading(false); }
  }, [dropId]);
  useEffect(() => { load(); }, [load]);
  const metricsList = [
    ['Total entries', metrics?.total_entries],
    ['Allocated entries', metrics?.allocated_entries],
    ['Allocation rate', metrics ? `${metrics.allocation_rate}%` : null],
  ];
  return <main className="transparency-page animate-fade-in" style={{ display: 'grid', gap: '1.5rem' }}>
    <header><Badge variant="primary">BACKEND METRICS</Badge><h1>Allocation transparency</h1><p>Aggregate outcomes returned by the Fair Drop metrics endpoint.</p></header>
    <Card><CardHeader title="Select a drop"/><CardContent><div style={{ display: 'flex', gap: '.75rem', alignItems: 'end', flexWrap: 'wrap' }}><label style={{ display: 'grid', gap: '.35rem' }}>Drop ID<input type="number" min="1" value={dropId} onChange={(event)=>setDropId(event.target.value)} /></label><Button variant="primary" onClick={load} loading={loading}>Refresh metrics</Button></div>{error&&<p role="alert">{error}</p>}</CardContent></Card>
    <div className="kpi-grid">{metricsList.map(([label,value])=><Card className="kpi-card" key={label}><CardContent><div className="kpi-label">{label}</div><div className="kpi-value">{value === undefined || value === null ? '—' : Number.isFinite(value) ? value.toLocaleString() : value}</div></CardContent></Card>)}</div>
    <Card><CardHeader title="What these numbers mean"/><CardContent><p>Total entries counts recorded registrations for this drop. Allocated entries counts entries with an assigned seat. Allocation rate is the backend-reported share allocated.</p><p>The current API does not expose demographic parity, geographic distribution, queue wait times, payment status, or cryptographic proofs. Metrics access requires an administrator account.</p></CardContent></Card>
  </main>;
}
