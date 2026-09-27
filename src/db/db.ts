import Dexie, { type Table } from 'dexie';

export interface UserProfile {
  id?: number;
  name: string;
  age: number;
  height: number;
  weightUnit: 'kg' | 'lbs';
  lengthUnit: 'cm' | 'inches';
  theme: 'light' | 'dark' | 'system';
}

export interface BodyMeasurement {
  id?: number;
  date: string;
  weight: number;
  waist: number;
}

export interface WorkoutPlan {
  id?: number;
  name: string;
  active: boolean;
}

export interface WorkoutDay {
  id: string; // e.g. 'day-monday', 'day-tuesday'
  planId: number;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  name: string;
  type: 'resistance' | 'cardio_mobility' | 'recovery' | 'fun' | 'warmup' | 'stretching' | 'daily_mobility';
}

export interface Exercise {
  id: string; // e.g. 'ex-lat-pulldown'
  dayId: string;
  name: string;
  sets: number;
  reps: string; // e.g., '8-12'
  rest: number; // in seconds
  instructions: string;
  keyCues: string;
  order: number;
}

export interface ExerciseVideo {
  id?: string;
  exerciseId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  blob: Blob;
  createdAt: number;
  updatedAt: number;
}

export interface WorkoutSession {
  id?: string;
  dayId: string;
  date: string;
  startTime: number;
  endTime?: number;
  completionPercent: number;
  notes: string;
}

export interface ExerciseSet {
  id?: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface CardioSession {
  id?: string;
  date: string; // e.g., 'YYYY-MM-DD'
  activity: string;
  duration: number; // minutes
  distance?: number;
  notes: string;
}

export interface MobilitySession {
  id?: string;
  date: string; // e.g., 'YYYY-MM-DD'
  duration: number; // minutes
  completed: boolean;
}

export interface DailyCheckIn {
  id?: string;
  date: string; // e.g., 'YYYY-MM-DD'
  steps: number;
  sleep: number;
  energy: number;
}

export class FitTrackDB extends Dexie {
  userProfile!: Table<UserProfile, number>;
  bodyMeasurements!: Table<BodyMeasurement, number>;
  workoutPlans!: Table<WorkoutPlan, number>;
  workoutDays!: Table<WorkoutDay, string>;
  exercises!: Table<Exercise, string>;
  exerciseVideos!: Table<ExerciseVideo, string>;
  workoutSessions!: Table<WorkoutSession, string>;
  exerciseSets!: Table<ExerciseSet, string>;
  cardioSessions!: Table<CardioSession, string>;
  mobilitySessions!: Table<MobilitySession, string>;
  dailyCheckIns!: Table<DailyCheckIn, string>;

  constructor() {
    super('FitTrackDB');
    this.version(1).stores({
      userProfile: '++id',
      bodyMeasurements: '++id, date',
      workoutPlans: '++id, active',
      workoutDays: 'id, planId, dayOfWeek',
      exercises: 'id, dayId, order',
      exerciseVideos: '++id, exerciseId',
      workoutSessions: '++id, date, dayId',
      exerciseSets: '++id, sessionId, exerciseId',
      cardioSessions: '++id, date',
      mobilitySessions: '++id, date',
      dailyCheckIns: '++id, date',
    });
  }
}

export const db = new FitTrackDB();
