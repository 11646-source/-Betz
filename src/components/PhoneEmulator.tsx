import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, CheckCircle, Clock, Trophy, Award, LogIn, LogOut, 
  Check, X, ShieldCheck, PlusCircle, Activity, Calendar, UserPlus, 
  ChevronRight, Send, User, Target, Layers
} from 'lucide-react';
import EBLogo from './EBLogo';
import { Challenge, CheckIn, Verification } from '../types';

interface PhoneEmulatorProps {
  currentUser: {
    id: string;
    username: string;
    email: string;
    total_xp: number;
  } | null;
  challenges: Challenge[];
  feed: (CheckIn & { votes: Verification[] })[];
  userChallenges: any[];
  leaderboard: any[];
  onRegister: (form: any) => Promise<void>;
  onLogin: (form: any) => Promise<void>;
  onJoinChallenge: (challengeId: string) => Promise<void>;
  onCreateChallenge: (form: any) => Promise<void>;
  onSubmitCheckin: (challengeId: string, form: any) => Promise<void>;
  onCastVote: (checkInId: string, voteType: 'APPROVE' | 'DISPUTED') => Promise<void>;
  onLogout: () => void;
}

export default function PhoneEmulator({
  currentUser,
  challenges,
  feed,
  userChallenges,
  leaderboard,
  onRegister,
  onLogin,
  onJoinChallenge,
  onCreateChallenge,
  onSubmitCheckin,
  onCastVote,
  onLogout
}: PhoneEmulatorProps) {
  // Mobile UI screens: 'FEED', 'DISCOVER', 'CREATE', 'LEADERBOARD', 'PROFILE', 'AUTH_LOGIN', 'AUTH_REGISTER'
  const [activeTab, setActiveTab] = useState<'FEED' | 'DISCOVER' | 'CREATE' | 'LEADERBOARD' | 'PROFILE'>('FEED');
  
  // Auth state inputs
  const [loginForm, setLoginForm] = useState({ usernameOrEmail: '', password: '123456' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '123456' });
  const [authError, setAuthError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Challenge detail state
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  
  // Submit check-in state
  const [submittingCheckinFor, setSubmittingCheckinFor] = useState<Challenge | null>(null);
  const [checkinForm, setCheckinForm] = useState({ text_proof: '', imageUrl: '' });
  const [checkinError, setCheckinError] = useState('');

  // Create challenge state
  const [newChalForm, setNewChalForm] = useState({
    title: '',
    description: '',
    category: 'Fitness',
    reward_xp: 150,
    duration_days: 7
  });
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createError, setCreateError] = useState('');

  // Handle Auth actions
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await onLogin(loginForm);
    } catch (err: any) {
      setAuthError(err.message || 'Login credentials incorrect');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await onRegister(registerForm);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    }
  };

  // Submit check-in action
  const handleCheckInSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckinError('');
    if (!submittingCheckinFor) return;
    try {
      // Pick random aesthetic images according to category
      let image = checkinForm.imageUrl;
      if (!image) {
        if (submittingCheckinFor.category === 'Fitness') {
          image = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400';
        } else if (submittingCheckinFor.category === 'Coding') {
          image = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400';
        } else {
          image = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400';
        }
      }
      await onSubmitCheckin(submittingCheckinFor.id, {
        text_proof: checkinForm.text_proof,
        imageUrl: image
      });
      setSubmittingCheckinFor(null);
      setCheckinForm({ text_proof: '', imageUrl: '' });
      setActiveTab('FEED');
    } catch (err: any) {
      setCheckinError(err.message || 'Transmission failed');
    }
  };

  // Submit custom Challenge creation
  const handleChallengeCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess(false);
    try {
      await onCreateChallenge(newChalForm);
      setCreateSuccess(true);
      setNewChalForm({
        title: '',
        description: '',
        category: 'Fitness',
        reward_xp: 150,
        duration_days: 7
      });
      setTimeout(() => {
        setCreateSuccess(false);
        setActiveTab('DISCOVER');
      }, 1500);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to deploy challenge');
    }
  };

  return (
    <div className="w-[360px] h-[720px] bg-[#0F172A] rounded-[48px] border-[10px] border-[#334155] shadow-2xl relative flex flex-col overflow-hidden select-none">
      
      {/* Top Phone Notch / Speaker & Camera details */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#334155] rounded-b-2xl z-50 flex items-center justify-center">
        <div className="w-12 h-1 bg-[#1E293B] rounded-full absolute top-1.5" />
        <div className="w-2 h-2 bg-[#1E293B] rounded-full absolute right-6 top-1" />
      </div>

      {/* Screen Header / Status Bar */}
      <header className="pt-7 px-6 pb-2 bg-[#1E293B] border-b border-[#334155] flex justify-between items-center text-slate-300 font-mono text-xs z-20">
        <span>09:41</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-2 bg-[#10B981] rounded-sm inline-block"></span>
          <span className="text-[10px] font-bold text-emerald-400">5G</span>
          <EBLogo className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        </div>
      </header>

      {/* Primary Simulator Screen Body */}
      <div className="flex-1 bg-[#0F172A] overflow-y-auto overflow-x-hidden p-4 pb-20 custom-scrollbar text-slate-100">
        
        {/* If user is not authenticated, show Auth Screens */}
        {!currentUser ? (
          <div className="py-6 flex flex-col justify-center min-h-[500px]">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20 mb-3">
                <EBLogo className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Access BETZ Ledger</h2>
              <p className="text-xs text-slate-400 mt-1">Social habits staking & verification engine</p>
            </div>

            <AnimatePresence mode="wait">
              {!isRegistering ? (
                <motion.form 
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLoginSubmit} 
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Username or Email</label>
                    <input 
                      type="text"
                      className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                      placeholder="e.g. yannick"
                      value={loginForm.usernameOrEmail}
                      onChange={e => setLoginForm({...loginForm, usernameOrEmail: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Password</label>
                    <input 
                      type="password"
                      className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={loginForm.password}
                      onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Default sandbox key: 123456</span>
                  </div>

                  {authError && (
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs">
                      {authError}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    Enter Protocol
                  </button>

                  <div className="text-center pt-4 border-t border-slate-800/60">
                    <button 
                      type="button" 
                      onClick={() => { setIsRegistering(true); setAuthError(''); }}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-medium"
                    >
                      Create new researcher ledger
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.form 
                  key="register-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRegisterSubmit} 
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Select Username</label>
                    <input 
                      type="text"
                      className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                      placeholder="e.g. nathanael"
                      value={registerForm.username}
                      onChange={e => setRegisterForm({...registerForm, username: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Email Address</label>
                    <input 
                      type="email"
                      className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                      placeholder="nath@gmail.com"
                      value={registerForm.email}
                      onChange={e => setRegisterForm({...registerForm, email: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Password</label>
                    <input 
                      type="password"
                      className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={registerForm.password}
                      onChange={e => setRegisterForm({...registerForm, password: e.target.value})}
                      required
                    />
                  </div>

                  {authError && (
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs">
                      {authError}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2.5 text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register Credentials
                  </button>

                  <div className="text-center pt-4 border-t border-slate-800/60">
                    <button 
                      type="button" 
                      onClick={() => { setIsRegistering(false); setAuthError(''); }}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-medium"
                    >
                      Login with existing profile
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div>
            
            {/* Logged in Welcome bar & quick profile stats */}
            <div className="flex justify-between items-center bg-[#1E293B] p-3 rounded-2xl mb-4 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <User className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">ACTIVE OPERATOR</span>
                  <span className="text-xs font-bold font-mono">@{currentUser.username}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono font-semibold">STAKED</span>
                <span className="text-xs font-black text-amber-400 flex items-center justify-end gap-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  {currentUser.total_xp} XP
                </span>
              </div>
            </div>

            {/* TAB SCREENS */}
            <AnimatePresence mode="wait">
              
              {/* 1. FEED SCREEN */}
              {activeTab === 'FEED' && (
                <motion.div 
                  key="feed-screen"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-1">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">Verification Feed</h3>
                    <span className="text-[10px] text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full font-mono">{feed.length} checkins</span>
                  </div>

                  {feed.length === 0 ? (
                    <div className="text-center py-12 bg-[#1E293B]/40 rounded-2xl border border-dashed border-slate-800">
                      <p className="text-xs text-slate-500 font-mono">No checkpoint proofs logged on chain yet.</p>
                    </div>
                  ) : (
                    feed.map((post) => {
                      // Count votes
                      const approves = post.votes.filter(v => v.vote === 'APPROVE').length;
                      const disputes = post.votes.filter(v => v.vote === 'DISPUTED').length;
                      const userVoted = post.votes.find(v => v.voter_id === currentUser.id);

                      return (
                        <div key={post.id} className="bg-[#1E293B] rounded-2xl overflow-hidden border border-slate-800/80 hover:border-slate-700 transition-all shadow-md">
                          
                          {/* Feed post header */}
                          <div className="p-3 pb-2 flex justify-between items-center bg-[#1E293B]/60 border-b border-slate-800/40">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                              <span className="text-xs font-bold font-mono">@{post.username}</span>
                            </div>
                            <span className="text-[9px] text-slate-400 bg-indigo-950/80 px-2 py-0.5 rounded font-mono border border-indigo-900/40">
                              {post.challenge_title.slice(0, 20)}{post.challenge_title.length > 20 ? '...' : ''}
                            </span>
                          </div>

                          {/* Image proof if exists */}
                          {post.imageUrl && (
                            <div className="w-full h-36 relative bg-slate-950">
                              <img 
                                src={post.imageUrl} 
                                alt="Checkpoint proof" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              
                              {/* Status badge */}
                              <div className="absolute top-2.5 right-2.5">
                                {post.status === 'APPROVED' ? (
                                  <span className="flex items-center gap-1 bg-emerald-950/90 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-500/30 shadow-lg">
                                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                                    VERIFIED
                                  </span>
                                ) : post.status === 'DISPUTED' ? (
                                  <span className="flex items-center gap-1 bg-rose-950/90 text-rose-400 text-[10px] font-bold px-2 py-1 rounded-full border border-rose-500/30 shadow-lg">
                                    <X className="w-3 h-3 text-rose-400" />
                                    DISPUTED
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 bg-amber-950/90 text-amber-400 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-500/30 shadow-lg">
                                    <Clock className="w-3 h-3 text-amber-400" />
                                    PENDING ({approves}/2)
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Proof content */}
                          <div className="p-3 space-y-2">
                            <p className="text-xs text-slate-200 leading-relaxed font-sans italic">
                              "{post.text_proof}"
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="text-emerald-400 font-bold">✓ {approves}</span>
                                <span className="text-slate-600">•</span>
                                <span className="text-rose-400 font-bold">✗ {disputes}</span>
                              </div>
                              <span className="text-[9px] font-mono opacity-80">
                                {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {/* VOTING OPTIONS (Hide for self checkins) */}
                            {post.user_id === currentUser.id ? (
                              <div className="pt-2 text-center text-[9px] font-mono text-slate-500 bg-slate-900/40 py-1.5 rounded-lg border border-slate-800/40">
                                Your own submission
                              </div>
                            ) : (
                              <div className="pt-2 grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => onCastVote(post.id, 'APPROVE')}
                                  disabled={userVoted?.vote === 'APPROVE'}
                                  className={`py-1.5 rounded-xl text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all ${
                                    userVoted?.vote === 'APPROVE'
                                      ? 'bg-emerald-950/40 text-emerald-500/60 border border-emerald-900/20'
                                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => onCastVote(post.id, 'DISPUTED')}
                                  disabled={userVoted?.vote === 'DISPUTED'}
                                  className={`py-1.5 rounded-xl text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all ${
                                    userVoted?.vote === 'DISPUTED'
                                      ? 'bg-rose-950/40 text-rose-500/60 border border-rose-900/20'
                                      : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  }`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Dispute
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}

              {/* 2. DISCOVER SCREEN */}
              {activeTab === 'DISCOVER' && (
                <motion.div 
                  key="discover-screen"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-1">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">Challenge Registry</h3>
                    <span className="text-[10px] text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full font-mono">{challenges.length} active</span>
                  </div>

                  {challenges.map((chal) => {
                    // Check if already enrolled in this
                    const isEnrolled = userChallenges.some(uc => uc.challenge_id === chal.id);
                    const enrollment = userChallenges.find(uc => uc.challenge_id === chal.id);

                    return (
                      <div 
                        key={chal.id} 
                        className="bg-[#1E293B] border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-indigo-500/50 transition-all cursor-pointer"
                        onClick={() => setSelectedChallenge(selectedChallenge?.id === chal.id ? null : chal)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-900/50 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                              {chal.category}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-1.5">{chal.title}</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 font-mono block">REWARD</span>
                            <span className="text-xs font-black text-amber-400 font-mono flex items-center justify-end">
                              +{chal.reward_xp} XP
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-normal font-sans">
                          {chal.description}
                        </p>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-800/50 text-[10px] font-mono text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{chal.duration_days} days limit</span>
                          </div>
                          <span>{chal.participants_count} locked in</span>
                        </div>

                        {/* Expandable Action drawer */}
                        {selectedChallenge?.id === chal.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pt-3 border-t border-slate-800/50 flex flex-col gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-[10px] font-mono text-slate-400">
                              Launched by: <span className="text-slate-200">@{chal.creator_username}</span>
                            </div>
                            
                            {isEnrolled ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 bg-slate-900/60 p-2 rounded-xl">
                                  <span>Enrollment Status:</span>
                                  <span className="text-emerald-400 font-bold">{enrollment?.status}</span>
                                </div>
                                <button
                                  onClick={() => { setSubmittingCheckinFor(chal); setCheckinForm({ text_proof: '', imageUrl: '' }); }}
                                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2 text-xs font-mono font-bold transition-all shadow-md flex items-center justify-center gap-1"
                                >
                                  <Check className="w-4 h-4" />
                                  Log Progress Check-in
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => onJoinChallenge(chal.id)}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2 text-xs font-mono font-bold transition-all shadow-md flex items-center justify-center gap-1"
                              >
                                <Target className="w-4 h-4" />
                                Accept Bet (Stakes Staked)
                              </button>
                            )}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* 3. CREATE SCREEN */}
              {activeTab === 'CREATE' && (
                <motion.div 
                  key="create-screen"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">Deploy New Challenge</h3>
                  
                  <form onSubmit={handleChallengeCreateSubmit} className="space-y-3.5 bg-[#1E293B] p-4 rounded-2xl border border-slate-800">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Challenge Title</label>
                      <input 
                        type="text"
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                        placeholder="e.g. Daily LeetCode Challenge"
                        value={newChalForm.title}
                        onChange={e => setNewChalForm({...newChalForm, title: e.target.value})}
                        maxLength={50}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Staking Description</label>
                      <textarea 
                        className="w-full h-16 bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500 resize-none"
                        placeholder="Detail exactly what researchers must log to prove completion."
                        value={newChalForm.description}
                        onChange={e => setNewChalForm({...newChalForm, description: e.target.value})}
                        maxLength={180}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Category</label>
                        <select
                          className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          value={newChalForm.category}
                          onChange={e => setNewChalForm({...newChalForm, category: e.target.value})}
                        >
                          <option value="Fitness">Fitness</option>
                          <option value="Coding">Coding</option>
                          <option value="Research">Research</option>
                          <option value="Nutrition">Nutrition</option>
                          <option value="Mental">Mental</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Staked Reward</label>
                        <select
                          className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          value={newChalForm.reward_xp}
                          onChange={e => setNewChalForm({...newChalForm, reward_xp: Number(e.target.value)})}
                        >
                          <option value={100}>100 XP</option>
                          <option value={150}>150 XP</option>
                          <option value={200}>200 XP</option>
                          <option value={300}>300 XP</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Duration Days</label>
                      <select
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        value={newChalForm.duration_days}
                        onChange={e => setNewChalForm({...newChalForm, duration_days: Number(e.target.value)})}
                      >
                        <option value={3}>3 Days Stakes</option>
                        <option value={5}>5 Days Stakes</option>
                        <option value={7}>7 Days Stakes</option>
                        <option value={10}>10 Days Stakes</option>
                      </select>
                    </div>

                    {createError && (
                      <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-mono">
                        {createError}
                      </div>
                    )}

                    {createSuccess && (
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-mono">
                        Challenge broadcasted!
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 text-xs font-mono font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Commit Staking Ledger
                    </button>
                  </form>
                </motion.div>
              )}

              {/* 4. LEADERBOARD SCREEN */}
              {activeTab === 'LEADERBOARD' && (
                <motion.div 
                  key="leaderboard-screen"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-1">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">Researcher Ledger</h3>
                    <span className="text-[10px] text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full font-mono">Ranked by Staked XP</span>
                  </div>

                  <div className="bg-[#1E293B] rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/60">
                    {leaderboard.map((user, idx) => {
                      const isSelf = user.id === currentUser.id;
                      return (
                        <div 
                          key={user.id} 
                          className={`p-3.5 flex justify-between items-center transition-all ${
                            isSelf ? 'bg-indigo-600/10' : 'hover:bg-slate-800/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center ${
                              idx === 0 ? 'bg-amber-500 text-slate-950 shadow shadow-amber-500/30' :
                              idx === 1 ? 'bg-slate-300 text-slate-950' :
                              idx === 2 ? 'bg-amber-700 text-white' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {idx + 1}
                            </span>
                            <div>
                              <span className="text-xs font-bold font-mono block text-white">
                                @{user.username} {isSelf && <span className="text-[9px] text-indigo-400 font-semibold font-mono">(YOU)</span>}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono block uppercase">
                                ID: {user.id.slice(0, 8)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-xs font-black text-amber-400 font-mono flex items-center gap-1 justify-end">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
                              {user.total_xp}
                            </span>
                            <span className="text-[9px] text-slate-500 block font-mono">XP LEDGERED</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* 5. PROFILE / MY WORK SCREEN */}
              {activeTab === 'PROFILE' && (
                <motion.div 
                  key="profile-screen"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-1">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">My Accountability Lock-Ins</h3>
                    <button 
                      onClick={onLogout}
                      className="text-[10px] text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg font-mono hover:text-white transition-all flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      Sign Out
                    </button>
                  </div>

                  {userChallenges.length === 0 ? (
                    <div className="text-center py-10 bg-[#1E293B]/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
                      <p className="text-xs text-slate-500 font-mono">You aren't locked into any active stakes right now.</p>
                      <button
                        onClick={() => setActiveTab('DISCOVER')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                      >
                        Find Stakes
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userChallenges.map((uc) => {
                        const chal = uc.challenge;
                        if (!chal) return null;
                        
                        return (
                          <div key={uc.id} className="bg-[#1E293B] border border-slate-800 rounded-2xl p-3.5 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-semibold uppercase">
                                  {chal.category}
                                </span>
                                <h4 className="text-xs font-bold text-white mt-1.5">{chal.title}</h4>
                              </div>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                uc.status === 'COMPLETED' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900' :
                                'bg-indigo-950/60 text-indigo-400 border border-indigo-900'
                              }`}>
                                {uc.status}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                                <span>Check-Ins Accomplished</span>
                                <span className="text-white font-bold">{uc.progress} / {chal.duration_days} days</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300" 
                                  style={{ width: `${Math.min(100, (uc.progress / chal.duration_days) * 100)}%` }}
                                />
                              </div>
                            </div>

                            {/* Trigger checkin form */}
                            {uc.status === 'ACTIVE' && (
                              <button
                                onClick={() => { setSubmittingCheckinFor(chal); setCheckinForm({ text_proof: '', imageUrl: '' }); }}
                                className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-xl py-1.5 text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                Post Check-In Proof
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>

          </div>
        )}

      </div>

      {/* --- FLOATING SUBMIT CHECK-IN POPUP PANEL --- */}
      <AnimatePresence>
        {submittingCheckinFor && (
          <motion.div 
            initial={{ opacity: 0, y: 120 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 120 }}
            className="absolute bottom-0 inset-x-0 bg-[#1E293B] border-t border-slate-700 rounded-t-3xl p-5 space-y-4 z-40 text-slate-100 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase font-bold text-indigo-400 font-mono">SUBMITTING PROOF</span>
                <h4 className="text-xs font-bold text-white mt-0.5">{submittingCheckinFor.title}</h4>
              </div>
              <button 
                onClick={() => setSubmittingCheckinFor(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCheckInSubmitAction} className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Text Proof / Summary</label>
                <textarea 
                  className="w-full h-20 bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500 resize-none"
                  placeholder="Detail exactly what you did as proof (e.g., 'Jogged 5km in 24 mins. Checked heart rate.')"
                  value={checkinForm.text_proof}
                  onChange={e => setCheckinForm({...checkinForm, text_proof: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Custom Image Proof URL (Optional)</label>
                <input 
                  type="url"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                  placeholder="Leave blank for random category placeholder"
                  value={checkinForm.imageUrl}
                  onChange={e => setCheckinForm({...checkinForm, imageUrl: e.target.value})}
                />
              </div>

              {checkinError && (
                <div className="p-2 bg-rose-500/15 border border-rose-500/20 rounded-lg text-rose-400 text-[10px] font-mono">
                  {checkinError}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2.5 text-xs font-mono font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Broadcast Proof to Consensus
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Bottom Tab Navigation Bar (Only if logged in) */}
      {currentUser && (
        <nav className="absolute bottom-0 inset-x-0 h-16 bg-[#1E293B] border-t border-[#334155] px-4 flex items-center justify-between z-30">
          
          <button 
            onClick={() => { setActiveTab('FEED'); setSelectedChallenge(null); setSubmittingCheckinFor(null); }}
            className={`flex flex-col items-center justify-center flex-1 transition-all ${
              activeTab === 'FEED' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span className="text-[8px] font-mono font-medium mt-1">Feed</span>
          </button>

          <button 
            onClick={() => { setActiveTab('DISCOVER'); setSelectedChallenge(null); setSubmittingCheckinFor(null); }}
            className={`flex flex-col items-center justify-center flex-1 transition-all ${
              activeTab === 'DISCOVER' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span className="text-[8px] font-mono font-medium mt-1">Stakes</span>
          </button>

          <button 
            onClick={() => { setActiveTab('CREATE'); setSelectedChallenge(null); setSubmittingCheckinFor(null); }}
            className={`flex flex-col items-center justify-center flex-1 transition-all ${
              activeTab === 'CREATE' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4.5 h-4.5 text-indigo-500 hover:scale-105 active:scale-95" />
            <span className="text-[8px] font-mono font-medium mt-1">Deploy</span>
          </button>

          <button 
            onClick={() => { setActiveTab('LEADERBOARD'); setSelectedChallenge(null); setSubmittingCheckinFor(null); }}
            className={`flex flex-col items-center justify-center flex-1 transition-all ${
              activeTab === 'LEADERBOARD' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span className="text-[8px] font-mono font-medium mt-1">Ledger</span>
          </button>

          <button 
            onClick={() => { setActiveTab('PROFILE'); setSelectedChallenge(null); setSubmittingCheckinFor(null); }}
            className={`flex flex-col items-center justify-center flex-1 transition-all ${
              activeTab === 'PROFILE' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-[8px] font-mono font-medium mt-1">Mine</span>
          </button>

        </nav>
      )}

    </div>
  );
}
