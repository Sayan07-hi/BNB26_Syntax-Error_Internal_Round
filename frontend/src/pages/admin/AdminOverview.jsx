import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardContent, CardHeader } from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { apiRequest } from '../../api/api';

const emptyForm = { name: '', description: '', total_seats: '100', registration_start: '', registration_end: '' };
const formatDate = (value) => value ? new Date(value).toLocaleString() : '—';

export default function AdminOverview() {
  const [activeDrop, setActiveDrop] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadMetrics = useCallback(async (dropId) => {
    if (!dropId) { setMetrics(null); return; }
    try { setMetrics(await apiRequest(`/allocations/metrics/${dropId}/`)); }
    catch (error) { setMetrics(null); setMessage(error.message); }
  }, []);

  const loadActiveDrop = useCallback(async () => {
    try {
      const drop = await apiRequest('/active/', { auth: false });
      setActiveDrop(drop);
      localStorage.setItem('fairDropDropId', String(drop.id));
      await loadMetrics(drop.id);
    } catch (error) {
      setActiveDrop(null);
      setMetrics(null);
      setMessage(error.message);
    }
  }, [loadMetrics]);

  useEffect(() => { loadActiveDrop(); }, [loadActiveDrop]);

  const createDrop = async (event) => {
    event.preventDefault();
    setMessage('');
    const totalSeats = Number(form.total_seats);
    const start = new Date(form.registration_start);
    const end = new Date(form.registration_end);
    if (!Number.isInteger(totalSeats) || totalSeats <= 0) { setMessage('Total seats must be a whole number greater than zero.'); return; }
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) { setMessage('Enter valid registration opening and closing dates and times.'); return; }
    if (start >= end) { setMessage('Registration closing time must be after opening time.'); return; }

    setCreating(true);
    try {
      const drop = await apiRequest('/create/', {
        method: 'POST',
        body: {
          name: form.name.trim(),
          description: form.description.trim(),
          total_seats: totalSeats,
          registration_start: start.toISOString(),
          registration_end: end.toISOString(),
        },
      });
      setActiveDrop(drop);
      localStorage.setItem('fairDropDropId', String(drop.id));
      setForm(emptyForm);
      setMessage(`Drop #${drop.id} created. Its ID is ready for the live simulation.`);
      await loadMetrics(drop.id);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setCreating(false);
    }
  };

  const endRegistrationNow = async () => {
    if (!activeDrop || activeDrop.registration_status !== 'open') return;
    setBusy(true);
    setMessage('');
    try {
      await apiRequest('/active/end-registration/', { method: 'POST', body: {} });
      await loadActiveDrop();
      setMessage('Registration Closed');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const runFairAllocation = async () => {
    if (!activeDrop) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await apiRequest(`/allocations/fair/${activeDrop.id}/`, { method: 'POST', body: {} });
      setMessage(`Fair allocation completed: ${result.allocated_count} seats assigned.`);
      await loadActiveDrop();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const waitingCount = metrics ? Math.max(0, metrics.total_entries - metrics.allocated_entries) : 0;
  const statusLabel = { upcoming: 'Registration not open', open: 'Registration Open', closed: 'Registration Closed' }[activeDrop?.registration_status] || 'No current Drop';

  return (
    <main className="animate-fade-in" style={{ display: 'grid', gap: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div><h1 style={{ margin: '0 0 .3rem' }}>Drop control center</h1><p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Publish a registration window, monitor entries, then run randomized allocation.</p></div>
        <div style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap' }}>
          <Link to="/admin/simulation"><Button variant="primary" size="sm" icon={<Icon name="play" size={16} />}>Run live simulation</Button></Link>
          <Link to="/admin/reports"><Button variant="secondary" size="sm" icon={<Icon name="activity" size={16} />}>Allocation metrics</Button></Link>
        </div>
      </header>

      <Card>
        <CardHeader title="Create a Drop" action={<Badge variant="secondary">STAFF ONLY</Badge>} />
        <CardContent>
          <form onSubmit={createDrop} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: '1rem' }}>
            <label style={{ display: 'grid', gap: '.35rem' }}>Drop / event name<input required maxLength={200} value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} /></label>
            <label style={{ display: 'grid', gap: '.35rem' }}>Total seats<input required type="number" min="1" step="1" value={form.total_seats} onChange={(e)=>setForm({...form,total_seats:e.target.value})} /></label>
            <label style={{ display: 'grid', gap: '.35rem', gridColumn: '1 / -1' }}>Description<textarea required rows="2" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} /></label>
            <label style={{ display: 'grid', gap: '.35rem' }}>Registration opens<input required type="datetime-local" value={form.registration_start} onChange={(e)=>setForm({...form,registration_start:e.target.value})} /></label>
            <label style={{ display: 'grid', gap: '.35rem' }}>Registration closes<input required type="datetime-local" value={form.registration_end} onChange={(e)=>setForm({...form,registration_end:e.target.value})} /></label>
            <div style={{ gridColumn: '1 / -1' }}><Button type="submit" variant="primary" loading={creating}>Create Drop</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Current published Drop" action={activeDrop && <Badge variant={activeDrop.registration_status === 'open' ? 'success' : activeDrop.registration_status === 'upcoming' ? 'warning' : 'secondary'}>{statusLabel}</Badge>} />
        <CardContent>
          {!activeDrop ? <p>{message || 'No active Drop has been published.'}</p> : <>
            <h2 style={{ marginTop: 0 }}>{activeDrop.name} <span style={{ color: 'var(--color-text-tertiary)', fontSize: '.9rem' }}>#{activeDrop.id}</span></h2>
            <p>{activeDrop.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1rem' }}>
              <div><strong>Registration opens</strong><div>{formatDate(activeDrop.registration_start)}</div></div>
              <div><strong>Registration closes</strong><div>{formatDate(activeDrop.registration_end)}</div></div>
              <div><strong>Total seats</strong><div>{activeDrop.total_seats}</div></div>
              <div><strong>Total entries</strong><div>{metrics?.total_entries ?? activeDrop.total_entries}</div></div>
              <div><strong>Seats remaining</strong><div>{Math.max(0, activeDrop.total_seats - (metrics?.allocated_entries ?? activeDrop.allocated_entries))} / {activeDrop.total_seats}</div></div>
              <div><strong>Allocation status</strong><div>{activeDrop.allocation_status === 'complete' ? 'Complete' : activeDrop.allocation_status === 'started' ? 'In progress' : 'Not started'}</div></div>
            </div>
            <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <Button variant="secondary" size="sm" onClick={loadActiveDrop}>Refresh Drop &amp; metrics</Button>
              <Button variant="outline" size="sm" loading={busy} disabled={activeDrop.registration_status !== 'open'} onClick={endRegistrationNow}>End Registration Now</Button>
              <Button variant="primary" size="sm" loading={busy} disabled={activeDrop.registration_status !== 'closed' || activeDrop.allocation_status !== 'not_started'} onClick={runFairAllocation}>Run Fair Allocation</Button>
              <Link to="/admin/simulation"><Button variant="outline" size="sm">Run simulation</Button></Link>
            </div>
          </>}
          {message && activeDrop && <p role="status" style={{ color: message.toLowerCase().includes('completed') || message.toLowerCase().includes('created') ? 'var(--color-success)' : '#b91c1c' }}>{message}</p>}
        </CardContent>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1rem' }}>
        {[['Total entries',metrics?.total_entries],['Allocated entries',metrics?.allocated_entries],['Remaining entries',waitingCount],['Allocation rate',metrics ? `${metrics.allocation_rate}%` : null]].map(([label,value])=><Card key={label}><CardContent><span style={{ color: 'var(--color-text-tertiary)', fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{label}</span><h2 style={{ margin: '.4rem 0 0' }}>{value === undefined || value === null ? '—' : typeof value === 'number' ? value.toLocaleString() : value}</h2></CardContent></Card>)}
      </div>
    </main>
  );
}
