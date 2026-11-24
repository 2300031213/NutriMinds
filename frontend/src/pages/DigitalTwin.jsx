import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Float, OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  Info,
  Moon,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserRound,
  Utensils,
  Zap,
} from "lucide-react";
import api from "../api/axios";

/* =========================================================
   3D AVATAR COMPONENT
========================================================= */

function TwinAvatar() {
  const { scene, animations } = useGLTF("/models/digital-twin.glb");
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    const animationNames = Object.keys(actions);
    const preferredAnimation = animationNames.find((name) =>
      /idle|stand|breath/i.test(name)
    );
    const action = actions[preferredAnimation || animationNames[0]];

    if (action) {
      action.reset().fadeIn(0.4).play();
    }

    return () => {
      action?.fadeOut(0.25);
    };
  }, [actions]);

  return (
    <Float speed={1.2} rotationIntensity={0.03} floatIntensity={0.08}>
      <Center>
        <primitive object={scene} scale={1.35} />
      </Center>
    </Float>
  );
}

function AvatarFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400">
      <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
      <p className="text-xs font-semibold">Initializing 3D Physiological Avatar...</p>
    </div>
  );
}

function TwinScene({ score = 75 }) {
  // Dynamic physiological rim light color based on wellness score
  const auraColor = useMemo(() => {
    if (score >= 80) return "#10b981"; // Vibrant Emerald
    if (score >= 65) return "#06b6d4"; // Cyan/Teal Vitality
    if (score >= 50) return "#f59e0b"; // Amber Warning
    return "#f43f5e"; // Rose/Red Stress Alert
  }, [score]);

  return (
    <Canvas camera={{ position: [0, 0.9, 3.8], fov: 42 }}>
      <ambientLight intensity={1.8} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <pointLight position={[-3, 1, 2]} color={auraColor} intensity={14} />
      <pointLight position={[3, -1, -2]} color="#ffffff" intensity={5} />
      <Suspense fallback={null}>
        <TwinAvatar />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={2.4}
        maxDistance={5.8}
        maxPolarAngle={Math.PI / 1.8}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}

/* =========================================================
   LOCAL CLIENT-SIDE CALCULATION FALLBACK
========================================================= */

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(value, max));
}

function computeLocalTwinAnalysis({
  water,
  sleep,
  steps,
  stress,
  calories = 2000,
  protein = 50,
}) {
  const hydration = clamp((water / 2.5) * 100);
  const sleepScore = sleep <= 9 ? clamp((sleep / 8) * 100) : clamp(100 - (sleep - 9) * 15);
  const activity = clamp((steps / 8000) * 100);
  const stressScore = clamp(((10 - stress) / 9) * 100);
  const nutritionScore = clamp((calories / 2000) * 50 + (protein / 50) * 50);

  const projected_wellness_index = Math.round(
    hydration * 0.25 + sleepScore * 0.25 + activity * 0.25 + stressScore * 0.25
  );

  const biological_age_shift = Number(((70.0 - projected_wellness_index) * 0.08).toFixed(1));

  const metabolic_flexibility = Number(clamp(activity * 0.5 + nutritionScore * 0.5).toFixed(1));
  const cellular_recovery = Number(clamp(sleepScore * 0.65 + stressScore * 0.35).toFixed(1));
  const cognitive_focus = Number(
    clamp(hydration * 0.4 + sleepScore * 0.35 + stressScore * 0.25).toFixed(1)
  );
  const cardiovascular_vitality = Number(clamp(activity * 0.7 + hydration * 0.3).toFixed(1));
  const cellular_hydration = Number(hydration.toFixed(1));

  const insights = [];
  const risk_flags = [];
  const prescriptions = [];

  // Hydration
  if (water >= 2.5) {
    insights.push({
      pillar: "Hydration",
      status: "Optimal",
      title: "Full Cellular Hydration",
      analysis: `At ${water.toFixed(1)}L/day, osmotic balance is peak, accelerating metabolic toxin clearance and cellular hydration.`,
      impact: "+15% Cognitive Endurance",
    });
  } else if (water < 1.5) {
    insights.push({
      pillar: "Hydration",
      status: "Suboptimal",
      title: "Hypohydration Warning",
      analysis: `Fluid intake of ${water.toFixed(1)}L slows mitochondrial ATP transfer and raises afternoon fatigue.`,
      impact: "-12% Energy Transfer",
    });
    risk_flags.push("Dehydration & Toxin Accumulation Risk");
    prescriptions.push(`Drink an additional ${(2.5 - water).toFixed(1)}L of water today.`);
  } else {
    insights.push({
      pillar: "Hydration",
      status: "Good",
      title: "Moderate Fluid Balance",
      analysis: `${water.toFixed(1)}L covers baseline hydration. Adding 0.5L will optimize renal efficiency.`,
      impact: "+6% Alertness",
    });
  }

  // Sleep
  if (sleep >= 7.5 && sleep <= 9.0) {
    insights.push({
      pillar: "Sleep & Recovery",
      status: "Optimal",
      title: "Glymphatic Neural Flush",
      analysis: `${sleep.toFixed(1)} hrs completes restorative REM & SWS cycles, facilitating hormone balance and memory consolidation.`,
      impact: "+20% Neuro-Plasticity",
    });
  } else if (sleep < 6.0) {
    insights.push({
      pillar: "Sleep & Recovery",
      status: "Critical",
      title: "Sleep Debt & Cortisol Elevation",
      analysis: `${sleep.toFixed(1)} hrs truncates restorative deep sleep, blunting insulin sensitivity and elevating ghrelin.`,
      impact: "-25% Stress Resilience",
    });
    risk_flags.push("Chronic Sleep Debt & Hormonal Imbalance");
    prescriptions.push(`Aim for ${Math.min(8.0, sleep + 1.5).toFixed(1)} hrs of sleep tonight with a wind-down routine.`);
  } else {
    insights.push({
      pillar: "Sleep & Recovery",
      status: "Moderate",
      title: "Basic Neural Rest",
      analysis: `${sleep.toFixed(1)} hrs provides adequate baseline rest; an extra 45 min would enhance immune markers.`,
      impact: "+8% Focus Retention",
    });
  }

  // Activity
  if (steps >= 8000) {
    insights.push({
      pillar: "Cardio & Mobility",
      status: "Optimal",
      title: "Active Mitochondrial Stimulation",
      analysis: `${steps.toLocaleString()} steps stimulates endothelial nitric oxide and continuous lipid oxidation.`,
      impact: "+18% Aerobic Efficiency",
    });
  } else if (steps < 4000) {
    insights.push({
      pillar: "Cardio & Mobility",
      status: "Suboptimal",
      title: "Sedentary Resistance",
      analysis: `Under 4,000 steps suppresses skeletal muscle lipase activity, impairing glucose disposal.`,
      impact: "-15% Caloric Burn",
    });
    risk_flags.push("Prolonged Sedentary Inactivity");
    prescriptions.push("Add a 15-minute brisk walk to gain ~1,800 steps toward your target.");
  } else {
    insights.push({
      pillar: "Cardio & Mobility",
      status: "Good",
      title: "Moderate Active Baseline",
      analysis: `${steps.toLocaleString()} steps maintains circulatory tone. Aim for 8,000 steps for systemic anti-inflammatory benefits.`,
      impact: "+10% Cardiovascular Tone",
    });
  }

  // Stress
  if (stress <= 3) {
    insights.push({
      pillar: "Neuro-Stress Balance",
      status: "Optimal",
      title: "Vagal Tone Dominance",
      analysis: `Stress level ${stress}/10 reflects parasympathetic balance, low resting heart rate, and strong gut digestion.`,
      impact: "+22% Digestive & Immune Balance",
    });
  } else if (stress >= 7) {
    insights.push({
      pillar: "Neuro-Stress Balance",
      status: "Critical",
      title: "Sympathetic Hyper-Arousal",
      analysis: `High stress (${stress}/10) triggers prolonged systemic cortisol, causing muscle tension and fragmented sleep.`,
      impact: "-30% Systemic Recovery",
    });
    risk_flags.push("Sympathetic Hyper-Arousal & Cortisol Surge");
    prescriptions.push("Practice 4-7-8 box breathing for 3 minutes to activate vagal parasympathetic rest.");
  } else {
    insights.push({
      pillar: "Neuro-Stress Balance",
      status: "Good",
      title: "Manageable Cognitive Load",
      analysis: `Stress level ${stress}/10 is within manageable bounds. 5 minutes of mindful breathwork will induce deep rest.`,
      impact: "+7% Mental Clarity",
    });
  }

  if (prescriptions.length === 0) {
    prescriptions.push("Maintain this optimal routine to sustain peak cellular vitality and cognitive focus.");
  }

  return {
    projected_wellness_index,
    biological_age_shift,
    biomarkers: {
      metabolic_flexibility,
      cellular_recovery,
      cognitive_focus,
      cardiovascular_vitality,
      cellular_hydration,
    },
    domain_scores: {
      hydration: Number(hydration.toFixed(1)),
      sleep: Number(sleepScore.toFixed(1)),
      activity: Number(activity.toFixed(1)),
      stress: Number(stressScore.toFixed(1)),
      nutrition: Number(nutritionScore.toFixed(1)),
    },
    ai_insights: insights,
    risk_flags,
    prescriptions,
    summary: `Your 3D Digital Twin projects a ${projected_wellness_index}/100 wellness score with a biological age shift of ${
      biological_age_shift > 0 ? "+" : ""
    }${biological_age_shift} years.`,
  };
}

/* =========================================================
   SCENARIO PRESETS
========================================================= */

const SCENARIOS = [
  {
    id: "peak",
    name: "Peak Vitality",
    badge: "Longevity",
    desc: "Optimal hydration, deep sleep & active movement",
    color: "from-emerald-500 to-teal-500",
    values: { water: 3.0, sleep: 8.5, steps: 11000, stress: 2, calories: 2100, protein: 90 },
  },
  {
    id: "recovery",
    name: "Deep Recovery",
    badge: "Rest",
    desc: "Low stress, extended sleep & restorative fluids",
    color: "from-violet-500 to-indigo-500",
    values: { water: 2.8, sleep: 9.5, steps: 5000, stress: 1, calories: 1950, protein: 75 },
  },
  {
    id: "stress",
    name: "High Stress Workday",
    badge: "Strain",
    desc: "Short sleep, dehydration, high cognitive pressure",
    color: "from-rose-500 to-amber-500",
    values: { water: 1.1, sleep: 5.0, steps: 3200, stress: 8, calories: 2450, protein: 45 },
  },
  {
    id: "athlete",
    name: "Active Athlete",
    badge: "Performance",
    desc: "Intense movement, high protein & elevated hydration",
    color: "from-blue-500 to-cyan-500",
    values: { water: 3.6, sleep: 8.0, steps: 15000, stress: 3, calories: 2750, protein: 125 },
  },
];

/* =========================================================
   MAIN DIGITAL TWIN COMPONENT
========================================================= */

export default function DigitalTwin() {
  const navigate = useNavigate();

  // Habit inputs
  const [water, setWater] = useState(2.2);
  const [sleep, setSleep] = useState(7.5);
  const [steps, setSteps] = useState(7000);
  const [stress, setStress] = useState(4);
  const [calories, setCalories] = useState(2000);
  const [protein, setProtein] = useState(65);

  // Live data reference
  const [liveData, setLiveData] = useState(null);
  const [isLiveSync, setIsLiveSync] = useState(false);
  const [activeScenario, setActiveScenario] = useState("custom");

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState(() =>
    computeLocalTwinAnalysis({ water: 2.2, sleep: 7.5, steps: 7000, stress: 4, calories: 2000, protein: 65 })
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const debounceTimerRef = useRef(null);

  // =========================================================
  // 1. FETCH LIVE TODAY'S WELLNESS DATA ON MOUNT
  // =========================================================
  useEffect(() => {
    let isMounted = true;

    async function fetchLiveBiometrics() {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const response = await api.get("/wellness/today");
        if (isMounted && response.data) {
          const w = response.data;
          const liveVals = {
            water: Number(w.lifestyle?.water_liters ?? w.water ?? 2.0),
            sleep: Number(w.lifestyle?.sleep_hours ?? w.sleep ?? 7.0),
            steps: Number(w.lifestyle?.steps ?? w.steps ?? 6000),
            stress: Number(w.lifestyle?.stress_level ?? w.stress ?? 4),
            calories: Number(w.nutrition?.calories ?? w.calories ?? 2000),
            protein: Number(w.nutrition?.protein ?? w.protein ?? 50),
          };

          setLiveData(liveVals);
          // Auto-sync initially with live data
          setWater(liveVals.water);
          setSleep(liveVals.sleep);
          setSteps(liveVals.steps);
          setStress(liveVals.stress);
          setCalories(liveVals.calories);
          setProtein(liveVals.protein);
          setIsLiveSync(true);
          setActiveScenario("today");
        }
      } catch (err) {
        console.warn("Could not fetch live wellness data, running in standalone mode:", err);
      }
    }

    fetchLiveBiometrics();

    return () => {
      isMounted = false;
    };
  }, []);

  // =========================================================
  // 2. TRIGGER REAL-TIME AI ANALYSIS (DEBOUNCED API + INSTANT LOCAL)
  // =========================================================
  const runAnalysis = useCallback((params) => {
    // Instant local preview for zero UI lag
    const localResult = computeLocalTwinAnalysis(params);
    setAiAnalysis(localResult);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const res = await api.post("/wellness/twin-analysis", {
          water_liters: params.water,
          sleep_hours: params.sleep,
          steps: params.steps,
          stress_level: params.stress,
          calories: params.calories,
          protein: params.protein,
        });
        if (res.data) {
          setAiAnalysis(res.data);
        }
      } catch (err) {
        console.warn("Backend twin-analysis failed, retained high-fidelity local analysis:", err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 320);
  }, []);

  // Re-run analysis on habit change
  useEffect(() => {
    runAnalysis({ water, sleep, steps, stress, calories, protein });
  }, [water, sleep, steps, stress, calories, protein, runAnalysis]);

  // Handle Preset Selection
  const applyScenario = (scenario) => {
    setActiveScenario(scenario.id);
    setIsLiveSync(false);
    setWater(scenario.values.water);
    setSleep(scenario.values.sleep);
    setSteps(scenario.values.steps);
    setStress(scenario.values.stress);
    setCalories(scenario.values.calories);
    setProtein(scenario.values.protein);
  };

  const applyTodayData = () => {
    if (!liveData) return;
    setActiveScenario("today");
    setIsLiveSync(true);
    setWater(liveData.water);
    setSleep(liveData.sleep);
    setSteps(liveData.steps);
    setStress(liveData.stress);
    setCalories(liveData.calories);
    setProtein(liveData.protein);
  };

  const resetToBaseline = () => {
    setActiveScenario("custom");
    setIsLiveSync(false);
    setWater(2.2);
    setSleep(7.5);
    setSteps(7000);
    setStress(4);
    setCalories(2000);
    setProtein(65);
  };

  // Helper values
  const wellnessScore = aiAnalysis?.projected_wellness_index ?? 75;
  const bioAgeShift = aiAnalysis?.biological_age_shift ?? 0.0;
  const biomarkers = aiAnalysis?.biomarkers || {
    metabolic_flexibility: 75,
    cellular_recovery: 75,
    cognitive_focus: 75,
    cardiovascular_vitality: 75,
    cellular_hydration: 75,
  };

  return (
    <div className="min-h-screen bg-[#f1f6f4] text-slate-900 pb-16">
      {/* =========================================================
          TOP NAVIGATION BAR
      ========================================================= */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/70 bg-white/85 px-5 py-4 backdrop-blur-xl md:px-8 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="/nutrimind-logo.png"
            alt="NutriMind AI"
            className="h-10 w-10 rounded-xl object-cover shadow-sm shadow-emerald-100"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-slate-900">NutriMind AI</h1>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                3D Digital Twin
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-600">
              Real-time Physiological Modeling & AI Analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {liveData && (
            <button
              onClick={applyTodayData}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                isLiveSync
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <RefreshCw size={13} className={isLiveSync ? "animate-spin" : ""} />
              {isLiveSync ? "Synced with Today" : "Sync Today's Data"}
            </button>
          )}

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700"
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>
        </div>
      </header>

      {/* =========================================================
          HERO & SCENARIO BAR
      ========================================================= */}
      <main className="mx-auto max-w-7xl px-5 pt-8 md:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-3.5 py-1 text-xs font-bold text-emerald-700 shadow-sm">
              <Sparkles size={14} className="text-emerald-500" />
              <span>AI PHYSIOLOGICAL RECONSTRUCTION</span>
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Your 3D Digital Twin & Longevity Simulator
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Manipulate your biometrics to simulate cellular recovery, project your biological age shift,
              and receive real-time explainable physiological diagnostics powered by AI.
            </p>
          </div>

          {/* Quick Scenario Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
              Scenarios:
            </span>
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => applyScenario(s)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  activeScenario === s.id
                    ? "bg-slate-900 text-white shadow-md scale-105"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-400 hover:text-emerald-700"
                }`}
              >
                {s.name}
              </button>
            ))}
            <button
              onClick={resetToBaseline}
              className="flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200"
              title="Reset sliders"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>
        </div>

        {/* =========================================================
            TOP IMPACT METRICS BANNER
        ========================================================= */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Projected Wellness Index */}
          <div className="relative overflow-hidden rounded-3xl border border-white bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Simulation Outcome
                </span>
                <h3 className="text-sm font-black text-slate-900">Wellness Index</h3>
              </div>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <HeartPulse size={18} />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{wellnessScore}</span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
              <span
                className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                  wellnessScore >= 80
                    ? "bg-emerald-100 text-emerald-800"
                    : wellnessScore >= 65
                    ? "bg-cyan-100 text-cyan-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {wellnessScore >= 80 ? "Optimal" : wellnessScore >= 65 ? "Good" : "Strain"}
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${Math.min(wellnessScore, 100)}%` }}
              />
            </div>
          </div>

          {/* 2. Biological Age Shift */}
          <div className="relative overflow-hidden rounded-3xl border border-white bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Longevity Projection
                </span>
                <h3 className="text-sm font-black text-slate-900">Biological Age Shift</h3>
              </div>
              <div
                className={`rounded-xl p-2 ${
                  bioAgeShift <= 0 ? "bg-teal-50 text-teal-600" : "bg-rose-50 text-rose-600"
                }`}
              >
                {bioAgeShift <= 0 ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span
                className={`text-3xl font-black ${
                  bioAgeShift <= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {bioAgeShift > 0 ? `+${bioAgeShift}` : bioAgeShift}
              </span>
              <span className="text-xs font-bold text-slate-500">years</span>
              <span
                className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  bioAgeShift <= 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {bioAgeShift <= 0 ? "Younger / Rejuvenation" : "Cellular Wear & Tear"}
              </span>
            </div>

            <p className="mt-3 text-[11px] text-slate-400 leading-tight">
              {bioAgeShift <= 0
                ? "Optimal restorative habits promote telomere protection and low systemic inflammation."
                : "Current stressors and deficits increase oxidative biological load."}
            </p>
          </div>

          {/* 3. Cellular Recovery Index */}
          <div className="relative overflow-hidden rounded-3xl border border-white bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Autonomic State
                </span>
                <h3 className="text-sm font-black text-slate-900">Cellular Recovery</h3>
              </div>
              <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                <Brain size={18} />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {biomarkers.cellular_recovery}%
              </span>
              <span className="ml-auto text-xs font-bold text-violet-600">
                {biomarkers.cellular_recovery >= 80
                  ? "Parasympathetic"
                  : biomarkers.cellular_recovery >= 60
                  ? "Balanced"
                  : "Sympathetic"}
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${Math.min(biomarkers.cellular_recovery, 100)}%` }}
              />
            </div>
          </div>

          {/* 4. Metabolic Flexibility */}
          <div className="relative overflow-hidden rounded-3xl border border-white bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mitochondrial Rate
                </span>
                <h3 className="text-sm font-black text-slate-900">Metabolic Flexibility</h3>
              </div>
              <div className="rounded-xl bg-orange-50 p-2 text-orange-600">
                <Flame size={18} />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {biomarkers.metabolic_flexibility}%
              </span>
              <span className="ml-auto text-xs font-bold text-orange-600">
                {biomarkers.metabolic_flexibility >= 80 ? "High Efficiency" : "Moderate Rate"}
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
                style={{ width: `${Math.min(biomarkers.metabolic_flexibility, 100)}%` }}
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            CLINICAL RISK FLAGS (IF ANY)
        ========================================================= */}
        {aiAnalysis?.risk_flags?.length > 0 && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 shadow-sm backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
                <ShieldAlert size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-rose-950">
                    Physiological Strain Risk Detected
                  </h4>
                  <span className="rounded-full bg-rose-200 px-2 py-0.5 text-[10px] font-black uppercase text-rose-900">
                    Clinical Alert
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {aiAnalysis.risk_flags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-2.5 py-1 text-xs font-semibold text-rose-800"
                    >
                      <AlertTriangle size={13} className="text-rose-600" />
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            MAIN INTERACTIVE WORKSPACE (3D TWIN + SLIDER SIMULATOR)
        ========================================================= */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT: 3D DIGITAL TWIN AVATAR CANVAS */}
          <section className="relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white bg-gradient-to-br from-[#d4f6ea] via-[#eefcf7] to-[#d3f0ed] p-6 shadow-lg">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-800">
                  Interactive Viewport
                </p>
                <h3 className="mt-0.5 text-xl font-black text-slate-900">3D Virtual Twin</h3>
              </div>

              <div className="flex items-center gap-2">
                {isAnalyzing && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/10 border border-emerald-600/20 px-3 py-1 text-xs font-bold text-emerald-800 animate-pulse">
                    <RefreshCw size={12} className="animate-spin" />
                    AI Computing...
                  </span>
                )}
                <span className="rounded-full bg-white/90 border border-white px-3 py-1 text-xs font-extrabold text-slate-800 shadow-sm">
                  Drag & Rotate
                </span>
              </div>
            </div>

            {/* 3D Canvas Area */}
            <div className="relative h-[420px] w-full cursor-grab active:cursor-grabbing">
              <Suspense fallback={<AvatarFallback />}>
                <TwinScene score={wellnessScore} />
              </Suspense>

              {/* Status overlay badge on the 3D twin */}
              <div className="absolute bottom-3 left-3 rounded-2xl border border-white/80 bg-white/80 p-3 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      wellnessScore >= 80
                        ? "bg-emerald-500 animate-ping"
                        : wellnessScore >= 60
                        ? "bg-cyan-500"
                        : "bg-rose-500"
                    }`}
                  />
                  <p className="text-xs font-extrabold text-slate-800">
                    {wellnessScore >= 80
                      ? "High Biological Equilibrium"
                      : wellnessScore >= 60
                      ? "Adaptive Physiological State"
                      : "Elevated Metabolic Strain"}
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Orbit with mouse or touch • Real-time lighting responds to biometrics
                </p>
              </div>
            </div>

            {/* Biomarker Gauge Bar inside Twin Card */}
            <div className="mt-4 rounded-2xl border border-white/90 bg-white/80 p-4 backdrop-blur-md">
              <p className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
                Biomarker Sensor Array
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <BiomarkerMini
                  label="Hydration"
                  value={`${biomarkers.cellular_hydration}%`}
                  score={biomarkers.cellular_hydration}
                />
                <BiomarkerMini
                  label="Cognitive Focus"
                  value={`${biomarkers.cognitive_focus}%`}
                  score={biomarkers.cognitive_focus}
                />
                <BiomarkerMini
                  label="Cardio Vitality"
                  value={`${biomarkers.cardiovascular_vitality}%`}
                  score={biomarkers.cardiovascular_vitality}
                />
              </div>
            </div>
          </section>

          {/* RIGHT: HABIT SIMULATOR CONTROLS */}
          <section className="flex flex-col justify-between rounded-[2.5rem] border border-white bg-white p-6 shadow-sm md:p-8">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="text-emerald-600" size={18} />
                    <h3 className="text-xl font-black text-slate-900">Habit Simulator</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Adjust parameters to see instant physiological adaptations
                  </p>
                </div>

                <button
                  onClick={resetToBaseline}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-emerald-400 hover:text-emerald-700"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Sliders Container */}
              <div className="mt-6 space-y-6">
                {/* 1. Water Intake */}
                <div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 font-bold text-slate-800">
                      <Droplets size={17} className="text-blue-500" />
                      Hydration Intake
                    </span>
                    <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg text-xs">
                      {water.toFixed(1)} L / day
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4.5"
                    step="0.1"
                    value={water}
                    onChange={(e) => {
                      setWater(Number(e.target.value));
                      setIsLiveSync(false);
                      setActiveScenario("custom");
                    }}
                    className="mt-3 w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                    <span>0.5 L</span>
                    <span>Target: 2.5 L</span>
                    <span>4.5 L</span>
                  </div>
                </div>

                {/* 2. Sleep Duration */}
                <div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 font-bold text-slate-800">
                      <Moon size={17} className="text-violet-500" />
                      Sleep Duration
                    </span>
                    <span className="font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg text-xs">
                      {sleep.toFixed(1)} hrs / night
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="12.0"
                    step="0.5"
                    value={sleep}
                    onChange={(e) => {
                      setSleep(Number(e.target.value));
                      setIsLiveSync(false);
                      setActiveScenario("custom");
                    }}
                    className="mt-3 w-full accent-violet-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                    <span>3.0 hrs</span>
                    <span>Target: 8.0 hrs</span>
                    <span>12.0 hrs</span>
                  </div>
                </div>

                {/* 3. Steps / Movement */}
                <div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 font-bold text-slate-800">
                      <Footprints size={17} className="text-orange-500" />
                      Daily Movement
                    </span>
                    <span className="font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg text-xs">
                      {steps.toLocaleString()} steps
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="20000"
                    step="500"
                    value={steps}
                    onChange={(e) => {
                      setSteps(Number(e.target.value));
                      setIsLiveSync(false);
                      setActiveScenario("custom");
                    }}
                    className="mt-3 w-full accent-orange-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                    <span>1,000</span>
                    <span>Target: 8,000</span>
                    <span>20,000</span>
                  </div>
                </div>

                {/* 4. Stress Level */}
                <div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 font-bold text-slate-800">
                      <Activity size={17} className="text-rose-500" />
                      Cognitive Stress Level
                    </span>
                    <span
                      className={`font-black px-2 py-0.5 rounded-lg text-xs ${
                        stress <= 3
                          ? "bg-emerald-50 text-emerald-700"
                          : stress <= 6
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {stress} / 10 {stress <= 3 ? "(Low)" : stress <= 6 ? "(Moderate)" : "(High)"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={stress}
                    onChange={(e) => {
                      setStress(Number(e.target.value));
                      setIsLiveSync(false);
                      setActiveScenario("custom");
                    }}
                    className="mt-3 w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                    <span>1 (Zen)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Overload)</span>
                  </div>
                </div>

                {/* 5. Caloric & Protein Targets */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Calories</span>
                      <span className="text-emerald-700">{calories} kcal</span>
                    </div>
                    <input
                      type="range"
                      min="1200"
                      max="3500"
                      step="50"
                      value={calories}
                      onChange={(e) => {
                        setCalories(Number(e.target.value));
                        setIsLiveSync(false);
                      }}
                      className="mt-2 w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Protein</span>
                      <span className="text-teal-700">{protein} g</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="160"
                      step="5"
                      value={protein}
                      onChange={(e) => {
                        setProtein(Number(e.target.value));
                        setIsLiveSync(false);
                      }}
                      className="mt-2 w-full accent-teal-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs leading-relaxed text-slate-600">
                <span className="font-bold text-slate-800">AI Twin Insight: </span>
                {aiAnalysis?.summary || "Adjusting habits recalculates physiological recovery curves."}
              </p>
            </div>
          </section>
        </div>

        {/* =========================================================
            AI DIAGNOSTIC DEEP-DIVE CARDS (4 PILLARS)
        ========================================================= */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                <Brain size={16} />
                <span>Explainable Physiological Intelligence</span>
              </div>
              <h3 className="mt-1 text-2xl font-black text-slate-900">
                AI Diagnostic Insights
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Generated from real-time metabolic formulas
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {aiAnalysis?.ai_insights?.map((insight, idx) => (
              <DiagnosticCard key={idx} insight={insight} />
            ))}
          </div>
        </section>

        {/* =========================================================
            AI PRESCRIPTIONS & ACTIONABLE MICRO-HABITS
        ========================================================= */}
        <section className="mt-10">
          <div className="rounded-[2.5rem] border border-white bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    AI Micro-Habit Prescriptions
                  </h3>
                  <p className="text-xs text-slate-400">
                    Personalized protocol to optimize your projected longevity shift
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                {aiAnalysis?.prescriptions?.length || 0} Action Items
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {aiAnalysis?.prescriptions?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-[#f9fbfa] p-4 transition-all hover:border-emerald-300"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Targeted to counteract biological wear and preserve metabolic tone.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            FOOTER NOTE
        ========================================================= */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-400">
            NutriMind AI • 3D Digital Twin Physiological Modeling Engine • Estimates are educational and simulation-based.
          </p>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   SUB-COMPONENTS
========================================================= */

function BiomarkerMini({ label, value, score }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white/90 p-2.5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-bold text-slate-500">{label}</span>
        <span className="text-xs font-black text-slate-900">{value}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-cyan-500" : "bg-rose-500"
          }`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

function DiagnosticCard({ insight }) {
  const statusColors = {
    Optimal: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Good: "bg-cyan-100 text-cyan-800 border-cyan-300",
    Moderate: "bg-amber-100 text-amber-800 border-amber-300",
    Suboptimal: "bg-orange-100 text-orange-800 border-orange-300",
    Critical: "bg-rose-100 text-rose-800 border-rose-300",
  };

  const badgeClass = statusColors[insight.status] || "bg-slate-100 text-slate-800";

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-white bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {insight.pillar}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase border ${badgeClass}`}>
            {insight.status}
          </span>
        </div>

        <h4 className="mt-3 text-sm font-black text-slate-900 leading-snug">
          {insight.title}
        </h4>

        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          {insight.analysis}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
          <Zap size={12} />
          {insight.impact}
        </span>
      </div>
    </div>
  );
}
