import React, { useState, useEffect } from 'react';
import { User, Challenge, CheckIn, Verification, SystemLog } from './types';
import PhoneEmulator from './components/PhoneEmulator';
import SandboxCockpit from './components/SandboxCockpit';
import { Cpu } from 'lucide-react';
import EBLogo from './components/EBLogo';

export default function App() {
  // Global React States
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
    email: string;
    total_xp: number;
  } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [feed, setFeed] = useState<(CheckIn & { votes: Verification[] })[]>([]);
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [dbState, setDbState] = useState<{
    users: User[];
    challenges: Challenge[];
    user_challenges: any[];
    check_ins: CheckIn[];
    verifications: Verification[];
  }>({
    users: [],
    challenges: [],
    user_challenges: [],
    check_ins: [],
    verifications: []
  });

  // Local storage initialization
  useEffect(() => {
    const savedUser = localStorage.getItem('betz_user');
    const savedToken = localStorage.getItem('betz_token');
    if (savedUser && savedToken) {
      setCurrentUser(JSON.parse(savedUser));
      setToken(savedToken);
    } else {
      // Default auto-login as first researcher (Yannick) to lower entrance friction
      const defaultMockUser = {
        id: 'yc745fbf-4076-4767-8919-48227e7ca4b1',
        username: 'yannick',
        email: 'yannick@gmail.com',
        total_xp: 450
      };
      setCurrentUser(defaultMockUser);
      setToken(`mock-jwt-token-for-${defaultMockUser.id}`);
      localStorage.setItem('betz_user', JSON.stringify(defaultMockUser));
      localStorage.setItem('betz_token', `mock-jwt-token-for-${defaultMockUser.id}`);
    }
  }, []);

  // Fetch functions
  const fetchData = async () => {
    try {
      // 1. Fetch generic feed
      const feedRes = await fetch('/api/feed');
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        setFeed(feedData);
      }

      // 2. Fetch challenges
      const chalRes = await fetch('/api/challenges');
      if (chalRes.ok) {
        const chalData = await chalRes.json();
        setChallenges(chalData);
      }

      // 3. Fetch leaderboards
      const leadRes = await fetch('/api/leaderboard');
      if (leadRes.ok) {
        const leadData = await leadRes.json();
        setLeaderboard(leadData);
      }

      // 4. Fetch system logs
      const logRes = await fetch('/api/system/logs');
      if (logRes.ok) {
        const logData = await logRes.json();
        setLogs(logData);
      }

      // 5. Fetch full database schemas state
      const stateRes = await fetch('/api/system/state');
      if (stateRes.ok) {
        const stateData = await stateRes.json();
        setDbState(stateData);

        // Update active logged in user's state from fresh database values
        if (currentUser) {
          const freshUser = stateData.users.find((u: User) => u.id === currentUser.id);
          if (freshUser) {
            const updated = {
              id: freshUser.id,
              username: freshUser.username,
              email: freshUser.email,
              total_xp: freshUser.total_xp
            };
            setCurrentUser(updated);
            localStorage.setItem('betz_user', JSON.stringify(updated));
          }
        }
      }
    } catch (e) {
      console.error('Error polling background systems', e);
    }
  };

  // Fetch active user's specialized enrollments
  const fetchUserEnrollments = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}/challenges`);
      if (res.ok) {
        const data = await res.json();
        setUserChallenges(data);
      }
    } catch (e) {
      console.error('Error fetching user challenges', e);
    }
  };

  // Pull triggers periodically
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1500);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      fetchUserEnrollments();
    } else {
      setUserChallenges([]);
    }
  }, [currentUser?.id, feed]);

  // Auth Handlers
  const handleRegister = async (form: any) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    setCurrentUser(data.user);
    setToken(data.token);
    localStorage.setItem('betz_user', JSON.stringify(data.user));
    localStorage.setItem('betz_token', data.token);
    fetchData();
  };

  const handleLogin = async (form: any) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login checkout rejected');
    }
    setCurrentUser(data.user);
    setToken(data.token);
    localStorage.setItem('betz_user', JSON.stringify(data.user));
    localStorage.setItem('betz_token', data.token);
    fetchData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('betz_user');
    localStorage.removeItem('betz_token');
  };

  // Sandbox Switch Client identity
  const handleQuickSwitchUser = async (username: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: username, password: '123456' })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setToken(data.token);
        localStorage.setItem('betz_user', JSON.stringify(data.user));
        localStorage.setItem('betz_token', data.token);
      }
    } catch (e) {
      console.error('Switch failed', e);
    }
  };

  // Challenge joins
  const handleJoinChallenge = async (challengeId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/challenges/${challengeId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({})
      });
      if (res.ok) {
        await fetchData();
        await fetchUserEnrollments();
      } else {
        const err = await res.json();
        alert(err.error || 'Join error');
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  // Challenge creations
  const handleCreateChallenge = async (form: any) => {
    if (!token) return;
    const res = await fetch('/api/challenges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Deployment error');
    }
    await fetchData();
    await fetchUserEnrollments();
  };

  // Checkin creations
  const handleSubmitCheckin = async (challengeId: string, form: any) => {
    if (!token) return;
    const res = await fetch(`/api/challenges/${challengeId}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Check-In transmission rejected');
    }
    await fetchData();
    await fetchUserEnrollments();
  };

  // Voting actions
  const handleCastVote = async (checkInId: string, voteType: 'APPROVE' | 'DISPUTED') => {
    if (!token) return;
    try {
      const res = await fetch(`/api/checkins/${checkInId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ vote: voteType })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Vote registration error');
      } else {
        await fetchData();
        await fetchUserEnrollments();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  // Sandbox action triggers
  const handleTriggerClockReset = async () => {
    try {
      const res = await fetch('/api/system/reset-engine', { method: 'POST' });
      if (res.ok) {
        await fetchData();
        await fetchUserEnrollments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetSandbox = async () => {
    if (confirm('Re-seed Sandbox database back to pristine Yannick, Ryan & Nathanaël defaults?')) {
      try {
        const res = await fetch('/api/system/reset-sandbox', { method: 'POST' });
        if (res.ok) {
          await fetchData();
          await fetchUserEnrollments();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/system/clear-logs', { method: 'POST' });
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-[#F8FAFC] text-slate-800 min-h-screen font-sans antialiased flex flex-col justify-between">
      
      {/* Sandbox Top Branded Masthead */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-indigo-600 rounded-xl shadow-md flex items-center justify-center">
                <EBLogo className="w-5 h-5 text-white" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900 leading-none">BETZ</h1>
                  <span className="text-[11px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded font-mono font-medium">
                    Stage 3: Project Charter
                  </span>
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Team: Yannick Sookree • Ryan Adams Bundhoo • Nathanaël Perraud</p>
              </div>
            </div>
          </div>

          {/* Academic and project details */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-right md:-mr-2 font-mono text-[11px] text-slate-600">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Environment Target</span>
              <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[10px]">PROD_VER_2026.1</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">PORT INTEGRATION</span>
              <span className="text-indigo-600 font-semibold text-[10px]">C27/28 (ACTIVE)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main double column cockpit area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Physical Phone Simulator Frame (Light Polish accent) */}
        <section className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="text-center mb-4 block lg:hidden">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">Interactive Client Emulator</span>
          </div>
          <PhoneEmulator
            currentUser={currentUser}
            challenges={challenges}
            feed={feed}
            userChallenges={userChallenges}
            leaderboard={leaderboard}
            onRegister={handleRegister}
            onLogin={handleLogin}
            onJoinChallenge={handleJoinChallenge}
            onCreateChallenge={handleCreateChallenge}
            onSubmitCheckin={handleSubmitCheckin}
            onCastVote={handleCastVote}
            onLogout={handleLogout}
          />
        </section>

        {/* Right Side: PostgreSQL Explorer & Server Operations Terminal */}
        <section className="lg:col-span-7 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-500 animate-spin" />
              Relational Transaction Engine
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Engine Status: ONLINE</span>
            </div>
          </div>
          <div className="flex-1 min-h-[560px]">
            <SandboxCockpit
              logs={logs}
              dbState={dbState}
              onTriggerClockReset={handleTriggerClockReset}
              onResetSandbox={handleResetSandbox}
              onClearLogs={handleClearLogs}
              onUserSelected={handleQuickSwitchUser}
              activeUsername={currentUser?.username || ''}
            />
          </div>
        </section>

      </main>

      {/* Footer Bar */}
      <footer className="h-10 bg-slate-900 text-slate-400 text-[10px] flex items-center px-8 justify-between mt-auto">
        <div className="flex gap-4">
          <span>© 2026 BETZ</span>
          <span className="opacity-50 font-mono">v2.4.0-stable</span>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> API GATEWAY: ONLINE</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> DB CLUSTER: SYNCED</span>
        </div>
      </footer>

    </div>
  );
}
