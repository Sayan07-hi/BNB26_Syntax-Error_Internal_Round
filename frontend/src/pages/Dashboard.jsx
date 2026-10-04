import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { apiRequest } from '../api/api';

const formatDate = (value) => value ? new Date(value).toLocaleString() : '—';

const registrationLabel = (drop) => ({
  upcoming: `Registration opens ${formatDate(drop.registration_start)}`,
  open: 'Registration Open',
  closed: 'Registration Closed',
}[drop.registration_status] || 'Registration status unavailable');

export default function Dashboard() {
  const navigate = useNavigate();
  const [drops, setDrops] = useState([]);
  const [entries, setEntries] = useState([]);
  const [dropLoading, setDropLoading] = useState(true);
  const [entryLoading, setEntryLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [dropError, setDropError] = useState('');
  const [message, setMessage] = useState('');
  const [joiningDropId, setJoiningDropId] = useState(null);

  useEffect(() => {
    let active = true;
    apiRequest('/list/', { auth: false })
      .then((items) => active && setDrops(items))
      .catch((error) => active && setDropError(error.message))
      .finally(() => active && setDropLoading(false));

    if (sessionStorage.getItem('fairDropAccessToken')) {
      apiRequest('/allocations/mine/')
        .then((items) => active && setEntries(items))
        .catch((error) => active && setMessage(error.message))
        .finally(() => active && setEntryLoading(false));
    } else {
      setEntryLoading(false);
    }
    return () => { active = false; };
  }, [refreshCount]);

  async function join(drop) {
    if (joiningDropId !== null || drop.registration_status !== 'open') return;
    setJoiningDropId(drop.id);
    setMessage('');
    try {
      const result = await apiRequest('/entries/', {
        method: 'POST',
        body: { drop: drop.id },
      });
      localStorage.setItem('fairDropEntryId', String(result.id));
      navigate('/my-allocation');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setJoiningDropId(null);
    }
  }

  function viewEntry(entry) {
    localStorage.setItem('fairDropEntryId', String(entry.entry_id));
    navigate('/my-allocation');
  }

  return (
    <main className="animate-fade-in" style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gap: '1.5rem' }}>
      <header>
        <Badge variant="primary">DASHBOARD</Badge>
        <h1>Available Drops</h1>
        <p>Choose a Drop to register. Each Drop has its own registration window and allocation.</p>
      </header>

      {dropLoading ? <p role="status">Loading available Drops…</p> : dropError ? (
        <Card><CardContent><p role="alert" style={{ color: '#b91c1c' }}>{dropError}</p></CardContent></Card>
      ) : drops.length === 0 ? (
        <Card><CardContent><p role="status">No Drops are available yet.</p></CardContent></Card>
      ) : drops.map((drop) => {
        const entry = entries.find((item) => Number(item.drop_id) === Number(drop.id));
        const badgeVariant = drop.registration_status === 'open' ? 'success' : drop.registration_status === 'upcoming' ? 'warning' : 'secondary';
        return (
          <Card key={drop.id}>
            <CardHeader title={`${drop.name} (#${drop.id})`} action={<Badge variant={badgeVariant}>{registrationLabel(drop)}</Badge>} />
            <CardContent>
              {drop.description && <p>{drop.description}</p>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1rem', margin: '1rem 0' }}>
                <div><strong>Total seats</strong><div>{drop.total_seats}</div></div>
                <div><strong>Registration opens</strong><div>{formatDate(drop.registration_start)}</div></div>
                <div><strong>Registration closes</strong><div>{formatDate(drop.registration_end)}</div></div>
                <div><strong>Entries</strong><div>{drop.total_entries}</div></div>
              </div>
              {entry ? (
                <Button variant="secondary" onClick={() => viewEntry(entry)}>View your entry</Button>
              ) : drop.registration_status === 'open' ? (
                <Button variant="primary" loading={joiningDropId === drop.id} disabled={joiningDropId !== null} onClick={() => join(drop)}>Register</Button>
              ) : (
                <Button variant="outline" disabled>{drop.registration_status === 'upcoming' ? 'Registration not open' : 'Registration closed'}</Button>
              )}
            </CardContent>
          </Card>
        );
      })}

      {message && <p role="alert" style={{ color: '#b91c1c' }}>{message}</p>}
      {entryLoading && <p>Loading your entries…</p>}
      {!entryLoading && entries.length > 0 && <Card><CardHeader title="Your registrations" /><CardContent><div style={{ display: 'grid', gap: '.75rem' }}>{entries.map((entry) => <div key={entry.entry_id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}><span><strong>{entry.drop_name}</strong> · {entry.allocation ? `Allocated · Seat #${entry.allocation.seat_number}` : entry.allocation_complete ? 'Not allocated' : 'Awaiting allocation'}</span><Button variant="outline" size="sm" onClick={() => viewEntry(entry)}>View result</Button></div>)}</div></CardContent></Card>}

      <Card>
        <CardHeader title="Allocation process" />
        <CardContent>
          <p>After registration closes, an administrator can run randomized allocation. Your seat is not guaranteed until an allocation result is recorded.</p>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <Link to="/allocations"><Button variant="outline">Allocation controls</Button></Link>
            <Link to="/transparency"><Button variant="secondary">View aggregate metrics</Button></Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
