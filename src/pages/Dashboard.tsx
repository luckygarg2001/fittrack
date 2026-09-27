import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Link } from 'react-router-dom';
import { PlayCircle, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0-6
  const dateStr = today.toISOString().split('T')[0];

  const currentDayPlan = useLiveQuery(() => 
    db.workoutDays.where({ dayOfWeek }).first()
  );

  const session = useLiveQuery(() =>
    db.workoutSessions.where({ date: dateStr, dayId: currentDayPlan?.id || '' }).first()
  );

  const dailyCheckIn = useLiveQuery(() =>
    db.dailyCheckIns.where({ date: dateStr }).first()
  );

  const userProfile = useLiveQuery(() => db.userProfile.toCollection().first());

  if (!currentDayPlan) {
    return <div className="p-4">Loading...</div>;
  }

  const progress = session ? session.completionPercent : 0;

  return (
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">FITTRACK</h1>
        <p className="text-text-muted">{today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </header>

      <section className="bg-surface p-4 rounded-xl border border-slate-700">
        <h2 className="text-xs uppercase tracking-wider text-text-muted mb-1">TODAY</h2>
        <h3 className="text-xl font-semibold mb-4">{currentDayPlan.name}</h3>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <Link to={`/workout/${currentDayPlan.id}`} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors">
          <PlayCircle size={20} />
          {session ? 'CONTINUE WORKOUT' : 'START WORKOUT'}
        </Link>
      </section>

      <section className="bg-surface p-4 rounded-xl border border-slate-700 space-y-4">
        <h3 className="font-semibold text-lg mb-2">Checklist</h3>
        <ChecklistItem label="Warm-up" completed={false} to="/workout/day-warmup" />
        <ChecklistItem label="Workout" completed={progress === 100} to={`/workout/${currentDayPlan.id}`} />
        <ChecklistItem label="Post-workout" completed={false} to="/workout/day-stretching" />
        <ChecklistItem label="Daily Mobility" completed={false} to="/workout/day-mobility" />
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-slate-700">
          <h4 className="text-xs text-text-muted mb-1">Today's Steps</h4>
          <input type="number" 
                 value={dailyCheckIn?.steps || ''} 
                 onChange={e => {
                   const val = parseInt(e.target.value) || 0;
                   if (dailyCheckIn) db.dailyCheckIns.update(dailyCheckIn.id!, {steps: val});
                   else db.dailyCheckIns.add({id: Date.now().toString(36) + Math.random().toString(36).substring(2), date: dateStr, steps: val, sleep: 0, energy: 0});
                 }}
                 className="bg-transparent text-2xl font-semibold w-full focus:outline-none" placeholder="0" />
        </div>
        <div className="bg-surface p-4 rounded-xl border border-slate-700">
          <h4 className="text-xs text-text-muted mb-1">Weight</h4>
          <div className="flex items-center text-2xl font-semibold">
             <input type="number" 
                 className="bg-transparent w-full focus:outline-none" placeholder="--" />
             <span className="text-sm text-text-muted ml-1">{userProfile?.weightUnit || 'kg'}</span>
          </div>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-slate-700">
          <h4 className="text-xs text-text-muted mb-1">Sleep (hrs)</h4>
          <input type="number" 
                 step="0.5"
                 value={dailyCheckIn?.sleep || ''} 
                 onChange={e => {
                   const val = parseFloat(e.target.value) || 0;
                   if (dailyCheckIn) db.dailyCheckIns.update(dailyCheckIn.id!, {sleep: val});
                   else db.dailyCheckIns.add({id: Date.now().toString(36) + Math.random().toString(36).substring(2), date: dateStr, steps: 0, sleep: val, energy: 0});
                 }}
                 className="bg-transparent text-2xl font-semibold w-full focus:outline-none" placeholder="0" />
        </div>
        <div className="bg-surface p-4 rounded-xl border border-slate-700">
          <h4 className="text-xs text-text-muted mb-1">Energy (1-10)</h4>
          <input type="number" 
                 min="1" max="10"
                 value={dailyCheckIn?.energy || ''} 
                 onChange={e => {
                   const val = parseInt(e.target.value) || 0;
                   if (dailyCheckIn) db.dailyCheckIns.update(dailyCheckIn.id!, {energy: val});
                   else db.dailyCheckIns.add({id: Date.now().toString(36) + Math.random().toString(36).substring(2), date: dateStr, steps: 0, sleep: 0, energy: val});
                 }}
                 className="bg-transparent text-2xl font-semibold w-full focus:outline-none" placeholder="0" />
        </div>
      </section>
    </div>
  );
}

function ChecklistItem({ label, completed, to }: { label: string, completed: boolean, to: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 hover:opacity-80">
      {completed ? <CheckCircle className="text-secondary" size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-slate-500" />}
      <span className={completed ? 'text-text-muted line-through' : 'text-text'}>{label}</span>
    </Link>
  );
}
