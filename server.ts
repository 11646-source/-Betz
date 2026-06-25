import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { User, Challenge, UserChallenge, CheckIn, Verification, SystemLog } from "./src/types";
import { GoogleGenAI, Type } from "@google/genai";

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Pristine Seed Data
const MOCK_USERS: User[] = [
  {
    id: 'yc745fbf-4076-4767-8919-48227e7ca4b1',
    username: 'yannick',
    email: 'yannick@gmail.com',
    total_xp: 450
  },
  {
    id: 'ry845fbf-4076-4767-8919-48227e7ca4b2',
    username: 'ryan',
    email: 'ryan@gmail.com',
    total_xp: 380
  },
  {
    id: 'na945fbf-4076-4767-8919-48227e7ca4b3',
    username: 'nathanael',
    email: 'nath@gmail.com',
    total_xp: 420
  }
];

const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'chal-1',
    title: 'Daily 5AM Workout',
    description: 'Commit to waking up and checking in with a gym workout photo or log by 6:00 AM daily.',
    category: 'Fitness',
    creator_id: 'yc745fbf-4076-4767-8919-48227e7ca4b1',
    creator_username: 'yannick',
    reward_xp: 150,
    participants_count: 3,
    duration_days: 7,
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'chal-2',
    title: 'Clean Code: Express APIs',
    description: 'Refactor old endpoints to follow strict type safety and REST standard constraints.',
    category: 'Coding',
    creator_id: 'ry845fbf-4076-4767-8919-48227e7ca4b2',
    creator_username: 'ryan',
    reward_xp: 200,
    participants_count: 2,
    duration_days: 5,
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'chal-3',
    title: 'Read 1 Research Paper Daily',
    description: 'Read an ML or distributed systems paper daily and write a 3-sentence summary as proof.',
    category: 'Research',
    creator_id: 'na945fbf-4076-4767-8919-48227e7ca4b3',
    creator_username: 'nathanael',
    reward_xp: 120,
    participants_count: 2,
    duration_days: 10,
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  }
];

const MOCK_USER_CHALLENGES: UserChallenge[] = [
  // Yannick joined fitness, coding
  { id: 'uc-1', user_id: 'yc745fbf-4076-4767-8919-48227e7ca4b1', challenge_id: 'chal-1', enrolled_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), status: 'ACTIVE', progress: 2 },
  { id: 'uc-2', user_id: 'yc745fbf-4076-4767-8919-48227e7ca4b1', challenge_id: 'chal-2', enrolled_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), status: 'ACTIVE', progress: 1 },
  // Ryan joined fitness, coding, research
  { id: 'uc-3', user_id: 'ry845fbf-4076-4767-8919-48227e7ca4b2', challenge_id: 'chal-1', enrolled_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), status: 'ACTIVE', progress: 1 },
  { id: 'uc-4', user_id: 'ry845fbf-4076-4767-8919-48227e7ca4b2', challenge_id: 'chal-2', enrolled_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), status: 'ACTIVE', progress: 2 },
  { id: 'uc-5', user_id: 'ry845fbf-4076-4767-8919-48227e7ca4b2', challenge_id: 'chal-3', enrolled_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), status: 'ACTIVE', progress: 0 },
  // Nathanael joined fitness, research
  { id: 'uc-6', user_id: 'na945fbf-4076-4767-8919-48227e7ca4b3', challenge_id: 'chal-1', enrolled_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), status: 'ACTIVE', progress: 3 },
  { id: 'uc-7', user_id: 'na945fbf-4076-4767-8919-48227e7ca4b3', challenge_id: 'chal-3', enrolled_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), status: 'ACTIVE', progress: 1 }
];

const MOCK_CHECKINS: CheckIn[] = [
  {
    id: 'ci-1',
    user_challenge_id: 'uc-1',
    challenge_id: 'chal-1',
    challenge_title: 'Daily 5AM Workout',
    user_id: 'yc745fbf-4076-4767-8919-48227e7ca4b1',
    username: 'yannick',
    text_proof: 'Leg day completed. Felt great. Woke up at 4:55 AM.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    status: 'APPROVED'
  },
  {
    id: 'ci-2',
    user_challenge_id: 'uc-6',
    challenge_id: 'chal-1',
    challenge_title: 'Daily 5AM Workout',
    user_id: 'na945fbf-4076-4767-8919-48227e7ca4b3',
    username: 'nathanael',
    text_proof: 'Morning jog in the drizzle. 5.2km. Streak holds!',
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&auto=format&fit=crop&q=60',
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    status: 'APPROVED'
  },
  {
    id: 'ci-3',
    user_challenge_id: 'uc-2',
    challenge_id: 'chal-2',
    challenge_title: 'Clean Code: Express APIs',
    user_id: 'yc745fbf-4076-4767-8919-48227e7ca4b1',
    username: 'yannick',
    text_proof: 'Completed the custom middleware for transaction rollback testing.',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60',
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    status: 'PENDING'
  },
  {
    id: 'ci-4',
    user_challenge_id: 'uc-7',
    challenge_id: 'chal-3',
    challenge_title: 'Read 1 Research Paper Daily',
    user_id: 'na945fbf-4076-4767-8919-48227e7ca4b3',
    username: 'nathanael',
    text_proof: 'Reviewed the original Spanner paper. Mindblown by TrueTime API guarantees!',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=60',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    status: 'PENDING'
  }
];

const MOCK_VERIFICATIONS: Verification[] = [
  { id: 'v-1', check_in_id: 'ci-1', voter_id: 'ry845fbf-4076-4767-8919-48227e7ca4b2', voter_username: 'ryan', vote: 'APPROVE', created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
  { id: 'v-2', check_in_id: 'ci-1', voter_id: 'na945fbf-4076-4767-8919-48227e7ca4b3', voter_username: 'nathanael', vote: 'APPROVE', created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
  { id: 'v-3', check_in_id: 'ci-2', voter_id: 'yc745fbf-4076-4767-8919-48227e7ca4b1', voter_username: 'yannick', vote: 'APPROVE', created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
  { id: 'v-4', check_in_id: 'ci-2', voter_id: 'ry845fbf-4076-4767-8919-48227e7ca4b2', voter_username: 'ryan', vote: 'APPROVE', created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
  { id: 'v-5', check_in_id: 'ci-3', voter_id: 'ry845fbf-4076-4767-8919-48227e7ca4b2', voter_username: 'ryan', vote: 'APPROVE', created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString() }
];

const MOCK_LOGS: SystemLog[] = [
  { id: 'log-1', action: 'SYSTEM_BOOT', timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), details: 'BETZ transaction verification ledger initialized successfully.' },
  { id: 'log-2', action: 'SEEDED_SANDBOX', timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), details: 'Populated initial profiles for Yannick Sookree, Ryan Adams Bundhoo, and Nathanaël Perraud.' },
  { id: 'log-3', action: 'CHALLENGE_CREATED', timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), details: 'Yannick launched challenge: Daily 5AM Workout.' },
  { id: 'log-4', action: 'USER_ENROLLED', timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), details: 'Ryan and Nathanaël enrolled into Yannicks challenge: Daily 5AM Workout.' }
];

// Database state container
let db = {
  users: JSON.parse(JSON.stringify(MOCK_USERS)) as User[],
  challenges: JSON.parse(JSON.stringify(MOCK_CHALLENGES)) as Challenge[],
  user_challenges: JSON.parse(JSON.stringify(MOCK_USER_CHALLENGES)) as UserChallenge[],
  check_ins: JSON.parse(JSON.stringify(MOCK_CHECKINS)) as CheckIn[],
  verifications: JSON.parse(JSON.stringify(MOCK_VERIFICATIONS)) as Verification[],
  logs: JSON.parse(JSON.stringify(MOCK_LOGS)) as SystemLog[]
};

// Logger helper
function addLog(action: string, details: string) {
  const newLog: SystemLog = {
    id: 'log-' + generateId(),
    action,
    timestamp: new Date().toISOString(),
    details
  };
  db.logs.unshift(newLog);
  // Keep logs at max 100
  if (db.logs.length > 100) {
    db.logs = db.logs.slice(0, 100);
  }
}

// Auth validator middleware / parsed helper
function getUserIdFromAuth(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  if (authHeader.startsWith("mock-jwt-token-for-")) {
    const userId = authHeader.replace("mock-jwt-token-for-", "");
    // verify user exists
    const user = db.users.find(u => u.id === userId);
    return user ? user.id : null;
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());

  // Log request API
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API REQUEST] ${req.method} ${req.path}`);
    }
    next();
  });

  // --- API ROUTES ---

  // Auth: Register
  app.post("/api/auth/register", (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email) {
      return res.status(400).json({ error: "Username and email are required fields." });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = db.users.find(u => u.username === cleanUsername || u.email === email.trim());
    if (existing) {
      return res.status(400).json({ error: "A researcher with this username or email already exists." });
    }

    const newUser: User = {
      id: generateId(),
      username: cleanUsername,
      email: email.trim(),
      total_xp: 100 // Starting bonus XP
    };

    db.users.push(newUser);
    addLog('USER_REGISTERED', `New researcher registration completed: @${cleanUsername} joined BETZ engine.`);

    res.json({
      user: newUser,
      token: `mock-jwt-token-for-${newUser.id}`
    });
  });

  // Auth: Login / Quick Switch
  app.post("/api/auth/login", (req, res) => {
    const { usernameOrEmail } = req.body;
    if (!usernameOrEmail) {
      return res.status(400).json({ error: "Username or email is required." });
    }

    const searchStr = usernameOrEmail.trim().toLowerCase();
    const user = db.users.find(u => u.username === searchStr || u.email.toLowerCase() === searchStr);

    if (!user) {
      return res.status(404).json({ error: "Researcher profile not found in transaction registry." });
    }

    addLog('USER_LOGIN', `@${user.username} successfully authenticated session.`);
    res.json({
      user,
      token: `mock-jwt-token-for-${user.id}`
    });
  });

  // Get generic feed (Checkins + their votes)
  app.get("/api/feed", (req, res) => {
    const feed = db.check_ins.map(ci => {
      const votes = db.verifications.filter(v => v.check_in_id === ci.id);
      return {
        ...ci,
        votes
      };
    });

    // Sort by created_at descending
    feed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(feed);
  });

  // Get challenges list
  app.get("/api/challenges", (req, res) => {
    res.json(db.challenges);
  });

  // Create a new challenge
  app.post("/api/challenges", (req, res) => {
    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized session credentials." });
    }

    const user = db.users.find(u => u.id === userId)!;
    const { title, description, category, reward_xp, duration_days, starts_in_hours } = req.body;

    if (!title || !description || !category || !reward_xp || !duration_days) {
      return res.status(400).json({ error: "All challenge meta parameters (title, description, category, reward_xp, duration_days) are required." });
    }

    const delayHours = starts_in_hours !== undefined ? Number(starts_in_hours) : 1;
    const startTimeDate = new Date(Date.now() + delayHours * 3600 * 1000);

    const challengeId = 'chal-' + generateId();
    const newChallenge: Challenge = {
      id: challengeId,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      creator_id: user.id,
      creator_username: user.username,
      reward_xp: Number(reward_xp),
      participants_count: 1, // Creator is joined immediately
      duration_days: Number(duration_days),
      created_at: new Date().toISOString(),
      start_time: startTimeDate.toISOString()
    };

    db.challenges.push(newChallenge);

    // Auto join the creator
    const enrollmentId = 'uc-' + generateId();
    const newEnrollment: UserChallenge = {
      id: enrollmentId,
      user_id: user.id,
      challenge_id: challengeId,
      enrolled_at: new Date().toISOString(),
      status: 'ACTIVE',
      progress: 0
    };
    db.user_challenges.push(newEnrollment);

    addLog('CHALLENGE_CREATED', `Challenge "${newChallenge.title}" launched by @${user.username}. Earn ${newChallenge.reward_xp} XP!`);
    res.json(newChallenge);
  });

  // Get Leaderboard
  app.get("/api/leaderboard", (req, res) => {
    const sorted = [...db.users].sort((a, b) => b.total_xp - a.total_xp);
    res.json(sorted);
  });

  // Get system logs
  app.get("/api/system/logs", (req, res) => {
    res.json(db.logs);
  });

  // Get full database state
  app.get("/api/system/state", (req, res) => {
    res.json({
      users: db.users,
      challenges: db.challenges,
      user_challenges: db.user_challenges,
      check_ins: db.check_ins,
      verifications: db.verifications
    });
  });

  // Get active user's specialized enrollments
  app.get("/api/users/:userId/challenges", (req, res) => {
    const { userId } = req.params;
    const enrolled = db.user_challenges
      .filter(uc => uc.user_id === userId)
      .map(uc => {
        const challenge = db.challenges.find(c => c.id === uc.challenge_id);
        return {
          ...uc,
          challenge: challenge || null
        };
      });
    res.json(enrolled);
  });

  // Join challenge
  app.post("/api/challenges/:challengeId/join", (req, res) => {
    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized session." });
    }

    const { challengeId } = req.params;
    const challenge = db.challenges.find(c => c.id === challengeId);
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found." });
    }

    // Check if already enrolled
    const alreadyEnrolled = db.user_challenges.some(uc => uc.user_id === userId && uc.challenge_id === challengeId);
    if (alreadyEnrolled) {
      return res.status(400).json({ error: "You are already locked into this challenge." });
    }

    const enrollment: UserChallenge = {
      id: 'uc-' + generateId(),
      user_id: userId,
      challenge_id: challengeId,
      enrolled_at: new Date().toISOString(),
      status: 'ACTIVE',
      progress: 0
    };

    db.user_challenges.push(enrollment);
    challenge.participants_count += 1;

    const user = db.users.find(u => u.id === userId)!;
    addLog('USER_ENROLLED', `@${user.username} joined the task group for "${challenge.title}".`);

    res.json(enrollment);
  });

  // Submit check-in
  app.post("/api/challenges/:challengeId/checkin", (req, res) => {
    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized session." });
    }

    const { challengeId } = req.params;
    const { text_proof, imageUrl } = req.body;

    if (!text_proof) {
      return res.status(400).json({ error: "Text proof detailing your progress is required." });
    }

    const challenge = db.challenges.find(c => c.id === challengeId);
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found." });
    }

    const userChallenge = db.user_challenges.find(uc => uc.user_id === userId && uc.challenge_id === challengeId);
    if (!userChallenge) {
      return res.status(400).json({ error: "You must join the challenge before checking in." });
    }

    // Simple cooldown: can't check in more than once every 1 minute in simulated time (or real-time) to prevent spamming
    const user = db.users.find(u => u.id === userId)!;

    // Create Check-in
    const checkinId = 'ci-' + generateId();
    const newCheckIn: CheckIn = {
      id: checkinId,
      user_challenge_id: userChallenge.id,
      challenge_id: challengeId,
      challenge_title: challenge.title,
      user_id: userId,
      username: user.username,
      text_proof: text_proof.trim(),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=60',
      created_at: new Date().toISOString(),
      status: 'PENDING'
    };

    db.check_ins.push(newCheckIn);
    addLog('CHECK_IN_SUBMITTED', `@${user.username} submitted daily proof for "${challenge.title}": "${text_proof.slice(0, 40)}..."`);

    res.json(newCheckIn);
  });

  // Cast vote / verify checkin
  app.post("/api/checkins/:checkInId/verify", (req, res) => {
    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized session." });
    }

    const { checkInId } = req.params;
    const { vote } = req.body; // 'APPROVE' or 'DISPUTED'

    if (!vote || (vote !== 'APPROVE' && vote !== 'DISPUTED')) {
      return res.status(400).json({ error: "Vote type must be 'APPROVE' or 'DISPUTED'." });
    }

    const checkIn = db.check_ins.find(ci => ci.id === checkInId);
    if (!checkIn) {
      return res.status(404).json({ error: "Check-in log not found." });
    }

    if (checkIn.user_id === userId) {
      return res.status(400).json({ error: "Researchers are prohibited from verifying their own proof entries." });
    }

    // Check if already voted
    const alreadyVoted = db.verifications.find(v => v.check_in_id === checkInId && v.voter_id === userId);
    if (alreadyVoted) {
      if (alreadyVoted.vote === vote) {
        return res.status(400).json({ error: "You have already cast an identical vote on this entry." });
      } else {
        // Change vote
        alreadyVoted.vote = vote;
        alreadyVoted.created_at = new Date().toISOString();
      }
    } else {
      // New vote
      const voter = db.users.find(u => u.id === userId)!;
      const newVote: Verification = {
        id: 'v-' + generateId(),
        check_in_id: checkInId,
        voter_id: userId,
        voter_username: voter.username,
        vote,
        created_at: new Date().toISOString()
      };
      db.verifications.push(newVote);
    }

    // Recalculate check-in status based on total votes
    const checkinVotes = db.verifications.filter(v => v.check_in_id === checkInId);
    const approves = checkinVotes.filter(v => v.vote === 'APPROVE').length;
    const disputes = checkinVotes.filter(v => v.vote === 'DISPUTED').length;

    const voterUser = db.users.find(u => u.id === userId)!;
    addLog('VOTE_CAST', `@${voterUser.username} cast a "${vote}" vote on @${checkIn.username}'s check-in proof.`);

    // Rule: If we reach >= 2 APPROVES and approves > disputes, it becomes APPROVED
    // If APPROVED, we update progress and award XP if not already awarded
    if (checkIn.status === 'PENDING') {
      if (approves >= 2 && approves > disputes) {
        checkIn.status = 'APPROVED';
        
        // Find user enrollment to increment progress
        const userChallenge = db.user_challenges.find(uc => uc.id === checkIn.user_challenge_id);
        const challenge = db.challenges.find(c => c.id === checkIn.challenge_id);
        
        if (userChallenge && challenge) {
          userChallenge.progress += 1;
          
          // Award XP bonus
          const earner = db.users.find(u => u.id === checkIn.user_id);
          if (earner) {
            const xpReward = Math.round(challenge.reward_xp / challenge.duration_days);
            earner.total_xp += xpReward;
            addLog('XP_AWARDED', `@${earner.username} was awarded +${xpReward} XP for verified day in "${challenge.title}"!`);
          }

          // Complete challenge check
          if (userChallenge.progress >= challenge.duration_days) {
            userChallenge.status = 'COMPLETED';
            addLog('CHALLENGE_COMPLETED', `🎉 @${checkIn.username} completed the challenge "${challenge.title}" in full!`);
          }
        }
      } else if (disputes >= 2 && disputes >= approves) {
        checkIn.status = 'DISPUTED';
        addLog('PROOF_DISPUTED', `⚠️ Check-in from @${checkIn.username} was flagged as DISPUTED by consensus.`);
      }
    }

    res.json({
      status: "success",
      checkInStatus: checkIn.status
    });
  });

  // Trigger clock advancement / simulate reviews & completions
  app.post("/api/system/reset-engine", (req, res) => {
    addLog('CLOCK_ADVANCED', `Triggered cron processing. Simulating peer validations on pending checkpoints.`);

    // Auto-approve pending check-ins with at least 1 approve vote
    let processedCount = 0;
    db.check_ins.forEach(ci => {
      if (ci.status === 'PENDING') {
        const votes = db.verifications.filter(v => v.check_in_id === ci.id);
        const approves = votes.filter(v => v.vote === 'APPROVE').length;
        const disputes = votes.filter(v => v.vote === 'DISPUTED').length;

        // Auto vote simulation: have other researchers cast a helpful review if empty!
        if (votes.length === 0) {
          // Choose a random helper (excluding the checkin creator)
          const potentialHelpers = db.users.filter(u => u.id !== ci.user_id);
          if (potentialHelpers.length > 0) {
            const helper = potentialHelpers[Math.floor(Math.random() * potentialHelpers.length)];
            const newVote: Verification = {
              id: 'v-' + generateId(),
              check_in_id: ci.id,
              voter_id: helper.id,
              voter_username: helper.username,
              vote: 'APPROVE',
              created_at: new Date().toISOString()
            };
            db.verifications.push(newVote);
            addLog('SIMULATED_VOTE', `@${helper.username} auto-verified checkin for @${ci.username}.`);
          }
        }

        // Re-evaluate
        const finalVotes = db.verifications.filter(v => v.check_in_id === ci.id);
        const finalApproves = finalVotes.filter(v => v.vote === 'APPROVE').length;
        const finalDisputes = finalVotes.filter(v => v.vote === 'DISPUTED').length;

        if (finalApproves >= 1 && finalDisputes === 0) {
          ci.status = 'APPROVED';
          processedCount++;

          const userChallenge = db.user_challenges.find(uc => uc.id === ci.user_challenge_id);
          const challenge = db.challenges.find(c => c.id === ci.challenge_id);
          
          if (userChallenge && challenge) {
            userChallenge.progress += 1;
            const earner = db.users.find(u => u.id === ci.user_id);
            if (earner) {
              const xpReward = Math.round(challenge.reward_xp / challenge.duration_days);
              earner.total_xp += xpReward;
              addLog('XP_AWARDED', `Consensus: @${earner.username} receives +${xpReward} XP for "${challenge.title}".`);
            }
          }
        }
      }
    });

    addLog('CRON_COMPLETE', `Engine cycle complete. Validated ${processedCount} pending proof logs.`);
    res.json({ message: "Advancement processed successfully", processed: processedCount });
  });

  // Reset sandbox back to original mock Yannick, Ryan & Nathanaël default tables
  app.post("/api/system/reset-sandbox", (req, res) => {
    db = {
      users: JSON.parse(JSON.stringify(MOCK_USERS)) as User[],
      challenges: JSON.parse(JSON.stringify(MOCK_CHALLENGES)) as Challenge[],
      user_challenges: JSON.parse(JSON.stringify(MOCK_USER_CHALLENGES)) as UserChallenge[],
      check_ins: JSON.parse(JSON.stringify(MOCK_CHECKINS)) as CheckIn[],
      verifications: JSON.parse(JSON.stringify(MOCK_VERIFICATIONS)) as Verification[],
      logs: [
        { id: 'log-' + generateId(), action: 'RESET_SANDBOX', timestamp: new Date().toISOString(), details: 'Database sandbox rollback triggered. Yannick, Ryan & Nathanaël restored.' }
      ]
    };
    res.json({ status: "ok" });
  });

  // Clear system logs
  app.post("/api/system/clear-logs", (req, res) => {
    db.logs = [
      { id: 'log-' + generateId(), action: 'CLEAR_LOGS', timestamp: new Date().toISOString(), details: 'System ledger logs flushed clean.' }
    ];
    res.json({ status: "ok" });
  });

  // Simulate missing/failing a challenge
  app.post("/api/system/simulate-fail", (req, res) => {
    const { userId, userChallengeId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    let uc = null;
    if (userChallengeId) {
      uc = db.user_challenges.find(u => u.id === userChallengeId && u.user_id === userId);
    } else {
      uc = db.user_challenges.find(u => u.user_id === userId && u.status === 'ACTIVE');
    }

    if (!uc) {
      return res.status(404).json({ error: "No active challenge found to simulate failure." });
    }

    const chal = db.challenges.find(c => c.id === uc.challenge_id);
    const user = db.users.find(u => u.id === userId);

    if (uc && chal && user) {
      uc.status = 'FAILED';
      const penalty = Math.min(user.total_xp, 100);
      user.total_xp -= penalty;
      
      addLog('CHALLENGE_FAILED', `💀 ALARM: @${user.username} lost the challenge "${chal.title}"! Failed to log daily check-in. -${penalty} Staked XP has been slashed!`);
      
      return res.json({ 
        success: true, 
        message: `Simulated failure for "${chal.title}".`,
        userChallenge: uc,
        penalty
      });
    }

    res.status(400).json({ error: "Could not process simulation." });
  });

  // Simulate a reminder for a challenge to do
  app.post("/api/system/simulate-reminder", (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const uc = db.user_challenges.find(u => u.user_id === userId && u.status === 'ACTIVE');
    const user = db.users.find(u => u.id === userId);

    if (!uc) {
      return res.status(404).json({ error: "No active challenge found to remind." });
    }

    const chal = db.challenges.find(c => c.id === uc.challenge_id);
    if (chal && user) {
      addLog('ALARM_REMINDER', `⏰ ALARM: @${user.username} has an outstanding checkpoint to complete for "${chal.title}"! Due in 2 hours.`);
      return res.json({
        success: true,
        message: `Alarm reminder broadcasted for "${chal.title}".`,
        challengeTitle: chal.title
      });
    }

    res.status(400).json({ error: "Could not process reminder simulation." });
  });

  // Simulate a warning alarm for a challenge starting in 1 hour
  app.post("/api/system/simulate-start", (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const user = db.users.find(u => u.id === userId);
    // Find the latest challenge created or first challenge
    const chal = db.challenges[db.challenges.length - 1] || db.challenges[0];

    if (chal && user) {
      // Dynamically set start_time to 45 minutes in the future so that the frontend's automated alarm fires instantly!
      chal.start_time = new Date(Date.now() + 45 * 60 * 1000).toISOString();
      
      addLog('ALARM_START_SOON', `⏰ UPCOMING ALARM: "${chal.title}" starts in 45 minutes! Challenger @${user.username}, make sure you are ready to log proof!`);
      return res.json({
        success: true,
        message: `Starting soon alarm broadcasted for "${chal.title}".`,
        challengeTitle: chal.title
      });
    }

    res.status(400).json({ error: "Could not process starting simulation." });
  });

  // Research and generate challenge + challenger using Gemini API
  app.post("/api/system/research-challenger", async (req, res) => {
    const { topic, userId } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Research topic is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "GEMINI_API_KEY environment variable is not configured." });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Find/research a matching human friend/accountability partner and a custom challenge outline for: "${topic}".`,
        config: {
          systemInstruction: `You are an expert matchmaking and social discovery engine for BETZ, a high-stakes habit verification game. Based on the user's research topic or interest, find/create a realistic human friend/accountability partner (a real person, NOT a bot or AI) who shares this specific passion, and design a customized daily habit challenge for both of them to complete. Return JSON with 'challenge' (title, description, category, reward_xp, duration_days) and 'challenger' (username, email, bio). The category must be one of: Fitness, Coding, Research, Nutrition, Mental. The challenger MUST be a human-like friend profile with a realistic human username (e.g. 'sarah_runs', 'dev_dan', 'alex_keto', 'emily_reads' - NO 'bot', 'ai', 'system', or 'agent' in the name). The bio should describe their human background, career, or hobby interests that make them a perfect new partner friend for the user.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              challenge: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "A punchy, short, motivating title for the challenge, under 50 characters." },
                  description: { type: Type.STRING, description: "Actionable details on what researchers must log to prove completion, under 180 characters." },
                  category: { type: Type.STRING, description: "Must be exactly one of: Fitness, Coding, Research, Nutrition, Mental." },
                  reward_xp: { type: Type.INTEGER, description: "XP reward. Choose one of: 100, 150, 200, 300." },
                  duration_days: { type: Type.INTEGER, description: "Duration in days. Choose one of: 3, 5, 7, 10." }
                },
                required: ["title", "description", "category", "reward_xp", "duration_days"]
              },
              challenger: {
                type: Type.OBJECT,
                properties: {
                  username: { type: Type.STRING, description: "Lowercase, alphanumeric only username for the new human friend (e.g. 'jake_lifts', 'code_clara', 'sophia_reads'). No spaces, no 'bot' or 'ai' keywords." },
                  email: { type: Type.STRING, description: "Email for this person." },
                  bio: { type: Type.STRING, description: "A 1-sentence description of this person's background, hobby or career that makes them a great match." }
                },
                required: ["username", "email", "bio"]
              }
            },
            required: ["challenge", "challenger"]
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Empty response from Gemini research model.");
      }

      const data = JSON.parse(resultText);

      // Sanitize username
      let usernameClean = data.challenger.username.toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (!usernameClean) {
        usernameClean = "ai_challenger_" + generateId().slice(0, 5);
      }

      // Check if username already exists, if so append unique suffix
      let finalUsername = usernameClean;
      let suffix = 1;
      while (db.users.some(u => u.username === finalUsername)) {
        finalUsername = `${usernameClean}_${suffix}`;
        suffix++;
      }

      // Create Challenger User
      const challengerUser: User = {
        id: 'user-' + generateId(),
        username: finalUsername,
        email: data.challenger.email || `${finalUsername}@betz.ai`,
        total_xp: 150
      };
      db.users.push(challengerUser);

      // Create Challenge
      const challengeId = 'chal-' + generateId();
      const newChallenge: Challenge = {
        id: challengeId,
        title: data.challenge.title || `${topic} Challenge`,
        description: data.challenge.description || `Daily tracking of ${topic}.`,
        category: data.challenge.category || "Research",
        creator_id: challengerUser.id,
        creator_username: challengerUser.username,
        reward_xp: Number(data.challenge.reward_xp) || 150,
        participants_count: userId ? 2 : 1,
        duration_days: Number(data.challenge.duration_days) || 7,
        created_at: new Date().toISOString(),
        start_time: new Date(Date.now() + 1 * 3600 * 1000).toISOString() // Starts in 1 hour
      };
      db.challenges.push(newChallenge);

      // Enroll Challenger
      db.user_challenges.push({
        id: 'uc-' + generateId(),
        user_id: challengerUser.id,
        challenge_id: challengeId,
        enrolled_at: new Date().toISOString(),
        status: 'ACTIVE',
        progress: 0
      });

      // Enroll User
      if (userId) {
        db.user_challenges.push({
          id: 'uc-' + generateId(),
          user_id: userId,
          challenge_id: challengeId,
          enrolled_at: new Date().toISOString(),
          status: 'ACTIVE',
          progress: 0
        });
      }

      addLog('FRIEND_RESEARCH_CHALLENGE', `Matchmaker created a new challenge: "${newChallenge.title}" with category ${newChallenge.category}.`);
      addLog('FRIEND_MATCHED', `New friend matched: @${challengerUser.username}! Bio: "${data.challenger.bio}".`);
      addLog('USER_ENROLLED', `@${challengerUser.username} and you joined the task group for "${newChallenge.title}".`);

      res.json({
        success: true,
        challenge: newChallenge,
        challenger: challengerUser,
        bio: data.challenger.bio
      });

    } catch (err: any) {
      console.error("[GEMINI ERROR]", err);
      res.status(500).json({ error: err.message || "Failed to research challenge using Gemini." });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
