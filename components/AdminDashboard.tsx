import React, { useEffect, useMemo, useState } from 'react';

type GameRow = {
  gameId: string;
  activity: string;
  chaosLevel: number;
  ruleCount: number;
  dareCount: number;
  createdAt: string;
  chaosScore: number;
};

type Winner = {
  gameId: string;
  activity: string;
  score: number;
  status?: string;
  imagePrompt?: string;
  imageUrl?: string;
  socialCaption?: string;
};

const toDateValue = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sessionEmail, setSessionEmail] = useState('');
  const [date, setDate] = useState(toDateValue());
  const [games, setGames] = useState<GameRow[]>([]);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const totalGames = useMemo(() => games.length, [games]);

  const loadSession = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/admin/session');
      const payload = await resp.json();
      setAuthenticated(Boolean(payload?.authenticated));
      setSessionEmail(payload?.email || '');
    } catch {
      setAuthenticated(false);
      setSessionEmail('');
    } finally {
      setLoading(false);
    }
  };

  const loadGamesAndWinner = async (targetDate: string) => {
    setError(null);
    try {
      const [gamesResp, winnerResp] = await Promise.all([
        fetch(`/api/admin/games?date=${encodeURIComponent(targetDate)}`),
        fetch(`/api/admin/winner-today?date=${encodeURIComponent(targetDate)}`),
      ]);

      if (gamesResp.status === 401 || winnerResp.status === 401) {
        setAuthenticated(false);
        setSessionEmail('');
        return;
      }

      const gamesPayload = await gamesResp.json();
      const winnerPayload = await winnerResp.json();

      if (!gamesResp.ok) {
        throw new Error(gamesPayload?.error || 'Failed to load games.');
      }
      if (!winnerResp.ok) {
        throw new Error(winnerPayload?.error || 'Failed to load winner.');
      }

      setGames(Array.isArray(gamesPayload?.games) ? gamesPayload.games : []);
      setWinner(winnerPayload?.winner || null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load admin data.');
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadGamesAndWinner(date);
    }
  }, [authenticated, date]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const resp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(payload?.error || 'Login failed.');
      }
      setAuthenticated(true);
      setSessionEmail(payload?.email || email);
      setPassword('');
      await loadGamesAndWinner(date);
    } catch (err: any) {
      setError(err?.message || 'Login failed.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setSessionEmail('');
    setGames([]);
    setWinner(null);
  };

  const runDailyScoring = async () => {
    setJobStatus('Running daily scoring...');
    setError(null);
    try {
      const resp = await fetch('/api/admin/daily-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      const payload = await resp.json();
      if (!resp.ok) {
        throw new Error(payload?.error || 'Daily scoring failed.');
      }
      setWinner(payload?.winner || null);
      setJobStatus(payload?.skipped ? 'Winner already exists for this date.' : 'Daily scoring complete.');
      await loadGamesAndWinner(date);
    } catch (err: any) {
      setError(err?.message || 'Daily scoring failed.');
      setJobStatus(null);
    }
  };

  const generateWinnerImage = async () => {
    setImageStatus('Generating image...');
    setImageError(null);
    setIsGeneratingImage(true);
    try {
      const resp = await fetch('/api/admin/generate-winner-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      const payload = await resp.json();
      if (!resp.ok) {
        const detailText = payload?.details ? ` (${payload.details})` : '';
        throw new Error(`${payload?.error || 'Image generation failed.'}${detailText}`);
      }
      setWinner(payload?.winner || null);
      setImageStatus('Image generated.');
    } catch (err: any) {
      setImageError(err?.message || 'Image generation failed.');
      setImageStatus(null);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12">Loading admin dashboard...</div>;
  }

  if (!authenticated) {
    return (
      <section className="max-w-md mx-auto px-4 py-12">
        <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-luckiest mb-4 text-center text-custom-lime">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              className="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-600 text-white"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-600 text-white"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-md bg-custom-lime text-custom-purple font-semibold hover:bg-lime-300"
            >
              Log in
            </button>
          </form>
          {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-luckiest text-custom-lime">Sipocalypse Admin</h2>
          <p className="text-sm text-gray-300">Signed in as {sessionEmail}</p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600">
          Log out
        </button>
      </div>

      <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-5 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="admin-date" className="block text-sm text-gray-300 mb-1">Date</label>
            <input
              id="admin-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white"
            />
          </div>
          <button
            onClick={() => loadGamesAndWinner(date)}
            className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
          >
            Refresh
          </button>
          <button
            onClick={runDailyScoring}
            className="px-4 py-2 rounded-md bg-custom-lime text-custom-purple font-semibold hover:bg-lime-300"
          >
            Run Daily Scoring
          </button>
          <button
            onClick={generateWinnerImage}
            className="px-4 py-2 rounded-md bg-purple-500 text-white font-semibold hover:bg-purple-400"
            disabled={isGeneratingImage}
          >
            {isGeneratingImage ? 'Generating...' : 'Generate Winner Image'}
          </button>
        </div>
        {jobStatus && <p className="text-sm text-green-300 mt-3">{jobStatus}</p>}
        {error && <p className="text-sm text-red-300 mt-3">{error}</p>}
        {imageStatus && <p className="text-sm text-green-300 mt-3">{imageStatus}</p>}
        {imageError && <p className="text-sm text-red-300 mt-3">{imageError}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-5">
          <h3 className="text-xl font-semibold text-white mb-2">Today's Winner</h3>
          {!winner ? (
            <p className="text-gray-300 text-sm">No winner selected yet for this date.</p>
          ) : (
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Activity:</span> {winner.activity}</p>
              <p><span className="text-gray-400">Score:</span> {winner.score}/100</p>
              {winner.status && <p><span className="text-gray-400">Status:</span> {winner.status}</p>}
              {winner.imageUrl && (
                <div className="pt-3">
                  <img
                    src={winner.imageUrl}
                    alt="Winner card"
                    className="w-full rounded-lg border border-gray-700"
                  />
                  <p className="text-xs text-gray-400 mt-2">Image link expires after about 60 minutes unless stored.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-5">
          <h3 className="text-xl font-semibold text-white mb-2">Games ({totalGames})</h3>
          <div className="max-h-80 overflow-auto space-y-2 pr-1">
            {games.length === 0 && <p className="text-gray-300 text-sm">No games logged for this date.</p>}
            {games.map((game) => (
              <div key={game.gameId} className="border border-gray-700 rounded-lg p-3 bg-gray-800/60">
                <p className="text-sm font-semibold text-white">{game.activity}</p>
                <p className="text-xs text-gray-300 mt-1">
                  chaos {game.chaosLevel} | rules {game.ruleCount} | dares {game.dareCount} | base chaos score {game.chaosScore}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
