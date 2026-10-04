import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card, { CardContent, CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { isAdminUser } from '../api/api';
import './Home.css';

const steps = [
  { title: 'Register', desc: 'Create an account with an email address and password.' },
  { title: 'Enter a drop', desc: 'Submit one entry while its registration window is open.' },
  { title: 'Allocate', desc: 'After registration closes, an administrator can run randomized allocation.' },
  { title: 'Review results', desc: 'Check your allocation state and aggregate drop metrics.' },
];

const Home = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const isAdmin = isAdminUser();
  const faqs = [
    { q: 'How does Fair Drop handle repeated entries?', a: 'The backend allows one entry per user per drop and applies a per-user request limit to the entry endpoint.' },
    { q: 'How is allocation performed?', a: 'When registration has closed, an administrator can start the fair allocation endpoint. It shuffles entries and assigns available seats within a database transaction.' },
    { q: 'What fairness data is available?', a: 'The current metrics endpoint reports total entries, allocated entries, and allocation rate. It does not report demographic or geographic parity.' },
  ];
  return <div className="home-page animate-fade-in">
    <section className="hero-section"><div className="hero-glow" aria-hidden="true"/><div className="hero-content">
      <div className="hero-badge-row"><span className="hero-pill"><Icon name="shield-check" size={16}/> FAIR DROP · WEB / APP PS 3</span></div>
      <h1 className="hero-title">Fair access when demand <span className="hero-gradient-text">exceeds capacity.</span></h1>
      <p className="hero-subtitle">A registration and randomized allocation demo built to examine duplicate protection, request limits, and measurable allocation outcomes under high demand.</p>
      <div className="hero-cta-group"><Button variant="primary" size="lg" icon={<Icon name="arrow-right" size={18}/>} onClick={() => navigate('/register')}>Create account</Button>{isAdmin && <Button variant="secondary" size="lg" icon={<Icon name="play" size={16}/>} onClick={() => navigate('/admin/simulation')}>Run live simulation</Button>}</div>
      <div className="hero-metrics-strip"><div className="hero-metric-item"><span className="metric-num">30 / min</span><span className="metric-label">Configured entry request limit</span></div><div className="metric-divider"/><div className="hero-metric-item"><span className="metric-num">1</span><span className="metric-label">Entry per user per drop</span></div><div className="metric-divider"/><div className="hero-metric-item"><span className="metric-num">Randomized</span><span className="metric-label">Seat assignment after close</span></div></div>
    </div></section>
    <section className="notice-section"><div className="notice-banner"><div className="notice-icon-badge"><Icon name="alert-circle" size={20}/></div><div className="notice-text-content"><h4>Controlled registration windows</h4><p>Administrators publish the Drop and its opening and closing times. Entry requests are enforced by the backend.</p></div></div></section>
    <section className="pillars-section"><div className="section-header-center"><Badge variant="primary">SYSTEM BEHAVIOR</Badge><h2>Designed around the registration path</h2><p>The current implementation focuses on protecting entry intake and making allocation results inspectable.</p></div><div className="pillars-grid">
      {[['Request controls','Authenticated entry requests are checked against the registration window and per-user rate limit.','shield-check','icon-blue'],['Duplicate protection','A user can hold at most one entry for the same drop.','lock','icon-green'],['Allocation metrics','Administrators can review entry counts and allocation rate from the backend.','activity','icon-purple']].map(([title,desc,icon,style]) => <Card key={title} className="pillar-card"><CardContent><div className={`pillar-icon-box ${style}`}><Icon name={icon} size={28}/></div><h3>{title}</h3><p>{desc}</p></CardContent></Card>)}
    </div></section>
    <section className="process-section"><div className="section-header-center"><Badge variant="success">ALLOCATION FLOW</Badge><h2>From registration to result</h2><p>Four steps supported by the current application.</p></div><div className="programs-grid">{steps.map((item,index)=><Card key={item.title} className="program-card"><CardHeader title={`${String(index+1).padStart(2,'0')} · ${item.title}`}/><CardContent><p>{item.desc}</p></CardContent></Card>)}</div></section>
    <section className="faq-teaser-section"><div className="section-header-center"><Badge variant="secondary">FAQ</Badge><h2>What this demo measures</h2><p>Answers based on the current backend behavior.</p></div><div className="faq-accordion-list">{faqs.map((faq,index)=><div key={faq.q} className={`faq-accordion-item ${activeFaq===index?'active':''}`}><button className="faq-question-btn" onClick={()=>setActiveFaq(activeFaq===index?null:index)} aria-expanded={activeFaq===index}><span>{faq.q}</span><span className="faq-toggle-icon">{activeFaq===index?'−':'+'}</span></button>{activeFaq===index&&<div className="faq-answer-content animate-slide-down"><p>{faq.a}</p></div>}</div>)}</div><div className="faq-more-cta"><Link to="/faq"><Button variant="outline" size="sm">Read all FAQs →</Button></Link></div></section>
    <section className="cta-banner-section"><div className="cta-banner-card"><div className="cta-banner-content"><h2>{isAdmin ? 'Run the live traffic simulation' : 'Check the current Drop'}</h2><p>{isAdmin ? 'Send concurrent authenticated requests to the backend using the published Drop.' : 'View the active Drop and its registration window from your dashboard.'}</p><div className="cta-buttons">{isAdmin && <Button variant="primary" size="lg" onClick={()=>navigate('/admin/simulation')}>Open live simulation</Button>}<Button variant="secondary" size="lg" onClick={()=>navigate('/dashboard')}>Go to dashboard</Button></div></div></div></section>
  </div>;
};
export default Home;
