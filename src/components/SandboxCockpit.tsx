import React, { useState } from 'react';
import { 
  Database, RefreshCw, Trash2, Cpu, FileText, Check, AlertTriangle, 
  Terminal, ShieldCheck, HelpCircle, Users, Layers, Star, Bell
} from 'lucide-react';
import { User, Challenge, UserChallenge, CheckIn, Verification, SystemLog } from '../types';

interface SandboxCockpitProps {
  logs: SystemLog[];
  dbState: {
    users: User[];
    challenges: Challenge[];
    user_challenges: UserChallenge[];
    check_ins: CheckIn[];
    verifications: Verification[];
  };
  onTriggerClockReset: () => Promise<void>;
  onResetSandbox: () => Promise<void>;
  onClearLogs: () => Promise<void>;
  onUserSelected: (username: string) => Promise<void>;
  activeUsername: string;
}

export default function SandboxCockpit({
  logs,
  dbState,
  onTriggerClockReset,
  onResetSandbox,
  onClearLogs,
  onUserSelected,
  activeUsername
}: SandboxCockpitProps) {
  // Current active table view
  const [activeTable, setActiveTable] = useState<'users' | 'challenges' | 'user_challenges' | 'check_ins' | 'verifications'>('users');
  const [isRunningCron, setIsRunningCron] = useState(false);
  const [isSimulatingFail, setIsSimulatingFail] = useState(false);
  const [isSimulatingReminder, setIsSimulatingReminder] = useState(false);
  const [isSimulatingStart, setIsSimulatingStart] = useState(false);

  const handleCronAdvance = async () => {
    setIsRunningCron(true);
    await onTriggerClockReset();
    setTimeout(() => {
      setIsRunningCron(false);
    }, 800);
  };

  const handleSimulateFail = async () => {
    const activeUser = dbState.users.find(u => u.username === activeUsername.toLowerCase());
    if (!activeUser) {
      alert('Please log in or select an active user to simulate challenge failure.');
      return;
    }
    setIsSimulatingFail(true);
    try {
      const res = await fetch('/api/system/simulate-fail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUser.id })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Simulation error');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulatingFail(false);
    }
  };

  const handleSimulateReminder = async () => {
    const activeUser = dbState.users.find(u => u.username === activeUsername.toLowerCase());
    if (!activeUser) {
      alert('Please log in or select an active user to simulate reminder alarm.');
      return;
    }
    setIsSimulatingReminder(true);
    try {
      const res = await fetch('/api/system/simulate-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUser.id })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Simulation error');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulatingReminder(false);
    }
  };

  const handleSimulateStart = async () => {
    const activeUser = dbState.users.find(u => u.username === activeUsername.toLowerCase());
    if (!activeUser) {
      alert('Please log in or select an active user to simulate challenge start alarm.');
      return;
    }
    setIsSimulatingStart(true);
    try {
      const res = await fetch('/api/system/simulate-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUser.id })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Simulation error');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulatingStart(false);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col h-full gap-6">
      
      {/* Upper Cockpit Panel: Operations Console */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Core Controls */}
        <div className="md:col-span-8 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold tracking-wider text-indigo-400 uppercase flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> Server Controls
            </h3>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              VITE_DEV_SERVER: ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCronAdvance}
              disabled={isRunningCron}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-mono font-bold transition-all shadow-md flex items-center justify-center gap-1 border border-indigo-500/30 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningCron ? 'animate-spin' : ''}`} />
              Run Cron
            </button>

            <button
              onClick={onResetSandbox}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1 border border-slate-700/60 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Reset DB
            </button>

            <button
              onClick={handleSimulateReminder}
              disabled={isSimulatingReminder}
              className="px-4 py-2 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/20 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              title="Simulate challenge checklist reminder warning"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingReminder ? 'animate-spin' : ''}`} />
              Sim Reminder
            </button>

            <button
              onClick={handleSimulateFail}
              disabled={isSimulatingFail}
              className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              title="Simulate challenge failure / missed check-in log"
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${isSimulatingFail ? 'animate-pulse' : ''}`} />
              Sim Failure
            </button>

            <button
              onClick={handleSimulateStart}
              disabled={isSimulatingStart}
              className="col-span-2 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              title="Simulate challenge starting in 1 hour alarm"
            >
              <Bell className={`w-3.5 h-3.5 ${isSimulatingStart ? 'animate-bounce' : ''}`} />
              Sim Start Alarm (starts in 1 hour)
            </button>
          </div>

          <div className="text-[10px] text-slate-400 font-mono flex items-start gap-1.5 leading-normal bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Alarms Ready:</strong> Trigger <strong>Sim Start Alarm</strong> to test warning 1 hour before start, <strong>Sim Reminder</strong> for checklist reminders, or <strong>Sim Failure</strong> to slash stakes!
            </span>
          </div>
        </div>

        {/* Quick Identity Switcher */}
        <div className="md:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-indigo-400 uppercase flex items-center gap-1.5 mb-1">
              <Users className="w-4 h-4" /> Switch Operator
            </h4>
            <p className="text-[9px] text-slate-500 font-mono leading-tight">Click to instantly log in as other team members for peer-voting tests:</p>
          </div>

          <div className="space-y-1.5 my-2">
            {[
              { name: 'yannick', role: 'Yannick S.' },
              { name: 'ryan', role: 'Ryan B.' },
              { name: 'nathanael', role: 'Nathanaël P.' }
            ].map(user => {
              const isActive = activeUsername.toLowerCase() === user.name;
              return (
                <button
                  key={user.name}
                  onClick={() => onUserSelected(user.name)}
                  className={`w-full px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-left flex justify-between items-center transition-all ${
                    isActive 
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold' 
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-transparent'
                  }`}
                >
                  <span>@{user.name}</span>
                  <span className="text-[9px] font-semibold opacity-70 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{user.role}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Database Explorer Block */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800/80 p-4 flex-1 flex flex-col min-h-[280px]">
        
        {/* Table selector headers */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Database className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] text-slate-500 font-mono block">SCHEMA VIEWER</span>
              <span className="text-xs font-bold font-mono text-emerald-400">PostgreSQL Mock Instance</span>
            </div>
          </div>

          {/* Selector tabs */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'users', label: 'users' },
              { id: 'challenges', label: 'challenges' },
              { id: 'user_challenges', label: 'user_challenges' },
              { id: 'check_ins', label: 'check_ins' },
              { id: 'verifications', label: 'verifications' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTable(tab.id as any)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all border ${
                  activeTable === tab.id 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 font-bold' 
                    : 'bg-slate-900 text-slate-400 border-transparent hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Database Table Rendering (Raw Table UI) */}
        <div className="flex-1 overflow-auto mt-3 custom-scrollbar text-xs font-mono">
          <table className="w-full text-left border-collapse">
            
            {activeTable === 'users' && (
              <>
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                    <th className="py-2 px-3">id (PK)</th>
                    <th className="py-2 px-3">username</th>
                    <th className="py-2 px-3">email</th>
                    <th className="py-2 px-3 text-right">total_xp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {dbState.users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-900/60 text-slate-300">
                      <td className="py-2 px-3 text-slate-500 text-[10px]">{u.id}</td>
                      <td className="py-2 px-3 font-semibold text-white">@{u.username}</td>
                      <td className="py-2 px-3 text-slate-400">{u.email}</td>
                      <td className="py-2 px-3 text-right text-amber-400 font-bold">{u.total_xp}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {activeTable === 'challenges' && (
              <>
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                    <th className="py-2 px-3">id (PK)</th>
                    <th className="py-2 px-3">title</th>
                    <th className="py-2 px-3">category</th>
                    <th className="py-2 px-3">creator</th>
                    <th className="py-2 px-3 text-right">reward_xp</th>
                    <th className="py-2 px-3 text-right">days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {dbState.challenges.map(c => (
                    <tr key={c.id} className="hover:bg-slate-900/60 text-slate-300">
                      <td className="py-2 px-3 text-slate-500 text-[10px]">{c.id}</td>
                      <td className="py-2 px-3 font-bold text-white">{c.title}</td>
                      <td className="py-2 px-3 text-indigo-400 font-semibold">{c.category}</td>
                      <td className="py-2 px-3 text-slate-400">@{c.creator_username}</td>
                      <td className="py-2 px-3 text-right text-amber-500 font-bold">+{c.reward_xp}</td>
                      <td className="py-2 px-3 text-right text-slate-400">{c.duration_days}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {activeTable === 'user_challenges' && (
              <>
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                    <th className="py-2 px-3">id (PK)</th>
                    <th className="py-2 px-3">user_id (FK)</th>
                    <th className="py-2 px-3">challenge_id (FK)</th>
                    <th className="py-2 px-3 text-right">progress</th>
                    <th className="py-2 px-3 text-right">status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {dbState.user_challenges.map(uc => {
                    const u = dbState.users.find(us => us.id === uc.user_id);
                    const c = dbState.challenges.find(ch => ch.id === uc.challenge_id);
                    return (
                      <tr key={uc.id} className="hover:bg-slate-900/60 text-slate-300">
                        <td className="py-2 px-3 text-slate-500 text-[10px]">{uc.id}</td>
                        <td className="py-2 px-3 text-slate-400">@{u?.username || 'unknown'}</td>
                        <td className="py-2 px-3 text-slate-400">{c?.title || uc.challenge_id}</td>
                        <td className="py-2 px-3 text-right text-indigo-400 font-bold">{uc.progress} days</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-200">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            uc.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-slate-900 text-slate-400'
                          }`}>
                            {uc.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </>
            )}

            {activeTable === 'check_ins' && (
              <>
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                    <th className="py-2 px-3">id (PK)</th>
                    <th className="py-2 px-3">username</th>
                    <th className="py-2 px-3">proof</th>
                    <th className="py-2 px-3 text-right">status</th>
                    <th className="py-2 px-3 text-right">timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {dbState.check_ins.map(ci => (
                    <tr key={ci.id} className="hover:bg-slate-900/60 text-slate-300">
                      <td className="py-2 px-3 text-slate-500 text-[10px]">{ci.id}</td>
                      <td className="py-2 px-3 font-semibold">@{ci.username}</td>
                      <td className="py-2 px-3 text-slate-400 max-w-[150px] truncate">{ci.text_proof}</td>
                      <td className="py-2 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ci.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400' :
                          ci.status === 'DISPUTED' ? 'bg-rose-950 text-rose-400' :
                          'bg-amber-950 text-amber-400'
                        }`}>
                          {ci.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-[10px] text-slate-500">
                        {new Date(ci.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {activeTable === 'verifications' && (
              <>
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                    <th className="py-2 px-3">id (PK)</th>
                    <th className="py-2 px-3">check_in_id</th>
                    <th className="py-2 px-3">voter</th>
                    <th className="py-2 px-3 text-right">vote</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {dbState.verifications.map(v => (
                    <tr key={v.id} className="hover:bg-slate-900/60 text-slate-300">
                      <td className="py-2 px-3 text-slate-500 text-[10px]">{v.id}</td>
                      <td className="py-2 px-3 text-slate-500 text-[10px]">{v.check_in_id}</td>
                      <td className="py-2 px-3 font-semibold">@{v.voter_username}</td>
                      <td className="py-2 px-3 text-right font-bold">
                        <span className={v.vote === 'APPROVE' ? 'text-emerald-400' : 'text-rose-400'}>
                          {v.vote}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

          </table>
          
          {dbState[activeTable]?.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No entries present in the "{activeTable}" table.
            </div>
          )}
        </div>

      </div>

      {/* Live Server Terminal Log */}
      <div className="bg-[#0b0f19] rounded-2xl border border-slate-800 p-4 h-48 flex flex-col">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800/60 mb-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-indigo-500" /> Server Log Stream
          </span>
          <button
            onClick={onClearLogs}
            className="text-[9px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Clear Console
          </button>
        </div>

        <div className="flex-1 overflow-y-auto font-mono text-[11px] text-emerald-400 space-y-1 custom-scrollbar">
          {logs.map((log) => (
            <div key={log.id} className="leading-normal hover:bg-slate-900/40 p-0.5 rounded">
              <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
              <span className="text-indigo-400 font-bold">{log.action}:</span>{' '}
              <span className="text-slate-300">{log.details}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <span className="text-slate-600 block italic py-4 text-center">Ledger logs empty. Trigger some actions to stream!</span>
          )}
        </div>
      </div>

    </div>
  );
}
