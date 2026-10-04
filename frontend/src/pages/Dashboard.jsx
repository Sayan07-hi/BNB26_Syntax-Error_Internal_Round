import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { apiRequest, configuredDropId } from '../api/api';

export default function Dashboard(){
  const navigate=useNavigate();
  const [dropId,setDropId]=useState(localStorage.getItem('fairDropDropId')||configuredDropId);
  const [entry,setEntry]=useState(null); const [joining,setJoining]=useState(false); const [message,setMessage]=useState('');
  useEffect(()=>{if(!localStorage.getItem('fairDropAccessToken'))return;apiRequest('/allocations/mine/').then((items)=>{const saved=localStorage.getItem('fairDropEntryId');const found=items.find((item)=>String(item.entry_id)===saved)||items[0];if(found){setEntry(found);setDropId(String(found.drop_id||configuredDropId));}}).catch((error)=>setMessage(error.message));},[]);
  async function join(event){event.preventDefault();setJoining(true);setMessage('');try{const result=await apiRequest('/entries/',{method:'POST',body:{drop:Number(dropId)}});localStorage.setItem('fairDropEntryId',String(result.id));localStorage.setItem('fairDropDropId',String(dropId));navigate('/my-allocation');}catch(error){setMessage(error.message);}finally{setJoining(false);}}
  return <main className="animate-fade-in" style={{maxWidth:1000,margin:'0 auto',display:'grid',gap:'1.5rem'}}><header><Badge variant="primary">DASHBOARD</Badge><h1>Drop registration</h1><p>Enter a drop ID to register while its registration window is open. One entry is allowed per account per drop.</p></header>
    <Card><CardHeader title="Join a drop"/><CardContent><form onSubmit={join} style={{display:'flex',alignItems:'end',gap:'.75rem',flexWrap:'wrap'}}><label style={{display:'grid',gap:'.35rem'}}>Drop ID<input type="number" min="1" required value={dropId} onChange={(e)=>setDropId(e.target.value)} style={{padding:'.65rem'}}/></label><Button type="submit" variant="primary" loading={joining}>Submit entry</Button></form>{message&&<p role="alert" style={{color:'#b91c1c'}}>{message}</p>}</CardContent></Card>
    <Card><CardHeader title="Your latest entry" action={entry&&<Badge variant={entry.allocation?'success':'warning'}>{entry.allocation?'ALLOCATED':'AWAITING ALLOCATION'}</Badge>}/><CardContent>{entry?<><p>Drop: <strong>{entry.drop_name||`#${entry.drop_id}`}</strong></p><p>Entry reference: <strong>{entry.entry_id}</strong></p><p>{entry.allocation?`Assigned seat #${entry.allocation.seat_number}`:'Your entry has not received an allocation result yet.'}</p><Button variant="outline" onClick={()=>navigate('/my-allocation')}>View allocation result</Button></>:<p>No entry was loaded for this account. Submit an entry above when drop registration is open.</p>}</CardContent></Card>
    <Card><CardHeader title="Allocation process"/><CardContent><p>After registration closes, an administrator can run randomized allocation for available seats. Entry position reflects registration ordering where provided by the API; it is not a promise of priority or a guaranteed seat.</p><p>Allocation actions use transaction handling and row locking. The current backend exposes aggregate counts and allocation rate for administrators.</p><div style={{display:'flex',gap:'.75rem',flexWrap:'wrap'}}><Link to="/allocations"><Button variant="outline">Allocation controls</Button></Link><Link to="/transparency"><Button variant="secondary">View aggregate metrics</Button></Link></div></CardContent></Card>
  </main>;
}
