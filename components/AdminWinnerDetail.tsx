import React, { useEffect, useState } from 'react';

type WinnerDetail = {
  date: string;
  activity: string;
  score: number;
  status?: string;
  imageUrl?: string;
  imagePrompt?: string;
  gameName?: string;
  rules?: string[];
};

const getDateFromHash = () => {
  if (typeof window === 'undefined') return '';
  const hash = window.location.hash || '';
  const query = hash.split('?')[1] || '';
  const params = new URLSearchParams(query);
  return params.get('date') || '';
};

const AdminWinnerDetail: React.FC = () => {
  const [winner, setWinner] = useState<WinnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const date = getDateFromHash();
    if (!date) {
      setError('Missing date.');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(`/api/admin/winner-detail?date=${encodeURIComponent(date)}`);
        const payload = await resp.json();
        if (!resp.ok) {
          throw new Error(payload?.error || 'Failed to load winner.');
        }
        setWinner(payload?.winner || null);
      } catch (err: any) {
        setError(err?.message || 'Failed to load winner.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-10">Loading winner...</div>;
  }

  if (!winner) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-red-300">{error || 'Winner not found.'}</p>
        <a href="#/admin/results" className="text-custom-lime">Back to Results</a>
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-luckiest text-custom-lime">Winner Details</h2>
          <p className="text-sm text-gray-300">{winner.date}</p>
        </div>
        <a href="#/admin/results" className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600">
          Back to Results
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-5 space-y-3">
          <p><span className="text-gray-400">Activity:</span> {winner.activity}</p>
          <p><span className="text-gray-400">Score:</span> {winner.score}/100</p>
          {winner.gameName && <p><span className="text-gray-400">Game Name:</span> {winner.gameName}</p>}
          {winner.status && <p><span className="text-gray-400">Status:</span> {winner.status}</p>}
          {winner.rules && winner.rules.length > 0 && (
            <div>
              <p className="text-gray-400 mb-2">Rules</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-200">
                {winner.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-5">
          {winner.imageUrl ? (
            <img src={winner.imageUrl} alt="Winner card" className="w-full rounded-lg border border-gray-700" />
          ) : (
            <p className="text-gray-400">No image generated yet.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminWinnerDetail;
