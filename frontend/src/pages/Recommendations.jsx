import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Award,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Droplets,
  Flame,
  HeartPulse,
  LineChart,
  Moon,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Utensils,
} from "lucide-react";

import api from "../api/axios";

function Recommendations() {
  const navigate = useNavigate();

  // Active view tab: "today" | "weekly" | "monthly"
  const [activeTab, setActiveTab] = useState("today");

  // Today's Recommendations data
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingToday, setLoadingToday] = useState(true);
  const [errorToday, setErrorToday] = useState(false);

  // Weekly & Monthly History data
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState(false);

  // Filter for monthly log table
  const [monthlyFilter, setMonthlyFilter] = useState("all"); // "all" | "optimal" | "attention"

  useEffect(() => {
    fetchRecommendations();
    fetchHistoryData();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoadingToday(true);
      setErrorToday(false);
      const response = await api.get("/recommendations/today");
      setRecommendations(response.data.recommendations || []);
      setSummary(response.data.summary || null);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      setErrorToday(true);
    } finally {
      setLoadingToday(false);
    }
  };

  const fetchHistoryData = async () => {
    try {
      setLoadingHistory(true);
      setErrorHistory(false);

      // Fetch 7-day and 30-day history in parallel
      const [res7, res30] = await Promise.all([
        api.get("/wellness/history?days=7"),
        api.get("/wellness/history?days=30"),
      ]);

      setWeeklyData(res7.data);
      setMonthlyData(res30.data);
    } catch (err) {
      console.error("Failed to fetch history data:", err);
      setErrorHistory(true);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "nutrition":
        return <Utensils size={22} />;
      case "hydration":
        return <Droplets size={22} />;
      case "sleep":
        return <Moon size={22} />;
      case "activity":
        return <Activity size={22} />;
      case "stress":
        return <HeartPulse size={22} />;
      default:
        return <Sparkles size={22} />;
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "high":
        return {
          container: "border-red-200 bg-red-50/70",
          icon: "bg-red-100 text-red-600",
          badge: "bg-red-100 text-red-700",
          label: "Needs attention",
        };
      case "medium":
        return {
          container: "border-amber-200 bg-amber-50/70",
          icon: "bg-amber-100 text-amber-600",
          badge: "bg-amber-100 text-amber-700",
          label: "Keep improving",
        };
      case "good":
        return {
          container: "border-emerald-200 bg-emerald-50/70",
          icon: "bg-emerald-100 text-emerald-600",
          badge: "bg-emerald-100 text-emerald-700",
          label: "On track",
        };
      default:
        return {
          container: "border-slate-200 bg-white",
          icon: "bg-slate-100 text-slate-600",
          badge: "bg-slate-100 text-slate-600",
          label: "Recommendation",
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 backdrop-blur-md bg-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-emerald-600"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2">
            <img
              src="/nutrimind-logo.png"
              alt="NutriMind AI"
              className="h-9 w-9 rounded-xl object-cover shadow-sm"
            />
            <span className="font-bold">NutriMind AI</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        {/* Page Heading */}
        <section>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Sparkles size={20} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  AI Wellness &amp; Nutrition Intelligence
                </p>
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                Insights &amp; Progress Analytics
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Real-time recommendations, 7-day trajectory tracking, and 30-day comprehensive logs
                powered by your personalized biometric targets.
              </p>
            </div>

            <button
              onClick={() => {
                fetchRecommendations();
                fetchHistoryData();
              }}
              disabled={loadingToday || loadingHistory}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loadingToday || loadingHistory ? "animate-spin text-emerald-600" : ""}
              />
              Refresh Data
            </button>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="mt-8 flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto">
          <TabButton
            active={activeTab === "today"}
            onClick={() => setActiveTab("today")}
            icon={<Sparkles size={16} />}
            label="Today's Insights"
            badge={recommendations.length > 0 ? recommendations.length : null}
          />
          <TabButton
            active={activeTab === "weekly"}
            onClick={() => setActiveTab("weekly")}
            icon={<TrendingUp size={16} />}
            label="Weekly Tracking (7 Days)"
          />
          <TabButton
            active={activeTab === "monthly"}
            onClick={() => setActiveTab("monthly")}
            icon={<Calendar size={16} />}
            label="Monthly Log (30 Days)"
          />
        </div>

        {/* ====================================================
            TAB 1: TODAY'S INSIGHTS
        ==================================================== */}
        {activeTab === "today" && (
          <div className="mt-6 space-y-8">
            {errorToday && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-bold text-red-700">Unable to load recommendations</p>
                  <p className="mt-1 text-xs text-red-600">
                    Please ensure the backend is connected and try refreshing.
                  </p>
                </div>
              </div>
            )}

            {/* Today Summary Cards */}
            {summary && !loadingToday && (
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <SummaryCard
                  icon={<Utensils size={18} />}
                  label="Protein"
                  value={`${Number(summary.protein || 0).toFixed(1)}g`}
                  className="bg-emerald-50 text-emerald-600"
                />
                <SummaryCard
                  icon={<Droplets size={18} />}
                  label="Water"
                  value={`${Number(summary.water_liters || 0).toFixed(2)}L`}
                  className="bg-blue-50 text-blue-600"
                />
                <SummaryCard
                  icon={<Moon size={18} />}
                  label="Sleep"
                  value={`${Number(summary.sleep_hours || 0).toFixed(1)}h`}
                  className="bg-violet-50 text-violet-600"
                />
                <SummaryCard
                  icon={<Activity size={18} />}
                  label="Steps"
                  value={
                    Number(summary.steps || 0) >= 1000
                      ? `${(Number(summary.steps || 0) / 1000).toFixed(1)}k`
                      : String(summary.steps || 0)
                  }
                  className="bg-orange-50 text-orange-600"
                />
                <SummaryCard
                  icon={<HeartPulse size={18} />}
                  label="Stress"
                  value={`${Number(summary.stress_level || 0)}/10`}
                  className="bg-pink-50 text-pink-600"
                />
              </section>
            )}

            {/* Today Recommendations List */}
            <section>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Target-Driven Guidance
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">What NutriMind Recommends</h2>
              </div>

              {loadingToday ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-2/3 rounded bg-slate-100" />
                          <div className="h-3 w-full rounded bg-slate-100" />
                          <div className="h-3 w-4/5 rounded bg-slate-100" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">You're doing great today!</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Your nutrition, hydration, and activity are tracking well against your personalized
                    targets. Keep up the good work!
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {recommendations.map((recommendation, index) => {
                    const styles = getPriorityStyles(recommendation.priority);
                    return (
                      <div
                        key={`${recommendation.type}-${index}`}
                        className={`rounded-3xl border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${styles.container}`}
                      >
                        <div className="flex gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}
                          >
                            {getIcon(recommendation.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900">
                                {recommendation.title}
                              </h3>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles.badge}`}
                              >
                                {styles.label}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {recommendation.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ====================================================
            TAB 2: WEEKLY TRACKING (7 DAYS)
        ==================================================== */}
        {activeTab === "weekly" && (
          <div className="mt-6 space-y-8">
            {errorHistory && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Unable to load 7-day tracking data. Please refresh to try again.
              </div>
            )}

            {/* Weekly Target Attainment & Summary */}
            {weeklyData?.stats && (
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <WeeklyMetricCard
                  title="Daily Calorie Average"
                  value={`${weeklyData.stats.avg_calories} kcal`}
                  target={`${weeklyData.targets?.calories || 2000} kcal goal`}
                  sub="Calorie balance"
                  icon={<Flame size={20} className="text-orange-500" />}
                />
                <WeeklyMetricCard
                  title="Daily Protein Average"
                  value={`${weeklyData.stats.avg_protein} g`}
                  target={`${weeklyData.targets?.protein || 80} g goal`}
                  sub="Muscle & recovery"
                  icon={<Utensils size={20} className="text-emerald-500" />}
                />
                <WeeklyMetricCard
                  title="Total 7-Day Water"
                  value={`${weeklyData.stats.total_water} L`}
                  target={`Avg ${weeklyData.stats.avg_water} L / day`}
                  sub="Hydration track"
                  icon={<Droplets size={20} className="text-blue-500" />}
                />
                <WeeklyMetricCard
                  title="Total 7-Day Steps"
                  value={`${Number(weeklyData.stats.total_steps).toLocaleString()}`}
                  target={`Avg ${Number(weeklyData.stats.avg_steps).toLocaleString()} / day`}
                  sub="Cardio & movement"
                  icon={<Activity size={20} className="text-violet-500" />}
                />
              </section>
            )}

            {/* 7-Day Trajectory Charts */}
            <section className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      7-Day Calorie &amp; Protein Trajectory
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tracking daily intake vs personalized nutrition target
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <span className="h-3 w-3 rounded-full bg-emerald-500" />
                      Calories
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <span className="h-3 w-3 rounded-full bg-blue-500" />
                      Protein
                    </span>
                  </div>
                </div>

                {/* Day-by-day bar rows */}
                <div className="mt-6 space-y-4">
                  {(weeklyData?.history || []).map((dayItem) => {
                    const cals = dayItem.nutrition?.calories || 0;
                    const protein = dayItem.nutrition?.protein || 0;
                    const calTarget = weeklyData?.targets?.calories || 2000;
                    const protTarget = weeklyData?.targets?.protein || 80;

                    const calPct = Math.min(100, Math.round((cals / calTarget) * 100));
                    const protPct = Math.min(100, Math.round((protein / protTarget) * 100));

                    return (
                      <div key={dayItem.date} className="rounded-2xl bg-slate-50 p-3.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-800">
                            {dayItem.day}, {dayItem.date.slice(5)}
                          </span>
                          <span className="text-slate-500">
                            {cals} / {calTarget} kcal ({calPct}%) · {protein}g / {protTarget}g protein
                          </span>
                        </div>

                        {/* Dual progress bars */}
                        <div className="mt-2.5 space-y-1.5">
                          <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                            <div
                              style={{ width: `${calPct}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                            />
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                            <div
                              style={{ width: `${protPct}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hydration & Steps Tracking */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <Droplets size={18} className="text-blue-500" />
                    <h4 className="text-sm font-extrabold text-slate-900">Hydration (Liters / Day)</h4>
                  </div>
                  <div className="mt-4 space-y-3">
                    {(weeklyData?.history || []).map((d) => {
                      const water = d.lifestyle?.water_liters || 0;
                      const target = weeklyData?.targets?.hydration || 2.5;
                      const pct = Math.min(100, Math.round((water / target) * 100));
                      return (
                        <div key={d.date} className="flex items-center gap-3 text-xs">
                          <span className="w-12 font-bold text-slate-600">{d.day}</span>
                          <div className="h-2.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full rounded-full bg-blue-500"
                            />
                          </div>
                          <span className="w-16 text-right font-bold text-slate-800">
                            {water.toFixed(1)} L
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <Activity size={18} className="text-orange-500" />
                    <h4 className="text-sm font-extrabold text-slate-900">Activity (Steps / Day)</h4>
                  </div>
                  <div className="mt-4 space-y-3">
                    {(weeklyData?.history || []).map((d) => {
                      const steps = d.lifestyle?.steps || 0;
                      const target = weeklyData?.targets?.activity || 8000;
                      const pct = Math.min(100, Math.round((steps / target) * 100));
                      return (
                        <div key={d.date} className="flex items-center gap-3 text-xs">
                          <span className="w-12 font-bold text-slate-600">{d.day}</span>
                          <div className="h-2.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full rounded-full bg-orange-500"
                            />
                          </div>
                          <span className="w-16 text-right font-bold text-slate-800">
                            {steps.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ====================================================
            TAB 3: MONTHLY LOG (30 DAYS)
        ==================================================== */}
        {activeTab === "monthly" && (
          <div className="mt-6 space-y-8">
            {/* 30-Day Aggregate Cards */}
            {monthlyData?.stats && (
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Monthly Steps Total
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {Number(monthlyData.stats.total_steps).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-emerald-600">
                    ~{roundVal(Number(monthlyData.stats.total_steps) * 0.0008, 1)} km total distance
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Monthly Water Logged
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {monthlyData.stats.total_water} L
                  </p>
                  <p className="mt-1 text-xs text-blue-600">
                    Avg {monthlyData.stats.avg_water} Liters / day
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Average Sleep Duration
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {monthlyData.stats.avg_sleep} hrs
                  </p>
                  <p className="mt-1 text-xs text-violet-600">
                    {monthlyData.stats.avg_sleep >= 7 ? "Optimal recovery range" : "Below recommended 7-8h"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Daily Calorie Average
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {monthlyData.stats.avg_calories} kcal
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Target: {monthlyData.targets?.calories || 2000} kcal
                  </p>
                </div>
              </section>
            )}

            {/* 30-Day Detailed Timeline Table */}
            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-950">30-Day Comprehensive Wellness Log</h3>
                  <p className="text-xs text-slate-400">Chronological history of nutrition and biometric logs</p>
                </div>

                {/* Status filter buttons */}
                <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 text-xs font-bold">
                  <button
                    onClick={() => setMonthlyFilter("all")}
                    className={`rounded-lg px-3 py-1.5 transition ${
                      monthlyFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    All Days
                  </button>
                  <button
                    onClick={() => setMonthlyFilter("optimal")}
                    className={`rounded-lg px-3 py-1.5 transition ${
                      monthlyFilter === "optimal" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    Optimal
                  </button>
                  <button
                    onClick={() => setMonthlyFilter("attention")}
                    className={`rounded-lg px-3 py-1.5 transition ${
                      monthlyFilter === "attention" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    Needs Attention
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="py-3.5 pl-6 pr-3">Date</th>
                      <th className="px-3 py-3.5">Status</th>
                      <th className="px-3 py-3.5">Calories</th>
                      <th className="px-3 py-3.5">Protein</th>
                      <th className="px-3 py-3.5">Water</th>
                      <th className="px-3 py-3.5">Steps</th>
                      <th className="px-3 py-3.5">Sleep</th>
                      <th className="py-3.5 pl-3 pr-6 text-right">Stress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {(monthlyData?.history || [])
                      .filter((row) => {
                        const hasWater = (row.lifestyle?.water_liters || 0) >= 1.5;
                        const hasSleep = (row.lifestyle?.sleep_hours || 0) >= 6.5;
                        const hasCals = (row.nutrition?.calories || 0) > 0;
                        const isOptimal = hasWater && hasSleep && hasCals;

                        if (monthlyFilter === "optimal") return isOptimal;
                        if (monthlyFilter === "attention") return !isOptimal;
                        return true;
                      })
                      .map((row) => {
                        const cals = row.nutrition?.calories || 0;
                        const protein = row.nutrition?.protein || 0;
                        const water = row.lifestyle?.water_liters || 0;
                        const steps = row.lifestyle?.steps || 0;
                        const sleep = row.lifestyle?.sleep_hours || 0;
                        const stress = row.lifestyle?.stress_level || 0;

                        const isOptimal = water >= 1.5 && sleep >= 6.5 && cals > 0;

                        return (
                          <tr key={row.date} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 pl-6 pr-3 font-bold text-slate-900">
                              {row.date} <span className="font-normal text-slate-400">({row.day})</span>
                            </td>
                            <td className="px-3 py-3.5">
                              {isOptimal ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                  <CheckCircle2 size={11} />
                                  Optimal
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                                  Attention
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3.5 font-semibold">
                              {cals > 0 ? `${cals} kcal` : "--"}
                            </td>
                            <td className="px-3 py-3.5 font-semibold">
                              {protein > 0 ? `${protein}g` : "--"}
                            </td>
                            <td className="px-3 py-3.5 font-semibold">
                              {water > 0 ? `${water.toFixed(1)} L` : "--"}
                            </td>
                            <td className="px-3 py-3.5 font-semibold">
                              {steps > 0 ? steps.toLocaleString() : "--"}
                            </td>
                            <td className="px-3 py-3.5 font-semibold">
                              {sleep > 0 ? `${sleep} hrs` : "--"}
                            </td>
                            <td className="py-3.5 pl-3 pr-6 text-right font-bold text-slate-900">
                              {stress > 0 ? `${stress}/10` : "--"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* Footer info banner */}
        <section className="mt-10 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Brain size={18} className="text-emerald-400" />
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Continuous AI Adaptation
                </p>
              </div>
              <h2 className="mt-3 text-xl font-bold">Dynamic Biometric Targets &amp; Digital Twin</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                NutriMind uses the Mifflin-St Jeor equation and your real lifestyle logs to dynamically
                re-calibrate daily calorie and protein goals without manual recalculation.
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-400"
            >
              View Full Dashboard
              <ChevronRight size={17} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition whitespace-nowrap ${
        active
          ? "border-emerald-600 text-emerald-600"
          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge !== null && badge !== undefined && (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
          {badge}
        </span>
      )}
    </button>
  );
}

function SummaryCard({ icon, label, value, className }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${className}`}>
        {icon}
      </div>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function WeeklyMetricCard({ title, value, target, sub, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <div className="rounded-xl bg-slate-50 p-2">{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-black text-slate-900">{value}</p>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-emerald-600">{target}</span>
        <span className="text-slate-400">{sub}</span>
      </div>
    </div>
  );
}

function roundVal(num, dec = 1) {
  if (num === null || num === undefined) return 0;
  return Number(Number(num).toFixed(dec));
}

export default Recommendations;
