import { useState, useEffect, useMemo } from "react";
import {
  Sun, Coffee, Moon, Zap, Brain, Wind, Clock,
  Check, ChevronRight, Flame, TrendingUp, X,
  Heart, Droplets, Apple
} from "lucide-react";

// ============ STYLE TOKENS (match Protocol) ============
const FF_HEAD = "'Bebas Neue', 'Impact', sans-serif";
const FF_MONO = "'JetBrains Mono', ui-monospace, monospace";
const FF_BODY = "'IBM Plex Sans', system-ui, sans-serif";

// ============ STORAGE ============
const KEY_PREFIX = "protocol_checkin_";
const KEY_STREAK = "protocol_checkin_streak";

function todayKey() {
  return KEY_PREFIX + new Date().toISOString().slice(0, 10);
}

function loadToday() {
  try {
    const raw = localStorage.getItem(todayKey());
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveToday(data) {
  try {
    localStorage.setItem(todayKey(), JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
    updateStreak();
  } catch {}
}

function updateStreak() {
  try {
    const streak = JSON.parse(localStorage.getItem(KEY_STREAK) || '{"count":0,"last":""}');
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (streak.last === today) return;
    const newStreak = {
      count: streak.last === yesterday ? streak.count + 1 : 1,
      last: today,
    };
    localStorage.setItem(KEY_STREAK, JSON.stringify(newStreak));
  } catch {}
}

function loadStreak() {
  try {
    return JSON.parse(localStorage.getItem(KEY_STREAK) || '{"count":0,"last":""}');
  } catch { return { count: 0, last: "" }; }
}

function loadHistory(days = 28) {
  const results = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    try {
      const raw = localStorage.getItem(KEY_PREFIX + d);
      if (raw) results.push({ date: d, ...JSON.parse(raw) });
    } catch {}
  }
  return results.reverse();
}

// ============ DEFAULTS ============
const DEFAULT_STATE = {
  sleepHours: null,
  sleepQuality: null,
  sunlight: false,
  caffeineDelayed: false,
  readiness: null,
  meditation: false,
  nsdr: false,
  fastingStart: null,
  nutritionMorningProtein: false,
  nutritionCarbsFrontLoaded: false,
  nutritionDinnerLight: false,
};

// ============ READINESS LABEL ============
function readinessLabel(r) {
  if (r <= 3) return { label: "RECOVER", color: "text-red-400" };
  if (r <= 5) return { label: "EASY", color: "text-yellow-400" };
  if (r <= 7) return { label: "MODERATE", color: "text-blue-400" };
  return { label: "GO HARD", color: "text-orange-500" };
}

// ============ SUBCOMPONENTS ============

function SectionLabel({ children }) {
  return (
    <div className="text-xs text-zinc-500 uppercase mb-3 mt-5"
      style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
      {children}
    </div>
  );
}

function ToggleRow({ icon: Icon, label, sublabel, value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded border transition-colors mb-2 ${
        value ? "border-orange-500/40 bg-orange-500/5" : "border-zinc-800 bg-zinc-900/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${value ? "text-orange-500" : "text-zinc-500"}`} />
        <div className="text-left">
          <div className="text-sm text-zinc-100" style={{ fontFamily: FF_BODY }}>{label}</div>
          {sublabel && <div className="text-xs text-zinc-500" style={{ fontFamily: FF_MONO }}>{sublabel}</div>}
        </div>
      </div>
      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
        value ? "border-orange-500 bg-orange-500" : "border-zinc-700"
      }`}>
        {value && <Check className="w-3 h-3 text-zinc-950" />}
      </div>
    </button>
  );
}

function NumberPicker({ label, value, onChange, min, max, step = 0.5, unit = "" }) {
  const options = [];
  for (let v = min; v <= max; v += step) options.push(Math.round(v * 10) / 10);

  return (
    <div className="mb-4">
      <div className="text-xs text-zinc-500 uppercase mb-2" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
        {label}
      </div>
      <div className="flex gap-2 flex-wrap">
        {options.map(o => (
          <button
            key={o}
            onClick={() => onChange(value === o ? null : o)}
            className={`px-3 py-2 rounded border text-sm transition-colors ${
              value === o
                ? "border-orange-500 bg-orange-500/10 text-orange-500"
                : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
            }`}
            style={{ fontFamily: FF_MONO }}
          >
            {o}{unit}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReadinessPicker({ value, onChange }) {
  const scores = [1,2,3,4,5,6,7,8,9,10];
  const rl = value ? readinessLabel(value) : null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-zinc-500 uppercase" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
          Readiness
        </div>
        {rl && (
          <div className={`text-sm ${rl.color}`} style={{ fontFamily: FF_HEAD, letterSpacing: "0.05em" }}>
            {rl.label}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        {scores.map(s => (
          <button
            key={s}
            onClick={() => onChange(value === s ? null : s)}
            className={`flex-1 py-2 rounded border text-sm transition-colors ${
              value === s
                ? "border-orange-500 bg-orange-500/10 text-orange-500"
                : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
            }`}
            style={{ fontFamily: FF_MONO }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function FastingTimer({ fastingStart, onStart, onEnd }) {
  const [elapsed, setElapsed] = useState(null);

  useEffect(() => {
    if (!fastingStart) { setElapsed(null); return; }
    const tick = () => {
      const diff = Date.now() - new Date(fastingStart).getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setElapsed(`${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [fastingStart]);

  return (
    <div className={`border rounded p-4 mb-2 ${fastingStart ? "border-orange-500/40 bg-orange-500/5" : "border-zinc-800"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className={`w-5 h-5 ${fastingStart ? "text-orange-500" : "text-zinc-500"}`} />
          <div>
            <div className="text-sm text-zinc-100" style={{ fontFamily: FF_BODY }}>
              Eating Window
            </div>
            {fastingStart ? (
              <div className="text-xs text-orange-500" style={{ fontFamily: FF_MONO }}>
                OPEN · {elapsed}
              </div>
            ) : (
              <div className="text-xs text-zinc-500" style={{ fontFamily: FF_MONO }}>
                TAP TO START
              </div>
            )}
          </div>
        </div>
        {fastingStart ? (
          <button
            onClick={onEnd}
            className="px-3 py-1.5 rounded border border-zinc-700 text-xs text-zinc-400 hover:border-zinc-500"
            style={{ fontFamily: FF_MONO }}
          >
            CLOSE WINDOW
          </button>
        ) : (
          <button
            onClick={onStart}
            className="px-3 py-1.5 rounded border border-orange-500/40 bg-orange-500/10 text-orange-500 text-xs"
            style={{ fontFamily: FF_MONO }}
          >
            START
          </button>
        )}
      </div>
      {fastingStart && (
        <div className="mt-3 text-xs text-zinc-500" style={{ fontFamily: FF_MONO }}>
          Started {new Date(fastingStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {" · "}Target close ~{new Date(new Date(fastingStart).getTime() + 10 * 3600000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      )}
    </div>
  );
}

// ============ SUMMARY CARD ============
function DaySummary({ data, streak }) {
  const rl = data.readiness ? readinessLabel(data.readiness) : null;
  const habits = [
    data.sunlight, data.caffeineDelayed, data.meditation,
    data.nsdr, data.nutritionMorningProtein,
    data.nutritionCarbsFrontLoaded, data.nutritionDinnerLight,
  ].filter(Boolean).length;
  const totalHabits = 7;

  return (
    <div className="border border-zinc-800 rounded p-5 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs text-zinc-500 uppercase" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
            Today's Check-In
          </div>
          <div className="text-4xl text-orange-500 mt-1" style={{ fontFamily: FF_HEAD, letterSpacing: "0.05em" }}>
            {rl ? rl.label : "LOGGED"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-500" style={{ fontFamily: FF_MONO }}>STREAK</div>
          <div className="text-2xl text-zinc-200" style={{ fontFamily: FF_HEAD }}>
            {streak.count}d
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="border border-zinc-800 rounded p-3 text-center">
          <Moon className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
          <div className="text-xl text-zinc-100" style={{ fontFamily: FF_HEAD }}>
            {data.sleepHours ?? "—"}
          </div>
          <div className="text-xs text-zinc-500" style={{ fontFamily: FF_MONO }}>HRS</div>
        </div>
        <div className="border border-zinc-800 rounded p-3 text-center">
          <Zap className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
          <div className="text-xl text-zinc-100" style={{ fontFamily: FF_HEAD }}>
            {data.readiness ?? "—"}
          </div>
          <div className="text-xs text-zinc-500" style={{ fontFamily: FF_MONO }}>READINESS</div>
        </div>
        <div className="border border-zinc-800 rounded p-3 text-center">
          <Check className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
          <div className="text-xl text-zinc-100" style={{ fontFamily: FF_HEAD }}>
            {habits}/{totalHabits}
          </div>
          <div className="text-xs text-zinc-500" style={{ fontFamily: FF_MONO }}>HABITS</div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: "sunlight", label: "SUN", icon: Sun },
          { key: "caffeineDelayed", label: "CAFF", icon: Coffee },
          { key: "meditation", label: "MED", icon: Brain },
          { key: "nsdr", label: "NSDR", icon: Wind },
          { key: "nutritionMorningProtein", label: "PROTEIN", icon: Flame },
          { key: "nutritionCarbsFrontLoaded", label: "CARBS", icon: Apple },
          { key: "nutritionDinnerLight", label: "DINNER", icon: Moon },
        ].map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-xs ${
              data[key]
                ? "border-orange-500/40 bg-orange-500/5 text-orange-500"
                : "border-zinc-800 text-zinc-600"
            }`}
            style={{ fontFamily: FF_MONO }}
          >
            <Icon className="w-3 h-3" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function MorningCheckIn({ readinessCallback }) {
  const [state, setState] = useState(() => loadToday() || { ...DEFAULT_STATE });
  const [saved, setSaved] = useState(!!loadToday());
  const [editing, setEditing] = useState(!loadToday());
  const [streak, setStreak] = useState(loadStreak());

  const set = (key, val) => setState(s => ({ ...s, [key]: val }));

  const handleSave = () => {
    saveToday(state);
    setSaved(true);
    setEditing(false);
    setStreak(loadStreak());
    if (readinessCallback && state.readiness) {
      readinessCallback(state.readiness);
    }
  };

  const isComplete = state.sleepHours !== null && state.readiness !== null;

  if (!editing && saved) {
    return (
      <div className="px-4 pt-6" style={{ fontFamily: FF_BODY }}>
        <DaySummary data={state} streak={streak} />
        <button
          onClick={() => setEditing(true)}
          className="w-full py-3 border border-zinc-800 rounded text-sm text-zinc-500 hover:border-zinc-600 transition-colors"
          style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
        >
          EDIT CHECK-IN
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-8" style={{ fontFamily: FF_BODY }}>

      {/* HEADER */}
      <div className="mb-6">
        <div className="text-xs text-zinc-500 uppercase mb-1" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
        <div className="text-4xl text-zinc-100" style={{ fontFamily: FF_HEAD, letterSpacing: "0.05em" }}>
          MORNING CHECK-IN
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-zinc-400" style={{ fontFamily: FF_MONO }}>
            {streak.count} day streak
          </span>
        </div>
      </div>

      {/* SLEEP */}
      <SectionLabel>Sleep</SectionLabel>
      <NumberPicker
        label="Hours slept"
        value={state.sleepHours}
        onChange={v => set("sleepHours", v)}
        min={4} max={10} step={0.5} unit="h"
      />
      <NumberPicker
        label="Sleep quality"
        value={state.sleepQuality}
        onChange={v => set("sleepQuality", v)}
        min={1} max={5} step={1}
      />

      {/* READINESS */}
      <SectionLabel>Readiness</SectionLabel>
      <ReadinessPicker value={state.readiness} onChange={v => set("readiness", v)} />

      {/* MORNING HABITS */}
      <SectionLabel>Morning Habits</SectionLabel>
      <ToggleRow
        icon={Sun}
        label="Morning sunlight"
        sublabel="Within 30-60 min of waking"
        value={state.sunlight}
        onChange={v => set("sunlight", v)}
      />
      <ToggleRow
        icon={Coffee}
        label="Caffeine delayed 90min"
        sublabel="Let adenosine clear first"
        value={state.caffeineDelayed}
        onChange={v => set("caffeineDelayed", v)}
      />

      {/* MINDSET */}
      <SectionLabel>Mindset</SectionLabel>
      <ToggleRow
        icon={Brain}
        label="Meditation"
        sublabel="10+ min breath focus"
        value={state.meditation}
        onChange={v => set("meditation", v)}
      />
      <ToggleRow
        icon={Wind}
        label="NSDR / Yoga Nidra"
        sublabel="10-20 min non-sleep deep rest"
        value={state.nsdr}
        onChange={v => set("nsdr", v)}
      />

      {/* EATING WINDOW */}
      <SectionLabel>Eating Window</SectionLabel>
      <FastingTimer
        fastingStart={state.fastingStart}
        onStart={() => set("fastingStart", new Date().toISOString())}
        onEnd={() => set("fastingStart", state.fastingStart)}
      />

      {/* NUTRITION */}
      <SectionLabel>Nutrition Template</SectionLabel>
      <ToggleRow
        icon={Flame}
        label="Morning protein + fiber"
        sublabel="40-50g protein, high fiber"
        value={state.nutritionMorningProtein}
        onChange={v => set("nutritionMorningProtein", v)}
      />
      <ToggleRow
        icon={Apple}
        label="Carbs front-loaded"
        sublabel="Around training, tapered through day"
        value={state.nutritionCarbsFrontLoaded}
        onChange={v => set("nutritionCarbsFrontLoaded", v)}
      />
      <ToggleRow
        icon={Moon}
        label="Dinner light"
        sublabel="Lower carbs, protein maintenance"
        value={state.nutritionDinnerLight}
        onChange={v => set("nutritionDinnerLight", v)}
      />

      {/* SAVE */}
      <div className="mt-8">
        <button
          onClick={handleSave}
          disabled={!isComplete}
          className={`w-full py-4 rounded font-bold transition-colors ${
            isComplete
              ? "bg-orange-500 text-zinc-950 hover:bg-orange-400"
              : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
          }`}
          style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
        >
          {isComplete ? "SAVE CHECK-IN" : "ADD SLEEP + READINESS TO SAVE"}
        </button>
        {!isComplete && (
          <div className="text-xs text-zinc-600 text-center mt-2" style={{ fontFamily: FF_MONO }}>
            Sleep hours and readiness are required
          </div>
        )}
      </div>

    </div>
  );
}

// ============ READINESS EXPORT (for AI generation hook) ============
export function getTodayReadiness() {
  const data = loadToday();
  return data?.readiness ?? null;
}

export function getCheckInHistory(days = 28) {
  return loadHistory(days);
}
