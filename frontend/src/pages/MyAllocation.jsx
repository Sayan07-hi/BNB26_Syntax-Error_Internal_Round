import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardContent, CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { apiRequest } from '../api/api';

const MyAllocation = () => {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);
  const entryId = localStorage.getItem('fairDropEntryId');

  useEffect(() => {
    let active = true;
    apiRequest('/allocations/mine/')
      .then((entries) => {
        if (!active) return;
        const selected = entries.find((item) => String(item.entry_id) === entryId) || entries[0] || null;
        setEntry(selected);
      })
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [entryId, refreshCount]);

  const allocated = Boolean(entry?.allocation);
  const allocationComplete = Boolean(entry?.allocation_complete);
  const statusLabel = allocated ? 'Allocated' : allocationComplete ? 'Not allocated' : 'Awaiting allocation';

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <Link to="/dashboard" style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem', fontWeight: 600 }}>← Back to Dashboard</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '0.75rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.25rem 0' }}>Allocation &amp; Claim Hub</h1>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Live status from the Fair Drop backend.</p>
          </div>
          <Badge variant={allocated ? 'success' : allocationComplete ? 'secondary' : 'warning'} dot>{loading ? 'Loading status' : statusLabel}</Badge>
        </div>
      </div>

      <Card style={{ borderTop: `4px solid ${allocated ? 'var(--color-success)' : 'var(--color-primary)'}` }}>
        <CardHeader title={allocated || allocationComplete ? 'Allocation Result' : 'Queue Status'} />
        <CardContent style={{ padding: '2rem' }}>
          {loading ? <p>Loading your allocation status…</p> : error ? (
            <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>
          ) : !entry ? (
            <div>
              <p>No drop entry was found for this account. Join a drop from your dashboard to continue.</p>
              <Link to="/dashboard"><Button variant="primary">Go to Dashboard</Button></Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div><span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8rem' }}>Drop</span><div style={{ fontWeight: 700 }}>{entry.drop_name} (#{entry.drop_id})</div></div>
              <div><span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8rem' }}>Entry ID</span><div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{entry.entry_id}</div></div>
              <div><span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8rem' }}>Result</span><div style={{ fontWeight: 700 }}>{allocated ? `Seat #${entry.allocation.seat_number}` : allocationComplete ? 'No seat was available in this allocation.' : 'Awaiting allocation'}</div></div>
              {allocated && <div><span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8rem' }}>Allocated at</span><div style={{ fontWeight: 600 }}>{new Date(entry.allocation.allocated_at).toLocaleString()}</div></div>}
              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                <Button variant="secondary" size="sm" onClick={() => setRefreshCount((count) => count + 1)}>Refresh status</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAllocation;
