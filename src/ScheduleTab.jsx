import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Edit2, Check, X,
  Footprints, Bike, Dumbbell, Activity, Heart,
  Flame, Wind, Apple, Moon, Clock, Zap,
  ChevronDown, ChevronUp, AlertCircle
} from "lucide-react";

// ============ TOKENS ============
const FF_HEAD = "'Bebas Neue', 'Impact', sans-serif";
const FF_MONO = "'JetBrains Mono', ui-monospace, monospace";
const FF_BODY = "'IBM Plex Sans', system-ui, sans-serif";

// ============ PHASE DATES ============
const PHASE_MAP = [
  { id: "rehab",       label: "REHAB",        start: "2026-06-22", end: "2026-07-19", color: "text-blue-400",   accent: "border-blue-400/30 bg-blue-400/5"   },
  { id: "early_build", label: "EARLY BUILD",  start: "2026-07-20", end: "2026-08-16", color: "text-yellow-400", accent: "border-yellow-400/30 bg-yellow-400/5" },
  { id: "hyrox_build", label: "HYROX BUILD",  start: "2026-08-17", end: "2026-09-20", color: "text-orange-500", accent: "border-orange-500/30 bg-orange-500/5"  },
  { id: "taper",       label: "TAPER",        start: "2026-09-21", end: "2026-09-30", color: "text-orange-300", accent: "border-orange-300/30 bg-orange-300/5"  },
  { id: "bulk",        label: "BULK",         start: "2026-10-01", end: "2026-11-15", color: "text-green-400",  accent: "border-green-400/30 bg-green-400/5"   },
];

function getPhase(dateStr) {
  return PHASE_MAP.find(p => dateStr >= p.start && dateStr <= p.end) || PHASE_MAP[0];
}

// ============ WEEK A/B ============
const WEEK_A_START = new Date("2026-06-22");

function getWeekType(date) {
  const d = new Date(date); d.setHours(0,0,0,0);
  const s = new Date(WEEK_A_START); s.setHours(0,0,0,0);
  const diff = Math.floor((d - s) / 86400000);
  if (diff < 0) return "A";
  return Math.floor(diff / 7) % 2 === 0 ? "A" : "B";
}

// Week A: Boys Mon 5pm-Tue 9am + Fri 3pm-Mon 9am
// Week B: Boys Wed 5pm-Fri 9am
// DOW: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat

const WEEK_SCHEDULES = {
  A: {
    0: { type: "rest",           short: false, boys: true,  label: "REST"           },
    1: { type: "lower_a",        short: false, boys: false, label: "LOWER A"        },
    2: { type: "cardio",         short: true,  boys: true,  label: "CARDIO"         },
    3: { type: "lower_b",        short: false, boys: false, label: "LOWER B"        },
    4: { type: "physio_cardio",  short: false, boys: false, label: "PHYSIO + CARDIO"},
    5: { type: "full_body",      short: false, boys: false, label: "FULL BODY"      },
    6: { type: "rest",           short: false, boys: true,  label: "REST"           },
  },
  B: {
    0: { type: "active_recovery",short: false, boys: false, label: "RECOVERY"       },
    1: { type: "lower_a",        short: false, boys: false, label: "LOWER A"        },
    2: { type: "cardio",         short: false, boys: false, label: "CARDIO"         },
    3: { type: "lower_b",        short: false, boys: false, label: "LOWER B"        },
    4: { type: "walk_physio",    short: true,  boys: true,  label: "WALK + PHYSIO"  },
    5: { type: "full_body",      short: true,  boys: true,  label: "FULL BODY"      },
    6: { type: "hyrox_long",     short: false, boys: false, label: "HYROX SKILL"    },
  },
};

const SESSION_TYPES = [
  "lower_a", "lower_b", "full_body", "cardio",
  "physio_cardio", "hyrox_long", "walk_physio",
  "active_recovery", "rest",
];

// ============ SESSION CONTENT ============
function getSessionContent(type, phase, short) {
  const p = phase?.id || "rehab";

  const base = {
    lower_a: {
      title: "LOWER A",
      subtitle: "Quad Dominant Strength",
      icon: "lift",
      duration: short ? "35min" : "55min",
      walk: true,
      exercises: {
        rehab: [
          "Leg press — 4×10",
          "Bulgarian split squat (DBs at sides, light) — 3×10/leg",
          "RDL with DBs — 3×10",
          "Single-leg glute bridge — 3×12/leg",
          "Standing calf raises — 3×20",
          "Dead bug (no arms) — 3×10/side",
        ],
        early_build: [
          "Hack squat — 4×10",
          "Bulgarian split squat (building weight) — 3×10/leg",
          "Trap bar deadlift — 3×8",
          "Walking lunges (DBs at sides) — 3×12/leg",
          "Leg extension — 3×12",
          "Calf raises — 3×20",
        ],
        hyrox_build: [
          "Hack squat — 4×8 (heavier)",
          "Bulgarian split squat — 4×8/leg",
          "Trap bar deadlift — 4×6",
          "Walking lunges — 3×12/leg",
          "Leg extension + curl superset — 3×12",
          "Sled push (high handles, building) — 4×25m",
        ],
        taper: [
          "Leg press — 3×8 (moderate)",
          "Bulgarian split squat — 2×10/leg",
          "RDL — 2×10",
          "Calf raises — 2×15",
          "Keep it crisp — no grinding",
        ],
        bulk: [
          "Back squat — 5×5 (heavy)",
          "Leg press — 4×10",
          "Bulgarian split squat — 4×8/leg",
          "RDL — 4×8",
          "Leg extension — 3×12",
          "Calf raises — 4×15",
        ],
      },
    },
    lower_b: {
      title: "LOWER B",
      subtitle: "Hip Dominant Strength",
      icon: "lift",
      duration: short ? "35min" : "55min",
      walk: true,
      exercises: {
        rehab: [
          "Hack squat or leg press — 4×10",
          "Hip thrust (barbell on hips, padded) — 3×10",
          "Step-ups (non-surgical hand DB only) — 3×10/leg",
          "Hamstring curl — 3×12",
          "Suitcase carry (non-surgical side) — 4×30m",
          "Pallof press (light) — 3×10",
        ],
        early_build: [
          "Hip thrust — 4×10 (building weight)",
          "Hamstring curl — 4×10",
          "Step-ups (both DBs) — 3×10/leg",
          "Trap bar RDL — 3×8",
          "Farmers carry (bilateral, light) — 4×30m",
          "Cable pull-through — 3×12",
        ],
        hyrox_build: [
          "Hip thrust — 4×10 (heavy)",
          "Hamstring curl — 4×10",
          "Step-ups (heavy) — 3×10/leg",
          "Romanian deadlift — 4×8",
          "Farmers carry (race weight building) — 4×40m",
          "Sled pull (if cleared) — 4×25m",
        ],
        taper: [
          "Hip thrust — 3×8 (moderate)",
          "Hamstring curl — 2×12",
          "Step-ups — 2×10/leg",
          "Farmers carry — 2×30m",
        ],
        bulk: [
          "Romanian deadlift — 5×5 (heavy)",
          "Hip thrust — 4×10",
          "Hamstring curl — 4×10",
          "Step-ups (heavy) — 3×10/leg",
          "Farmers carry — 4×40m",
          "Back extension — 3×12",
        ],
      },
    },
    full_body: {
      title: short ? "FULL BODY SHORT" : "FULL BODY",
      subtitle: short ? "Focused 40min" : "Strength + Conditioning",
      icon: "lift",
      duration: short ? "40min" : "60min",
      walk: true,
      exercises: {
        rehab: [
          "Goblet squat — 3×12",
          "Hip thrust — 3×10",
          "Single-leg RDL — 3×8/leg",
          "Physio shoulder circuit — 2×15",
          "Core: dead bug + pallof press — 3 rounds",
        ],
        early_build: [
          "Trap bar deadlift — 3×8",
          "Incline DB press (light, if cleared) — 3×10",
          "Seated row — 3×12 (10-20lbs)",
          "Leg press — 3×10",
          "Face pulls — 3×15",
        ],
        hyrox_build: [
          "Trap bar deadlift — 4×6",
          "DB bench (building) — 3×10",
          "Seated row (building weight) — 4×10",
          "Leg press — 3×10",
          "Sled push — 4×25m (building)",
          "Burpee step-backs — 3×8",
        ],
        taper: [
          "Trap bar deadlift — 2×5 (light)",
          "Row — 2×10",
          "Leg press — 2×10",
          "Movement quality only — no grinding",
        ],
        bulk: [
          "Deadlift — 4×5 (heavy)",
          "DB bench — 4×8",
          "Barbell row — 4×8",
          "Squat — 3×8",
          "Overhead press (if cleared) — 3×10",
          "Carries — 3×40m",
        ],
      },
    },
    cardio: {
      title: short ? "CARDIO SHORT" : "CARDIO",
      subtitle: { rehab: "Bike Z2", early_build: "Run + Spin", hyrox_build: "Run Intervals", taper: "Easy Run", bulk: "Zone 2" }[p] || "Cardio",
      icon: "cardio",
      duration: short ? "30min" : "45min",
      walk: true,
      exercises: {
        rehab: [
          "Upright or recumbent bike only",
          "Z2 conversational pace — nose breathing",
          `${short ? "25" : "35"}min steady state`,
          "No leaning on bars with surgical arm",
        ],
        early_build: [
          short ? "Easy run 20min Z2" : "Easy run 25-30min Z2",
          "Or spin bike — 5×3min moderate / 2min easy",
          "Warmup: 5min walk before running",
          "Cooldown: 5min walk",
        ],
        hyrox_build: [
          short ? "4×400m @ race pace / 90s rest" : "6×600m @ threshold / 90s rest",
          "1km warmup jog",
          "1km cooldown",
          "Total ~40min",
        ],
        taper: [
          "Easy 25min run Z2",
          "4 strides at end (100m @ race pace)",
          "Legs should feel fresh after — if not, go easier",
        ],
        bulk: [
          "Zone 2 bike or run — 40min",
          "Conversational pace",
          "Maintenance only — engine doesn't shut down post-race",
        ],
      },
    },
    physio_cardio: {
      title: "PHYSIO + CARDIO",
      subtitle: "Shoulder rehab then conditioning",
      icon: "physio",
      duration: "55min",
      walk: true,
      exercises: {
        rehab: [
          "Pendulum circles — 3×30s each direction",
          "AAROM: Supine flexion with pulley — 3×15",
          "Wall slides — 3×10",
          "Scapular retractions — 3×15",
          "External rotation (no resistance) — 3×15",
          "— then —",
          "Bike Z2 — 25min",
        ],
        early_build: [
          "AROM: CKC table slides → wall slides — 3×12",
          "Light Theraband rows — 3×15",
          "Multilevel rows — 3×12",
          "Scapular stabilization — 3×15",
          "— then —",
          "Run easy 20min or spin 25min",
        ],
        hyrox_build: [
          "Rotator cuff Theraband — 3×15",
          "Row machine 10-30lbs — 3×12",
          "Multilevel rows — 3×12",
          "Scapular stabilization — 3×15",
          "— then —",
          "Run 25-30min moderate",
        ],
        taper: [
          "Light shoulder maintenance — 15min",
          "Easy run 20min",
          "Nothing heroic",
        ],
        bulk: [
          "Rotator cuff maintenance — 15min",
          "Zone 2 bike — 30min",
        ],
      },
    },
    walk_physio: {
      title: "WALK + PHYSIO",
      subtitle: "Boys school day — keep it simple",
      icon: "walk",
      duration: "45min",
      walk: false,
      exercises: {
        rehab: [
          "Morning walk 30-45min — this is today's main session",
          "Physio shoulder exercises at home:",
          "Pendulum circles — 3×30s",
          "Scapular retractions — 3×15",
          "AAROM as tolerated",
          "Boys logistics today — don't stress the training",
        ],
        early_build: [
          "Morning walk 30-45min",
          "At-home physio — Theraband work",
          "Scapular stabilization — 3×15",
          "Light rows if band available — 3×15",
        ],
        hyrox_build: [
          "Morning walk 30-45min",
          "At-home Theraband circuit — 20min",
          "Rotator cuff + rows + scapular",
          "Optional: 15min easy run if logistics allow",
        ],
        taper: [
          "30min easy walk",
          "Mobility only — hips, thoracic",
          "Rest. Trust the taper.",
        ],
        bulk: [
          "30min walk",
          "Mobility work",
        ],
      },
    },
    hyrox_long: {
      title: "HYROX SKILL",
      subtitle: "Stations + long cardio",
      icon: "hyrox",
      duration: "75min",
      walk: true,
      exercises: {
        rehab: [
          "Spin bike — 40min Z2 (this week's long cardio)",
          "Light sled push (high handles, empty sled) — 4×25m",
          "Rowing technique — 1000m easy",
          "No overhead, no burpees yet",
        ],
        early_build: [
          "Easy run 30min Z2",
          "Light sled push (high handles, 10-20lbs) — 4×30m",
          "Rowing — 2×1000m easy",
          "Burpee step-backs (no push-up) — 3×8",
          "Walk cooldown 10min",
        ],
        hyrox_build: [
          "1km run (race pace) + 500m row",
          "1km run + 50m sled push (building weight)",
          "1km run + 50m sled pull (if cleared)",
          "1km run + 50m farmers carry",
          "Rest 90s between. Partner takes wall balls + SkiErg.",
        ],
        taper: [
          "1km run + 500m row",
          "1km run + 50m sled push (race weight — just feeling it)",
          "Easy pace. Confidence builder not a crusher.",
        ],
        bulk: [
          "Long run 45-60min Z2",
          "Engine maintenance — Hyrox is done",
        ],
      },
    },
    active_recovery: {
      title: "ACTIVE RECOVERY",
      subtitle: "Move, don't train",
      icon: "walk",
      duration: "30-45min",
      walk: false,
      exercises: {
        rehab: ["Walk 30-45min", "Mobility — hips, thoracic spine", "Foam roll — quads, hamstrings, calves", "No gym today"],
        early_build: ["Walk 30-45min", "Light mobility + foam roll", "Optional: 15min easy spin", "No intensity"],
        hyrox_build: ["Walk 30-45min", "Mobility", "Foam roll", "You earned it — don't add training"],
        taper: ["Walk 20-30min", "Mobility only", "Sleep and eat well"],
        bulk: ["Walk 30-45min", "Mobility", "Foam roll"],
      },
    },
    rest: {
      title: "REST",
      subtitle: "Boys day. Walk and be present.",
      icon: "rest",
      duration: "Walk only",
      walk: false,
      exercises: {
        rehab: ["Morning walk 30-45min — always", "Be present with the boys", "Hydrate well", "Sleep priority tonight"],
        early_build: ["Morning walk 30-45min", "Boys day — no training", "Prep mentally for tomorrow"],
        hyrox_build: ["Morning walk 30-45min", "Boys day — you need this recovery", "Hydrate + eat well", "Tomorrow matters more than today"],
        taper: ["Walk 20-30min", "Boys day", "Race week is coming — rest is training"],
        bulk: ["Walk 30-45min", "Boys day", "Enjoy it"],
      },
    },
  };

  const s = base[type] || base.rest;
  const exKey = p in (s.exercises || {}) ? p : "rehab";
  return {
    ...s,
    exercises: s.exercises?.[exKey] || [],
  };
}

// ============ FOOD TIMING ============
function getFoodTiming(dayMeta, tomorrowMeta, phase) {
  const phaseId = phase?.id || "rehab";
  const isRest = ["rest", "active_recovery", "walk_physio"].includes(dayMeta?.type);
  const isShort = dayMeta?.short;
  const tomorrowHard = ["lower_a", "lower_b", "full_body", "hyrox_long"].includes(tomorrowMeta?.type);
  const tomorrowCardio = ["cardio"].includes(tomorrowMeta?.type);

  const meals = [
    {
      time: "6:30am",
      emoji: "🌅",
      label: "Morning Walk",
      detail: "30-45min fasted. Peptides after. Sunlight on the way.",
      carbLevel: null,
    },
    isRest ? {
      time: "7:00am",
      emoji: "🍳",
      label: "First Meal — Protein + Fat + Fiber",
      detail: "3-4 eggs + spinach in olive oil + avocado + Greek yogurt with chia and blueberries. No training carb load needed.",
      carbLevel: "low",
    } : {
      time: "7:00am",
      emoji: "🍳",
      label: "First Meal — Protein + Fat",
      detail: "3-4 eggs + spinach in olive oil + half avocado + Greek yogurt with chia and blueberries. Light on carbs — training in 2hrs.",
      carbLevel: "low",
    },
    ...(!isRest ? [{
      time: "8:15am",
      emoji: "🍌",
      label: "Pre-Training Fuel",
      detail: "Banana or 2 rice cakes. Fast carbs only. Small — just topping glycogen.",
      carbLevel: "moderate",
    }] : []),
    ...(!isRest ? [{
      time: "9:00am",
      emoji: "🏋️",
      label: "TRAIN",
      detail: null,
      isSession: true,
    }] : []),
    ...(!isRest ? [{
      time: "10:30am",
      emoji: "🍚",
      label: "Post-Training — Main Carb Meal",
      detail: "Whey isolate shake immediately. Then: white rice or sweet potato + chicken or beef + broccoli. Biggest carb meal of the day. Don't skip this window.",
      carbLevel: "high",
    }] : [{
      time: "10:00am",
      emoji: "🫐",
      label: "Mid-Morning Snack",
      detail: "Cottage cheese or Greek yogurt + walnuts + berries. No big carb hit on rest days.",
      carbLevel: "low",
    }]),
    {
      time: isRest ? "1:00pm" : "1:30pm",
      emoji: "🫙",
      label: "Lunch — Protein + Fiber",
      detail: isRest
        ? "Salmon or chicken + sweet potato (smaller portion) + vegetables. Modest carbs on rest days."
        : "Chicken or beef + black beans or lentils + broccoli. Lower carbs — training carbs already done.",
      carbLevel: isRest ? "moderate" : "low",
    },
    {
      time: "6:30pm",
      emoji: "🍜",
      label: "Dinner — Protein Dominant",
      detail: tomorrowHard
        ? "Salmon or chicken + vegetables + olive oil. Add small sweet potato tonight — tomorrow is a heavy session. Carb top-up."
        : tomorrowCardio
        ? "Salmon or chicken + white rice (moderate) + vegetables. Carb-load slightly for tomorrow's cardio."
        : "Salmon or chicken thighs + vegetables + olive oil. No rice. Triglyceride window — keep carbs out of dinner.",
      carbLevel: tomorrowHard || tomorrowCardio ? "moderate" : "none",
      note: tomorrowHard ? "⚡ TOMORROW IS HEAVY → small carb addition" : tomorrowCardio ? "⚡ TOMORROW IS CARDIO → moderate carbs" : null,
    },
    {
      time: "7:00-7:30pm",
      emoji: "🌙",
      label: "Window Closes",
      detail: "Water + herbal tea only. 10-12hr eating window. Fasted for morning peptides.",
      isClose: true,
    },
  ];

  return meals;
}

// ============ PEPTIDES ============
function getPeptideStack(phase) {
  const stacks = {
    rehab:       { label: "CUT", color: "text-blue-400",   list: [{ n: "Retatrutide", note: "Fat loss + appetite suppression" }, { n: "CJC-1295", note: "GHRH — GH pulse, take fasted" }, { n: "Ipamorelin", note: "GH secretagogue, clean" }, { n: "Tesamorelin", note: "Visceral fat reduction" }, { n: "MOTS-c", note: "Mitochondrial + exercise performance" }, { n: "SS-31", note: "Recovery + surgical healing" }] },
    early_build: { label: "CUT", color: "text-blue-400",   list: [{ n: "Retatrutide", note: "Fat loss + appetite" }, { n: "CJC-1295", note: "GHRH" }, { n: "Ipamorelin", note: "GH secretagogue" }, { n: "Tesamorelin", note: "Visceral fat" }, { n: "MOTS-c", note: "Performance" }, { n: "SS-31", note: "Recovery" }] },
    hyrox_build: { label: "CUT", color: "text-blue-400",   list: [{ n: "Retatrutide", note: "Fat loss" }, { n: "CJC-1295", note: "GHRH" }, { n: "Ipamorelin", note: "GH secretagogue" }, { n: "Tesamorelin", note: "Visceral fat" }, { n: "MOTS-c", note: "Performance" }] },
    taper:       { label: "MAINTAIN", color: "text-yellow-400", list: [{ n: "CJC-1295", note: "GHRH" }, { n: "Ipamorelin", note: "GH secretagogue" }, { n: "MOTS-c", note: "Performance" }, { n: "SS-31", note: "Recovery" }] },
    bulk:        { label: "BULK", color: "text-green-400", list: [{ n: "CJC-1295", note: "GHRH" }, { n: "GHRP-6", note: "GH + appetite drive (morning = no sleep disruption)" }, { n: "Tesamorelin", note: "Keep visceral fat in check" }, { n: "MOTS-c", note: "Mitochondrial" }] },
  };
  return stacks[phase?.id] || stacks.rehab;
}

// ============ STORAGE ============
function isoDate(d) { return d.toISOString().slice(0, 10); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

function loadEdit(dateStr) { try { return JSON.parse(localStorage.getItem(`protocol_sched_edit_${dateStr}`) || "null"); } catch { return null; } }
function saveEdit(dateStr, v) { try { localStorage.setItem(`protocol_sched_edit_${dateStr}`, JSON.stringify(v)); } catch {} }
function loadPeptides(dateStr) { try { return JSON.parse(localStorage.getItem(`protocol_peptides_${dateStr}`) || "{}"); } catch { return {}; } }
function savePeptides(dateStr, v) { try { localStorage.setItem(`protocol_peptides_${dateStr}`, JSON.stringify(v)); } catch {} }

// ============ HELPERS ============
const DOW = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const CARB_COLORS = { low: "bg-blue-400", moderate: "bg-yellow-400", high: "bg-orange-500", none: "bg-zinc-700" };

function getIconComponent(icon) {
  return { lift: Dumbbell, cardio: Activity, walk: Footprints, rest: Heart, physio: Wind, hyrox: Flame }[icon] || Activity;
}

function getDayData(date) {
  const dateStr = isoDate(date);
  const dow = date.getDay();
  const weekType = getWeekType(date);
  const schedule = WEEK_SCHEDULES[weekType][dow];
  const phase = getPhase(dateStr);
  const edit = loadEdit(dateStr);
  const effectiveType = edit?.type || schedule.type;
  const effectiveShort = edit?.short !== undefined ? edit.short : schedule.short;
  return { dateStr, dow, weekType, schedule, phase, edit, effectiveType, effectiveShort };
}

// ============ SUBCOMPONENTS ============

function SectionLabel({ children }) {
  return (
    <div className="text-xs text-zinc-500 uppercase mb-3 mt-5" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
      {children}
    </div>
  );
}

function CarbBadge({ level }) {
  if (!level || level === "none") return null;
  const labels = { low: "LOW CARB", moderate: "MOD CARB", high: "HIGH CARB" };
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${CARB_COLORS[level]} text-zinc-950`} style={{ fontFamily: FF_MONO, fontSize: "0.6rem" }}>
      {labels[level]}
    </span>
  );
}

function WeekStrip({ today, selectedDate, onSelect }) {
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

  return (
    <div className="grid grid-cols-7 gap-1 mb-4">
      {Array.from({ length: 7 }, (_, i) => {
        const d = addDays(startOfWeek, i);
        const ds = isoDate(d);
        const isToday = ds === isoDate(today);
        const isSelected = ds === isoDate(selectedDate);
        const { schedule, phase, effectiveType } = getDayData(d);
        const isRest = ["rest", "active_recovery"].includes(effectiveType);
        const Icon = getIconComponent(getSessionContent(effectiveType, phase, schedule.short).icon);
        return (
          <button key={ds} onClick={() => onSelect(d)}
            className={`flex flex-col items-center py-2 px-1 rounded border transition-colors ${
              isSelected ? "border-orange-500 bg-orange-500/10" :
              isToday ? "border-orange-500/40" : "border-zinc-800"
            }`}>
            <div className="text-xs text-zinc-500 mb-1" style={{ fontFamily: FF_MONO, fontSize: "0.6rem" }}>{DOW[i]}</div>
            <div className={`text-sm mb-1 ${isToday ? "text-orange-500" : "text-zinc-100"}`} style={{ fontFamily: FF_HEAD }}>{d.getDate()}</div>
            <Icon className={`w-3 h-3 ${isRest ? "text-zinc-600" : isSelected || isToday ? "text-orange-500" : "text-zinc-400"}`} />
          </button>
        );
      })}
    </div>
  );
}

function SessionCard({ date, expanded = true }) {
  const { dateStr, weekType, schedule, phase, edit, effectiveType, effectiveShort } = getDayData(date);
  const session = getSessionContent(effectiveType, phase, effectiveShort);
  const Icon = getIconComponent(session.icon);
  const isRest = ["rest", "active_recovery", "walk_physio"].includes(effectiveType);

  return (
    <div className={`border rounded p-4 ${phase?.accent || "border-zinc-800"}`}>
      <div className="flex items-start gap-3 mb-3">
        <Icon className={`w-7 h-7 flex-shrink-0 ${isRest ? "text-zinc-500" : "text-orange-500"}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <div className="text-2xl text-zinc-100" style={{ fontFamily: FF_HEAD, letterSpacing: "0.03em" }}>{session.title}</div>
            {schedule.boys && <span className="text-xs text-zinc-500 border border-zinc-700 px-1.5 py-0.5 rounded" style={{ fontFamily: FF_MONO }}>BOYS</span>}
            {effectiveShort && !isRest && <span className="text-xs text-zinc-500 border border-zinc-700 px-1.5 py-0.5 rounded" style={{ fontFamily: FF_MONO }}>SHORT</span>}
            {edit && <span className="text-xs text-orange-500/60 border border-orange-500/30 px-1.5 py-0.5 rounded" style={{ fontFamily: FF_MONO }}>EDITED</span>}
          </div>
          <div className="text-xs text-zinc-500" style={{ fontFamily: FF_MONO }}>{session.subtitle} · {session.duration}</div>
        </div>
      </div>

      {session.walk && (
        <div className="flex items-center gap-2 mb-3 text-sm text-zinc-400 border border-zinc-800 rounded px-3 py-2">
          <Footprints className="w-4 h-4 text-zinc-500" />
          <span style={{ fontFamily: FF_MONO, fontSize: "0.75rem" }}>MORNING WALK 30-45MIN FIRST — ALWAYS</span>
        </div>
      )}

      {expanded && session.exercises.length > 0 && (
        <div className="border-t border-zinc-800 pt-3 mt-3 space-y-2">
          {session.exercises.map((ex, i) => (
            <div key={i} className={`text-sm flex items-start gap-2 ${ex.startsWith("—") ? "text-zinc-600 text-xs" : "text-zinc-300"}`}>
              {!ex.startsWith("—") && <span className="text-orange-500 flex-shrink-0" style={{ fontFamily: FF_MONO, fontSize: "0.7rem" }}>{String(i + 1).padStart(2, "0")}</span>}
              <span>{ex}</span>
            </div>
          ))}
        </div>
      )}

      {edit?.note && (
        <div className="border-t border-zinc-800 pt-3 mt-3 text-sm text-zinc-400 italic">
          Note: {edit.note}
        </div>
      )}
    </div>
  );
}

function EditModal({ date, onClose }) {
  const { dateStr, schedule, phase, effectiveType, effectiveShort, edit } = getDayData(date);
  const [type, setType] = useState(effectiveType);
  const [short, setShort] = useState(effectiveShort);
  const [note, setNote] = useState(edit?.note || "");

  const handleSave = () => {
    saveEdit(dateStr, { type, short, note: note.trim() || null });
    onClose(true);
  };

  const handleReset = () => {
    localStorage.removeItem(`protocol_sched_edit_${dateStr}`);
    onClose(true);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/90 z-50 flex items-end" onClick={onClose}>
      <div className="w-full max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-t-xl p-5"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl text-zinc-100" style={{ fontFamily: FF_HEAD }}>EDIT SESSION</div>
          <button onClick={onClose} className="text-zinc-500"><X className="w-5 h-5" /></button>
        </div>

        <div className="mb-4">
          <div className="text-xs text-zinc-500 uppercase mb-2" style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}>Session Type</div>
          <div className="grid grid-cols-3 gap-2">
            {SESSION_TYPES.map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`py-2 px-2 rounded border text-xs transition-colors text-center ${type === t ? "border-orange-500 bg-orange-500/10 text-orange-500" : "border-zinc-700 text-zinc-400"}`}
                style={{ fontFamily: FF_MONO }}>
                {t.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setShort(!short)}
            className={`flex items-center gap-2 px-3 py-2 rounded border text-sm transition-colors ${short ? "border-orange-500 bg-orange-500/10 text-orange-500" : "border-zinc-700 text-zinc-400"}`}
            style={{ fontFamily: FF_MONO }}>
            {short ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 border border-zinc-600 rounded" />}
            SHORT SESSION
          </button>
        </div>

        <div className="mb-5">
          <div className="text-xs text-zinc-500 uppercase mb-2" style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}>Note (optional)</div>
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. shoulder tight, went lighter"
            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-orange-500"
            style={{ fontFamily: FF_MONO }}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave}
            className="flex-1 py-3 bg-orange-500 text-zinc-950 rounded font-bold"
            style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}>
            SAVE
          </button>
          {edit && (
            <button onClick={handleReset}
              className="px-4 py-3 border border-zinc-700 text-zinc-400 rounded text-sm"
              style={{ fontFamily: FF_MONO }}>
              RESET
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PeptideChecklist({ dateStr, phase }) {
  const stack = getPeptideStack(phase);
  const [checked, setChecked] = useState(loadPeptides(dateStr));

  const toggle = (name) => {
    const next = { ...checked, [name]: !checked[name] };
    setChecked(next);
    savePeptides(dateStr, next);
  };

  const doneCount = stack.list.filter(p => checked[p.n]).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Peptides — Morning Fasted</SectionLabel>
        <div className={`text-xs px-2 py-1 rounded border ${stack.color} border-current`} style={{ fontFamily: FF_MONO }}>
          {stack.label} · {doneCount}/{stack.list.length}
        </div>
      </div>
      <div className="space-y-2">
        {stack.list.map(({ n, note }) => (
          <button key={n} onClick={() => toggle(n)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded border transition-colors text-left ${checked[n] ? "border-orange-500/40 bg-orange-500/5" : "border-zinc-800"}`}>
            <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${checked[n] ? "border-orange-500 bg-orange-500" : "border-zinc-600"}`}>
              {checked[n] && <Check className="w-3 h-3 text-zinc-950" />}
            </div>
            <div>
              <div className="text-sm text-zinc-100" style={{ fontFamily: FF_MONO }}>{n}</div>
              <div className="text-xs text-zinc-500">{note}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="text-xs text-zinc-600 mt-2" style={{ fontFamily: FF_MONO }}>
        All morning fasted · Confirm dosing with your doctor
      </div>
    </div>
  );
}

function FoodTimingCard({ dayData, tomorrowData, phase }) {
  const meals = getFoodTiming(dayData?.schedule, tomorrowData?.schedule, phase);
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-zinc-800 rounded overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <Apple className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-zinc-100" style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}>FOOD TIMING</span>
          {tomorrowData?.schedule && <span className="text-xs text-zinc-500" style={{ fontFamily: FF_MONO }}>· tomorrow: {tomorrowData.schedule.label}</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 space-y-3">
          {meals.map((meal, i) => (
            <div key={i} className={`${meal.isSession ? "opacity-60" : ""} ${meal.isClose ? "opacity-60" : ""}`}>
              {meal.isSession ? (
                <div className="flex items-center gap-2 py-1">
                  <div className="w-12 text-orange-500 text-xs flex-shrink-0" style={{ fontFamily: FF_MONO }}>{meal.time}</div>
                  <div className="h-px flex-1 bg-orange-500/30" />
                  <Flame className="w-4 h-4 text-orange-500" />
                  <div className="h-px flex-1 bg-orange-500/30" />
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-12 text-xs text-zinc-500 flex-shrink-0 pt-0.5" style={{ fontFamily: FF_MONO }}>{meal.time}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm text-zinc-100">{meal.emoji} {meal.label}</span>
                      {meal.carbLevel && meal.carbLevel !== "none" && <CarbBadge level={meal.carbLevel} />}
                    </div>
                    {meal.detail && <div className="text-xs text-zinc-400">{meal.detail}</div>}
                    {meal.note && (
                      <div className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{meal.note}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function ScheduleTab() {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [editOpen, setEditOpen] = useState(false);
  const [tomorrowOpen, setTomorrowOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  const isToday = isoDate(selectedDate) === isoDate(today);
  const tomorrow = addDays(selectedDate, 1);
  const dayData = getDayData(selectedDate);
  const tomorrowData = getDayData(tomorrow);
  const { dateStr, weekType, phase, schedule } = dayData;
  const peptideDate = isoDate(today);

  const handleEditClose = (changed) => {
    setEditOpen(false);
    if (changed) forceUpdate(n => n + 1);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24" style={{ fontFamily: FF_BODY }}>
      <div className="max-w-2xl mx-auto px-4 pt-6">

        {/* HEADER */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs text-zinc-500 uppercase mb-1" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
              Schedule · Week {weekType}
            </div>
            <div className="text-4xl text-orange-500" style={{ fontFamily: FF_HEAD, letterSpacing: "0.05em" }}>
              {isToday ? "TODAY" : selectedDate.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()}
            </div>
            <div className="text-sm text-zinc-500 mt-1" style={{ fontFamily: FF_MONO }}>
              {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </div>
          </div>
          <div className={`px-3 py-1 rounded border text-sm ${phase?.color} border-current`} style={{ fontFamily: FF_HEAD, letterSpacing: "0.05em" }}>
            {phase?.label}
          </div>
        </div>

        {/* WEEK STRIP */}
        <WeekStrip today={today} selectedDate={selectedDate} onSelect={setSelectedDate} />

        {/* WEEK NAVIGATION */}
        {(() => {
          const canGoNext = addDays(selectedDate, 7) <= addDays(today, 14);
          return (
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300" style={{ fontFamily: FF_MONO }}>
                <ChevronLeft className="w-4 h-4" /> PREV WEEK
              </button>
              {!isToday && (
                <button onClick={() => setSelectedDate(today)}
                  className="text-xs text-orange-500 border border-orange-500/40 px-3 py-1 rounded" style={{ fontFamily: FF_MONO }}>
                  TODAY
                </button>
              )}
              <button
                onClick={() => canGoNext && setSelectedDate(addDays(selectedDate, 7))}
                disabled={!canGoNext}
                className={`flex items-center gap-1 text-xs ${canGoNext ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-700 cursor-not-allowed"}`}
                style={{ fontFamily: FF_MONO }}>
                NEXT WEEK <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })()}

        {/* TODAY/SELECTED SESSION */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>{isToday ? "Today's Session" : `${DOW[selectedDate.getDay()]} Session`}</SectionLabel>
            <button onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 text-xs text-zinc-500 border border-zinc-700 rounded px-2 py-1 hover:border-zinc-500"
              style={{ fontFamily: FF_MONO }}>
              <Edit2 className="w-3 h-3" /> EDIT
            </button>
          </div>
          <SessionCard date={selectedDate} expanded={true} />
        </div>

        {/* TOMORROW PREVIEW */}
        <div className="mb-5 mt-5">
          <button onClick={() => setTomorrowOpen(!tomorrowOpen)}
            className="w-full flex items-center justify-between mb-3">
            <SectionLabel>Tomorrow — {DOW[tomorrow.getDay()]}</SectionLabel>
            {tomorrowOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
          </button>
          {tomorrowOpen ? (
            <SessionCard date={tomorrow} expanded={true} />
          ) : (
            <button onClick={() => setTomorrowOpen(true)}
              className="w-full border border-zinc-800 rounded px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => { const d = getDayData(tomorrow); const s = getSessionContent(d.effectiveType, d.phase, d.effectiveShort); const Icon = getIconComponent(s.icon); return <Icon className="w-5 h-5 text-zinc-500" />; })()}
                <div>
                  <div className="text-sm text-zinc-300" style={{ fontFamily: FF_HEAD, letterSpacing: "0.03em" }}>
                    {getSessionContent(tomorrowData.effectiveType, tomorrowData.phase, tomorrowData.effectiveShort).title}
                  </div>
                  <div className="text-xs text-zinc-500" style={{ fontFamily: FF_MONO }}>
                    {getSessionContent(tomorrowData.effectiveType, tomorrowData.phase, tomorrowData.effectiveShort).duration}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            </button>
          )}
        </div>

        {/* FOOD TIMING */}
        <div className="mb-5">
          <FoodTimingCard dayData={dayData} tomorrowData={tomorrowData} phase={phase} />
        </div>


      </div>

      {editOpen && (
        <EditModal date={selectedDate} onClose={handleEditClose} />
      )}
    </div>
  );
}

export { getDayData, getSessionContent };
