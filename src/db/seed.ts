import { db } from './db';


export async function seedInitialData() {
  const plansCount = await db.workoutPlans.count();
  if (plansCount > 0) {
    return; // Already seeded
  }

  // 1. Create User Profile
  await db.userProfile.add({
    name: 'User',
    age: 30,
    height: 175,
    weightUnit: 'kg',
    lengthUnit: 'cm',
    theme: 'system'
  });

  // 2. Create Workout Plan
  const planId = await db.workoutPlans.add({
    name: 'Initial PDF Plan',
    active: true,
  });

  // 3. Create Days & Exercises
  const days = [
    {
      id: 'day-monday', planId, dayOfWeek: 1, name: 'Upper Body A', type: 'resistance' as const,
      exercises: [
        { name: 'Machine chest press', sets: 3, reps: '8-12', rest: 90, instructions: 'Focus on chest contraction.', keyCues: 'Keep chest up, shoulders down.', order: 1 },
        { name: 'Lat pulldown', sets: 3, reps: '8-12', rest: 90, instructions: 'Pull to upper chest.', keyCues: 'Depress shoulders before pulling.', order: 2 },
        { name: 'Seated cable row', sets: 3, reps: '10-12', rest: 90, instructions: 'Pull to stomach.', keyCues: 'Squeeze shoulder blades together.', order: 3 },
        { name: 'Incline dumbbell press', sets: 2, reps: '8-12', rest: 90, instructions: 'Press dumbbells up over upper chest.', keyCues: 'Control the descent.', order: 4 },
        { name: 'Cable lateral raise', sets: 2, reps: '12-15', rest: 60, instructions: 'Raise arms to side.', keyCues: 'Slight bend in elbows.', order: 5 },
        { name: 'Rope triceps pushdown', sets: 2, reps: '10-15', rest: 60, instructions: 'Push rope down, spread at bottom.', keyCues: 'Keep elbows tucked.', order: 6 },
        { name: 'Dumbbell curls', sets: 2, reps: '10-15', rest: 60, instructions: 'Curl weight up.', keyCues: 'Avoid swinging.', order: 7 },
      ]
    },
    {
      id: 'day-tuesday', planId, dayOfWeek: 2, name: 'Lower Body A', type: 'resistance' as const,
      exercises: [
        { name: 'Leg press', sets: 3, reps: '10-12', rest: 120, instructions: 'Press weight up.', keyCues: "Don't lock knees at top.", order: 1 },
        { name: 'Romanian deadlift', sets: 3, reps: '8-12', rest: 120, instructions: 'Hinge at hips.', keyCues: 'Keep back straight, slight bend in knees.', order: 2 },
        { name: 'Seated leg curl', sets: 3, reps: '10-15', rest: 90, instructions: 'Curl weight back.', keyCues: 'Squeeze hamstrings.', order: 3 },
        { name: 'Leg extension', sets: 2, reps: '10-15', rest: 90, instructions: 'Extend legs out.', keyCues: 'Control the eccentric phase.', order: 4 },
        { name: 'Standing calf raise', sets: 3, reps: '12-15', rest: 60, instructions: 'Raise heels.', keyCues: 'Full stretch at bottom.', order: 5 },
        { name: 'Dead bug', sets: 3, reps: '8 each side', rest: 60, instructions: 'Opposite arm and leg lower.', keyCues: 'Keep lower back pressed into floor.', order: 6 },
      ]
    },
    {
      id: 'day-wednesday', planId, dayOfWeek: 3, name: 'Cardio + Mobility', type: 'cardio_mobility' as const,
      exercises: []
    },
    {
      id: 'day-thursday', planId, dayOfWeek: 4, name: 'Upper Body B', type: 'resistance' as const,
      exercises: [
        { name: 'Assisted pull-up OR lat pulldown', sets: 3, reps: '8-12', rest: 90, instructions: 'Pull body up or bar down.', keyCues: 'Lead with elbows.', order: 1 },
        { name: 'Dumbbell bench press', sets: 3, reps: '8-12', rest: 90, instructions: 'Press dumbbells up.', keyCues: 'Control the descent.', order: 2 },
        { name: 'Chest-supported row', sets: 3, reps: '8-12', rest: 90, instructions: 'Row weight up.', keyCues: 'Squeeze shoulder blades.', order: 3 },
        { name: 'Machine shoulder press', sets: 2, reps: '8-12', rest: 90, instructions: 'Press weight overhead.', keyCues: 'Keep core tight.', order: 4 },
        { name: 'Cable face pull', sets: 2, reps: '12-15', rest: 60, instructions: 'Pull rope towards face.', keyCues: 'External rotation at end.', order: 5 },
        { name: 'Triceps rope extension', sets: 2, reps: '10-15', rest: 60, instructions: 'Extend arms.', keyCues: 'Keep elbows still.', order: 6 },
        { name: 'Hammer curls', sets: 2, reps: '10-15', rest: 60, instructions: 'Curl with neutral grip.', keyCues: 'Control weight.', order: 7 },
      ]
    },
    {
      id: 'day-friday', planId, dayOfWeek: 5, name: 'Lower Body B', type: 'resistance' as const,
      exercises: [
        { name: 'Goblet squat', sets: 3, reps: '8-12', rest: 120, instructions: 'Squat with dumbbell at chest.', keyCues: 'Keep chest up.', order: 1 },
        { name: 'Hip thrust / glute bridge', sets: 3, reps: '10-15', rest: 90, instructions: 'Thrust hips up.', keyCues: 'Squeeze glutes at top.', order: 2 },
        { name: 'Bulgarian split squat', sets: 2, reps: '8-10 each leg', rest: 90, instructions: 'Squat with rear foot elevated.', keyCues: 'Keep torso upright.', order: 3 },
        { name: 'Leg curl', sets: 3, reps: '10-15', rest: 90, instructions: 'Curl legs.', keyCues: 'Squeeze hamstrings.', order: 4 },
        { name: 'Calf raises', sets: 3, reps: '12-15', rest: 60, instructions: 'Raise heels.', keyCues: 'Full stretch.', order: 5 },
        { name: 'Pallof press', sets: 3, reps: '10 each side', rest: 60, instructions: 'Press band/cable out.', keyCues: 'Resist rotation.', order: 6 },
      ]
    },
    {
      id: 'day-saturday', planId, dayOfWeek: 6, name: 'Fun Fitness Day', type: 'fun' as const,
      exercises: []
    },
    {
      id: 'day-sunday', planId, dayOfWeek: 0, name: 'Recovery', type: 'recovery' as const,
      exercises: []
    },
    {
      id: 'day-warmup', planId, dayOfWeek: -1, name: 'Pre-Workout Warm-up', type: 'warmup' as const,
      exercises: [
        { name: 'Easy cardio', sets: 1, reps: '3-5 min', rest: 0, instructions: 'Treadmill, cycle, or elliptical.', keyCues: 'Light pace.', order: 1 },
        { name: 'Neck rotations', sets: 1, reps: '5 each dir', rest: 0, instructions: 'Rotate neck.', keyCues: 'Slow and controlled.', order: 2 },
        { name: 'Shoulder circles', sets: 1, reps: '10 fwd, 10 bwd', rest: 0, instructions: 'Circle shoulders.', keyCues: 'Full range of motion.', order: 3 },
        { name: 'Arm circles', sets: 1, reps: '10 small, 10 large', rest: 0, instructions: 'Circle arms.', keyCues: 'Gradually increase size.', order: 4 },
        { name: 'Cat-Cow', sets: 1, reps: '8-10', rest: 0, instructions: 'Arch and round back on all fours.', keyCues: 'Move with breath.', order: 5 },
        { name: "World's Greatest Stretch", sets: 1, reps: '4-5 each side', rest: 0, instructions: 'Lunge and rotate.', keyCues: 'Open up the chest.', order: 6 },
        { name: 'Bodyweight squat', sets: 1, reps: '10', rest: 0, instructions: 'Squat down.', keyCues: 'Keep chest up.', order: 7 },
        { name: 'Hip hinge', sets: 1, reps: '10', rest: 0, instructions: 'Hinge at hips.', keyCues: 'Feel stretch in hamstrings.', order: 8 },
      ]
    },
    {
      id: 'day-stretching', planId, dayOfWeek: -1, name: 'Post-Workout Stretching', type: 'stretching' as const,
      exercises: [
        { name: 'Chest doorway stretch', sets: 2, reps: '30 sec each', rest: 0, instructions: 'Stretch chest in doorway.', keyCues: 'Gentle pull.', order: 1 },
        { name: 'Lat stretch', sets: 2, reps: '30 sec', rest: 0, instructions: 'Stretch lats holding a pole.', keyCues: 'Lean back.', order: 2 },
        { name: 'Hip-flexor stretch', sets: 2, reps: '30 sec each', rest: 0, instructions: 'Kneeling lunge.', keyCues: 'Tuck pelvis.', order: 3 },
        { name: 'Hamstring stretch', sets: 2, reps: '30 sec', rest: 0, instructions: 'Reach for toes.', keyCues: 'Keep back straight.', order: 4 },
        { name: 'Quad stretch', sets: 2, reps: '30 sec each', rest: 0, instructions: 'Pull heel to glute.', keyCues: 'Keep knees together.', order: 5 },
        { name: 'Calf stretch', sets: 2, reps: '30 sec each', rest: 0, instructions: 'Push against wall.', keyCues: 'Keep heel down.', order: 6 },
        { name: "Child's pose", sets: 1, reps: '45-60 sec', rest: 0, instructions: 'Rest on knees, arms forward.', keyCues: 'Breathe deeply.', order: 7 },
      ]
    },
    {
      id: 'day-mobility', planId, dayOfWeek: -1, name: 'Daily Mobility', type: 'daily_mobility' as const,
      exercises: [
        { name: 'Shoulder circles', sets: 1, reps: '1 min', rest: 0, instructions: 'Circle shoulders.', keyCues: 'Continuous motion.', order: 1 },
        { name: 'Cat-Cow', sets: 1, reps: '1 min', rest: 0, instructions: 'Arch and round back.', keyCues: 'Continuous motion.', order: 2 },
        { name: 'Thoracic rotations', sets: 1, reps: '1 min', rest: 0, instructions: 'Rotate spine.', keyCues: 'Continuous motion.', order: 3 },
        { name: 'Hip-flexor mobility', sets: 1, reps: '2 min', rest: 0, instructions: 'Dynamic lunge.', keyCues: 'Continuous motion.', order: 4 },
        { name: 'Ankle mobility', sets: 1, reps: '2 min', rest: 0, instructions: 'Push knees forward.', keyCues: 'Continuous motion.', order: 5 },
        { name: 'Deep squat hold', sets: 1, reps: '2 min', rest: 0, instructions: 'Hold deep squat.', keyCues: 'Keep chest up.', order: 6 },
        { name: 'Relaxed breathing', sets: 1, reps: '1 min', rest: 0, instructions: 'Box breathing.', keyCues: 'Focus on breath.', order: 7 },
      ]
    },
  ];

  for (const day of days) {
    await db.workoutDays.add({
      id: day.id,
      planId: day.planId,
      dayOfWeek: day.dayOfWeek,
      name: day.name,
      type: day.type,
    });

    for (const ex of day.exercises) {
      await db.exercises.add({
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        dayId: day.id,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        rest: ex.rest,
        instructions: ex.instructions,
        keyCues: ex.keyCues,
        order: ex.order,
      });
    }
  }
}
