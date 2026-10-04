import { useEffect, useMemo, useRef, useState } from 'react';
import Card, { CardContent, CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Icon from '../components/Icon';
import './Simulation.css';

const RATE_LIMIT = 5;
const AVAILABLE_SEATS = 8;

const makeRequests = (scenario) => Array.from({ length: 12 }, (_, index) => ({
  id: `REQ-${String(index + 1).padStart(2, '0')}`,
  account: scenario === 'normal' ? `user-${String(index + 1).padStart(2, '0')}` : 'burst-user',
  attempt: scenario === 'normal' ? 1 : index + 1,
  status: 'Pending',
  seat: null,
}));

const STAGES = [
  { title: '1. Request arrival', description: 'Send the selected request profile to the entry endpoint.' },
  { title: '2. Intake controls', description: 'Apply the per-user limit and one-entry-per-drop constraint.' },
  { title: '3. Random allocation', description: 'Shuffle accepted entries and assign the available seats.' },
  { title: '4. Results', description: 'Review accepted entries, blocked repeats, and allocation rate.' },
];

const Simulation = () => {
  const [scenario, setScenario] = useState('normal');
  const [stage, setStage] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [requests, setRequests] = useState(() => makeRequests('normal'));
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState(['Select a request profile, then start the in-browser scenario.']);
  const timerRef = useRef(null);

  const accepted = useMemo(() => requests.filter((request) => ['Accepted', 'Allocated', 'No seat available'].includes(request.status)), [requests]);
  const duplicateCount = requests.filter((request) => request.status === 'Duplicate blocked').length;
  const limitedCount = requests.filter((request) => request.status === 'Rate limited').length;
  const allocatedCount = requests.filter((request) => request.status === 'Allocated').length;
  const allocationRate = accepted.length ? Math.round((allocatedCount / accepted.length) * 100) : 0;
  const completed = stage === STAGES.length;

  const addLog = (message) => {
    setLogs((previous) => [`${new Date().toLocaleTimeString()}  ${message}`, ...previous].slice(0, 12));
  };

  const reset = (nextScenario = scenario) => {
    clearInterval(timerRef.current);
    setRunning(false);
    setStage(0);
    setProgress(0);
    setRequests(makeRequests(nextScenario));
    setLogs(['Scenario reset. No requests were sent to Django.']);
  };

  useEffect(() => {
    if (!running) return undefined;
    timerRef.current = setInterval(() => {
      setStage((current) => {
        if (current === 0) {
          addLog(`Prepared 12 ${scenario === 'normal' ? 'distinct-user' : 'same-user burst'} POST /api/v1/entries/ requests.`);
          setProgress(20);
          return 1;
        }
        if (current === 1) {
          setRequests((previous) => previous.map((request, index) => {
            if (scenario === 'normal') return { ...request, status: 'Accepted' };
            if (index === 0) return { ...request, status: 'Accepted' };
            if (index < RATE_LIMIT) return { ...request, status: 'Duplicate blocked' };
            return { ...request, status: 'Rate limited' };
          }));
          addLog(scenario === 'normal'
            ? '12 distinct accounts pass the modeled 5/min per-user limit and uniqueness constraint.'
            : 'One entry accepted; four repeated entries hit the unique constraint; seven later requests exceed 5/min.');
          setProgress(50);
          return 2;
        }
        if (current === 2) {
          setRequests((previous) => {
            const candidates = previous.filter((request) => request.status === 'Accepted');
            for (let index = candidates.length - 1; index > 0; index -= 1) {
              const swap = Math.floor(Math.random() * (index + 1));
              [candidates[index], candidates[swap]] = [candidates[swap], candidates[index]];
            }
            const seatByRequest = new Map(candidates.map((request, index) => [request.id, index < AVAILABLE_SEATS ? index + 1 : null]));
            return previous.map((request) => {
              if (request.status !== 'Accepted') return request;
              const seat = seatByRequest.get(request.id);
              return seat ? { ...request, status: 'Allocated', seat: `Seat ${seat}` } : { ...request, status: 'No seat available' };
            });
          });
          addLog(`Shuffled accepted entries and assigned up to ${AVAILABLE_SEATS} seats.`);
          setProgress(80);
          return 3;
        }
        if (current === 3) {
          addLog(`Scenario complete: ${allocatedCount} seats assigned from ${accepted.length} distinct accepted entries.`);
          setProgress(100);
          setRunning(false);
          clearInterval(timerRef.current);
          return 4;
        }
        return current;
      });
    }, 1250 / speed);
    return () => clearInterval(timerRef.current);
  }, [running, speed, scenario, allocatedCount, accepted.length]);

  const chooseScenario = (nextScenario) => {
    if (running) return;
    setScenario(nextScenario);
    reset(nextScenario);
    setLogs([`${nextScenario === 'normal' ? 'Normal traffic' : 'Adversarial burst'} selected. This is an in-browser model.`]);
  };

  const statusClass = (status) => status.toLowerCase().replaceAll(' ', '-').replaceAll('.', '');

  return (
    <div className="simulation-page animate-fade-in">
      <div className="simulation-header">
        <div className="header-left">
          <div className="badge-row">
            <Badge variant="primary" dot>ENGINEERING DEMO</Badge>
            <span className="demo-notice-tag">BROWSER MODEL · NO API TRAFFIC</span>
          </div>
          <h1>Traffic &amp; Allocation Simulator</h1>
          <p className="header-subtitle">Compare ordinary sign-up traffic with a single-account request burst. The model mirrors the configured entry limit, duplicate-entry constraint, and randomized seat allocation; it does not load-test the server.</p>
          <div className="scenario-selector" role="group" aria-label="Traffic profile">
            <Button variant={scenario === 'normal' ? 'primary' : 'outline'} size="sm" disabled={running} onClick={() => chooseScenario('normal')}>Normal traffic</Button>
            <Button variant={scenario === 'adversarial' ? 'primary' : 'outline'} size="sm" disabled={running} onClick={() => chooseScenario('adversarial')}>Adversarial burst</Button>
          </div>
        </div>
        <div className="simulation-controls">
          {!running && !completed && <Button variant="primary" size="lg" icon={<Icon name="play" size={16} />} onClick={() => setRunning(true)}>{stage ? 'Resume' : 'Start scenario'}</Button>}
          {running && <Button variant="secondary" size="lg" icon={<Icon name="pause" size={16} />} onClick={() => setRunning(false)}>Pause</Button>}
          <Button variant="outline" size="md" icon={<Icon name="refresh" size={16} />} onClick={() => reset()}>Reset</Button>
          <div className="speed-toggle"><span>Speed:</span>{[1, 2, 4].map((value) => <button key={value} className={`speed-btn ${speed === value ? 'active' : ''}`} onClick={() => setSpeed(value)}>{value}x</button>)}</div>
        </div>
      </div>

      <Card className="stage-tracker-card">
        <CardContent>
          <div className="progress-header"><div className="current-stage-title"><span className="stage-dot pulse-dot" /><strong>{completed ? 'Scenario complete' : STAGES[stage].title}:</strong> {completed ? 'Review the modeled request outcomes.' : STAGES[stage].description}</div><div className="progress-pct-text">{progress}%</div></div>
          <div className="overall-progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <div className="stage-steps-grid">{STAGES.map((item, index) => <div key={item.title} className={`step-bubble ${stage > index ? 'completed' : ''} ${stage === index && running ? 'active' : ''}`}><div className="step-num">{index + 1}</div><div className="step-name">{item.title.split('. ')[1]}</div></div>)}</div>
        </CardContent>
      </Card>

      <div className="simulation-kpi-grid">
        <div className="kpi-mini-card"><div className="kpi-mini-label">Requests</div><div className="kpi-mini-val">{requests.length}</div><div className="kpi-mini-sub">Simulated POSTs</div></div>
        <div className="kpi-mini-card"><div className="kpi-mini-label">Unique entries</div><div className="kpi-mini-val text-primary">{accepted.length}</div><div className="kpi-mini-sub">Accepted by intake model</div></div>
        <div className="kpi-mini-card"><div className="kpi-mini-label">Duplicates blocked</div><div className="kpi-mini-val text-warning">{duplicateCount}</div><div className="kpi-mini-sub">One entry per user/drop</div></div>
        <div className="kpi-mini-card"><div className="kpi-mini-label">Rate limited</div><div className="kpi-mini-val text-danger">{limitedCount}</div><div className="kpi-mini-sub">Limit: {RATE_LIMIT}/min per user</div></div>
        <div className="kpi-mini-card"><div className="kpi-mini-label">Allocation rate</div><div className="kpi-mini-val text-success">{completed ? `${allocationRate}%` : '—'}</div><div className="kpi-mini-sub">Seats / accepted entries</div></div>
      </div>

      <div className="sim-split-grid">
        <div className="sim-table-col"><Card><CardHeader title="Request trace" action={<Badge variant={running ? 'warning' : completed ? 'success' : 'secondary'} dot>{running ? 'RUNNING MODEL' : completed ? 'COMPLETE' : 'READY'}</Badge>} /><CardContent style={{ padding: 0 }}><div className="sim-table-wrap"><table className="sim-table"><thead><tr><th>Request</th><th>Account</th><th>Attempt</th><th>Outcome</th><th>Allocation</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id} className={`sim-row ${request.status === 'Allocated' ? 'row-allocated' : request.status === 'No seat available' ? 'row-waitlist' : ''}`}><td><strong>{request.id}</strong><div className="app-hash">POST /api/v1/entries/</div></td><td>{request.account}</td><td>{request.attempt}</td><td><span className={`status-pill pill-${statusClass(request.status)}`}>{request.status}</span></td><td>{request.seat ? <span className="slot-assigned-badge">{request.seat}</span> : <span className="slot-empty">—</span>}</td></tr>)}</tbody></table></div></CardContent></Card></div>
        <div className="sim-console-col"><Card className="console-card"><CardHeader title="Run log" action={<span className="console-live-tag">LOCAL MODEL</span>} /><CardContent><div className="console-output">{logs.map((log, index) => <div key={`${log}-${index}`} className="log-line">{log}</div>)}</div>
          {completed && <div className="completion-card animate-fade-in"><h4>Scenario summary</h4><p>{accepted.length} unique entries accepted; {duplicateCount} duplicates blocked; {limitedCount} requests rate limited; {allocatedCount} seats assigned.</p><p className="receipt-hash">The API currently exposes aggregate entry count, allocated count, and allocation rate. This panel reports only the simulated scenario above.</p></div>}
        </CardContent></Card></div>
      </div>

      <div className="simulation-controls-note">
        <strong>Backend controls represented</strong>
        <span>Entry endpoint: 5 requests per minute per authenticated user; one entry per user per drop; registration-window checks; randomized allocation after registration closes; allocation uses transactions and row locking. The allocation endpoint also requires an idempotency key. This UI does not send requests or measure database contention.</span>
      </div>
    </div>
  );
};

export default Simulation;
