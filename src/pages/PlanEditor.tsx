import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type WorkoutDay, type Exercise } from '../db/db';
import { ChevronDown, ChevronRight, Edit2, Plus, Trash2 } from 'lucide-react';

export default function PlanEditor() {
  const plans = useLiveQuery(() => db.workoutPlans.toArray());
  const activePlan = plans?.find(p => p.active);
  const days = useLiveQuery(() => 
    db.workoutDays.where({ planId: activePlan?.id || -1 }).sortBy('dayOfWeek')
  );

  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  if (!activePlan || !days) return <div className="p-4">Loading plan...</div>;

  return (
    <div className="p-4 space-y-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">PLAN EDITOR</h1>
        <p className="text-text-muted">Modify your weekly routine</p>
      </header>

      {days.map(day => (
        <DayEditor 
          key={day.id} 
          day={day} 
          isExpanded={expandedDay === day.id}
          onToggle={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
        />
      ))}
    </div>
  );
}

function DayEditor({ day, isExpanded, onToggle }: { day: WorkoutDay, isExpanded: boolean, onToggle: () => void }) {
  const exercises = useLiveQuery(() => 
    db.exercises.where({ dayId: day.id }).sortBy('order')
  );
  
  const [editingEx, setEditingEx] = useState<Exercise | null>(null);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="bg-surface rounded-xl border border-slate-700 overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-800 transition-colors"
      >
        <div className="text-left">
          <p className="text-xs text-text-muted">{dayNames[day.dayOfWeek]}</p>
          <p className="font-semibold">{day.name}</p>
        </div>
        {isExpanded ? <ChevronDown /> : <ChevronRight />}
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-slate-700 bg-background/50 space-y-2">
          {exercises?.map((ex) => (
            <div key={ex.id} className="flex justify-between items-center bg-surface p-3 rounded-lg border border-slate-700">
              <div>
                <p className="font-medium">{ex.name}</p>
                <p className="text-xs text-text-muted">{ex.sets} sets × {ex.reps} • {ex.rest}s rest</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingEx(ex)} className="p-2 text-primary bg-primary/10 rounded">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => db.exercises.delete(ex.id)} className="p-2 text-red-400 bg-red-400/10 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <button onClick={() => setEditingEx({
            id: crypto.randomUUID(),
            dayId: day.id,
            name: 'New Exercise',
            sets: 3,
            reps: '10',
            rest: 60,
            instructions: '',
            keyCues: '',
            order: (exercises?.length || 0) + 1
          })} className="w-full py-3 mt-2 border-2 border-dashed border-slate-600 rounded-lg text-text-muted hover:text-text hover:border-slate-400 flex items-center justify-center gap-2">
            <Plus size={18} /> ADD EXERCISE
          </button>
        </div>
      )}

      {editingEx && (
        <ExerciseEditorModal 
          exercise={editingEx} 
          onClose={() => setEditingEx(null)} 
          onSave={async (updatedEx) => {
            await db.exercises.put(updatedEx);
            setEditingEx(null);
          }}
        />
      )}
    </div>
  );
}

function ExerciseEditorModal({ exercise, onClose, onSave }: { exercise: Exercise, onClose: () => void, onSave: (ex: Exercise) => void }) {
  const [ex, setEx] = useState(exercise);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-surface w-full max-w-md rounded-xl p-5 border border-slate-700 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Edit Exercise</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-muted">Name</label>
            <input type="text" value={ex.name} onChange={e => setEx({...ex, name: e.target.value})} className="w-full bg-background border border-slate-600 rounded p-2 mt-1" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted">Sets</label>
              <input type="number" value={ex.sets} onChange={e => setEx({...ex, sets: parseInt(e.target.value)})} className="w-full bg-background border border-slate-600 rounded p-2 mt-1" />
            </div>
            <div>
              <label className="text-xs text-text-muted">Reps</label>
              <input type="text" value={ex.reps} onChange={e => setEx({...ex, reps: e.target.value})} className="w-full bg-background border border-slate-600 rounded p-2 mt-1" />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-text-muted">Rest (seconds)</label>
            <input type="number" value={ex.rest} onChange={e => setEx({...ex, rest: parseInt(e.target.value)})} className="w-full bg-background border border-slate-600 rounded p-2 mt-1" />
          </div>

          <div>
            <label className="text-xs text-text-muted">Instructions</label>
            <textarea value={ex.instructions} onChange={e => setEx({...ex, instructions: e.target.value})} className="w-full bg-background border border-slate-600 rounded p-2 mt-1 h-20" />
          </div>

          <div>
            <label className="text-xs text-text-muted">Key Cues</label>
            <input type="text" value={ex.keyCues} onChange={e => setEx({...ex, keyCues: e.target.value})} className="w-full bg-background border border-slate-600 rounded p-2 mt-1" />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-text-muted hover:text-text">Cancel</button>
          <button onClick={() => onSave(ex)} className="bg-primary text-white px-4 py-2 rounded-lg font-medium">Save</button>
        </div>
      </div>
    </div>
  );
}
