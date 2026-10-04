import { useMemo, useState } from 'react';
import Card, { CardContent, CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Icon from '../components/Icon';
import './Simulation.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const DEFAULT_DROP_ID = import.meta.env.VITE_DEMO_DROP_ID ? Number(import.meta.env.VITE_DEMO_DROP_ID) : '';
const DEFAULT_CONCURRENCY = 25;
const SIMULATION_USERS = Array.from({ length: 25 }, (_, index) => `sim${String(index + 1).padStart(2, '0')}@test.com`);

const getInitialDropId = () => {
  const storedDropId = localStorage.getItem('fairDropDropId');

  if (storedDropId && Number(storedDropId) > 0) {
    return Number(storedDropId);
  }

  return DEFAULT_DROP_ID;
};

const STAGES = [
  {
    title: '1. Request arrival',
    description:
      'Generate concurrent authenticated requests against the live entry endpoint.',
  },
  {
    title: '2. Intake controls',
    description:
      'Process authentication, rate limiting, registration checks, and duplicate protection.',
  },
  {
    title: '3. Backend processing',
    description:
      'Measure the real response latency from the Django API and database.',
  },
  {
    title: '4. Results',
    description:
      'Review successful requests, failures, latency, and backend response details.',
  },
];

const STATUS_LABELS = {
  200: 'Success',
  201: 'Created',
  400: 'Rejected',
  401: 'Unauthorized',
  403: 'Forbidden',
  429: 'Rate limited',
  500: 'Server error',
};

const statusClass = (status) => {
  if (typeof status !== 'number') return 'error';

  if (status >= 200 && status < 300) return 'success';
  if (status === 429) return 'rate-limited';
  if (status >= 400 && status < 500) return 'rejected';

  return 'error';
};

const Simulation = () => {
  const [dropId, setDropId] = useState(getInitialDropId);
  const [concurrency, setConcurrency] = useState(DEFAULT_CONCURRENCY);

  const [stage, setStage] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [simulation, setSimulation] = useState(null);

  const [logs, setLogs] = useState([
    'Ready. Start a live backend simulation to generate real HTTP traffic.',
  ]);

  const addLog = (message) => {
    setLogs((previous) =>
      [
        `${new Date().toLocaleTimeString()}  ${message}`,
        ...previous,
      ].slice(0, 12)
    );
  };

  const reset = () => {
    setRunning(false);
    setCompleted(false);
    setStage(0);
    setSimulation(null);
    setLogs([
      'Simulation reset. No requests are currently running.',
    ]);
  };

  const runSimulation = async () => {
    if (running) return;

    const accessToken = sessionStorage.getItem('fairDropAccessToken');

    if (!accessToken) {
      addLog('No FairDrop access token found. Please log in first.');
      window.location.assign('/login');
      return;
    }

    const currentDropId = Number(
      localStorage.getItem('fairDropDropId') || dropId
    );

    if (!currentDropId || currentDropId < 1) {
      addLog('No active Drop selected. Open the Dashboard or Admin control center first.');
      return;
    }

    setDropId(currentDropId);
    setRunning(true);
    setCompleted(false);
    setStage(0);
    setSimulation(null);

    addLog(`Starting live simulation for Drop ${currentDropId}.`);

    addLog(
      `Preparing ${concurrency} concurrent authenticated POST /api/v1/entries/ requests.`
    );

    try {
      setStage(1);

      const response = await fetch(`${API_BASE_URL}/simulation/run/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          drop_id: currentDropId,
          concurrency: Number(concurrency),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (response.status === 401) {
        sessionStorage.removeItem('fairDropAccessToken');
        sessionStorage.removeItem('fairDropRefreshToken');
        window.location.assign('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(
          payload?.detail ||
            `Simulation request failed with HTTP ${response.status}.`
        );
      }

      setStage(2);

      addLog(
        `Backend completed ${payload.requests} concurrent request${
          payload.requests === 1 ? '' : 's'
        }.`
      );

      setSimulation(payload);

      setStage(3);

      if (payload.failed === 0) {
        addLog(
          `All ${payload.successful} requests completed successfully.`
        );
      } else {
        addLog(
          `${payload.successful} successful, ${payload.failed} failed request${
            payload.failed === 1 ? '' : 's'
          }.`
        );
      }

      addLog(
        `Average latency: ${payload.average_latency_ms} ms · P95: ${payload.p95_latency_ms} ms.`
      );

      setStage(4);
      setCompleted(true);
    } catch (error) {
      addLog(`Simulation error: ${error.message}`);
      setSimulation(null);
      setStage(0);
    } finally {
      setRunning(false);
    }
  };

  const results = simulation?.results || [];

  const successfulCount = simulation?.successful ?? 0;
  const failedCount = simulation?.failed ?? 0;

  const successRate = useMemo(() => {
    if (!simulation?.requests) return 0;

    return Math.round(
      (simulation.successful / simulation.requests) * 100
    );
  }, [simulation]);

  return (
    <div className="simulation-page animate-fade-in">
      <div className="simulation-header">
        <div className="header-left">
          <div className="badge-row">
            <Badge variant="primary" dot>
              LIVE BACKEND DEMO
            </Badge>

            <span className="demo-notice-tag">
              REAL API TRAFFIC
            </span>
          </div>

          <h1>Traffic &amp; Allocation Simulator</h1>

          <p className="header-subtitle">
            Generate concurrent authenticated requests against the actual
            FairDrop backend and measure real request success, latency,
            and failure behaviour.
          </p>

          <div
            className="scenario-selector"
            role="group"
            aria-label="Simulation configuration"
          >
            <label className="simulation-input-label">
              Drop ID

              <input
                type="number"
                min="1"
                value={dropId}
                disabled={running}
                onChange={(event) => {
                  const value = event.target.value;
                  setDropId(value);
                  localStorage.setItem('fairDropDropId', value);
                }}
              />
            </label>

            <label className="simulation-input-label">
              Concurrent requests

              <select
                value={concurrency}
                disabled={running}
                onChange={(event) =>
                  setConcurrency(Number(event.target.value))
                }
              >
                {Array.from({ length: 25 }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="simulation-controls">
          {!running && (
            <Button
              variant="primary"
              size="lg"
              icon={<Icon name="play" size={16} />}
              onClick={runSimulation}
            >
              {completed ? 'Run again' : 'Run live simulation'}
            </Button>
          )}

          {running && (
            <Button
              variant="secondary"
              size="lg"
              disabled
              icon={<Icon name="play" size={16} />}
            >
              Running...
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            icon={<Icon name="refresh" size={16} />}
            onClick={reset}
            disabled={running}
          >
            Reset
          </Button>
        </div>
      </div>

      <Card className="simulated-participants-card">
        <CardHeader
          title="LIVE CONCURRENT USER SIMULATION"
          action={<Badge variant="primary">25 simulated accounts available</Badge>}
        />
        <CardContent>
          <p style={{ marginTop: 0 }}>These simulated accounts make real concurrent HTTP requests; they are not human users.</p>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {SIMULATION_USERS.map((email) => (
              <Badge key={email} variant="secondary">{email}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="stage-tracker-card">
        <CardContent>
          <div className="progress-header">
            <div className="current-stage-title">
              <span className="stage-dot pulse-dot" />

              <strong>
                {completed
                  ? 'Simulation complete'
                  : STAGES[Math.min(stage, STAGES.length - 1)].title}
              </strong>{' '}

              {completed
                ? 'Review the measured backend results.'
                : STAGES[Math.min(stage, STAGES.length - 1)].description}
            </div>

            <div className="progress-pct-text">
              {completed
                ? '100%'
                : `${Math.min(stage * 25, 100)}%`}
            </div>
          </div>

          <div className="overall-progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${completed ? 100 : Math.min(stage * 25, 100)}%`,
              }}
            />
          </div>

          <div className="stage-steps-grid">
            {STAGES.map((item, index) => (
              <div
                key={item.title}
                className={`step-bubble ${
                  stage > index || completed ? 'completed' : ''
                } ${stage === index && running ? 'active' : ''}`}
              >
                <div className="step-num">{index + 1}</div>

                <div className="step-name">
                  {item.title.split('. ')[1]}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="simulation-kpi-grid">
        <div className="kpi-mini-card">
          <div className="kpi-mini-label">Requests</div>

          <div className="kpi-mini-val">
            {simulation?.requests ?? '—'}
          </div>

          <div className="kpi-mini-sub">
            Real HTTP requests
          </div>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-mini-label">Successful</div>

          <div className="kpi-mini-val text-primary">
            {simulation ? successfulCount : '—'}
          </div>

          <div className="kpi-mini-sub">
            HTTP 2xx responses
          </div>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-mini-label">Failed</div>

          <div className="kpi-mini-val text-warning">
            {simulation ? failedCount : '—'}
          </div>

          <div className="kpi-mini-sub">
            Rejected or failed requests
          </div>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-mini-label">Average latency</div>

          <div className="kpi-mini-val">
            {simulation
              ? `${simulation.average_latency_ms} ms`
              : '—'}
          </div>

          <div className="kpi-mini-sub">
            Measured API response time
          </div>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-mini-label">P95 latency</div>

          <div className="kpi-mini-val text-success">
            {simulation
              ? `${simulation.p95_latency_ms} ms`
              : '—'}
          </div>

          <div className="kpi-mini-sub">
            95th percentile
          </div>
        </div>
      </div>

      <div className="sim-split-grid">
        <div className="sim-table-col">
          <Card>
            <CardHeader
              title="Live request trace"
              action={
                <Badge
                  variant={
                    running
                      ? 'warning'
                      : completed
                        ? 'success'
                        : 'secondary'
                  }
                  dot
                >
                  {running
                    ? 'RUNNING'
                    : completed
                      ? 'COMPLETE'
                      : 'READY'}
                </Badge>
              }
            />

            <CardContent style={{ padding: 0 }}>
              <div className="sim-table-wrap">
                <table className="sim-table">
                  <thead>
                    <tr>
                      <th>Request</th>
                      <th>Account</th>
                      <th>Status</th>
                      <th>Latency</th>
                      <th>Outcome</th>
                    </tr>
                  </thead>

                  <tbody>
                    {results.length > 0 ? (
                      results.map((result, index) => (
                        <tr
                          key={`${result.email}-${index}`}
                          className={`sim-row ${
                            result.status >= 200 &&
                            result.status < 300
                              ? 'row-allocated'
                              : ''
                          }`}
                        >
                          <td>
                            <strong>
                              REQ-{String(index + 1).padStart(2, '0')}
                            </strong>

                            <div className="app-hash">
                              POST /api/v1/entries/
                            </div>
                          </td>

                          <td>{result.email}</td>

                          <td>
                            <span
                              className={`status-pill pill-${statusClass(
                                result.status
                              )}`}
                            >
                              {result.status}
                            </span>
                          </td>

                          <td>
                            {typeof result.latency === 'number'
                              ? `${result.latency} ms`
                              : '—'}
                          </td>

                          <td>
                            {typeof result.status === 'number'
                              ? STATUS_LABELS[result.status] ||
                                (result.status >= 200 &&
                                result.status < 300
                                  ? 'Success'
                                  : 'Rejected')
                              : 'Error'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5">
                          <div
                            style={{
                              padding: '32px',
                              textAlign: 'center',
                              opacity: 0.7,
                            }}
                          >
                            No live request results yet. Start the
                            simulation to generate real backend traffic.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="sim-console-col">
          <Card className="console-card">
            <CardHeader
              title="Backend run log"
              action={
                <span className="console-live-tag">
                  LIVE API
                </span>
              }
            />

            <CardContent>
              <div className="console-output">
                {logs.map((log, index) => (
                  <div
                    key={`${log}-${index}`}
                    className="log-line"
                  >
                    {log}
                  </div>
                ))}
              </div>

              {completed && simulation && (
                <div className="completion-card animate-fade-in">
                  <h4>Simulation summary</h4>

                  <p>
                    {successfulCount} of {simulation.requests}{' '}
                    requests completed successfully, producing a{' '}
                    {successRate}% success rate.
                  </p>

                  <p>
                    Average latency was{' '}
                    {simulation.average_latency_ms} ms with a
                    P95 latency of{' '}
                    {simulation.p95_latency_ms} ms.
                  </p>

                  <p className="receipt-hash">
                    Total backend execution time:{' '}
                    {simulation.total_time_ms} ms.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="simulation-controls-note">
        <strong>Live backend controls</strong>

        <span>
          This page sends real authenticated requests to the FairDrop
          Django API. The backend applies the configured per-user
          entry rate limit, one-entry-per-user-per-drop constraint,
          registration-window checks, and database persistence.
          The metrics above are measured from actual HTTP responses,
          not a browser-only animation.
        </span>
      </div>
    </div>
  );
};

export default Simulation;
