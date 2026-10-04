import { useCallback, useEffect, useState } from 'react';
import Card, { CardContent, CardHeader } from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { Link } from 'react-router-dom';
import { apiRequest, configuredDropId } from '../../api/api';

const AdminOverview = () => {
  const [dropId, setDropId] = useState(localStorage.getItem('fairDropDropId') || configuredDropId);
  const [metrics, setMetrics] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const loadMetrics = useCallback(async () => {
    if (!dropId) return;
    try {
      setMetrics(await apiRequest(`/allocations/metrics/${dropId}/`));
      setMessage('');
    } catch (error) {
      setMessage(error.message);
      setMetrics(null);
    }
  }, [dropId]);

  useEffect(() => { loadMetrics(); }, [loadMetrics]);

  const runFairAllocation = async () => {
    setBusy(true);
    setMessage('');
    try {
      const result = await apiRequest(`/allocations/fair/${dropId}/`, { method: 'POST', body: {} });
      setMessage(`Fair allocation completed: ${result.allocated_count} seats assigned.`);
      await loadMetrics();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const waitingCount = metrics ? Math.max(0, metrics.total_entries - metrics.allocated_entries) : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.25rem 0' }}>Admin overview</h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Review current drop metrics and start allocation after registration closes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/simulation">
            <Button variant="primary" size="sm" icon={<Icon name="play" size={16} />}>
              Launch Simulator
            </Button>
          </Link>
          <Link to="/admin/reports">
            <Button variant="secondary" size="sm" icon={<Icon name="activity" size={16} />}>
              Allocation metrics
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader title="Fair Drop controls" action={metrics && <Badge variant="success">Drop #{metrics.drop_id}</Badge>} />
        <CardContent>
          <div style={{ display: 'flex', alignItems: 'end', gap: '0.75rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'grid', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600 }}>Drop ID
              <input type="number" min="1" value={dropId} onChange={(event) => setDropId(event.target.value)} style={{ padding: '0.65rem 0.8rem' }} />
            </label>
            <Button variant="secondary" size="sm" onClick={loadMetrics}>Refresh metrics</Button>
            <Button variant="primary" size="sm" loading={busy} onClick={runFairAllocation}>Run Fair Allocation</Button>
          </div>
          {message && <p role="status" style={{ margin: '0.75rem 0 0', color: metrics ? 'var(--color-success)' : '#b91c1c', fontSize: '0.85rem' }}>{message}</p>}
        </CardContent>
      </Card>

      {/* Top 4 Metric KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <Card style={{ borderTop: '4px solid var(--color-primary)' }}>
          <CardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Total entries</span>
              <Icon name="user" size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 800 }}>{metrics ? metrics.total_entries.toLocaleString() : '—'}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
              <span>Actual entries</span>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '4px solid var(--color-success)' }}>
          <CardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Allocated entries</span>
              <Icon name="shield-check" size={18} style={{ color: 'var(--color-success)' }} />
            </div>
            <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 800 }}>{metrics ? metrics.allocated_entries.toLocaleString() : '—'}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
              <span>Backend metric</span>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '4px solid var(--color-purple)' }}>
          <CardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Not allocated</span>
              <Icon name="clock" size={18} style={{ color: 'var(--color-purple)' }} />
            </div>
            <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 800, color: 'var(--color-purple)' }}>{metrics ? waitingCount.toLocaleString() : '—'}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
              <span>Entries without an allocation</span>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '4px solid var(--color-warning)' }}>
          <CardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Allocation rate</span>
              <Icon name="alert-circle" size={18} style={{ color: 'var(--color-warning)' }} />
            </div>
            <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 800, color: 'var(--color-warning)' }}>{metrics ? `${metrics.allocation_rate}%` : '—'}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
              <span>Backend metric</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Allocation Progress & Live Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.75rem' }}>
        
        {/* Allocation Progress Card */}
        <Card>
          <CardHeader
            title="Allocation outcome"
            action={<Badge variant="secondary">DROP METRICS</Badge>}
          />
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600 }}>Allocated entries</span>
                  <span style={{ fontWeight: 800, color: 'var(--color-success)' }}>{metrics ? `${metrics.allocated_entries.toLocaleString()} / ${metrics.total_entries.toLocaleString()}` : '—'}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${metrics?.allocation_rate || 0}%`, height: '100%', backgroundColor: 'var(--color-success)', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600 }}>Entries not allocated</span>
                  <span style={{ fontWeight: 800, color: 'var(--color-warning)' }}>{metrics ? waitingCount.toLocaleString() : '—'}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${metrics ? Math.max(0, 100 - metrics.allocation_rate) : 0}%`, height: '100%', backgroundColor: 'var(--color-warning)', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--color-background)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontWeight: 700 }}>TOTAL ENTRIES</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>{metrics ? metrics.total_entries.toLocaleString() : '—'}</div>
                </div>
                <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }}></div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontWeight: 700 }}>COMPLETION</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-success)' }}>{metrics ? `${metrics.allocation_rate}%` : '—'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Realtime Watchdog Stream */}
        <Card>
          <CardHeader
            title="Allocation safeguards"
            action={<span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>BACKEND BEHAVIOR</span>}
          />
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)', marginTop: '6px' }}></div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.85rem' }}>Duplicate entry protection</strong>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>The backend permits one entry per user per drop.</p>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>8m ago</span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', marginTop: '6px' }}></div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.85rem' }}>Request throttling</strong>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Entry requests are limited to five per minute per user.</p>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>42m ago</span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-warning)', marginTop: '6px' }}></div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.85rem' }}>Concurrency handling</strong>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Allocation uses a transaction and row locking for seat assignment.</p>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>2h ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};

export default AdminOverview;
