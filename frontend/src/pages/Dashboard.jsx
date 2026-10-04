import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { apiRequest } from '../api/api';

const formatDate = (value) => value ? new Date(value).toLocaleString() : '—';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeDrop, setActiveDrop] = useState(null);
  const [entries, setEntries] = useState([]);
  const [dropLoading, setDropLoading] = useState(true);
  const [entryLoading, setEntryLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [dropError, setDropError] = useState('');
  const [message, setMessage] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest('/active/', { auth: false })
      .then((drop) => {
        if (!active) return;
        setActiveDrop(drop);
        localStorage.setItem('fairDropDropId', String(drop.id));
      })
      .catch((error) => active && setDropError(error.message))
      .finally(() => active && setDropLoading(false));

    if (localStorage.getItem('fairDropAccessToken')) {
      apiRequest('/allocations/mine/')
        .then((items) => active && setEntries(items))
        .catch((error) => active && setMessage(error.message))
        .finally(() => active && setEntryLoading(false));
    } else {
      setEntryLoading(false);
    }
    return () => { active = false; };
  }, [refreshCount]);

  const allocationComplete = activeDrop?.allocation_status === 'complete';

  const entry = activeDrop
    ? entries.find((item) => Number(item.drop_id) === Number(activeDrop.id))
    : null;

  async function join() {
    if (!activeDrop) return;
    setJoining(true);
    setMessage('');
    try {
      const result = await apiRequest('/entries/', {
        method: 'POST',
        body: { drop: activeDrop.id },
      });
      localStorage.setItem('fairDropEntryId', String(result.id));
      localStorage.setItem('fairDropDropId', String(activeDrop.id));
      navigate('/my-allocation');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setJoining(false);
    }
  }

  const registrationLabel = {
    upcoming: `Registration opens ${formatDate(activeDrop?.registration_start)}`,
    open: 'Registration Open',
    closed: 'Registration Closed',
  }[activeDrop?.registration_status] || 'Registration status unavailable';

  return (
    <main className="animate-fade-in" style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gap: '1.5rem' }}>
      <header>
        <Badge variant="primary">DASHBOARD</Badge>
        <h1>Current Drop</h1>
        <p>Participate in the Drop published by the FairDrop administrator.</p>
      </header>

      <Card>
        <CardHeader
          title={dropLoading ? 'Loading published Drop…' : activeDrop?.name || 'No active Drop'}
          action={activeDrop && <Badge variant={activeDrop.registration_status === 'open' ? 'success' : activeDrop.registration_status === 'upcoming' ? 'warning' : 'secondary'}>{registrationLabel}</Badge>}
        />
        <CardContent>
          {dropLoading ? <p>Loading Drop details…</p> : !activeDrop ? (
            <p role="status">{dropError || 'No active Drop has been published yet.'}</p>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button variant="outline" size="sm" onClick={() => setRefreshCount((count) => count + 1)}>Refresh Drop status</Button></div>
              {activeDrop.description && <p>{activeDrop.description}</p>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1rem', margin: '1rem 0' }}>
                <div><strong>Drop ID</strong><div>#{activeDrop.id}</div></div>
                <div><strong>Registration opens</strong><div>{formatDate(activeDrop.registration_start)}</div></div>
                <div><strong>Registration closes</strong><div>{formatDate(activeDrop.registration_end)}</div></div>
                <div><strong>Seats remaining</strong><div>{activeDrop.remaining_seats} / {activeDrop.total_seats}</div></div>
                <div><strong>Total entries</strong><div>{activeDrop.total_entries}</div></div>
                <div><strong>Allocation</strong><div>{activeDrop.allocation_status === 'complete' ? 'Complete' : activeDrop.allocation_status === 'started' ? 'In progress' : 'Not started'}</div></div>
              </div>
              {activeDrop.registration_status === 'open' && !entry && (
                <Button type="button" variant="primary" loading={joining} onClick={join}>Join Drop</Button>
              )}
              {activeDrop.registration_status === 'upcoming' && <p>Entry submission will be available when registration opens.</p>}
              {activeDrop.registration_status === 'closed' && <p>This Drop is no longer accepting entries.</p>}
              {message && <p role="alert" style={{ color: '#b91c1c' }}>{message}</p>}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Your entry" action={entry && <Badge variant={entry.allocation ? 'success' : allocationComplete ? 'secondary' : 'warning'}>{entry.allocation ? 'ALLOCATED' : allocationComplete ? 'NOT ALLOCATED' : 'AWAITING ALLOCATION'}</Badge>} />
        <CardContent>
          {entryLoading ? <p>Loading your entry…</p> : entry ? (
            <>
              <p>Entry reference: <strong>{entry.entry_id}</strong></p>
              <p>{entry.allocation ? `Assigned seat #${entry.allocation.seat_number}` : allocationComplete ? 'No seat was available in this allocation.' : 'Your entry has not received an allocation result yet.'}</p>
              <Button variant="outline" onClick={() => navigate('/my-allocation')}>View allocation result</Button>
            </>
          ) : <p>{activeDrop ? 'You have not entered this Drop yet.' : 'Your entry for the current Drop will appear here.'}</p>}
        </CardContent>
      </Card>

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
