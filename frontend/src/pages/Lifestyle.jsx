import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import {
  ArrowLeft,
  Brain,
  Droplets,
  Moon,
  Activity,
  Smile,
  Plus,
  Minus,
  Save,
  Sparkles,
} from "lucide-react";

function Lifestyle() {
  const navigate = useNavigate();

  const [water, setWater] = useState(1.8);
  const [sleep, setSleep] = useState(7.2);
  const [steps, setSteps] = useState(6400);
  const [stress, setStress] = useState(4);
  const [mood, setMood] = useState("Good");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [waterTarget, setWaterTarget] = useState(2.5);
  const [sleepTarget, setSleepTarget] = useState(8);
  const [stepsTarget, setStepsTarget] = useState(8000);

  // Load today's lifestyle data and dynamic targets from backend
  useEffect(() => {
    const loadLifestyle = async () => {
      try {
        const [lifeRes, wellRes] = await Promise.allSettled([
          api.get("/lifestyle/today"),
          api.get("/wellness/today"),
        ]);

        if (lifeRes.status === "fulfilled") {
          const entries = lifeRes.value.data.entries;
          if (entries && entries.length > 0) {
            const latest = entries[0];
            setWater(Number(latest.water_liters || 0));
            setSleep(Number(latest.sleep_hours || 0));
            setSteps(Number(latest.steps || 0));
            setStress(Number(latest.stress_level || 0));
            setMood(latest.mood || "Good");
          }
        }

        if (wellRes.status === "fulfilled" && wellRes.value.data.targets) {
          const t = wellRes.value.data.targets;
          if (t.water_liters) setWaterTarget(t.water_liters);
          if (t.sleep_hours) setSleepTarget(t.sleep_hours);
          if (t.steps) setStepsTarget(t.steps);
        }
      } catch (error) {
        console.error("Failed to load lifestyle data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLifestyle();
  }, []);

  const addWater = () => {
    setWater((current) =>
      Math.min(Number((current + 0.25).toFixed(2)), waterTarget)
    );

    setSaved(false);
  };

  const removeWater = () => {
    setWater((current) =>
      Math.max(Number((current - 0.25).toFixed(2)), 0)
    );

    setSaved(false);
  };

  const waterProgress = Math.min((water / waterTarget) * 100, 100);
  const sleepProgress = Math.min((sleep / sleepTarget) * 100, 100);
  const activityProgress = Math.min((steps / stepsTarget) * 100, 100);

  // Save lifestyle data to backend
  const saveLifestyle = async () => {
    try {
      setSaving(true);
      setSaved(false);

      await api.post("/lifestyle/log", {
        water_liters: water,
        sleep_hours: sleep,
        steps: steps,
        stress_level: stress,
        mood: mood,
      });

      setSaved(true);
    } catch (error) {
      console.error("Failed to save lifestyle data:", error);
      alert("Failed to save lifestyle data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6faf8] text-slate-900">

      {/* Header */}
      <header className="border-b border-white bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">

          <button
            onClick={() => navigate("/dashboard")}
            className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white">
              <ArrowLeft size={17} />
            </span>

            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <img
              src="/nutrimind-logo.png"
              alt="NutriMind AI"
              className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-emerald-200"
            />

            <div>
              <p className="text-sm font-extrabold">
                NutriMind AI
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                Lifestyle Intelligence
              </p>
            </div>
          </div>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">

        {/* Heading */}
        <div className="mx-auto mb-10 max-w-3xl text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700 shadow-sm">
            <Sparkles size={14} />
            Daily Wellness Tracking
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            Your lifestyle,
            <span className="block bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              understood by AI.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500">
            Track hydration, sleep, activity, stress and mood to help
            NutriMind understand your daily wellness patterns.
          </p>

        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-sm font-semibold text-slate-400">
              Loading today's lifestyle data...
            </div>
          </div>
        ) : (
          <>
            {/* Tracker Cards */}
            <div className="grid gap-6 md:grid-cols-2">

              {/* Water */}
              <section className="rounded-[2rem] border border-white bg-white p-6 shadow-lg">

                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                      <Droplets size={23} />
                    </div>

                    <div>
                      <h2 className="font-extrabold text-slate-950">
                        Hydration
                      </h2>

                      <p className="text-xs text-slate-400">
                        Daily water intake
                      </p>
                    </div>

                  </div>

                  <span className="text-sm font-bold text-blue-500">
                    {water} L
                  </span>

                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${waterProgress}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{water} L consumed</span>
                  <span>{waterTarget} L target</span>
                </div>

                <div className="mt-5 flex gap-3">

                  <button
                    onClick={removeWater}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50"
                  >
                    <Minus size={17} />
                  </button>

                  <button
                    onClick={addWater}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-bold text-white hover:bg-blue-600"
                  >
                    <Plus size={17} />
                    Add 250 ml
                  </button>

                </div>

              </section>

              {/* Sleep */}
              <section className="rounded-[2rem] border border-white bg-white p-6 shadow-lg">

                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-500">
                      <Moon size={23} />
                    </div>

                    <div>
                      <h2 className="font-extrabold text-slate-950">
                        Sleep
                      </h2>

                      <p className="text-xs text-slate-400">
                        Last night's sleep
                      </p>
                    </div>

                  </div>

                  <span className="text-sm font-bold text-purple-500">
                    {sleep} hrs
                  </span>

                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{ width: `${sleepProgress}%` }}
                  />
                </div>

                <div className="mt-3 flex justify-between text-xs text-slate-400">
                  <span>{sleep} hours</span>
                  <span>{sleepTarget} hours target</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.1"
                  value={sleep}
                  onChange={(e) => {
                    setSleep(Number(e.target.value));
                    setSaved(false);
                  }}
                  className="mt-6 w-full accent-purple-500"
                />

              </section>

              {/* Activity */}
              <section className="rounded-[2rem] border border-white bg-white p-6 shadow-lg">

                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                      <Activity size={23} />
                    </div>

                    <div>
                      <h2 className="font-extrabold text-slate-950">
                        Physical Activity
                      </h2>

                      <p className="text-xs text-slate-400">
                        Daily steps
                      </p>
                    </div>

                  </div>

                  <span className="text-sm font-bold text-emerald-500">
                    {steps.toLocaleString()}
                  </span>

                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${activityProgress}%` }}
                  />
                </div>

                <div className="mt-3 flex justify-between text-xs text-slate-400">
                  <span>{steps.toLocaleString()} steps</span>
                  <span>{stepsTarget.toLocaleString()} target</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="15000"
                  step="100"
                  value={steps}
                  onChange={(e) => {
                    setSteps(Number(e.target.value));
                    setSaved(false);
                  }}
                  className="mt-6 w-full accent-emerald-500"
                />

              </section>

              {/* Stress & Mood */}
              <section className="rounded-[2rem] border border-white bg-white p-6 shadow-lg">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                    <Smile size={23} />
                  </div>

                  <div>
                    <h2 className="font-extrabold text-slate-950">
                      Stress & Mood
                    </h2>

                    <p className="text-xs text-slate-400">
                      How are you feeling today?
                    </p>
                  </div>

                </div>

                <div className="mt-6">

                  <div className="flex justify-between">
                    <span className="text-sm font-semibold">
                      Stress level
                    </span>

                    <span className="font-bold text-orange-500">
                      {stress}/10
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={stress}
                    onChange={(e) => {
                      setStress(Number(e.target.value));
                      setSaved(false);
                    }}
                    className="mt-4 w-full accent-orange-500"
                  />

                </div>

                <div className="mt-6">

                  <p className="mb-3 text-sm font-semibold">
                    Mood
                  </p>

                  <div className="grid grid-cols-4 gap-2">

                    {["Low", "Okay", "Good", "Great"].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setMood(item);
                          setSaved(false);
                        }}
                        className={`rounded-xl border px-2 py-3 text-xs font-bold transition ${
                          mood === item
                            ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {item}
                      </button>
                    ))}

                  </div>

                </div>

              </section>

            </div>

            {/* Save */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3">

              <button
                onClick={saveLifestyle}
                disabled={saving}
                className="flex items-center gap-2 rounded-2xl bg-slate-950 px-7 py-4 text-sm font-bold text-white shadow-lg hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />

                {saving
                  ? "Saving..."
                  : saved
                  ? "Lifestyle Saved ✓"
                  : "Save Today's Lifestyle"}
              </button>

              {saved && (
                <p className="text-sm font-semibold text-emerald-600">
                  Your lifestyle data has been saved successfully.
                </p>
              )}

            </div>

            {/* AI insight */}
            <div className="mt-8 rounded-[2rem] border border-emerald-100 bg-emerald-50/70 p-6">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                  <Brain size={20} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    NutriMind AI
                  </p>

                  <h3 className="mt-1 font-extrabold text-slate-950">
                    Lifestyle intelligence is ready
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Your hydration, sleep, activity, stress and mood data
                    will be used to generate personalized wellness insights.
                  </p>
                </div>

              </div>

            </div>
          </>
        )}

      </main>
    </div>
  );
}

export default Lifestyle;
