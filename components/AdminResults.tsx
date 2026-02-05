import React, { useEffect, useState } from 'react';

type WinnerRow = {
  date: string;
  gameId: string;
  activity: string;
  score: number;
  status?: string;
  imageUrl?: string;
};

const AdminResults: React.FC = () => {
  const [winners, setWinners] = useState<WinnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch('/api/admin/winners');
        const payload = await resp.json();
        if (!resp.ok) {
          throw new Error(payload?.error || 'Failed to load winners.');
        }
        setWinners(Array.isArray(payload?.winners) ? payload.winners : []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load winners.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-10">Loading winners...</div>;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-luckiest text-custom-lime">Winner History</h2>
          <p className="text-sm text-gray-300">Daily winners archive</p>
        </div>
        <a
          href="#/admin"
          className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
        >
          Back to Admin
        </a>
      </div>

      {error && <p className="text-red-300 mb-4">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900/70">
        <table className="min-w-full text-left text-sm text-gray-200">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {winners.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-400" colSpan={5}>
                  No winners yet.
                </td>
              </tr>
            )}
            {winners.map((winner) => (
              <tr key={winner.date} className="border-t border-gray-800">
                <td className="px-4 py-3 whitespace-nowrap">{winner.date}</td>
                <td className="px-4 py-3">{winner.activity}</td>
                <td className="px-4 py-3">{winner.score}</td>
                <td className="px-4 py-3">{winner.status || 'ready'}</td>
                <td className="px-4 py-3">
                  <a
                    href={`#/admin/winner?date=${encodeURIComponent(winner.date)}`}
                    className="text-custom-lime hover:text-lime-300"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminResults;
