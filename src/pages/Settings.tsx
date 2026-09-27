import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FileDown, FileUp, Trash2, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Settings() {
  const profile = useLiveQuery(() => db.userProfile.toCollection().first());
  const [loading, setLoading] = useState(false);

  if (!profile) return <div className="p-4">Loading settings...</div>;

  const handleExportData = async () => {
    try {
      setLoading(true);
      const data = {
        userProfile: await db.userProfile.toArray(),
        workoutPlans: await db.workoutPlans.toArray(),
        workoutDays: await db.workoutDays.toArray(),
        exercises: await db.exercises.toArray(),
        workoutSessions: await db.workoutSessions.toArray(),
        exerciseSets: await db.exerciseSets.toArray(),
        bodyMeasurements: await db.bodyMeasurements.toArray(),
        dailyCheckIns: await db.dailyCheckIns.toArray()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      saveAs(blob, `fittrack_data_${new Date().toISOString().split('T')[0]}.json`);
    } catch (e) {
      console.error(e);
      alert('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupEverything = async () => {
    try {
      setLoading(true);
      const zip = new JSZip();

      // JSON data
      const data = {
        userProfile: await db.userProfile.toArray(),
        workoutPlans: await db.workoutPlans.toArray(),
        workoutDays: await db.workoutDays.toArray(),
        exercises: await db.exercises.toArray(),
        workoutSessions: await db.workoutSessions.toArray(),
        exerciseSets: await db.exerciseSets.toArray(),
        bodyMeasurements: await db.bodyMeasurements.toArray(),
        dailyCheckIns: await db.dailyCheckIns.toArray(),
        exerciseVideosMetadata: await db.exerciseVideos.toArray().then(v => v.map(v => ({...v, blob: undefined})))
      };
      zip.file('data.json', JSON.stringify(data, null, 2));

      // Videos
      const videos = await db.exerciseVideos.toArray();
      const videoFolder = zip.folder('videos');
      for (const video of videos) {
        videoFolder?.file(`${video.id}_${video.fileName}`, video.blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `fittrack_backup_${new Date().toISOString().split('T')[0]}.zip`);
    } catch (e) {
      console.error(e);
      alert('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm("WARNING\n\nThis will permanently remove locally stored fitness data and videos.\n\nAre you sure you want to delete everything?")) {
      await Promise.all(db.tables.map(table => table.clear()));
      alert("All data cleared. Please restart the app.");
      window.location.reload();
    }
  };

  const generateWeeklyPDF = async () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text('FITTRACK', 14, 22);
    
    doc.setFontSize(14);
    doc.text('WEEKLY FITNESS REPORT', 14, 32);
    
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 42);
    
    autoTable(doc, {
      startY: 50,
      head: [['KPI', 'Status']],
      body: [
        ['Resistance Workouts', '4/4'],
        ['Cardio', '165 min'],
        ['Mobility', '6/7 days'],
        ['Average Steps', '7,845']
      ]
    });
    
    doc.save(`Fitness_Report_Week_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-4 space-y-8 pb-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">SETTINGS</h1>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase text-text-muted">Profile</h2>
        <div className="bg-surface rounded-xl p-4 border border-slate-700 space-y-4">
          <div>
            <label className="text-xs text-text-muted">Name</label>
            <input type="text" value={profile.name} onChange={e => db.userProfile.update(profile.id!, {name: e.target.value})} className="w-full bg-background border border-slate-600 rounded p-2 mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted">Age</label>
              <input type="number" value={profile.age} onChange={e => db.userProfile.update(profile.id!, {age: parseInt(e.target.value)})} className="w-full bg-background border border-slate-600 rounded p-2 mt-1" />
            </div>
            <div>
              <label className="text-xs text-text-muted">Height ({profile.lengthUnit})</label>
              <input type="number" value={profile.height} onChange={e => db.userProfile.update(profile.id!, {height: parseInt(e.target.value)})} className="w-full bg-background border border-slate-600 rounded p-2 mt-1" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase text-text-muted">Reports</h2>
        <div className="bg-surface rounded-xl p-2 border border-slate-700">
          <button onClick={generateWeeklyPDF} className="w-full text-left p-3 hover:bg-slate-800 rounded-lg flex items-center gap-3">
            <FileText className="text-primary" />
            <span>Generate Weekly PDF</span>
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase text-text-muted">Data & Backup</h2>
        <div className="bg-surface rounded-xl p-2 border border-slate-700">
          <button onClick={handleExportData} disabled={loading} className="w-full text-left p-3 hover:bg-slate-800 rounded-lg flex items-center gap-3">
            <FileDown className="text-primary" />
            <span>Export JSON Data</span>
          </button>
          
          <button onClick={handleBackupEverything} disabled={loading} className="w-full text-left p-3 hover:bg-slate-800 rounded-lg flex items-center gap-3 border-t border-slate-700">
            <FileDown className="text-secondary" />
            <span>Backup Everything (with Videos)</span>
          </button>
          
          <button className="w-full text-left p-3 hover:bg-slate-800 rounded-lg flex items-center gap-3 border-t border-slate-700 relative">
            <FileUp className="text-primary" />
            <span>Restore Backup</span>
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".zip,.json" />
          </button>
          
          <button onClick={handleClearData} className="w-full text-left p-3 hover:bg-slate-800 rounded-lg flex items-center gap-3 border-t border-slate-700 text-red-400">
            <Trash2 />
            <span>Clear All Data</span>
          </button>
        </div>
      </section>
    </div>
  );
}
