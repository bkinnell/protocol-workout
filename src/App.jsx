import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Dumbbell, Activity, History as HistoryIcon, User, Plus, Check, X,
  ChevronRight, ChevronLeft, Play, Square, TrendingUp, Calendar,
  Settings, Edit2, Trash2, Sparkles, Loader2, Flame, Heart, Timer,
  ArrowRight, Zap, BarChart3, RefreshCw, Save, AlertCircle
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Area, AreaChart
} from "recharts";

// ============ FONT / TOKEN CONSTANTS ============
const FF_HEAD = "'Bebas Neue', 'Impact', sans-serif";
const FF_MONO = "'JetBrains Mono', ui-monospace, monospace";
const FF_BODY = "'IBM Plex Sans', system-ui, sans-serif";

// ============ DEFAULTS (seeded from onboarding chat) ============
const DEFAULT_PROFILE = {
  goal: "concurrent",
  experience: "advanced",
  equipment: "full_gym",
  daysPerWeek: 5,
  // Mon=0 ... Sun=6
  schedule: [
    { day: "MON", type: "push" },
    { day: "TUE", type: "intervals" },
    { day: "WED", type: "pull" },
    { day: "THU", type: "z2" },
    { day: "FRI", type: "legs" },
    { day: "SAT", type: "rest" },
    { day: "SUN", type: "rest" },
  ],
  bodyweight: null,
  height: null,
  units: "lb",
  startDate: new Date().toISOString().slice(0, 10),
  bodyComp: [],
};

const SESSION_LABELS = {
  push: "UPPER - PUSH",
  pull: "UPPER - PULL",
  legs: "LOWER",
  full: "FULL BODY",
  z2: "ZONE 2 STEADY",
  intervals: "VO2 INTERVALS",
  tempo: "TEMPO RUN",
  hyrox_sim: "HYROX SIMULATION",
  hyrox_stations: "HYROX STATIONS",
  hyrox_compromised: "COMPROMISED RUNS",
  rest: "REST",
};

const SESSION_KIND = {
  push: "lift", pull: "lift", legs: "lift", full: "lift",
  z2: "cardio", intervals: "cardio", tempo: "cardio",
  hyrox_sim: "hyrox", hyrox_stations: "hyrox", hyrox_compromised: "hyrox",
  rest: "rest",
};

// ============ EXERCISE LIBRARY (rolodex) ============
const LIBRARY = {
  push: {
    compound: [
      { name: "Barbell Bench Press", muscle: "chest" },
      { name: "Incline Barbell Press", muscle: "upper chest" },
      { name: "Dumbbell Bench Press", muscle: "chest" },
      { name: "Overhead Press", muscle: "shoulders" },
      { name: "Push Press", muscle: "shoulders" },
      { name: "Close-Grip Bench Press", muscle: "triceps" },
      { name: "Weighted Dips", muscle: "chest/triceps" },
      { name: "Seated DB Shoulder Press", muscle: "shoulders" },
    ],
    accessory: [
      { name: "Incline DB Press", muscle: "upper chest" },
      { name: "Cable Crossover", muscle: "chest" },
      { name: "Pec Deck", muscle: "chest" },
      { name: "DB Lateral Raise", muscle: "side delts" },
      { name: "Cable Lateral Raise", muscle: "side delts" },
      { name: "Reverse Pec Deck", muscle: "rear delts" },
      { name: "Face Pull", muscle: "rear delts" },
      { name: "Cable Tricep Pushdown", muscle: "triceps" },
      { name: "Overhead Rope Extension", muscle: "triceps" },
      { name: "Skull Crusher", muscle: "triceps" },
    ],
  },
  pull: {
    compound: [
      { name: "Conventional Deadlift", muscle: "posterior chain" },
      { name: "Trap Bar Deadlift", muscle: "posterior chain" },
      { name: "Weighted Pull-Up", muscle: "lats" },
      { name: "Pull-Up", muscle: "lats" },
      { name: "Barbell Row", muscle: "mid back" },
      { name: "Pendlay Row", muscle: "mid back" },
      { name: "T-Bar Row", muscle: "mid back" },
      { name: "Chest-Supported Row", muscle: "back" },
    ],
    accessory: [
      { name: "Lat Pulldown", muscle: "lats" },
      { name: "Single-Arm DB Row", muscle: "back" },
      { name: "Seated Cable Row", muscle: "mid back" },
      { name: "Straight-Arm Pulldown", muscle: "lats" },
      { name: "Face Pull", muscle: "rear delts" },
      { name: "Barbell Curl", muscle: "biceps" },
      { name: "Incline DB Curl", muscle: "biceps" },
      { name: "Hammer Curl", muscle: "biceps" },
      { name: "Preacher Curl", muscle: "biceps" },
      { name: "Cable Curl", muscle: "biceps" },
      { name: "Barbell Shrug", muscle: "traps" },
    ],
  },
  legs: {
    compound: [
      { name: "Back Squat", muscle: "quads/glutes" },
      { name: "Front Squat", muscle: "quads" },
      { name: "Romanian Deadlift", muscle: "hamstrings/glutes" },
      { name: "Hack Squat", muscle: "quads" },
      { name: "Leg Press", muscle: "quads" },
      { name: "Bulgarian Split Squat", muscle: "quads/glutes" },
      { name: "Walking DB Lunge", muscle: "quads/glutes" },
      { name: "Barbell Hip Thrust", muscle: "glutes" },
    ],
    accessory: [
      { name: "Leg Extension", muscle: "quads" },
      { name: "Lying Leg Curl", muscle: "hamstrings" },
      { name: "Seated Leg Curl", muscle: "hamstrings" },
      { name: "Glute Ham Raise", muscle: "hamstrings" },
      { name: "Cable Pull-Through", muscle: "glutes" },
      { name: "Standing Calf Raise", muscle: "calves" },
      { name: "Seated Calf Raise", muscle: "calves" },
      { name: "Adductor Machine", muscle: "adductors" },
      { name: "Hanging Leg Raise", muscle: "core" },
      { name: "Cable Crunch", muscle: "core" },
    ],
  },
  hyrox: {
    // The 8 standard race stations (in race order)
    stations: [
      { name: "SkiErg", standard: "1000m" },
      { name: "Sled Push", standard: "50m heavy" },
      { name: "Sled Pull", standard: "50m heavy" },
      { name: "Burpee Broad Jumps", standard: "80m" },
      { name: "Row Erg", standard: "1000m" },
      { name: "Farmer's Carry", standard: "200m / 24kg per hand" },
      { name: "Sandbag Lunges", standard: "100m / 20kg sandbag" },
      { name: "Wall Balls", standard: "100 reps / 9kg" },
    ],
    accessory: [
      { name: "Assault Bike Intervals", muscle: "cardio" },
      { name: "Echo Bike Sprint", muscle: "cardio" },
      { name: "Sandbag Clean", muscle: "full body" },
      { name: "Devil's Press", muscle: "full body" },
      { name: "DB Snatch", muscle: "full body" },
      { name: "Kettlebell Swing", muscle: "posterior" },
      { name: "Box Jump Over", muscle: "legs/cardio" },
      { name: "Goblet Lunge", muscle: "legs" },
      { name: "Heavy Carries", muscle: "grip/core" },
      { name: "Run 400m", muscle: "cardio" },
      { name: "Run 800m", muscle: "cardio" },
    ],
  },
};

// Flatten all exercises into a single browsable list with metadata
function flatLibrary() {
  const out = [];
  ["push", "pull", "legs"].forEach(g => {
    LIBRARY[g].compound.forEach(e =>
      out.push({ ...e, group: g, category: "compound" })
    );
    LIBRARY[g].accessory.forEach(e =>
      out.push({ ...e, group: g, category: "accessory" })
    );
  });
  LIBRARY.hyrox.accessory.forEach(e =>
    out.push({ ...e, group: "hyrox", category: "accessory" })
  );
  return out;
}

// Muscle groupings for the exercise picker
const MUSCLE_GROUPS = [
  { key: "chest", label: "CHEST", match: m => /chest/i.test(m) },
  { key: "shoulders", label: "SHOULDERS", match: m => /shoulder|delt/i.test(m) },
  { key: "back", label: "BACK", match: m => /back|lat|posterior/i.test(m) && !/rear delt/i.test(m) },
  { key: "biceps", label: "BICEPS", match: m => /bicep|brachial/i.test(m) },
  { key: "triceps", label: "TRICEPS", match: m => /tricep/i.test(m) },
  { key: "traps", label: "TRAPS", match: m => /trap/i.test(m) },
  { key: "quads", label: "QUADS", match: m => /quad/i.test(m) },
  { key: "hams", label: "HAMSTRINGS", match: m => /hamstring/i.test(m) },
  { key: "glutes", label: "GLUTES", match: m => /glute/i.test(m) },
  { key: "calves", label: "CALVES", match: m => /calv/i.test(m) },
  { key: "core", label: "CORE", match: m => /core/i.test(m) },
  { key: "adductors", label: "ADDUCTORS", match: m => /adductor/i.test(m) },
  { key: "conditioning", label: "CONDITIONING", match: m => /cardio|full body|legs\/cardio/i.test(m) },
];

// ============ STORAGE LAYER (localStorage-backed) ============
const STORAGE_PREFIX = "protocol:";
const storage = {
  async get(key) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  async set(key, val) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
      return { ok: true };
    } catch (e) { console.error("storage.set", e); return null; }
  },
  async list(prefix) {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX + prefix)) {
          keys.push(k.slice(STORAGE_PREFIX.length));
        }
      }
      return keys;
    } catch { return []; }
  },
  async delete(key) {
    try { localStorage.removeItem(STORAGE_PREFIX + key); return { ok: true }; }
    catch { return null; }
  },
};

// ============ API KEY MGMT ============
const getApiKey = () => localStorage.getItem("protocol:apiKey") || "";
const setApiKey = (k) => localStorage.setItem("protocol:apiKey", k);

// ============ AI WORKOUT GENERATION ============
function extractJSON(text) {
  // Strip markdown fences first
  let s = text.replace(/```json|```/g, "").trim();
  // Find first { and last } and extract that
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    s = s.slice(first, last + 1);
  }
  return JSON.parse(s);
}

async function generateWorkout(profile, history, sessionType) {
  const recent = history.slice(-10).map(w => ({
    date: w.date, type: w.type, title: w.title,
    exercises: (w.exercises || []).map(e => ({
      name: e.name,
      sets: (e.sets || []).filter(s => s.completed).map(s => ({
        w: s.weight, r: s.reps, rpe: s.rpe
      }))
    })),
    cardio: w.cardio,
  }));

  const sysPrompt =
    "You are an elite strength & conditioning coach for an advanced lifter " +
    "running concurrent hypertrophy + endurance + Hyrox functional fitness. " +
    "Output ONLY valid JSON. No markdown, no preamble, no explanation.";

  const kind = SESSION_KIND[sessionType];
  let userPrompt;

  if (kind === "lift") {
    const muscleGroup = sessionType === "push" ? "push" : sessionType === "pull" ? "pull" : "legs";
    const pool = LIBRARY[muscleGroup];
    userPrompt = `Generate today's LIFT workout. Session: "${SESSION_LABELS[sessionType]}".

Profile: ${JSON.stringify(profile)}
Recent sessions (oldest first): ${JSON.stringify(recent)}

Pick exercises ONLY from this library:
COMPOUNDS: ${JSON.stringify(pool.compound)}
ACCESSORIES: ${JSON.stringify(pool.accessory)}

Rules:
- 5-7 exercises. Lead with 1-2 compounds (4-5 sets, 4-8 reps), then 3-5 accessories (3-4 sets, 8-15 reps).
- Progressive overload: if last similar session had RPE <= 7 on top sets, bump load 2.5-5lb. If RPE >= 9 or missed reps, hold or deload 5-10%.
- Rotate accessories week to week. Keep main compound consistent for 3-4 weeks.
- Suggest specific starting weight from history; otherwise null.

Output JSON only:
{
  "type": "lift",
  "title": "string",
  "summary": "1 sentence coaching cue",
  "exercises": [
    { "name": "string (must be from library)", "category": "compound|accessory", "targetSets": number, "targetReps": "string e.g. '6-8'", "suggestedWeight": number|null, "rest": "string", "notes": "string" }
  ]
}`;
  } else if (kind === "hyrox") {
    userPrompt = `Generate today's HYROX session. Type: "${SESSION_LABELS[sessionType]}".

Profile: ${JSON.stringify(profile)}
Recent sessions: ${JSON.stringify(recent)}

Hyrox race stations (in standard order, use these names exactly):
${JSON.stringify(LIBRARY.hyrox.stations)}

Hyrox accessories: ${JSON.stringify(LIBRARY.hyrox.accessory)}

Rules:
- HYROX SIMULATION: 8 rounds of (1km run + 1 station). Use stations in race order. This is race-pace work.
- HYROX STATIONS: 4-6 stations as a circuit, 2-4 rounds. No running. Pick stations targeting weakness.
- COMPROMISED RUNS: Alternate 800m run + 1 station, 4-6 rounds. Test station performance under aerobic stress.

Output JSON only:
{
  "type": "hyrox",
  "subtype": "simulation|stations|compromised",
  "title": "string",
  "summary": "1 sentence coaching cue",
  "rounds": number,
  "structure": [
    { "phase": "run|station|rest", "name": "string", "target": "string e.g. '1000m' or '50m' or '100 reps'", "intensity": "string e.g. 'race pace' or 'Z3'", "notes": "string" }
  ],
  "totalDuration": "string estimate"
}`;
  } else {
    userPrompt = `Generate today's CARDIO workout. Session: "${SESSION_LABELS[sessionType]}".

Profile: ${JSON.stringify(profile)}
Recent sessions: ${JSON.stringify(recent)}

Rules:
- Z2: 30-60 min steady, HR ~60-70% max, conversational.
- VO2 INTERVALS: warmup + 4-6 hard intervals (3-5 min @ Z4-5) with equal recovery + cooldown.
- TEMPO: warmup + 20-30 min sustained Z3-4 + cooldown.
- Pick ONE modality (run, bike, row, stairs) and vary across week.

Output JSON only:
{
  "type": "cardio",
  "title": "string",
  "modality": "run|bike|row|stairs|mixed",
  "summary": "1 sentence coaching cue",
  "structure": [
    { "phase": "warmup|work|recovery|cooldown", "duration": "string", "intensity": "string", "notes": "string" }
  ],
  "totalDuration": "string"
}`;
  }

  console.log("[Protocol] Calling API for", sessionType);
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("No API key set. Add one in Profile tab.");
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: sysPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "unknown");
    console.error("[Protocol] API error", res.status, errText);
    throw new Error(`API ${res.status}: ${errText.slice(0, 100)}`);
  }
  const data = await res.json();
  console.log("[Protocol] API raw response", data);
  const text = (data.content || [])
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("");
  if (!text) throw new Error("Empty response from API");
  return extractJSON(text);
}

// ============ FALLBACK GENERATOR (no API needed) ============
function pickN(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

function fallbackWorkout(profile, history, sessionType) {
  const kind = SESSION_KIND[sessionType];
  if (kind === "lift") {
    const groupKey = sessionType === "push" ? "push" : sessionType === "pull" ? "pull" : "legs";
    const group = LIBRARY[groupKey];
    const compounds = pickN(group.compound, 2);
    const accessories = pickN(group.accessory, 4);
    const exercises = [
      ...compounds.map(c => ({
        name: c.name, category: "compound",
        targetSets: 4, targetReps: "5-8", suggestedWeight: null,
        rest: "2-3 min", notes: c.muscle,
      })),
      ...accessories.map(a => ({
        name: a.name, category: "accessory",
        targetSets: 3, targetReps: "10-12", suggestedWeight: null,
        rest: "60-90 sec", notes: a.muscle,
      })),
    ];
    return {
      type: "lift",
      title: SESSION_LABELS[sessionType],
      summary: "Library fallback — API unavailable, picked reasonable defaults.",
      exercises,
    };
  }
  if (kind === "hyrox") {
    const stations = LIBRARY.hyrox.stations;
    if (sessionType === "hyrox_sim") {
      const structure = [];
      stations.forEach(s => {
        structure.push({ phase: "run", name: "Run", target: "1000m", intensity: "race pace", notes: "" });
        structure.push({ phase: "station", name: s.name, target: s.standard, intensity: "race pace", notes: "" });
      });
      return {
        type: "hyrox", subtype: "simulation",
        title: "HYROX SIMULATION",
        summary: "Full 8-round race simulation.",
        rounds: 8, structure, totalDuration: "60-90 min",
      };
    }
    if (sessionType === "hyrox_stations") {
      const picked = pickN(stations, 5);
      return {
        type: "hyrox", subtype: "stations",
        title: "HYROX STATIONS",
        summary: "Station circuit, 3 rounds. No running.",
        rounds: 3,
        structure: picked.map(s => ({
          phase: "station", name: s.name, target: s.standard,
          intensity: "race pace", notes: "Rest 90s between stations",
        })),
        totalDuration: "40-50 min",
      };
    }
    const picked = pickN(stations, 5);
    const structure = [];
    picked.forEach(s => {
      structure.push({ phase: "run", name: "Run", target: "800m", intensity: "Z3", notes: "" });
      structure.push({ phase: "station", name: s.name, target: s.standard, intensity: "race pace", notes: "" });
    });
    return {
      type: "hyrox", subtype: "compromised",
      title: "COMPROMISED RUNS",
      summary: "Run + station alternating. Train station work under aerobic load.",
      rounds: 5, structure, totalDuration: "45-60 min",
    };
  }
  // cardio fallback
  if (sessionType === "z2") {
    return {
      type: "cardio", title: "ZONE 2 STEADY", modality: "bike",
      summary: "Conversational pace, build aerobic base.",
      structure: [
        { phase: "warmup", duration: "5 min", intensity: "easy", notes: "Gradual ramp" },
        { phase: "work", duration: "45 min", intensity: "Z2 (60-70% max HR)", notes: "Should be able to talk" },
        { phase: "cooldown", duration: "5 min", intensity: "easy", notes: "" },
      ],
      totalDuration: "55 min",
    };
  }
  if (sessionType === "intervals") {
    return {
      type: "cardio", title: "VO2 INTERVALS", modality: "run",
      summary: "Hard intervals, full recovery between.",
      structure: [
        { phase: "warmup", duration: "10 min", intensity: "Z2", notes: "Build to Z3 last min" },
        { phase: "work", duration: "4 min", intensity: "Z4-5", notes: "5 rounds — hard but sustainable" },
        { phase: "recovery", duration: "4 min", intensity: "easy walk/jog", notes: "Between each work" },
        { phase: "cooldown", duration: "10 min", intensity: "easy", notes: "" },
      ],
      totalDuration: "50 min",
    };
  }
  return {
    type: "cardio", title: "TEMPO RUN", modality: "run",
    summary: "Sustained tempo effort.",
    structure: [
      { phase: "warmup", duration: "10 min", intensity: "Z2", notes: "" },
      { phase: "work", duration: "25 min", intensity: "Z3-4", notes: "Comfortably hard" },
      { phase: "cooldown", duration: "5 min", intensity: "easy", notes: "" },
    ],
    totalDuration: "40 min",
  };
}

// ============ DATE HELPERS ============
const isoDate = (d = new Date()) => d.toISOString().slice(0, 10);
const todayDow = () => (new Date().getDay() + 6) % 7; // Mon=0..Sun=6
const fmtDate = iso => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric",
  });
};

// ============ FONT INJECTION ============
function useFonts() {
  useEffect(() => {
    const id = "fitbod-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

// ============ TOP-LEVEL APP ============
export default function App() {
  useFonts();
  const [profile, setProfile] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [tab, setTab] = useState("today");
  const [loaded, setLoaded] = useState(false);

  const reloadAll = useCallback(async () => {
    const p = await storage.get("profile");
    setProfile(p || DEFAULT_PROFILE);
    const keys = await storage.list("workout:");
    const items = await Promise.all(
      keys.map(async k => await storage.get(k.replace(/^workout:/, "workout:")))
    );
    const cleaned = items.filter(Boolean).sort((a, b) =>
      a.date < b.date ? -1 : 1
    );
    setWorkouts(cleaned);
    setLoaded(true);
  }, []);

  // Load on mount
  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  // Persist profile when changed
  useEffect(() => {
    if (loaded && profile) storage.set("profile", profile);
  }, [profile, loaded]);

  const saveWorkout = useCallback(async w => {
    await storage.set(`workout:${w.id}`, w);
    setWorkouts(prev => {
      const idx = prev.findIndex(p => p.id === w.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = w;
        return next;
      }
      return [...prev, w].sort((a, b) => a.date < b.date ? -1 : 1);
    });
  }, []);

  const deleteWorkout = useCallback(async id => {
    await storage.delete(`workout:${id}`);
    setWorkouts(prev => prev.filter(w => w.id !== id));
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100 pb-20"
      style={{ fontFamily: FF_BODY }}
    >
      <div className="max-w-2xl mx-auto">
        <Header profile={profile} workouts={workouts} />
        <div className="px-4">
          {tab === "today" && (
            <Today
              profile={profile}
              workouts={workouts}
              onSave={saveWorkout}
            />
          )}
          {tab === "history" && (
            <History workouts={workouts} onDelete={deleteWorkout} />
          )}
          {tab === "progress" && <Progress workouts={workouts} profile={profile} />}
          {tab === "profile" && (
            <ProfileTab
              profile={profile}
              setProfile={setProfile}
              workouts={workouts}
              reload={reloadAll}
            />
          )}
        </div>
        <Nav tab={tab} setTab={setTab} />
      </div>
    </div>
  );
}

// ============ HEADER ============
function Header({ profile, workouts }) {
  const streak = useMemo(() => {
    let s = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = isoDate(d);
      const w = workouts.find(x => x.date === iso && x.completed);
      if (w) s++;
      else if (i > 0) break;
    }
    return s;
  }, [workouts]);

  const weekVol = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const recent = workouts.filter(w =>
      new Date(w.date) >= start && w.completed
    );
    return recent.length;
  }, [workouts]);

  return (
    <div className="px-4 pt-6 pb-3 border-b border-zinc-900">
      <div className="flex items-baseline justify-between">
        <h1
          className="text-3xl tracking-wider"
          style={{ fontFamily: FF_HEAD, letterSpacing: "0.05em" }}
        >
          PROTOCOL<span className="text-orange-500">.</span>
        </h1>
        <div className="flex gap-4 items-center">
          <Stat label="STREAK" value={streak} unit="d" />
          <Stat label="WK" value={weekVol} unit="/5" />
        </div>
      </div>
      <div
        className="mt-1 text-xs text-zinc-500 uppercase tracking-widest"
        style={{ fontFamily: FF_MONO }}
      >
        Concurrent · Hypertrophy + Endurance · Advanced
      </div>
    </div>
  );
}

function Stat({ label, value, unit }) {
  return (
    <div className="text-right">
      <div
        className="text-xl text-orange-500 leading-none"
        style={{ fontFamily: FF_MONO, fontWeight: 700 }}
      >
        {value}
        <span className="text-xs text-zinc-500 ml-0.5">{unit}</span>
      </div>
      <div
        className="text-xs text-zinc-600 mt-0.5"
        style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
      >
        {label}
      </div>
    </div>
  );
}

// ============ TODAY ============
function Today({ profile, workouts, onSave }) {
  const today = isoDate();
  const dow = todayDow();
  const plannedType = profile.schedule[dow]?.type || "rest";
  const existing = workouts.find(w => w.date === today);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  if (plannedType === "rest" && !existing) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-zinc-800 mb-6">
          <Heart className="w-8 h-8 text-zinc-600" />
        </div>
        <h2
          className="text-4xl mb-2"
          style={{ fontFamily: FF_HEAD, letterSpacing: "0.05em" }}
        >
          REST DAY
        </h2>
        <p className="text-zinc-500 text-sm">
          Recovery is training. Sleep, eat, walk.
        </p>
      </div>
    );
  }

  const onGenerate = async (forceFallback = false) => {
    setGenerating(true);
    setError(null);
    try {
      let data;
      let usedFallback = false;
      if (forceFallback) {
        data = fallbackWorkout(profile, workouts, plannedType);
        usedFallback = true;
      } else {
        try {
          data = await generateWorkout(profile, workouts, plannedType);
        } catch (apiErr) {
          console.warn("[Protocol] API failed, using library fallback:", apiErr);
          setError(`API: ${apiErr.message}. Used library fallback.`);
          data = fallbackWorkout(profile, workouts, plannedType);
          usedFallback = true;
        }
      }

      const kind = SESSION_KIND[plannedType];
      const w = {
        id: `${today}-${Date.now()}`,
        date: today,
        type: data.type,
        title: data.title || SESSION_LABELS[plannedType],
        summary: data.summary,
        sessionKind: kind,
        completed: false,
        startedAt: new Date().toISOString(),
        usedFallback,
        garminLink: null,
        exercises: kind === "lift"
          ? (data.exercises || []).map(e => ({
              ...e,
              sets: Array.from({ length: e.targetSets || 3 }, () => ({
                weight: e.suggestedWeight || null,
                reps: null, rpe: null, completed: false,
              })),
            }))
          : null,
        cardio: kind === "cardio"
          ? {
              modality: data.modality,
              structure: data.structure || [],
              totalDuration: data.totalDuration,
              actualDuration: null,
              actualDistance: null,
              avgHr: null,
              notes: "",
            }
          : null,
        hyrox: kind === "hyrox"
          ? {
              subtype: data.subtype,
              rounds: data.rounds,
              structure: data.structure || [],
              totalDuration: data.totalDuration,
              actualDuration: null,
              notes: "",
            }
          : null,
      };
      await onSave(w);
    } catch (e) {
      console.error("[Protocol] Total failure:", e);
      setError(`Failed: ${e.message}. Tap RETRY or USE LIBRARY.`);
    } finally {
      setGenerating(false);
    }
  };

  if (!existing) {
    const kindLabel = SESSION_KIND[plannedType];
    const subtitle =
      kindLabel === "lift"
        ? "Resistance training session — generated from your training history."
        : kindLabel === "hyrox"
        ? "Hyrox-style functional fitness session — built from race stations."
        : "Conditioning session — paired with your strength work.";
    return (
      <div className="py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-950 border border-red-900 text-red-400 text-sm flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1 break-words">{error}</div>
          </div>
        )}
        <div
          className="text-xs text-zinc-500 uppercase tracking-widest mb-2"
          style={{ fontFamily: FF_MONO }}
        >
          {fmtDate(today)} · Today's Session
        </div>
        <h2
          className="text-5xl mb-1"
          style={{ fontFamily: FF_HEAD, letterSpacing: "0.04em" }}
        >
          {SESSION_LABELS[plannedType]}
        </h2>
        <p className="text-zinc-500 text-sm mb-8">{subtitle}</p>
        <button
          onClick={() => onGenerate(false)}
          disabled={generating}
          className="w-full bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-zinc-950 py-5 px-6 flex items-center justify-center gap-3 disabled:opacity-50 transition-colors"
          style={{ fontFamily: FF_HEAD, fontSize: "1.5rem", letterSpacing: "0.08em" }}
        >
          {generating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              GENERATING…
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              GENERATE WORKOUT
            </>
          )}
        </button>
        <button
          onClick={() => onGenerate(true)}
          disabled={generating}
          className="w-full mt-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 py-3 flex items-center justify-center gap-2 transition-colors text-sm"
          style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
        >
          USE LIBRARY (no AI)
        </button>
      </div>
    );
  }

  return existing.sessionKind === "lift"
    ? <LiftSession w={existing} workouts={workouts} onSave={onSave} />
    : existing.sessionKind === "hyrox"
    ? <HyroxSession w={existing} onSave={onSave} />
    : <CardioSession w={existing} onSave={onSave} />;
}

// ============ EXERCISE PICKER (manual add by muscle) ============
function ExercisePicker({ onAdd, onClose, alreadyInWorkout }) {
  const [muscle, setMuscle] = useState("chest");
  const all = useMemo(() => flatLibrary(), []);
  const group = MUSCLE_GROUPS.find(g => g.key === muscle);
  const filtered = useMemo(
    () => all.filter(e => group?.match(e.muscle || "")),
    [all, group]
  );

  return (
    <div className="border border-orange-900 bg-zinc-900 mt-4">
      <div className="flex justify-between items-center px-3 py-2.5 border-b border-zinc-800">
        <div
          className="text-xs text-orange-500 uppercase"
          style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}
        >
          ADD EXERCISE
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-200"
          aria-label="Close picker"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto px-3 py-2 border-b border-zinc-800">
        <div className="flex gap-1.5 min-w-max">
          {MUSCLE_GROUPS.map(g => (
            <button
              key={g.key}
              onClick={() => setMuscle(g.key)}
              className={`px-2.5 py-1 text-xs uppercase border whitespace-nowrap transition-colors ${
                muscle === g.key
                  ? "border-orange-500 bg-orange-950 text-orange-500"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
              style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800">
        {filtered.length === 0 ? (
          <div
            className="px-3 py-6 text-center text-xs text-zinc-600"
            style={{ fontFamily: FF_MONO }}
          >
            No exercises in this group.
          </div>
        ) : (
          filtered.map(e => {
            const inWorkout = alreadyInWorkout?.has(e.name.toLowerCase());
            return (
              <button
                key={e.name}
                onClick={() => onAdd(e)}
                className="w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm uppercase truncate text-zinc-200"
                    style={{ fontFamily: FF_HEAD, letterSpacing: "0.03em" }}
                  >
                    {e.name}
                    {inWorkout && (
                      <span className="ml-2 text-xs text-zinc-600 normal-case">
                        (already added)
                      </span>
                    )}
                  </div>
                  <div
                    className="text-xs text-zinc-500"
                    style={{ fontFamily: FF_MONO }}
                  >
                    {e.muscle}
                    {e.category === "compound" && (
                      <span className="ml-2 text-orange-500">● COMPOUND</span>
                    )}
                  </div>
                </div>
                <Plus className="w-4 h-4 text-orange-500 flex-shrink-0" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============ REUSABLE: GARMIN LINK INPUT ============
function GarminLinkInput({ value, onChange }) {
  return (
    <div className="mt-4 mb-4">
      <div
        className="text-xs text-zinc-500 uppercase mb-1.5"
        style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}
      >
        GARMIN ACTIVITY LINK
      </div>
      <input
        type="url"
        value={value ?? ""}
        onChange={e => onChange(e.target.value || null)}
        placeholder="Paste from Garmin Connect → Share → Copy Link"
        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
        style={{ fontFamily: FF_MONO }}
      />
    </div>
  );
}

// ============ LIFT SESSION ============
function LiftSession({ w, workouts, onSave }) {
  const [draft, setDraft] = useState(w);
  const [showPicker, setShowPicker] = useState(false);
  useEffect(() => setDraft(w), [w.id]);

  const updateSet = (eIdx, sIdx, patch) => {
    const next = { ...draft };
    next.exercises = next.exercises.map((e, i) =>
      i === eIdx
        ? {
            ...e,
            sets: e.sets.map((s, j) =>
              j === sIdx ? { ...s, ...patch } : s
            ),
          }
        : e
    );
    setDraft(next);
    onSave(next);
  };

  const addSet = eIdx => {
    const next = { ...draft };
    next.exercises = next.exercises.map((e, i) =>
      i === eIdx
        ? {
            ...e,
            sets: [
              ...e.sets,
              {
                weight: e.sets[e.sets.length - 1]?.weight || null,
                reps: null, rpe: null, completed: false,
              },
            ],
          }
        : e
    );
    setDraft(next);
    onSave(next);
  };

  const removeSet = (eIdx, sIdx) => {
    const next = { ...draft };
    next.exercises = next.exercises.map((e, i) =>
      i === eIdx
        ? { ...e, sets: e.sets.filter((_, j) => j !== sIdx) }
        : e
    );
    setDraft(next);
    onSave(next);
  };

  const addExercise = libEntry => {
    const isCompound = libEntry.category === "compound";
    // Try to pull last performance for suggested weight
    let suggestedWeight = null;
    for (let i = workouts.length - 1; i >= 0; i--) {
      const w = workouts[i];
      const found = (w.exercises || []).find(
        e => e.name?.toLowerCase() === libEntry.name.toLowerCase()
      );
      if (found) {
        const completed = (found.sets || []).filter(
          s => s.completed && s.weight
        );
        if (completed.length) {
          suggestedWeight = completed[completed.length - 1].weight;
          break;
        }
      }
    }
    const numSets = isCompound ? 4 : 3;
    const newEx = {
      name: libEntry.name,
      category: libEntry.category || "accessory",
      targetSets: numSets,
      targetReps: isCompound ? "5-8" : "8-12",
      suggestedWeight,
      rest: isCompound ? "2-3 min" : "60-90 sec",
      notes: libEntry.muscle || "",
      userAdded: true,
      sets: Array.from({ length: numSets }, () => ({
        weight: suggestedWeight,
        reps: null,
        rpe: null,
        completed: false,
      })),
    };
    const next = { ...draft, exercises: [...draft.exercises, newEx] };
    setDraft(next);
    onSave(next);
  };

  const removeExercise = eIdx => {
    if (!confirm("Remove this exercise?")) return;
    const next = {
      ...draft,
      exercises: draft.exercises.filter((_, i) => i !== eIdx),
    };
    setDraft(next);
    onSave(next);
  };

  const finish = () => {
    const finished = {
      ...draft,
      completed: true,
      finishedAt: new Date().toISOString(),
    };
    setDraft(finished);
    onSave(finished);
  };

  const allSetsLogged = draft.exercises.every(e =>
    e.sets.some(s => s.completed)
  );

  const alreadyInWorkout = useMemo(
    () => new Set(draft.exercises.map(e => e.name?.toLowerCase())),
    [draft.exercises]
  );

  return (
    <div className="py-6">
      <div
        className="text-xs text-zinc-500 uppercase tracking-widest mb-1"
        style={{ fontFamily: FF_MONO }}
      >
        {fmtDate(draft.date)}
      </div>
      <h2
        className="text-4xl mb-2"
        style={{ fontFamily: FF_HEAD, letterSpacing: "0.04em" }}
      >
        {draft.title}
      </h2>
      {draft.summary && (
        <p className="text-zinc-400 text-sm mb-6 italic">{draft.summary}</p>
      )}

      <div className="space-y-5">
        {draft.exercises.map((ex, eIdx) => (
          <ExerciseCard
            key={eIdx}
            ex={ex}
            eIdx={eIdx}
            history={workouts}
            updateSet={updateSet}
            addSet={addSet}
            removeSet={removeSet}
            removeExercise={() => removeExercise(eIdx)}
          />
        ))}
      </div>

      {!showPicker ? (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full mt-4 border-2 border-dashed border-zinc-800 hover:border-orange-500 hover:text-orange-500 text-zinc-500 py-3 flex items-center justify-center gap-2 transition-colors"
          style={{ fontFamily: FF_HEAD, fontSize: "1rem", letterSpacing: "0.08em" }}
        >
          <Plus className="w-4 h-4" /> ADD EXERCISE
        </button>
      ) : (
        <ExercisePicker
          onAdd={addExercise}
          onClose={() => setShowPicker(false)}
          alreadyInWorkout={alreadyInWorkout}
        />
      )}

      <GarminLinkInput
        value={draft.garminLink}
        onChange={v => {
          const next = { ...draft, garminLink: v };
          setDraft(next);
          onSave(next);
        }}
      />

      {!draft.completed ? (
        <button
          onClick={finish}
          disabled={!allSetsLogged}
          className="w-full mt-6 bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 py-4 flex items-center justify-center gap-2 transition-colors"
          style={{ fontFamily: FF_HEAD, fontSize: "1.25rem", letterSpacing: "0.08em" }}
        >
          <Check className="w-5 h-5" /> FINISH SESSION
        </button>
      ) : (
        <div
          className="w-full mt-6 bg-green-950 border border-green-900 text-green-500 py-4 flex items-center justify-center gap-2"
          style={{ fontFamily: FF_HEAD, fontSize: "1.25rem", letterSpacing: "0.08em" }}
        >
          <Check className="w-5 h-5" /> SESSION COMPLETE
        </div>
      )}
    </div>
  );
}

function ExerciseCard({ ex, eIdx, history, updateSet, addSet, removeSet, removeExercise }) {
  // Find last performance of this exercise
  const lastPerf = useMemo(() => {
    for (let i = history.length - 1; i >= 0; i--) {
      const w = history[i];
      if (!w.completed || !w.exercises) continue;
      const found = w.exercises.find(
        e => e.name?.toLowerCase() === ex.name?.toLowerCase()
      );
      if (found) {
        const completed = (found.sets || []).filter(s => s.completed);
        if (completed.length) {
          const top = completed.reduce(
            (a, b) => ((b.weight || 0) > (a.weight || 0) ? b : a),
            completed[0]
          );
          return { date: w.date, top, count: completed.length };
        }
      }
    }
    return null;
  }, [ex.name, history]);

  return (
    <div className="border border-zinc-800 bg-zinc-900">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3
              className="text-lg uppercase"
              style={{ fontFamily: FF_HEAD, letterSpacing: "0.04em" }}
            >
              {ex.name}
              {ex.userAdded && (
                <span
                  className="ml-2 text-xs text-orange-500 normal-case"
                  style={{ fontFamily: FF_MONO, letterSpacing: "0.05em" }}
                >
                  (added)
                </span>
              )}
            </h3>
            <div
              className="text-xs text-zinc-500 mt-0.5"
              style={{ fontFamily: FF_MONO }}
            >
              {ex.targetSets} × {ex.targetReps} · rest {ex.rest}
              {ex.category === "compound" && (
                <span className="ml-2 text-orange-500">● COMPOUND</span>
              )}
            </div>
          </div>
          {removeExercise && (
            <button
              onClick={removeExercise}
              className="text-zinc-700 hover:text-red-500 flex-shrink-0 p-1 -mt-1 -mr-1"
              aria-label="Remove exercise"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {ex.notes && (
          <div className="text-xs text-zinc-400 mt-2 italic">{ex.notes}</div>
        )}
        {lastPerf && (
          <div
            className="text-xs text-zinc-500 mt-2"
            style={{ fontFamily: FF_MONO }}
          >
            LAST: {lastPerf.top.weight}× {lastPerf.top.reps}
            {lastPerf.top.rpe ? ` @ RPE ${lastPerf.top.rpe}` : ""}
            <span className="text-zinc-600 ml-2">
              ({fmtDate(lastPerf.date)})
            </span>
          </div>
        )}
      </div>

      <div className="divide-y divide-zinc-800">
        <div
          className="grid grid-cols-12 px-4 py-2 text-xs text-zinc-600 uppercase"
          style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
        >
          <div className="col-span-1">SET</div>
          <div className="col-span-3 text-right">WEIGHT</div>
          <div className="col-span-3 text-right">REPS</div>
          <div className="col-span-2 text-right">RPE</div>
          <div className="col-span-3 text-right">DONE</div>
        </div>
        {ex.sets.map((s, sIdx) => (
          <SetRow
            key={sIdx}
            set={s}
            num={sIdx + 1}
            onUpdate={p => updateSet(eIdx, sIdx, p)}
            onRemove={() => removeSet(eIdx, sIdx)}
          />
        ))}
      </div>

      <button
        onClick={() => addSet(eIdx)}
        className="w-full py-2.5 text-xs text-zinc-500 hover:text-orange-500 hover:bg-zinc-900 transition-colors flex items-center justify-center gap-1.5 border-t border-zinc-800"
        style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
      >
        <Plus className="w-3.5 h-3.5" /> ADD SET
      </button>
    </div>
  );
}

function SetRow({ set, num, onUpdate, onRemove }) {
  return (
    <div
      className={`grid grid-cols-12 px-4 py-2.5 items-center gap-2 ${
        set.completed ? "bg-zinc-900" : ""
      }`}
    >
      <div
        className="col-span-1 text-zinc-400"
        style={{ fontFamily: FF_MONO, fontWeight: 500 }}
      >
        {num}
      </div>
      <input
        type="number"
        inputMode="decimal"
        value={set.weight ?? ""}
        onChange={e =>
          onUpdate({ weight: e.target.value === "" ? null : Number(e.target.value) })
        }
        placeholder="—"
        className="col-span-3 bg-transparent border border-zinc-800 text-right px-2 py-1 text-zinc-100 focus:outline-none focus:border-orange-500"
        style={{ fontFamily: FF_MONO }}
      />
      <input
        type="number"
        inputMode="numeric"
        value={set.reps ?? ""}
        onChange={e =>
          onUpdate({ reps: e.target.value === "" ? null : Number(e.target.value) })
        }
        placeholder="—"
        className="col-span-3 bg-transparent border border-zinc-800 text-right px-2 py-1 text-zinc-100 focus:outline-none focus:border-orange-500"
        style={{ fontFamily: FF_MONO }}
      />
      <input
        type="number"
        inputMode="decimal"
        step="0.5"
        min="1" max="10"
        value={set.rpe ?? ""}
        onChange={e =>
          onUpdate({ rpe: e.target.value === "" ? null : Number(e.target.value) })
        }
        placeholder="—"
        className="col-span-2 bg-transparent border border-zinc-800 text-right px-2 py-1 text-zinc-100 focus:outline-none focus:border-orange-500"
        style={{ fontFamily: FF_MONO }}
      />
      <div className="col-span-3 flex justify-end gap-1">
        <button
          onClick={() => onUpdate({ completed: !set.completed })}
          className={`w-9 h-9 flex items-center justify-center border transition-colors ${
            set.completed
              ? "bg-orange-500 border-orange-500 text-zinc-950"
              : "border-zinc-700 text-zinc-600 hover:border-orange-500 hover:text-orange-500"
          }`}
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={onRemove}
          className="w-9 h-9 flex items-center justify-center border border-zinc-800 text-zinc-700 hover:text-red-500 hover:border-red-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============ CARDIO SESSION ============
function CardioSession({ w, onSave }) {
  const [draft, setDraft] = useState(w);
  useEffect(() => setDraft(w), [w.id]);

  const update = patch => {
    const next = {
      ...draft,
      cardio: { ...draft.cardio, ...patch },
    };
    setDraft(next);
    onSave(next);
  };

  const finish = () => {
    const finished = {
      ...draft,
      completed: true,
      finishedAt: new Date().toISOString(),
    };
    setDraft(finished);
    onSave(finished);
  };

  return (
    <div className="py-6">
      <div
        className="text-xs text-zinc-500 uppercase tracking-widest mb-1"
        style={{ fontFamily: FF_MONO }}
      >
        {fmtDate(draft.date)}
      </div>
      <h2
        className="text-4xl mb-1"
        style={{ fontFamily: FF_HEAD, letterSpacing: "0.04em" }}
      >
        {draft.title}
      </h2>
      <div
        className="text-xs text-orange-500 uppercase mb-1"
        style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}
      >
        {draft.cardio?.modality} · {draft.cardio?.totalDuration}
      </div>
      {draft.summary && (
        <p className="text-zinc-400 text-sm mb-6 italic">{draft.summary}</p>
      )}

      <div className="border border-zinc-800 mb-6">
        <div
          className="px-4 py-2.5 text-xs text-zinc-500 uppercase border-b border-zinc-800 bg-zinc-900"
          style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
        >
          STRUCTURE
        </div>
        <div className="divide-y divide-zinc-800">
          {(draft.cardio?.structure || []).map((p, i) => (
            <div
              key={i}
              className="px-4 py-3 flex items-center justify-between"
            >
              <div>
                <div
                  className="text-sm uppercase"
                  style={{ fontFamily: FF_HEAD, letterSpacing: "0.04em" }}
                >
                  {p.phase}
                </div>
                {p.notes && (
                  <div className="text-xs text-zinc-500 mt-0.5">{p.notes}</div>
                )}
              </div>
              <div className="text-right">
                <div
                  className="text-sm text-zinc-200"
                  style={{ fontFamily: FF_MONO, fontWeight: 500 }}
                >
                  {p.duration}
                </div>
                <div
                  className="text-xs text-orange-500"
                  style={{ fontFamily: FF_MONO }}
                >
                  {p.intensity}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="text-xs text-zinc-500 uppercase mb-3"
        style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}
      >
        LOG ACTUALS
      </div>
      <div className="grid grid-cols-3 gap-2 mb-6">
        <CardioInput
          label="DURATION"
          unit="min"
          value={draft.cardio?.actualDuration}
          onChange={v => update({ actualDuration: v })}
        />
        <CardioInput
          label="DISTANCE"
          unit="mi/km"
          value={draft.cardio?.actualDistance}
          onChange={v => update({ actualDistance: v })}
        />
        <CardioInput
          label="AVG HR"
          unit="bpm"
          value={draft.cardio?.avgHr}
          onChange={v => update({ avgHr: v })}
        />
      </div>

      <textarea
        placeholder="Notes (felt, weather, perceived effort...)"
        value={draft.cardio?.notes || ""}
        onChange={e => update({ notes: e.target.value })}
        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 mb-6 min-h-20"
        style={{ fontFamily: FF_BODY }}
      />

      <GarminLinkInput
        value={draft.garminLink}
        onChange={v => {
          const next = { ...draft, garminLink: v };
          setDraft(next);
          onSave(next);
        }}
      />

      {!draft.completed ? (
        <button
          onClick={finish}
          className="w-full bg-orange-500 hover:bg-orange-400 text-zinc-950 py-4 flex items-center justify-center gap-2"
          style={{ fontFamily: FF_HEAD, fontSize: "1.25rem", letterSpacing: "0.08em" }}
        >
          <Check className="w-5 h-5" /> FINISH SESSION
        </button>
      ) : (
        <div
          className="w-full bg-green-950 border border-green-900 text-green-500 py-4 flex items-center justify-center gap-2"
          style={{ fontFamily: FF_HEAD, fontSize: "1.25rem", letterSpacing: "0.08em" }}
        >
          <Check className="w-5 h-5" /> SESSION COMPLETE
        </div>
      )}
    </div>
  );
}

function CardioInput({ label, unit, value, onChange }) {
  return (
    <div className="border border-zinc-800 bg-zinc-900 p-2.5">
      <div
        className="text-xs text-zinc-500 mb-1"
        style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
      >
        {label}
      </div>
      <input
        type="number"
        inputMode="decimal"
        value={value ?? ""}
        onChange={e =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        placeholder="—"
        className="w-full bg-transparent text-xl text-zinc-100 focus:outline-none"
        style={{ fontFamily: FF_MONO, fontWeight: 500 }}
      />
      <div
        className="text-xs text-zinc-600"
        style={{ fontFamily: FF_MONO }}
      >
        {unit}
      </div>
    </div>
  );
}

// ============ HYROX SESSION ============
function HyroxSession({ w, onSave }) {
  const [draft, setDraft] = useState(w);
  useEffect(() => setDraft(w), [w.id]);

  const update = patch => {
    const next = { ...draft, hyrox: { ...draft.hyrox, ...patch } };
    setDraft(next);
    onSave(next);
  };

  const finish = () => {
    const finished = { ...draft, completed: true, finishedAt: new Date().toISOString() };
    setDraft(finished);
    onSave(finished);
  };

  const struct = draft.hyrox?.structure || [];

  return (
    <div className="py-6">
      <div
        className="text-xs text-zinc-500 uppercase tracking-widest mb-1"
        style={{ fontFamily: FF_MONO }}
      >
        {fmtDate(draft.date)}
      </div>
      <h2
        className="text-4xl mb-1"
        style={{ fontFamily: FF_HEAD, letterSpacing: "0.04em" }}
      >
        {draft.title}
      </h2>
      <div
        className="text-xs text-orange-500 uppercase mb-1"
        style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}
      >
        {draft.hyrox?.rounds} ROUNDS · {draft.hyrox?.totalDuration}
      </div>
      {draft.summary && (
        <p className="text-zinc-400 text-sm mb-6 italic">{draft.summary}</p>
      )}

      <div className="border border-zinc-800 mb-6">
        <div
          className="px-4 py-2.5 text-xs text-zinc-500 uppercase border-b border-zinc-800 bg-zinc-900"
          style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
        >
          STRUCTURE
        </div>
        <div className="divide-y divide-zinc-800">
          {struct.map((p, i) => (
            <div
              key={i}
              className="px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="text-xs text-zinc-600 w-6 text-right"
                  style={{ fontFamily: FF_MONO }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm uppercase truncate"
                    style={{ fontFamily: FF_HEAD, letterSpacing: "0.04em" }}
                  >
                    {p.name}
                  </div>
                  <div
                    className="text-xs text-zinc-500"
                    style={{ fontFamily: FF_MONO }}
                  >
                    {p.phase}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div
                  className="text-sm text-zinc-200"
                  style={{ fontFamily: FF_MONO, fontWeight: 500 }}
                >
                  {p.target}
                </div>
                <div
                  className="text-xs text-orange-500"
                  style={{ fontFamily: FF_MONO }}
                >
                  {p.intensity}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="text-xs text-zinc-500 uppercase mb-3"
        style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}
      >
        LOG ACTUALS
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <CardioInput
          label="TOTAL TIME"
          unit="min"
          value={draft.hyrox?.actualDuration}
          onChange={v => update({ actualDuration: v })}
        />
        <CardioInput
          label="AVG HR"
          unit="bpm"
          value={draft.hyrox?.avgHr}
          onChange={v => update({ avgHr: v })}
        />
      </div>

      <textarea
        placeholder="Notes (round splits, station weak points, sled weight...)"
        value={draft.hyrox?.notes || ""}
        onChange={e => update({ notes: e.target.value })}
        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 mb-6 min-h-20"
        style={{ fontFamily: FF_BODY }}
      />

      <GarminLinkInput
        value={draft.garminLink}
        onChange={v => {
          const next = { ...draft, garminLink: v };
          setDraft(next);
          onSave(next);
        }}
      />

      {!draft.completed ? (
        <button
          onClick={finish}
          className="w-full bg-orange-500 hover:bg-orange-400 text-zinc-950 py-4 flex items-center justify-center gap-2"
          style={{ fontFamily: FF_HEAD, fontSize: "1.25rem", letterSpacing: "0.08em" }}
        >
          <Check className="w-5 h-5" /> FINISH SESSION
        </button>
      ) : (
        <div
          className="w-full bg-green-950 border border-green-900 text-green-500 py-4 flex items-center justify-center gap-2"
          style={{ fontFamily: FF_HEAD, fontSize: "1.25rem", letterSpacing: "0.08em" }}
        >
          <Check className="w-5 h-5" /> SESSION COMPLETE
        </div>
      )}
    </div>
  );
}

// ============ HISTORY ============
function History({ workouts, onDelete }) {
  const sorted = [...workouts].sort((a, b) => (a.date < b.date ? 1 : -1));

  if (!sorted.length) {
    return (
      <div className="py-12 text-center text-zinc-500">
        <HistoryIcon className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
        <div className="text-sm">No sessions logged yet.</div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h2
        className="text-3xl mb-5"
        style={{ fontFamily: FF_HEAD, letterSpacing: "0.04em" }}
      >
        TRAINING LOG
      </h2>
      <div className="space-y-2">
        {sorted.map(w => (
          <HistoryRow key={w.id} w={w} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

function HistoryRow({ w, onDelete }) {
  const [open, setOpen] = useState(false);

  const volume = useMemo(() => {
    if (w.sessionKind !== "lift") return null;
    let total = 0, sets = 0;
    (w.exercises || []).forEach(e =>
      (e.sets || []).forEach(s => {
        if (s.completed && s.weight && s.reps) {
          total += s.weight * s.reps;
          sets++;
        }
      })
    );
    return { total, sets };
  }, [w]);

  return (
    <div className="border border-zinc-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-900 transition-colors"
      >
        <div className="text-left">
          <div
            className="text-xs text-zinc-500"
            style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
          >
            {fmtDate(w.date).toUpperCase()}
          </div>
          <div
            className="text-base mt-0.5"
            style={{ fontFamily: FF_HEAD, letterSpacing: "0.03em" }}
          >
            {w.title}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {w.completed ? (
            <span className="text-xs text-green-500" style={{ fontFamily: FF_MONO }}>
              ✓ DONE
            </span>
          ) : (
            <span className="text-xs text-zinc-600" style={{ fontFamily: FF_MONO }}>
              IN PROGRESS
            </span>
          )}
          <ChevronRight
            className={`w-4 h-4 text-zinc-600 transition-transform ${
              open ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-zinc-800 p-4 bg-zinc-900">
          {w.sessionKind === "lift" && (
            <>
              {volume && (
                <div
                  className="mb-3 text-xs text-zinc-500"
                  style={{ fontFamily: FF_MONO }}
                >
                  VOLUME: {volume.total.toLocaleString()} lb · {volume.sets} sets
                </div>
              )}
              <div className="space-y-3">
                {(w.exercises || []).map((e, i) => (
                  <div key={i}>
                    <div
                      className="text-sm uppercase mb-1"
                      style={{ fontFamily: FF_HEAD, letterSpacing: "0.03em" }}
                    >
                      {e.name}
                    </div>
                    <div
                      className="text-xs text-zinc-400 space-y-0.5"
                      style={{ fontFamily: FF_MONO }}
                    >
                      {(e.sets || [])
                        .filter(s => s.completed)
                        .map((s, j) => (
                          <div key={j}>
                            SET {j + 1}: {s.weight}× {s.reps}
                            {s.rpe ? ` @ RPE ${s.rpe}` : ""}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {w.sessionKind === "cardio" && w.cardio && (
            <div
              className="text-xs text-zinc-300 space-y-1"
              style={{ fontFamily: FF_MONO }}
            >
              <div>MODALITY: {w.cardio.modality}</div>
              {w.cardio.actualDuration && (
                <div>DURATION: {w.cardio.actualDuration} min</div>
              )}
              {w.cardio.actualDistance && (
                <div>DISTANCE: {w.cardio.actualDistance}</div>
              )}
              {w.cardio.avgHr && <div>AVG HR: {w.cardio.avgHr}</div>}
              {w.cardio.notes && (
                <div className="text-zinc-400 italic mt-2">
                  {w.cardio.notes}
                </div>
              )}
            </div>
          )}
          {w.sessionKind === "hyrox" && w.hyrox && (
            <div
              className="text-xs text-zinc-300 space-y-1"
              style={{ fontFamily: FF_MONO }}
            >
              <div>TYPE: {w.hyrox.subtype} · {w.hyrox.rounds} rounds</div>
              {w.hyrox.actualDuration && (
                <div>TOTAL: {w.hyrox.actualDuration} min</div>
              )}
              {w.hyrox.avgHr && <div>AVG HR: {w.hyrox.avgHr}</div>}
              <div className="text-zinc-500 mt-2">STATIONS:</div>
              {(w.hyrox.structure || [])
                .filter(s => s.phase === "station")
                .map((s, j) => (
                  <div key={j} className="text-zinc-400">
                    · {s.name} ({s.target})
                  </div>
                ))}
              {w.hyrox.notes && (
                <div className="text-zinc-400 italic mt-2">
                  {w.hyrox.notes}
                </div>
              )}
            </div>
          )}
          {w.garminLink && (
            <a
              href={w.garminLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-xs text-orange-500 hover:text-orange-400 underline"
              style={{ fontFamily: FF_MONO, letterSpacing: "0.05em" }}
            >
              VIEW ON GARMIN CONNECT →
            </a>
          )}
          <button
            onClick={() => {
              if (confirm("Delete this session?")) onDelete(w.id);
            }}
            className="mt-4 text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
            style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
          >
            <Trash2 className="w-3 h-3" /> DELETE
          </button>
        </div>
      )}
    </div>
  );
}

// ============ PROGRESS ============
function Progress({ workouts, profile }) {
  const completed = workouts.filter(w => w.completed);
  const bodyComp = profile?.bodyComp || [];

  const exerciseStats = useMemo(() => {
    const map = {};
    completed.forEach(w => {
      if (w.sessionKind !== "lift") return;
      (w.exercises || []).forEach(e => {
        const key = e.name?.toLowerCase();
        if (!key) return;
        const top = (e.sets || [])
          .filter(s => s.completed && s.weight && s.reps)
          .reduce((a, b) => ((b.weight || 0) > (a?.weight || 0) ? b : a), null);
        if (!top) return;
        if (!map[key]) map[key] = { name: e.name, points: [] };
        map[key].points.push({
          date: w.date,
          weight: top.weight,
          reps: top.reps,
          e1rm: Math.round(top.weight * (1 + top.reps / 30)),
        });
      });
    });
    return Object.values(map).sort((a, b) => b.points.length - a.points.length);
  }, [completed]);

  const weeklyVolume = useMemo(() => {
    const buckets = {};
    completed.forEach(w => {
      if (w.sessionKind !== "lift") return;
      const d = new Date(w.date + "T00:00:00");
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const key = isoDate(monday);
      let vol = 0;
      (w.exercises || []).forEach(e =>
        (e.sets || []).forEach(s => {
          if (s.completed && s.weight && s.reps) vol += s.weight * s.reps;
        })
      );
      buckets[key] = (buckets[key] || 0) + vol;
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-8)
      .map(([week, volume]) => ({
        week: week.slice(5),
        volume: Math.round(volume),
      }));
  }, [completed]);

  const bodyCompChart = useMemo(() => {
    return bodyComp.map(e => ({
      date: e.date.slice(5),
      weight: e.weight,
      bodyFat: e.bodyFat,
      muscleMass: e.muscleMass,
    }));
  }, [bodyComp]);

  const latestBC = bodyComp[bodyComp.length - 1] || null;
  const prevBC = bodyComp[bodyComp.length - 2] || null;
  const delta = (curr, prev, key) => {
    if (!curr || !prev || curr[key] == null || prev[key] == null) return null;
    return +(curr[key] - prev[key]).toFixed(1);
  };

  if (!completed.length && !bodyComp.length) {
    return (
      <div className="py-12 text-center text-zinc-500">
        <BarChart3 className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
        <div className="text-sm">
          Log a few sessions or body comp entries to see trends.
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h2
        className="text-3xl mb-5"
        style={{ fontFamily: FF_HEAD, letterSpacing: "0.04em" }}
      >
        PROGRESSION
      </h2>

      {bodyComp.length > 0 && (
        <div className="mb-8">
          <div
            className="text-xs text-zinc-500 mb-3 uppercase"
            style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}
          >
            BODY COMPOSITION
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <BCStatCard
              label="WEIGHT"
              unit={profile?.units || "lb"}
              value={latestBC?.weight}
              delta={delta(latestBC, prevBC, "weight")}
            />
            <BCStatCard
              label="BODY FAT"
              unit="%"
              value={latestBC?.bodyFat}
              delta={delta(latestBC, prevBC, "bodyFat")}
            />
            <BCStatCard
              label="MUSCLE"
              unit={profile?.units || "lb"}
              value={latestBC?.muscleMass}
              delta={delta(latestBC, prevBC, "muscleMass")}
            />
          </div>
          {bodyCompChart.length > 1 && (
            <div className="border border-zinc-800 bg-zinc-900 p-3">
              <div
                className="text-xs text-zinc-600 mb-2"
                style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
              >
                WEIGHT TREND ({profile?.units || "lb"})
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={bodyCompChart}>
                  <CartesianGrid
                    strokeDasharray="2 4"
                    stroke="#27272a"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#71717a", fontSize: 10, fontFamily: "monospace" }}
                    axisLine={{ stroke: "#3f3f46" }}
                  />
                  <YAxis
                    domain={["dataMin - 2", "dataMax + 2"]}
                    tick={{ fill: "#71717a", fontSize: 10, fontFamily: "monospace" }}
                    axisLine={{ stroke: "#3f3f46" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#18181b",
                      border: "1px solid #3f3f46",
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: "#f97316", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {bodyCompChart.length > 1 &&
            bodyCompChart.some(p => p.bodyFat != null) && (
              <div className="border border-zinc-800 bg-zinc-900 p-3 mt-2">
                <div
                  className="text-xs text-zinc-600 mb-2"
                  style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
                >
                  BODY FAT % TREND
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart
                    data={bodyCompChart.filter(p => p.bodyFat != null)}
                  >
                    <CartesianGrid
                      strokeDasharray="2 4"
                      stroke="#27272a"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#71717a", fontSize: 10, fontFamily: "monospace" }}
                      axisLine={{ stroke: "#3f3f46" }}
                    />
                    <YAxis
                      domain={["dataMin - 1", "dataMax + 1"]}
                      tick={{ fill: "#71717a", fontSize: 10, fontFamily: "monospace" }}
                      axisLine={{ stroke: "#3f3f46" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#18181b",
                        border: "1px solid #3f3f46",
                        fontFamily: "monospace",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="bodyFat"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ fill: "#06b6d4", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
        </div>
      )}

      {weeklyVolume.length > 0 && (
        <div className="mb-8">
          <div
            className="text-xs text-zinc-500 mb-3 uppercase"
            style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}
          >
            WEEKLY VOLUME (lb)
          </div>
          <div className="border border-zinc-800 bg-zinc-900 p-3">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyVolume}>
                <CartesianGrid strokeDasharray="2 4" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "#71717a", fontSize: 10, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#3f3f46" }}
                />
                <YAxis
                  tick={{ fill: "#71717a", fontSize: 10, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#3f3f46" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #3f3f46",
                    fontFamily: "monospace",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="volume" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {exerciseStats.length > 0 && (
        <>
          <div
            className="text-xs text-zinc-500 mb-3 uppercase"
            style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}
          >
            TOP LIFTS (est. 1RM)
          </div>
          <div className="space-y-4">
            {exerciseStats.slice(0, 6).map(stat => (
              <div key={stat.name} className="border border-zinc-800 bg-zinc-900 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="text-sm uppercase"
                    style={{ fontFamily: FF_HEAD, letterSpacing: "0.03em" }}
                  >
                    {stat.name}
                  </div>
                  <div
                    className="text-xs text-orange-500"
                    style={{ fontFamily: FF_MONO }}
                  >
                    {stat.points[stat.points.length - 1].e1rm} lb
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={stat.points}>
                    <Line
                      type="monotone"
                      dataKey="e1rm"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ fill: "#f97316", r: 3 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#18181b",
                        border: "1px solid #3f3f46",
                        fontFamily: "monospace",
                        fontSize: 12,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BCStatCard({ label, unit, value, delta }) {
  return (
    <div className="border border-zinc-800 bg-zinc-900 p-2.5">
      <div
        className="text-xs text-zinc-500 mb-1"
        style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
      >
        {label}
      </div>
      <div
        className="text-xl text-zinc-100 leading-none"
        style={{ fontFamily: FF_MONO, fontWeight: 500 }}
      >
        {value ?? "—"}
        {value != null && (
          <span className="text-xs text-zinc-600 ml-0.5">{unit}</span>
        )}
      </div>
      {delta != null && (
        <div
          className="text-xs text-zinc-500 mt-1"
          style={{ fontFamily: FF_MONO }}
        >
          {delta > 0 ? "▲" : delta < 0 ? "▼" : "·"} {Math.abs(delta)}
        </div>
      )}
    </div>
  );
}

// ============ EXPORT / IMPORT ============
function ExportImport({ profile, setProfile, workouts, reload, flashSaved }) {
  const fileRef = useRef(null);

  const exportData = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile,
      workouts,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `protocol-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.profile || !Array.isArray(data.workouts)) {
          alert("Invalid file format.");
          return;
        }
        if (!confirm(
          `Import will replace ALL current data with ${data.workouts.length} workouts and your saved profile. Continue?`
        )) return;
        // Wipe existing workouts
        const existingKeys = await storage.list("workout:");
        await Promise.all(existingKeys.map(k => storage.delete(k)));
        // Import new
        await storage.set("profile", data.profile);
        await Promise.all(
          data.workouts.map(w => storage.set(`workout:${w.id}`, w))
        );
        flashSaved();
        reload();
      } catch (err) {
        alert("Import failed: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div>
      <div
        className="text-xs text-zinc-500 mb-3 uppercase"
        style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}
      >
        BACKUP
      </div>
      <div className="flex gap-2">
        <button
          onClick={exportData}
          className="flex-1 border border-zinc-800 hover:border-orange-500 hover:text-orange-500 text-zinc-400 py-2.5 text-xs transition-colors"
          style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
        >
          EXPORT JSON
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 border border-zinc-800 hover:border-orange-500 hover:text-orange-500 text-zinc-400 py-2.5 text-xs transition-colors"
          style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
        >
          IMPORT JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          onChange={importData}
          className="hidden"
        />
      </div>
      <div
        className="text-xs text-zinc-600 italic mt-2"
        style={{ fontFamily: FF_BODY }}
      >
        Export saves all data to a file. Import replaces everything — back up first.
      </div>
    </div>
  );
}

// ============ API KEY SECTION ============
function ApiKeySection({ flashSaved }) {
  const [key, setKey] = useState(getApiKey());
  const [show, setShow] = useState(false);
  const masked = key ? key.slice(0, 7) + "…" + key.slice(-4) : "";

  const save = () => {
    setApiKey(key);
    flashSaved();
    setShow(false);
  };

  return (
    <div>
      <div
        className="text-xs text-zinc-500 mb-3 uppercase"
        style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}
      >
        ANTHROPIC API KEY
      </div>
      {!show ? (
        <div className="flex items-center justify-between border border-zinc-800 px-3 py-2.5">
          <div
            className="text-xs text-zinc-300"
            style={{ fontFamily: FF_MONO }}
          >
            {masked || (
              <span className="text-zinc-600 italic">Not set — required for AI workouts</span>
            )}
          </div>
          <button
            onClick={() => setShow(true)}
            className="text-xs text-orange-500 hover:text-orange-400"
            style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
          >
            {key ? "CHANGE" : "ADD"}
          </button>
        </div>
      ) : (
        <div className="border border-zinc-800 bg-zinc-900 p-3 space-y-2">
          <input
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full bg-zinc-950 border border-zinc-800 px-2 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
            style={{ fontFamily: FF_MONO }}
          />
          <div
            className="text-xs text-zinc-600 italic"
            style={{ fontFamily: FF_BODY }}
          >
            Stored in your browser only. Get one at console.anthropic.com.
            ~$0.01–0.05 per workout generated.
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              className="flex-1 bg-orange-500 hover:bg-orange-400 text-zinc-950 py-2 text-sm"
              style={{ fontFamily: FF_HEAD, letterSpacing: "0.08em" }}
            >
              SAVE
            </button>
            <button
              onClick={() => { setKey(getApiKey()); setShow(false); }}
              className="px-4 border border-zinc-800 text-zinc-400 py-2 text-sm hover:bg-zinc-800"
              style={{ fontFamily: FF_HEAD, letterSpacing: "0.08em" }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ BODY COMPOSITION ============
function BodyCompSection({ profile, update, flashSaved }) {
  const [show, setShow] = useState(false);
  const empty = {
    date: new Date().toISOString().slice(0, 10),
    weight: "", bmi: "", bodyFat: "",
    muscleMass: "", bodyWater: "", boneMass: "", bmr: "",
  };
  const [entry, setEntry] = useState(empty);

  const save = () => {
    if (!entry.weight) return;
    const cleaned = Object.fromEntries(
      Object.entries(entry).map(([k, v]) =>
        k === "date" ? [k, v] : [k, v === "" ? null : Number(v)]
      )
    );
    const newEntries = [...(profile.bodyComp || []), cleaned].sort((a, b) =>
      a.date < b.date ? -1 : 1
    );
    update({ bodyComp: newEntries });
    setEntry(empty);
    setShow(false);
    flashSaved();
  };

  const remove = idx => {
    if (!confirm("Delete this entry?")) return;
    const next = (profile.bodyComp || []).filter((_, i) => i !== idx);
    update({ bodyComp: next });
    flashSaved();
  };

  const recent = [...(profile.bodyComp || [])].reverse().slice(0, 5);
  const u = profile.units;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div
          className="text-xs text-zinc-500 uppercase"
          style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}
        >
          BODY COMPOSITION
        </div>
        <button
          onClick={() => setShow(!show)}
          className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1"
          style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
        >
          {show ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {show ? "CANCEL" : "LOG ENTRY"}
        </button>
      </div>

      {show && (
        <div className="border border-zinc-800 bg-zinc-900 p-3 mb-3 space-y-2">
          <BcRow label="DATE">
            <input
              type="date"
              value={entry.date}
              onChange={e => setEntry({ ...entry, date: e.target.value })}
              className="bg-transparent border border-zinc-800 px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
              style={{ fontFamily: FF_MONO }}
            />
          </BcRow>
          <BcRow label={`WEIGHT (${u})`}>
            <BcInput
              value={entry.weight}
              onChange={v => setEntry({ ...entry, weight: v })}
              required
            />
          </BcRow>
          <BcRow label="BMI">
            <BcInput
              value={entry.bmi}
              onChange={v => setEntry({ ...entry, bmi: v })}
            />
          </BcRow>
          <BcRow label="BODY FAT %">
            <BcInput
              value={entry.bodyFat}
              onChange={v => setEntry({ ...entry, bodyFat: v })}
            />
          </BcRow>
          <BcRow label={`MUSCLE MASS (${u})`}>
            <BcInput
              value={entry.muscleMass}
              onChange={v => setEntry({ ...entry, muscleMass: v })}
            />
          </BcRow>
          <BcRow label="BODY WATER %">
            <BcInput
              value={entry.bodyWater}
              onChange={v => setEntry({ ...entry, bodyWater: v })}
            />
          </BcRow>
          <BcRow label={`BONE MASS (${u})`}>
            <BcInput
              value={entry.boneMass}
              onChange={v => setEntry({ ...entry, boneMass: v })}
            />
          </BcRow>
          <BcRow label="BMR (kcal)">
            <BcInput
              value={entry.bmr}
              onChange={v => setEntry({ ...entry, bmr: v })}
            />
          </BcRow>
          <button
            onClick={save}
            disabled={!entry.weight}
            className="w-full mt-2 bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 py-2 transition-colors"
            style={{ fontFamily: FF_HEAD, letterSpacing: "0.08em" }}
          >
            SAVE ENTRY
          </button>
        </div>
      )}

      {recent.length > 0 ? (
        <div className="space-y-1">
          {recent.map((e, i) => {
            const realIdx = (profile.bodyComp || []).length - 1 - i;
            return (
              <div
                key={i}
                className="border border-zinc-800 px-3 py-2 flex items-start justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs text-zinc-500"
                    style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
                  >
                    {e.date}
                  </div>
                  <div
                    className="text-xs text-zinc-300 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5"
                    style={{ fontFamily: FF_MONO }}
                  >
                    <span>
                      <span className="text-zinc-500">WT</span> {e.weight}
                    </span>
                    {e.bmi != null && (
                      <span>
                        <span className="text-zinc-500">BMI</span> {e.bmi}
                      </span>
                    )}
                    {e.bodyFat != null && (
                      <span>
                        <span className="text-zinc-500">BF</span> {e.bodyFat}%
                      </span>
                    )}
                    {e.muscleMass != null && (
                      <span>
                        <span className="text-zinc-500">MUSC</span> {e.muscleMass}
                      </span>
                    )}
                    {e.bodyWater != null && (
                      <span>
                        <span className="text-zinc-500">H2O</span> {e.bodyWater}%
                      </span>
                    )}
                    {e.bmr != null && (
                      <span>
                        <span className="text-zinc-500">BMR</span> {e.bmr}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => remove(realIdx)}
                  className="text-zinc-700 hover:text-red-500 flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
          {(profile.bodyComp || []).length > 5 && (
            <div
              className="text-xs text-zinc-600 text-center pt-1"
              style={{ fontFamily: FF_MONO }}
            >
              + {(profile.bodyComp || []).length - 5} older entries
            </div>
          )}
        </div>
      ) : (
        <div
          className="text-xs text-zinc-600 italic"
          style={{ fontFamily: FF_BODY }}
        >
          No entries yet. Step on your Garmin scale, paste in the numbers, build a trend.
        </div>
      )}
    </div>
  );
}

function BcRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div
        className="text-xs text-zinc-500 uppercase"
        style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
      >
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function BcInput({ value, onChange, required }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step="0.1"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={required ? "required" : "—"}
      className="w-24 bg-transparent border border-zinc-800 px-2 py-1 text-xs text-zinc-200 text-right focus:outline-none focus:border-orange-500"
      style={{ fontFamily: FF_MONO }}
    />
  );
}

// ============ PROFILE ============
function ProfileTab({ profile, setProfile, workouts, reload }) {
  const [savedFlash, setSavedFlash] = useState(false);
  const flashTimer = useRef(null);

  const flashSaved = () => {
    setSavedFlash(true);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setSavedFlash(false), 1200);
  };

  const update = patch => {
    setProfile({ ...profile, ...patch });
    flashSaved();
  };

  const updateScheduleDay = (idx, type) => {
    const next = { ...profile };
    next.schedule = next.schedule.map((d, i) =>
      i === idx ? { ...d, type } : d
    );
    setProfile(next);
    flashSaved();
  };

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-3xl"
          style={{ fontFamily: FF_HEAD, letterSpacing: "0.04em" }}
        >
          PROFILE
        </h2>
        <div
          className={`text-xs uppercase transition-opacity ${
            savedFlash ? "text-green-500 opacity-100" : "text-zinc-700 opacity-60"
          }`}
          style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}
        >
          {savedFlash ? "✓ SAVED" : "AUTOSAVE ON"}
        </div>
      </div>

      <div className="space-y-5">
        <Field label="GOAL">
          <div className="text-zinc-200 text-sm">
            Concurrent · Hypertrophy + Endurance + Hyrox
          </div>
        </Field>

        <Field label="EXPERIENCE">
          <div className="text-zinc-200 text-sm">Advanced (3+ yrs)</div>
        </Field>

        <Field label="EQUIPMENT">
          <div className="text-zinc-200 text-sm">Full commercial gym</div>
        </Field>

        <Field label="BODYWEIGHT">
          <input
            type="number"
            inputMode="decimal"
            value={profile.bodyweight ?? ""}
            onChange={e =>
              update({
                bodyweight: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            placeholder="—"
            className="w-24 bg-transparent border border-zinc-800 px-2 py-1 text-zinc-100 focus:outline-none focus:border-orange-500"
            style={{ fontFamily: FF_MONO }}
          />
          <span className="text-xs text-zinc-500 ml-2">{profile.units}</span>
        </Field>

        <Field label="HEIGHT">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={profile.height ?? ""}
            onChange={e =>
              update({
                height: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            placeholder="—"
            className="w-24 bg-transparent border border-zinc-800 px-2 py-1 text-zinc-100 focus:outline-none focus:border-orange-500"
            style={{ fontFamily: FF_MONO }}
          />
          <span className="text-xs text-zinc-500 ml-2">
            {profile.units === "lb" ? "in" : "cm"}
          </span>
        </Field>

        <Field label="UNITS">
          <div className="flex gap-2">
            {["lb", "kg"].map(u => (
              <button
                key={u}
                onClick={() => update({ units: u })}
                className={`px-3 py-1 text-xs uppercase border ${
                  profile.units === u
                    ? "border-orange-500 text-orange-500 bg-orange-950"
                    : "border-zinc-800 text-zinc-400"
                }`}
                style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
              >
                {u}
              </button>
            ))}
          </div>
        </Field>

        <div>
          <div
            className="text-xs text-zinc-500 mb-3 uppercase"
            style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}
          >
            WEEKLY SCHEDULE
          </div>
          <div className="space-y-1">
            {profile.schedule.map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-between border border-zinc-800 px-3 py-2"
              >
                <div
                  className="text-xs text-zinc-400 w-10"
                  style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
                >
                  {d.day}
                </div>
                <select
                  value={d.type}
                  onChange={e => updateScheduleDay(i, e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 px-2 py-1 focus:outline-none focus:border-orange-500"
                  style={{ fontFamily: FF_MONO, letterSpacing: "0.05em" }}
                >
                  {Object.entries(SESSION_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div
            className="text-xs text-zinc-600 mt-2 italic"
            style={{ fontFamily: FF_BODY }}
          >
            Changes save instantly. Tomorrow's Today screen will reflect any new schedule.
          </div>
        </div>

        <ApiKeySection flashSaved={flashSaved} />

        <ExportImport
          profile={profile}
          setProfile={setProfile}
          workouts={workouts}
          reload={reload}
          flashSaved={flashSaved}
        />

        <BodyCompSection
          profile={profile}
          update={update}
          flashSaved={flashSaved}
        />
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div
        className="text-xs text-zinc-500 mb-1.5 uppercase"
        style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}
      >
        {label}
      </div>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

// ============ BOTTOM NAV ============
function Nav({ tab, setTab }) {
  const items = [
    { id: "today", label: "TODAY", icon: Flame },
    { id: "history", label: "LOG", icon: HistoryIcon },
    { id: "progress", label: "PROGRESS", icon: TrendingUp },
    { id: "profile", label: "PROFILE", icon: User },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-2xl mx-auto grid grid-cols-4">
        {items.map(it => {
          const Icon = it.icon;
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className={`py-3 flex flex-col items-center gap-1 transition-colors ${
                active ? "text-orange-500" : "text-zinc-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span
                className="text-xs"
                style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
              >
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
