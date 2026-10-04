import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';

const controls = [
  { name: 'Registration window', category: 'Entry', status: 'Enforced', detail: 'Entry creation is accepted only while the drop registration window is open.' },
  { name: 'One entry per user and drop', category: 'Duplicate protection', status: 'Enforced', detail: 'A database uniqueness constraint prevents a second entry for the same user and drop.' },
  { name: 'Per-user request limit', category: 'Traffic control', status: '5 / minute', detail: 'The entry endpoint applies a per-user request throttle.' },
  { name: 'Randomized seat assignment', category: 'Allocation', status: 'Admin action', detail: 'After registration closes, an administrator can run randomized allocation for available seats.' },
  { name: 'Concurrency and retries', category: 'Reliability', status: 'Implemented', detail: 'Allocation uses a database transaction and row locking; the individual allocation endpoint requires an idempotency key.' },
];

export default function Allocations() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const filtered = controls.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  return <main className="animate-fade-in" style={{ display: 'grid', gap: '1.5rem' }}>
    <header><Badge variant="primary">WEB / APP PS 3</Badge><h1>Allocation controls</h1><p>System behaviors currently implemented in Fair Drop. This project does not distribute funds or operate separate public programs.</p><div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}><Button variant="outline" onClick={() => navigate('/transparency')}>View backend metrics</Button><Button variant="primary" onClick={() => navigate('/simulation')}>Open traffic simulation</Button></div></header>
    <Card><CardContent><input aria-label="Search controls" placeholder="Search controls..." value={query} onChange={(event)=>setQuery(event.target.value)} style={{ width: '100%', maxWidth: 480, padding: '.7rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}/></CardContent></Card>
    <div style={{ display: 'grid', gap: '1rem' }}>{filtered.map((item)=><Card key={item.name}><CardHeader title={item.name} action={<Badge variant="success">{item.status}</Badge>}/><CardContent><div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}><p>{item.detail}</p><span style={{ color: 'var(--color-text-secondary)' }}>{item.category}</span><Button variant="outline" size="sm" onClick={()=>setSelected(item)}>Details</Button></div></CardContent></Card>)}</div>
    {selected&&<div role="dialog" aria-modal="true" aria-label={`${selected.name} details`} style={{ position: 'fixed', inset: 0, zIndex: 20, background: '#0008', display: 'grid', placeItems: 'center', padding: '1rem' }}><Card style={{ maxWidth: 520, width: '100%' }}><CardHeader title={selected.name}/><CardContent><p>{selected.detail}</p><p>Category: {selected.category}</p><Button variant="primary" onClick={()=>setSelected(null)}>Close</Button></CardContent></Card></div>}
  </main>;
}
