import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export default function History() {
  const sessions = useLiveQuery(() => 
    db.workoutSessions.orderBy('date').reverse().toArray()
  );

  if (!sessions) return <div className="p-4">Loading history...</div>;

  return (
    <div className="p-4 space-y-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">HISTORY</h1>
        <p className="text-text-muted">Your past workouts</p>
      </header>

      {sessions.length === 0 ? (
        <p className="text-text-muted text-center mt-10">No workouts recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({ session }: { session: any }) {
  const day = useLiveQuery(() => db.workoutDays.get(session.dayId));
  
  if (!day) return null;

  return (
    <div className="bg-surface p-4 rounded-xl border border-slate-700">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs text-text-muted">{new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          <h3 className="font-semibold text-lg">{day.name}</h3>
        </div>
        <div className="text-right">
          <span className={`text-sm px-2 py-1 rounded ${session.completionPercent === 100 ? 'bg-secondary/20 text-secondary' : 'bg-slate-700 text-text-muted'}`}>
            {session.completionPercent}% complete
          </span>
        </div>
      </div>
    </div>
  );
}
