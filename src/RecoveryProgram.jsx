import { useMemo, useState, useEffect } from "react";
import {
  Calendar, AlertCircle, Check, ChevronRight, ChevronLeft,
  Footprints, Bike, Dumbbell, Activity, Trophy, Heart,
  ArrowRight, Info, X
} from "lucide-react";

// ============ STYLE TOKENS (match existing app) ============
const FF_HEAD = "'Bebas Neue', 'Impact', sans-serif";
const FF_MONO = "'JetBrains Mono', ui-monospace, monospace";
const FF_BODY = "'IBM Plex Sans', system-ui, sans-serif";

// ============ PROGRAM DATA ============
const PROGRAM = {
  name: "Post-Op AC -> Hyrox Doubles",
  startDate: "2026-05-15", // Surgery date
  raceDate: "2026-10-01",
  phases: [
    {
      id: 1,
      name: "SLING",
      subtitle: "Protect & Preserve",
      weeks: [1, 2, 3, 4],
      shoulder: "Sling on. No movement.",
      avoid: ["Anything jostling the shoulder", "Treadmill running", "Arms in core work", "Lifting > coffee cup with surgical side"],
      sessions: {
        1: { type: "walk", title: "Easy Walk", duration: "60-75min", detail: "Conversational pace", icon: "walk" },
        2: { type: "bike", title: "Z2 Bike", duration: "45min", detail: "Upright/recumbent only. Don't lean on bars.", icon: "bike" },
        3: { type: "walk_bw", title: "Walk + BW Lower", duration: "75min", detail: "60min walk + lower bodyweight circuit", icon: "walk", exercises: [
          "BW squats - 3 x 15",
          "Wall sits - 3 x 30s",
          "Single-leg balance - 3 x 30s/side",
          "Standing hip abduction - 3 x 12/side",
          "Standing calf raises - 3 x 20",
          "Glute bridges (arms at sides) - 3 x 15",
        ] },
        4: { type: "bike", title: "Z2 Bike", duration: "45min", detail: "Upright/recumbent only.", icon: "bike" },
        5: { type: "walk", title: "Easy Walk", duration: "75min", detail: "Conversational pace", icon: "walk" },
        6: { type: "bike", title: "Z2 Bike", duration: "60min", detail: "Long Z2.", icon: "bike" },
        0: { type: "rest", title: "Rest", duration: "-", detail: "Recovery day. Optional gentle walk.", icon: "rest" },
      },
    },
    {
      id: 2,
      name: "REBUILD",
      subtitle: "Reintroduce Running",
      weeks: [5, 6, 7, 8],
      shoulder: "Sling off. Physio leads. NO upper loading.",
      avoid: ["Upper body loading (physio-only)", "Carrying anything surgical side", "Sleeping on surgical side"],
      sessions: {
        1: { type: "lift", title: "Lower Strength A", duration: "45-60min", detail: "Lower body, no shoulder load", icon: "lift", exercises: [
          "Leg press - 4 x 10",
          "Bulgarian split squat (DBs at sides, non-surgical only) - 3 x 10/leg",
          "RDL with DBs at sides - 3 x 10",
          "Single-leg glute bridge - 3 x 12/leg",
          "Standing calf raises - 3 x 15",
          "Dead bug (no arms) - 3 x 10/side",
        ] },
        2: { type: "run", title: "Easy Run", duration: "20-30min", detail: "Z2. See weekly progression in phase notes.", icon: "run" },
        3: { type: "bike_intervals", title: "Bike Intervals", duration: "40min", detail: "5 x 3min moderate / 2min easy", icon: "bike" },
        4: { type: "physio_walk", title: "Physio + Walk", duration: "45min walk", detail: "Physio session + 45min easy walk", icon: "walk" },
        5: { type: "lift", title: "Lower Strength B", duration: "45-60min", detail: "Lower body + light carries", icon: "lift", exercises: [
          "Hack squat OR leg press - 4 x 10",
          "Hip thrust (pad shoulders) - 3 x 10",
          "Step-ups (non-surgical hand DB) - 3 x 10/leg",
          "Hamstring curl - 3 x 12",
          "Suitcase carry (non-surgical only) - 4 x 30m",
          "Pallof press (light, non-surgical) - 3 x 10",
        ] },
        6: { type: "run", title: "Easy Run", duration: "30-40min", detail: "Z2 conversational", icon: "run" },
        0: { type: "rest", title: "Rest", duration: "-", detail: "Recovery day.", icon: "rest" },
      },
      runProgression: {
        5: "Walk 5 / Jog 2 x 4 (~30min)",
        6: "Walk 3 / Jog 5 x 4 (~35min)",
        7: "Walk 2 / Jog 8 x 3 (~35min)",
        8: "Continuous easy 25-30min",
      },
    },
    {
      id: 3,
      name: "STRENGTHEN",
      subtitle: "Light Loading Begins",
      weeks: [9, 10, 11, 12],
      shoulder: "Light strengthening per physio. Their list only - nothing extra.",
      avoid: ["Wall balls", "SkiErg", "Sled pull", "Sandbag carries", "Burpee broad jumps (yet)"],
      sessions: {
        1: { type: "lift", title: "Lower (Heavier) + Cleared Upper", duration: "60min", detail: "Lower near full capacity + physio-prescribed upper only", icon: "lift" },
        2: { type: "run", title: "Run Intervals", duration: "45min", detail: "6 x 600m moderate / 90s rest", icon: "run" },
        3: { type: "bike_core", title: "Z2 Bike + Core", duration: "60min", detail: "60min Z2 bike + core circuit", icon: "bike" },
        4: { type: "run", title: "Easy Run", duration: "30-40min", detail: "Z2", icon: "run" },
        5: { type: "lift", title: "Lower Strength + Carries", duration: "60min", detail: "Bilateral carries if cleared, short distance", icon: "lift" },
        6: { type: "run", title: "Long Z2 Run", duration: "45-60min", detail: "Build to 60min by W12", icon: "run" },
        0: { type: "rest", title: "Rest", duration: "-", detail: "Recovery day.", icon: "rest" },
      },
      stations: {
        intro: "Begin practicing (light, only if shoulder cleared):",
        list: [
          "W11+: Sled push, HIGH handles, light weight",
          "W12: Rowing - technique only, light pull",
          "W12: Burpee step-back (NO jump, NO push-up)",
        ],
      },
    },
    {
      id: 4,
      name: "BUILD",
      subtitle: "Hyrox-Specific Work",
      weeks: [13, 14, 15, 16, 17],
      shoulder: "Loading. Physio still active.",
      doublesNote: "Lock in station split with partner. You take legs-dominant; partner takes overhead.",
      sessions: {
        1: { type: "lift", title: "Strength", duration: "60min", detail: "Full lower + physio-cleared upper", icon: "lift" },
        2: { type: "run_station", title: "Compromised Running", duration: "45min", detail: "4 x (800m race pace + station)", icon: "run" },
        3: { type: "station_skill", title: "Station Skill Day", duration: "45min", detail: "Technique on stations, sub-race pace", icon: "lift" },
        4: { type: "run", title: "Easy Run", duration: "45-50min", detail: "Z2", icon: "run" },
        5: { type: "lift_power", title: "Strength + Power", duration: "60min", detail: "Broad jumps, KB work as cleared", icon: "lift" },
        6: { type: "run", title: "Long Z2 Run", duration: "60-75min", detail: "Conversational", icon: "run" },
        0: { type: "rest", title: "Rest", duration: "-", detail: "Recovery.", icon: "rest" },
      },
      stationSplit: {
        you: ["Sled push", "Rowing", "Burpee broad jumps (if cleared)", "Running"],
        partner: ["Wall balls", "SkiErg", "Sandbag lunges", "Sled pull"],
        gameTime: ["Farmers carry"],
      },
    },
    {
      id: 5,
      name: "RACE",
      subtitle: "Sharpen & Taper",
      weeks: [18, 19, 20],
      shoulder: "Manage load. No new stimuli.",
      sessions: {
        1: { type: "lift", title: "Strength (light)", duration: "30min", detail: "Maintenance only", icon: "lift" },
        2: { type: "run", title: "Run Intervals", duration: "40min", detail: "Race-pace work", icon: "run" },
        3: { type: "sim", title: "Race Sim / Skill", duration: "60min", detail: "W18: Half-Hyrox sim. W19: 30min station practice. W20: light handoffs.", icon: "lift" },
        4: { type: "run", title: "Easy Run", duration: "30-40min", detail: "Z2", icon: "run" },
        5: { type: "lift", title: "Light Strength / Mobility", duration: "30min", detail: "Movement quality", icon: "lift" },
        6: { type: "run", title: "Long Run w/ Tempo", duration: "60min", detail: "W18: last 20min tempo. W19: 20min + strides. W20: 15min shakeout.", icon: "run" },
        0: { type: "rest", title: "Rest", duration: "-", detail: "Recovery.", icon: "rest" },
      },
      raceWeek: "Week 20 = race week. Sat or Sun = RACE DAY.",
    },
  ],
  checkpoints: [
    { week: 4, title: "Post-op visit", detail: "Confirm sling-off date, physio start, what's cleared." },
    { week: 8, title: "Light strengthening cleared", detail: "Get specific exercises, loads, and ROM limits from physio." },
    { week: 12, title: "Honest assessment", detail: "Can you sled push pain-free? Row easy without provocation? If no, adjust Phase 4 down." },
    { week: 17, title: "Lock station split", detail: "Final partner conversation. Decide who takes what. Practice handoffs." },
    { week: 20, title: "RACE WEEK", detail: "Trust the work. Pre-race nutrition + sleep priority." },
  ],
};

// ============ HELPERS ============
function daysBetween(d1, d2) {
  return Math.floor((d2 - d1) / 86400000);
}

function getCurrentPhase(weekNumber) {
  return PROGRAM.phases.find(p => p.weeks.includes(weekNumber)) || PROGRAM.phases[0];
}

function getNextCheckpoint(weekNumber) {
  return PROGRAM.checkpoints.find(c => c.week >= weekNumber);
}

function sessionIcon(type) {
  switch (type) {
    case "walk": return Footprints;
    case "bike": return Bike;
    case "run": return Activity;
    case "lift": return Dumbbell;
    case "rest": return Heart;
    default: return Activity;
  }
}

// ============ STORAGE ============
const STORAGE_KEY = "protocol_recovery_completions";

function getCompletions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch { return {}; }
}

function setCompletion(dateKey, value) {
  const all = getCompletions();
  if (value) all[dateKey] = { completed: true, at: new Date().toISOString() };
  else delete all[dateKey];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// ============ COMPONENT ============
export default function RecoveryProgram() {
  const [viewedPhaseId, setViewedPhaseId] = useState(null);
  const [completions, setCompletions] = useState({});
  const [showCheckpoint, setShowCheckpoint] = useState(true);

  useEffect(() => {
    setCompletions(getCompletions());
  }, []);

  const today = new Date();
  const start = new Date(PROGRAM.startDate);
  const race = new Date(PROGRAM.raceDate);

  const daysSince = Math.max(0, daysBetween(start, today));
  const daysToRace = Math.max(0, daysBetween(today, race));
  const weekNumber = Math.floor(daysSince / 7) + 1;
  const dayOfWeek = today.getDay(); // 0=Sun ... 6=Sat
  const todayKey = today.toISOString().slice(0, 10);

  const currentPhase = getCurrentPhase(weekNumber);
  const viewedPhase = viewedPhaseId
    ? PROGRAM.phases.find(p => p.id === viewedPhaseId)
    : currentPhase;

  const todaySession = currentPhase.sessions[dayOfWeek];
  const TodayIcon = sessionIcon(todaySession.type);

  const nextCheckpoint = getNextCheckpoint(weekNumber);
  const weeksToCheckpoint = nextCheckpoint ? nextCheckpoint.week - weekNumber : null;
  const checkpointDue = weeksToCheckpoint !== null && weeksToCheckpoint <= 1;

  const isCompleteToday = !!completions[todayKey];

  const toggleComplete = () => {
    setCompletion(todayKey, !isCompleteToday);
    setCompletions(getCompletions());
  };

  const phaseProgress = useMemo(() => {
    const total = PROGRAM.phases.reduce((sum, p) => sum + p.weeks.length, 0);
    return Math.min(100, Math.round((weekNumber / total) * 100));
  }, [weekNumber]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24" style={{ fontFamily: FF_BODY }}>
      <div className="max-w-2xl mx-auto px-4 pt-6">

        {/* TOP STATUS BAR */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-zinc-500 uppercase mb-1" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
              Recovery Program
            </div>
            <div className="text-3xl text-orange-500" style={{ fontFamily: FF_HEAD, letterSpacing: "0.05em" }}>
              WEEK {weekNumber} · DAY {daysSince + 1}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500 uppercase" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
              Race
            </div>
            <div className="text-2xl text-zinc-200" style={{ fontFamily: FF_HEAD }}>
              {daysToRace}d
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="mb-6">
          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${phaseProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-zinc-600" style={{ fontFamily: FF_MONO }}>
            <span>SURGERY</span>
            <span>{phaseProgress}%</span>
            <span>RACE DAY</span>
          </div>
        </div>

        {/* CHECKPOINT ALERT */}
        {checkpointDue && nextCheckpoint && showCheckpoint && (
          <div className="mb-6 border border-orange-500/40 bg-orange-500/5 rounded p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-orange-500 text-sm uppercase mb-1" style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}>
                  Checkpoint · Week {nextCheckpoint.week}
                </div>
                <div className="text-zinc-100 mb-1" style={{ fontFamily: FF_HEAD, fontSize: "1.5rem", letterSpacing: "0.03em" }}>
                  {nextCheckpoint.title.toUpperCase()}
                </div>
                <div className="text-sm text-zinc-400">{nextCheckpoint.detail}</div>
              </div>
              <button onClick={() => setShowCheckpoint(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TODAY'S SESSION */}
        <div className="mb-6">
          <div className="text-xs text-zinc-500 uppercase mb-3" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
            Today · {["SUN","MON","TUE","WED","THU","FRI","SAT"][dayOfWeek]}
          </div>
          <div className={`border ${isCompleteToday ? "border-orange-500/50 bg-orange-500/5" : "border-zinc-800"} rounded p-5`}>
            <div className="flex items-start gap-4 mb-4">
              <TodayIcon className={`w-8 h-8 ${todaySession.type === "rest" ? "text-zinc-600" : "text-orange-500"} flex-shrink-0`} />
              <div className="flex-1">
                <div className="text-3xl text-zinc-100 mb-1" style={{ fontFamily: FF_HEAD, letterSpacing: "0.03em" }}>
                  {todaySession.title.toUpperCase()}
                </div>
                <div className="text-orange-500 text-sm" style={{ fontFamily: FF_MONO, letterSpacing: "0.05em" }}>
                  {todaySession.duration}
                </div>
                <div className="text-sm text-zinc-400 mt-2">{todaySession.detail}</div>
              </div>
            </div>

            {todaySession.exercises && (
              <div className="border-t border-zinc-800 pt-4 mt-4">
                <div className="text-xs text-zinc-500 uppercase mb-3" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
                  Exercises
                </div>
                <ul className="space-y-2">
                  {todaySession.exercises.map((ex, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-orange-500" style={{ fontFamily: FF_MONO }}>{String(i+1).padStart(2,"0")}</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentPhase.runProgression && todaySession.type === "run" && (
              <div className="border-t border-zinc-800 pt-4 mt-4">
                <div className="text-xs text-zinc-500 uppercase mb-2" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
                  This week's prescription
                </div>
                <div className="text-sm text-zinc-300">
                  {currentPhase.runProgression[weekNumber] || "Easy Z2 conversational"}
                </div>
              </div>
            )}

            {todaySession.type !== "rest" && (
              <button
                onClick={toggleComplete}
                className={`w-full mt-5 py-3 rounded font-bold transition-colors ${
                  isCompleteToday
                    ? "bg-orange-500/20 text-orange-500 border border-orange-500/40"
                    : "bg-orange-500 text-zinc-950 hover:bg-orange-400"
                }`}
                style={{ fontFamily: FF_MONO, letterSpacing: "0.1em" }}
              >
                {isCompleteToday ? "✓ COMPLETED" : "MARK COMPLETE"}
              </button>
            )}
          </div>
        </div>

        {/* PHASE OVERVIEW */}
        <div className="mb-6">
          <div className="text-xs text-zinc-500 uppercase mb-3" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
            {viewedPhase.id === currentPhase.id ? "Current Phase" : "Viewing Phase"}
          </div>
          <div className="border border-zinc-800 rounded p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-orange-500 text-xs" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
                  PHASE {viewedPhase.id} / 5
                </div>
                <div className="text-4xl text-zinc-100 mt-1" style={{ fontFamily: FF_HEAD, letterSpacing: "0.05em" }}>
                  {viewedPhase.name}
                </div>
                <div className="text-sm text-zinc-400">{viewedPhase.subtitle}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-500" style={{ fontFamily: FF_MONO }}>WEEKS</div>
                <div className="text-2xl text-zinc-200" style={{ fontFamily: FF_HEAD }}>
                  {viewedPhase.weeks[0]}-{viewedPhase.weeks[viewedPhase.weeks.length-1]}
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-3 mt-3">
              <div className="text-xs text-zinc-500 uppercase mb-1" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
                Shoulder Status
              </div>
              <div className="text-sm text-zinc-300 mb-3">{viewedPhase.shoulder}</div>

              {viewedPhase.avoid && (
                <>
                  <div className="text-xs text-zinc-500 uppercase mb-1" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
                    Avoid
                  </div>
                  <ul className="text-sm text-zinc-400 space-y-1 mb-3">
                    {viewedPhase.avoid.map((a, i) => <li key={i}>· {a}</li>)}
                  </ul>
                </>
              )}

              {viewedPhase.stationSplit && (
                <>
                  <div className="text-xs text-orange-500 uppercase mb-2 mt-3" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
                    Doubles Split
                  </div>
                  <div className="text-xs text-zinc-500 mb-1" style={{ fontFamily: FF_MONO }}>YOU TAKE</div>
                  <div className="text-sm text-zinc-300 mb-2">{viewedPhase.stationSplit.you.join(" · ")}</div>
                  <div className="text-xs text-zinc-500 mb-1" style={{ fontFamily: FF_MONO }}>PARTNER TAKES</div>
                  <div className="text-sm text-zinc-300 mb-2">{viewedPhase.stationSplit.partner.join(" · ")}</div>
                  <div className="text-xs text-zinc-500 mb-1" style={{ fontFamily: FF_MONO }}>GAME-TIME</div>
                  <div className="text-sm text-zinc-300">{viewedPhase.stationSplit.gameTime.join(" · ")}</div>
                </>
              )}

              {viewedPhase.stations && (
                <>
                  <div className="text-xs text-orange-500 uppercase mb-2 mt-3" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
                    Stations
                  </div>
                  <div className="text-sm text-zinc-400 mb-2">{viewedPhase.stations.intro}</div>
                  <ul className="text-sm text-zinc-300 space-y-1">
                    {viewedPhase.stations.list.map((s, i) => <li key={i}>· {s}</li>)}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>

        {/* PHASE NAVIGATION */}
        <div className="mb-6">
          <div className="text-xs text-zinc-500 uppercase mb-3" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
            All Phases
          </div>
          <div className="grid grid-cols-5 gap-2">
            {PROGRAM.phases.map(p => {
              const isCurrent = p.id === currentPhase.id;
              const isViewed = p.id === viewedPhase.id;
              const isPast = p.weeks[p.weeks.length-1] < weekNumber;
              return (
                <button
                  key={p.id}
                  onClick={() => setViewedPhaseId(p.id)}
                  className={`p-2 rounded border text-center transition-colors ${
                    isViewed
                      ? "border-orange-500 bg-orange-500/10"
                      : isCurrent
                      ? "border-orange-500/40"
                      : isPast
                      ? "border-zinc-800 bg-zinc-900/50"
                      : "border-zinc-800"
                  }`}
                >
                  <div className={`text-xs ${isCurrent || isViewed ? "text-orange-500" : "text-zinc-500"}`} style={{ fontFamily: FF_MONO }}>
                    {p.id}
                  </div>
                  <div className={`text-xs mt-1 ${isViewed ? "text-zinc-100" : "text-zinc-500"}`} style={{ fontFamily: FF_HEAD, letterSpacing: "0.05em" }}>
                    {p.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* UPCOMING CHECKPOINTS */}
        <div className="mb-6">
          <div className="text-xs text-zinc-500 uppercase mb-3" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
            Checkpoints
          </div>
          <div className="space-y-2">
            {PROGRAM.checkpoints.map(cp => {
              const past = cp.week < weekNumber;
              const current = cp.week === weekNumber || (cp.week > weekNumber && cp.week - weekNumber <= 1);
              return (
                <div
                  key={cp.week}
                  className={`border rounded p-3 ${
                    current
                      ? "border-orange-500/40 bg-orange-500/5"
                      : past
                      ? "border-zinc-800 opacity-50"
                      : "border-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-xl ${current ? "text-orange-500" : "text-zinc-500"}`} style={{ fontFamily: FF_HEAD }}>
                      W{cp.week}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-zinc-100">{cp.title}</div>
                      <div className="text-xs text-zinc-500">{cp.detail}</div>
                    </div>
                    {past && <Check className="w-4 h-4 text-zinc-600" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// ============ MODE TOGGLE (cross-component sync) ============
const RECOVERY_MODE_KEY = "protocol_recovery_mode";
const RECOVERY_MODE_EVENT = "protocol-recovery-mode-change";

export function getRecoveryMode() {
  try {
    const stored = localStorage.getItem(RECOVERY_MODE_KEY);
    // Default ON - this is being added mid-recovery
    return stored === null ? true : stored === "true";
  } catch { return true; }
}

function setRecoveryModeValue(value) {
  try {
    localStorage.setItem(RECOVERY_MODE_KEY, String(value));
    window.dispatchEvent(new CustomEvent(RECOVERY_MODE_EVENT, { detail: value }));
  } catch {}
}

export function useRecoveryMode() {
  const [enabled, setEnabled] = useState(getRecoveryMode());

  useEffect(() => {
    const handler = (e) => setEnabled(e.detail);
    window.addEventListener(RECOVERY_MODE_EVENT, handler);
    return () => window.removeEventListener(RECOVERY_MODE_EVENT, handler);
  }, []);

  return [enabled, setRecoveryModeValue];
}

export function RecoveryModeToggle() {
  const [enabled, setMode] = useRecoveryMode();

  const today = new Date();
  const start = new Date(PROGRAM.startDate);
  const race = new Date(PROGRAM.raceDate);
  const daysSince = Math.max(0, daysBetween(start, today));
  const daysToRace = Math.max(0, daysBetween(today, race));
  const weekNumber = Math.floor(daysSince / 7) + 1;

  return (
    <div className="border border-zinc-800 rounded p-5 bg-zinc-950" style={{ fontFamily: FF_BODY }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 pr-4">
          <div className="text-xs text-zinc-500 uppercase" style={{ fontFamily: FF_MONO, letterSpacing: "0.15em" }}>
            Mode
          </div>
          <div className={`text-3xl mt-1 ${enabled ? "text-orange-500" : "text-zinc-100"}`} style={{ fontFamily: FF_HEAD, letterSpacing: "0.05em" }}>
            {enabled ? "RECOVERY" : "STANDARD"}
          </div>
          <div className="text-xs text-zinc-500 mt-1" style={{ fontFamily: FF_MONO }}>
            {enabled
              ? `WEEK ${weekNumber} · ${daysToRace}D TO RACE`
              : "NORMAL PROTOCOL · AI WORKOUTS"}
          </div>
        </div>
        <button
          onClick={() => setMode(!enabled)}
          className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ${
            enabled ? "bg-orange-500" : "bg-zinc-800"
          }`}
          aria-label="Toggle recovery mode"
        >
          <div
            className={`absolute top-1 w-6 h-6 rounded-full bg-zinc-950 transition-transform ${
              enabled ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      <div className="text-xs text-zinc-500 mt-3">
        {enabled
          ? "Recovery program guides Today until you flip this off."
          : "Toggle on to resume the 20-week post-op program."}
      </div>
    </div>
  );
}

