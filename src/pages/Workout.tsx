import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Exercise, type ExerciseSet } from '../db/db';
import { Check, ChevronLeft, ChevronRight, Video, Upload, Trash2 } from 'lucide-react';

export default function Workout() {
  const { dayId } = useParams();
  const navigate = useNavigate();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restRemaining, setRestRemaining] = useState(0);

  const todayStr = new Date().toISOString().split('T')[0];

  const exercises = useLiveQuery(() => 
    db.exercises.where('dayId').equals(dayId || '').sortBy('order')
  );

  const session = useLiveQuery(async () => {
    let s = await db.workoutSessions.where('date').equals(todayStr).and(s => s.dayId === (dayId || '')).first();
    if (!s) {
      const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      await db.workoutSessions.add({
        id,
        dayId: dayId || '',
        date: todayStr,
        startTime: Date.now(),
        completionPercent: 0,
        notes: ''
      });
      s = await db.workoutSessions.get(id);
    }
    return s;
  });

  useEffect(() => {
    let timer: any;
    if (showRestTimer && restRemaining > 0) {
      timer = setInterval(() => setRestRemaining(r => r - 1), 1000);
    } else if (restRemaining <= 0) {
      setShowRestTimer(false);
    }
    return () => clearInterval(timer);
  }, [showRestTimer, restRemaining]);

  if (!exercises || !session) return <div className="p-4">Loading workout...</div>;
  if (exercises.length === 0) return <div className="p-4">No exercises found for this day.</div>;

  const currentEx = exercises[currentExerciseIndex];

  return (
    <div className="flex flex-col h-full bg-background relative">
      <header className="flex items-center justify-between p-4 bg-surface border-b border-slate-700">
        <button onClick={() => navigate('/')} className="text-primary p-2 -ml-2">
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-semibold text-lg">{currentEx.name}</h2>
        <div className="w-8" />
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="text-center">
          <p className="text-text-muted">Target</p>
          <p className="text-xl font-bold">{currentEx.sets} × {currentEx.reps}</p>
        </div>

        <VideoSection exercise={currentEx} />

        <SetsSection exercise={currentEx} sessionId={session.id!} onSetComplete={(rest) => {
          setRestRemaining(rest);
          setShowRestTimer(true);
        }} />
      </div>

      {showRestTimer && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4">
          <h2 className="text-2xl mb-4 font-bold text-text-muted">REST</h2>
          <div className="text-6xl font-bold mb-8">
            {String(Math.floor(restRemaining / 60)).padStart(2, '0')}:{String(restRemaining % 60).padStart(2, '0')}
          </div>
          <div className="flex gap-4 mb-8">
            <button onClick={() => setRestRemaining(r => r - 15)} className="bg-surface px-6 py-3 rounded-lg border border-slate-700">-15s</button>
            <button onClick={() => setRestRemaining(r => r + 15)} className="bg-surface px-6 py-3 rounded-lg border border-slate-700">+15s</button>
          </div>
          <button onClick={() => setShowRestTimer(false)} className="bg-primary text-white w-full max-w-sm py-4 rounded-xl font-semibold">
            SKIP REST
          </button>
        </div>
      )}

      <footer className="p-4 bg-surface border-t border-slate-700 flex justify-between">
        <button 
          onClick={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
          disabled={currentExerciseIndex === 0}
          className="p-3 text-text-muted disabled:opacity-30"
        >
          Previous
        </button>
        
        <button 
          onClick={() => {
            if (currentExerciseIndex < exercises.length - 1) {
              setCurrentExerciseIndex(currentExerciseIndex + 1);
            } else {
              // Finish workout
              db.workoutSessions.update(session.id!, { endTime: Date.now(), completionPercent: 100 });
              navigate('/');
            }
          }}
          className="bg-primary text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          {currentExerciseIndex === exercises.length - 1 ? 'FINISH' : 'NEXT EXERCISE'}
          <ChevronRight size={20} />
        </button>
      </footer>
    </div>
  );
}

function SetsSection({ exercise, sessionId, onSetComplete }: { exercise: Exercise, sessionId: string, onSetComplete: (rest: number) => void }) {
  const sets = useLiveQuery(() => 
    db.exerciseSets.where('sessionId').equals(sessionId).and(s => s.exerciseId === exercise.id).sortBy('setNumber')
  );

  // Initialize sets if they don't exist
  useEffect(() => {
    if (sets !== undefined && sets.length === 0) {
      const initSets = [];
      for(let i=1; i<=exercise.sets; i++) {
        initSets.push({
          id: Date.now().toString(36) + Math.random().toString(36).substring(2),
          sessionId,
          exerciseId: exercise.id,
          setNumber: i,
          weight: 0,
          reps: 0,
          completed: false
        });
      }
      db.exerciseSets.bulkAdd(initSets);
    }
  }, [sets, exercise, sessionId]);

  if (!sets) return null;

  return (
    <div className="space-y-4">
      {sets.map((set) => (
        <SetRow key={set.id} set={set} onComplete={() => onSetComplete(exercise.rest)} />
      ))}
    </div>
  );
}

function SetRow({ set, onComplete }: { set: ExerciseSet, onComplete: () => void }) {
  const [weight, setWeight] = useState(set.weight.toString());
  const [reps, setReps] = useState(set.reps.toString());

  const handleComplete = async () => {
    const isCompleted = !set.completed;
    await db.exerciseSets.update(set.id!, { 
      weight: parseFloat(weight) || 0, 
      reps: parseInt(reps) || 0, 
      completed: isCompleted 
    });
    if (isCompleted) {
      onComplete();
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${set.completed ? 'bg-secondary/10 border-secondary/30' : 'bg-surface border-slate-700'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold">SET {set.setNumber}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-xs text-text-muted block mb-1">Weight</label>
          <input 
            type="number" 
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="w-full bg-background border border-slate-600 rounded-lg p-2 text-center text-lg focus:outline-none focus:border-primary"
            disabled={set.completed}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-text-muted block mb-1">Reps</label>
          <input 
            type="number" 
            value={reps}
            onChange={e => setReps(e.target.value)}
            className="w-full bg-background border border-slate-600 rounded-lg p-2 text-center text-lg focus:outline-none focus:border-primary"
            disabled={set.completed}
          />
        </div>
        <button 
          onClick={handleComplete}
          className={`h-12 w-12 mt-5 rounded-lg flex items-center justify-center ${set.completed ? 'bg-secondary text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
        >
          <Check size={24} />
        </button>
      </div>
    </div>
  );
}

function VideoSection({ exercise }: { exercise: Exercise }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const videoRecord = useLiveQuery(() => 
    db.exerciseVideos.where('exerciseId').equals(exercise.id).first()
  );

  useEffect(() => {
    if (videoRecord) {
      const url = URL.createObjectURL(videoRecord.blob);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoUrl(null);
    }
  }, [videoRecord]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (videoRecord) {
      await db.exerciseVideos.delete(videoRecord.id!);
    }

    await db.exerciseVideos.add({
      exerciseId: exercise.id,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      blob: file,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  };

  const handleDelete = async () => {
    if (videoRecord && window.confirm("Delete instruction video? This will remove the locally stored video from this exercise.")) {
      await db.exerciseVideos.delete(videoRecord.id!);
    }
  };

  return (
    <div className="bg-surface rounded-xl overflow-hidden border border-slate-700">
      {videoUrl ? (
        <div>
          <video src={videoUrl} controls className="w-full aspect-video bg-black object-contain" />
          <div className="p-3 flex justify-between items-center bg-surface">
            <span className="text-xs text-text-muted truncate max-w-[60%]">{videoRecord?.fileName}</span>
            <div className="flex gap-2">
              <label className="text-xs text-primary cursor-pointer border border-primary px-3 py-1.5 rounded flex gap-1 items-center">
                <Upload size={14} /> Replace
                <input type="file" accept="video/*" className="hidden" onChange={handleUpload} />
              </label>
              <button onClick={handleDelete} className="text-red-400 p-1.5">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center">
          <Video className="mx-auto text-slate-500 mb-2" size={32} />
          <p className="text-sm text-text-muted mb-4">No video available</p>
          <label className="inline-block bg-primary text-white px-4 py-2 rounded-lg font-medium cursor-pointer">
            [ UPLOAD VIDEO ]
            <input type="file" accept="video/*" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      )}
      
      <div className="p-4 border-t border-slate-700 bg-surface/50">
        <h4 className="text-xs uppercase text-text-muted mb-1">Instructions</h4>
        <p className="text-sm mb-3">{exercise.instructions}</p>
        <h4 className="text-xs uppercase text-text-muted mb-1">Key Cues</h4>
        <p className="text-sm italic">{exercise.keyCues}</p>
      </div>
    </div>
  );
}
