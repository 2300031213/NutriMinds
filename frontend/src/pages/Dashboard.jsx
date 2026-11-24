import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  Brain,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Droplets,
  HeartPulse,
  Home,
  Lightbulb,
  LogOut,
  Menu,
  Moon,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Utensils,
  X,
} from "lucide-react";

import api from "../api/axios";


function Dashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [wellness, setWellness] = useState(null);
  const [loadingWellness, setLoadingWellness] = useState(true);
  const [wellnessError, setWellnessError] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  const [wellnessHistory, setWellnessHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);


  // =========================================================
  // FETCH USER
  // =========================================================

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/auth");
        return;
      }

      try {
        const response = await api.get("/users/me");

        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);

        localStorage.removeItem("access_token");
        navigate("/auth");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [navigate]);


  // =========================================================
  // FETCH TODAY'S WELLNESS DATA
  // =========================================================

  useEffect(() => {
    const fetchWellness = async () => {
      try {
        setLoadingWellness(true);
        setWellnessError(false);

        const response = await api.get("/wellness/today");
        setWellness(response.data);

        const recommendationsResponse = await api.get(
          "/recommendations/today"
        );

        setRecommendations(
          recommendationsResponse.data?.recommendations || []
        );

        try {
          const histRes = await api.get("/wellness/history?days=7");
          setWellnessHistory(histRes.data?.history || []);
        } catch (hErr) {
          console.warn("Could not load wellness history:", hErr);
        }
      } catch (error) {
        console.error("Failed to fetch wellness data:", error);
        setWellnessError(true);
      } finally {
        setLoadingWellness(false);
        setLoadingRecommendations(false);
        setLoadingHistory(false);
      }
    };

    fetchWellness();
  }, []);


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/auth");
  };


  // =========================================================
  // PROFILE
  // =========================================================

  const openProfile = () => {
    setSidebarOpen(false);
    navigate("/profile");
  };


  // =========================================================
  // WELLNESS DATA
  // =========================================================

  const wellnessIndex = wellness?.wellness_index ?? 0;

  const nutrition = wellness?.nutrition || {};

  const lifestyle = wellness?.lifestyle || {};

  const breakdown = wellness?.breakdown || {};


  // =========================================================
  // REAL VALUES
  // =========================================================

  const calories = Number(nutrition.calories || 0);

  const protein = Number(nutrition.protein || 0);

  const carbohydrates = Number(
    nutrition.carbohydrates || 0
  );

  const fats = Number(nutrition.fats || 0);

  const water = Number(
    lifestyle.water_liters || 0
  );

  const sleep = Number(
    lifestyle.sleep_hours || 0
  );

  const steps = Number(
    lifestyle.steps || 0
  );

  const stress = Number(
    lifestyle.stress_level || 0
  );

  const mood = lifestyle.mood || "Okay";


  // =========================================================
  // PROJECT TARGETS
  // =========================================================

  const calorieTarget = 2000;

  const proteinTarget = 50;

  const carbTarget = 230;

  const fatTarget = 65;

  const waterTarget = 2.5;

  const sleepTarget = 8;

  const stepsTarget = 8000;


  // =========================================================
  // PROGRESS VALUES
  // =========================================================

  const calorieProgress = Math.min(
    (calories / calorieTarget) * 100,
    100
  );

  const proteinProgress = Math.min(
    (protein / proteinTarget) * 100,
    100
  );

  const carbProgress = Math.min(
    (carbohydrates / carbTarget) * 100,
    100
  );

  const fatProgress = Math.min(
    (fats / fatTarget) * 100,
    100
  );

  const hydrationProgress = Math.min(
    (water / waterTarget) * 100,
    100
  );

  const sleepProgress = Math.min(
    (sleep / sleepTarget) * 100,
    100
  );

  const activityProgress = Math.min(
    (steps / stepsTarget) * 100,
    100
  );


  // =========================================================
  // STATUS TEXT
  // =========================================================

  const getWellnessStatus = () => {
    if (wellnessIndex >= 80) {
      return {
        title: "Strong wellness balance",
        description:
          "Your nutrition and lifestyle indicators are showing a strong overall balance.",
      };
    }

    if (wellnessIndex >= 60) {
      return {
        title: "Room to improve",
        description:
          "Some areas are doing well while others could use more attention today.",
      };
    }

    if (wellnessIndex >= 40) {
      return {
        title: "Focus on your daily balance",
        description:
          "A few nutrition and lifestyle areas may need additional attention today.",
      };
    }

    return {
      title: "Start with small improvements",
      description:
        "Use your nutrition and lifestyle tracking to build healthier daily patterns.",
    };
  };


  const wellnessStatus = getWellnessStatus();


  // =========================================================
  // AI NUTRITION INSIGHT
  // =========================================================

  const getNutritionInsight = () => {
    if (proteinProgress < 60) {
      return "Your protein intake is currently below your project target. A protein-rich food could help increase today's intake.";
    }

    if (carbProgress < 60) {
      return "Your carbohydrate intake is currently below your project target.";
    }

    if (fatProgress > 100) {
      return "Your fat intake is currently above the project target.";
    }

    return "Your current nutrition intake is being tracked and combined with your lifestyle data.";
  };


  // =========================================================
  // RECOMMENDATION HELPERS
  // =========================================================

  const getRecommendationIcon = (priority) => {
    if (priority === "high") {
      return <AlertCircle size={19} />;
    }

    if (priority === "good") {
      return <CheckCircle2 size={19} />;
    }

    return <Lightbulb size={19} />;
  };

  const getRecommendationClasses = (priority) => {
    if (priority === "high") {
      return {
        wrapper: "border-red-100 bg-red-50/70",
        icon: "bg-white text-red-500",
        badge: "bg-red-100 text-red-700",
      };
    }

    if (priority === "good") {
      return {
        wrapper: "border-emerald-100 bg-emerald-50/70",
        icon: "bg-white text-emerald-600",
        badge: "bg-emerald-100 text-emerald-700",
      };
    }

    return {
      wrapper: "border-amber-100 bg-amber-50/70",
      icon: "bg-white text-amber-600",
      badge: "bg-amber-100 text-amber-700",
    };
  };


  // =========================================================
  // DAILY GOAL VALUES
  // =========================================================

  const nutritionGoal = Math.round(
    Number(breakdown.nutrition || 0)
  );

  const hydrationGoal = Math.round(
    hydrationProgress
  );

  const activityGoal = Math.round(
    activityProgress
  );

  const sleepGoal = Math.round(
    sleepProgress
  );


  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-900">


      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">

        <div className="flex items-center gap-3">

          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2">

            <img
              src="/nutrimind-logo.png"
              alt="NutriMind AI"
              className="h-9 w-9 rounded-xl object-cover"
            />

            <span className="font-bold">
              NutriMind AI
            </span>

          </div>

        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

      </header>


      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-72 flex-col
          border-r border-slate-200 bg-white
          transition-transform duration-300
          md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* Logo */}

        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">

          <div className="flex items-center gap-3">

            <img
              src="/nutrimind-logo.png"
              alt="NutriMind AI"
              className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-emerald-100"
            />

            <div>

              <p className="font-extrabold tracking-tight text-slate-900">
                NutriMind AI
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Personalized Wellness
              </p>

            </div>

          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 md:hidden"
          >
            <X size={20} />
          </button>

        </div>


        {/* User */}

        <div className="mx-4 mt-5 rounded-2xl bg-slate-50 p-4">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-bold text-slate-900">
                {loadingUser
                  ? "Loading..."
                  : user?.name || "User"}
              </p>

              <p className="truncate text-xs text-slate-400">
                {user?.email || "Wellness member"}
              </p>

            </div>

          </div>

        </div>


        {/* Navigation */}

        <nav className="flex-1 px-4 py-6">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Main Menu
          </p>


          <SidebarItem
            icon={<Home size={18} />}
            label="Dashboard"
            active
            onClick={() => {
              setSidebarOpen(false);
              navigate("/dashboard");
            }}
          />


          <SidebarItem
            icon={<CircleUserRound size={18} />}
            label="My Profile"
            onClick={openProfile}
          />


          <SidebarItem
            icon={<Camera size={18} />}
            label="Food Scanner"
            onClick={() => {
              setSidebarOpen(false);
              navigate("/food-scanner");
            }}
          />


          <SidebarItem
            icon={<Utensils size={18} />}
            label="Nutrition"
            onClick={() => {
              setSidebarOpen(false);
              navigate("/nutrition");
            }}
          />


          <SidebarItem
            icon={<Activity size={18} />}
            label="Lifestyle"
            onClick={() => {
              setSidebarOpen(false);
              navigate("/lifestyle");
            }}
          />


          <SidebarItem
            icon={<TrendingUp size={18} />}
            label="Trends"
            onClick={() => {
              setSidebarOpen(false);
            }}
          />


          <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Intelligence
          </p>

          <SidebarItem
            icon={<UserRound size={18} />}
            label="3D Digital Twin"
            onClick={() => {
              setSidebarOpen(false);
              navigate("/digital-twin");
            }}
          />

          <SidebarItem
            icon={<Brain size={18} />}
            label="AI Insights"
            onClick={() => {
              setSidebarOpen(false);
              navigate("/recommendations");
            }}
          />

         <SidebarItem
            icon={<Sparkles size={18} />}
            label="Recommendations"
            onClick={() => {
              setSidebarOpen(false);
              navigate("/recommendations");
            }}
          />

        </nav>


        {/* Bottom */}

        <div className="border-t border-slate-100 p-4">

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Sign Out
          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="min-h-screen md:ml-72">

        <div className="px-4 pb-10 pt-20 md:px-8 md:pt-8 lg:px-10">


          {/* =================================================
              TOP BAR
          ================================================= */}

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Your Wellness Dashboard
              </p>

              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                Good evening,{" "}
                {loadingUser
                  ? "..."
                  : user?.name || "there"}{" "}
                👋
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Here's your wellness overview for today.
              </p>

            </div>


            <div className="hidden items-center gap-3 md:flex">

              <button
                onClick={openProfile}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600"
              >
                <UserRound size={17} />
                Profile
              </button>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

            </div>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {wellnessError && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              Unable to load today's wellness data. Please refresh the page.
            </div>
          )}


          {/* =================================================
              WELLNESS SCORE
          ================================================= */}

          <section className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl md:p-8">

            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                    <Sparkles size={16} />
                  </div>

                  <p className="text-xs font-bold tracking-wider text-slate-400">
                    ADAPTIVE WELLNESS INDEX
                  </p>

                </div>


                <div className="mt-4 flex items-end gap-2">

                  <span className="text-6xl font-black tracking-tight">

                    {loadingWellness
                      ? "--"
                      : wellnessIndex.toFixed(0)}

                  </span>

                  <span className="mb-2 text-sm text-slate-500">
                    /100
                  </span>

                </div>


                <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">

                  <TrendingUp size={16} />

                  <span>
                    Today's calculated wellness score
                  </span>

                </div>

              </div>


              {/* Score Circle */}

              <div className="flex items-center gap-6">

                <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-[8px] border-emerald-500/20">

                  <div
                    className="absolute inset-1 rounded-full border-[6px] border-emerald-400 border-r-transparent border-b-transparent"
                    style={{
                      transform: `rotate(${wellnessIndex * 3.6 - 25}deg)`,
                    }}
                  />

                  <div className="text-center">

                    <p className="text-2xl font-black">

                      {loadingWellness
                        ? "--"
                        : `${wellnessIndex.toFixed(0)}%`}

                    </p>

                    <p className="mt-1 text-[9px] font-semibold tracking-wider text-slate-500">
                      WELLNESS
                    </p>

                  </div>

                </div>


                <div className="hidden sm:block">

                  <p className="text-xs font-semibold text-slate-500">
                    Today's status
                  </p>

                  <p className="mt-1 text-lg font-bold text-emerald-400">
                    {loadingWellness
                      ? "Calculating..."
                      : wellnessStatus.title}
                  </p>

                  <p className="mt-1 max-w-[180px] text-xs leading-5 text-slate-500">
                    {loadingWellness
                      ? "Combining your nutrition and lifestyle data."
                      : wellnessStatus.description}
                  </p>

                </div>

              </div>

            </div>


            {/* Progress */}

            <div className="mt-8">

              <div className="mb-2 flex justify-between text-xs">

                <span className="text-slate-500">
                  Today's wellness progress
                </span>

                <span className="font-semibold text-emerald-400">

                  {loadingWellness
                    ? "--"
                    : `${wellnessIndex.toFixed(0)}%`}

                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-700"
                  style={{
                    width: `${Math.min(wellnessIndex, 100)}%`,
                  }}
                />

              </div>

            </div>

          </section>


          {/* =================================================
              3D DIGITAL TWIN PROMO BANNER
          ================================================= */}

          <section className="mt-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 p-6 text-white shadow-xl md:p-8">
              <div className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-cyan-500/15 blur-2xl" />

              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl space-y-2.5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    <Sparkles size={13} />
                    <span>3D Physiological Simulation • Real-Time AI</span>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                    Explore Your 3D Digital Twin
                  </h2>

                  <p className="text-sm leading-relaxed text-slate-300">
                    Visualize your biometrics on an interactive 3D avatar. Simulate water, sleep, activity, and stress changes in real time to project your biological age shift, cellular recovery, and AI-predicted metabolic health.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <button
                    onClick={() => navigate("/digital-twin")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:brightness-110 active:scale-95"
                  >
                    <span>Launch 3D Twin & AI Analysis</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </section>


          {/* =================================================
              STAT CARDS
          ================================================= */}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={<Utensils size={20} />}
              title="Calories"
              value={
                loadingWellness
                  ? "--"
                  : calories.toFixed(0)
              }
              unit="kcal"
              progress={`${calorieProgress}%`}
              note={`of ${calorieTarget.toLocaleString()} target`}
              iconClass="bg-orange-50 text-orange-500"
            />


            <StatCard
              icon={<Droplets size={20} />}
              title="Hydration"
              value={
                loadingWellness
                  ? "--"
                  : water.toFixed(2)
              }
              unit="L"
              progress={`${hydrationProgress}%`}
              note={`of ${waterTarget} L target`}
              iconClass="bg-blue-50 text-blue-500"
            />


            <StatCard
              icon={<Moon size={20} />}
              title="Sleep"
              value={
                loadingWellness
                  ? "--"
                  : sleep.toFixed(1)
              }
              unit="hrs"
              progress={`${sleepProgress}%`}
              note={`of ${sleepTarget} hr target`}
              iconClass="bg-violet-50 text-violet-500"
            />


            <StatCard
              icon={<Activity size={20} />}
              title="Activity"
              value={
                loadingWellness
                  ? "--"
                  : steps >= 1000
                    ? `${(steps / 1000).toFixed(1)}k`
                    : steps.toString()
              }
              unit="steps"
              progress={`${activityProgress}%`}
              note={`of ${stepsTarget.toLocaleString()} target`}
              iconClass="bg-emerald-50 text-emerald-500"
            />

          </section>


          {/* =================================================
              LOWER GRID
          ================================================= */}

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">


            {/* Nutrition Overview */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Today's nutrition
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Nutrition Overview
                  </h2>

                </div>

                <button
                  onClick={() => navigate("/nutrition")}
                  className="flex items-center gap-1 text-sm font-semibold text-emerald-600"
                >
                  Details
                  <ChevronRight size={16} />
                </button>

              </div>


              <div className="mt-7 grid gap-5 sm:grid-cols-3">

                <NutritionBar
                  label="Protein"
                  value={`${protein.toFixed(1)}g`}
                  target={`${proteinTarget}g`}
                  percentage={proteinProgress}
                />


                <NutritionBar
                  label="Carbs"
                  value={`${carbohydrates.toFixed(1)}g`}
                  target={`${carbTarget}g`}
                  percentage={carbProgress}
                />


                <NutritionBar
                  label="Fats"
                  value={`${fats.toFixed(1)}g`}
                  target={`${fatTarget}g`}
                  percentage={fatProgress}
                />

              </div>


              <div className="mt-7 rounded-2xl bg-emerald-50 p-4">

                <div className="flex gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                    <Brain size={19} />
                  </div>

                  <div>

                    <div className="flex items-center gap-2">

                      <p className="text-sm font-bold text-slate-900">
                        AI Nutrition Insight
                      </p>

                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                        PERSONALIZED
                      </span>

                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {loadingWellness
                        ? "Analyzing today's nutrition data..."
                        : getNutritionInsight()}
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* Daily Goals */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Target size={20} />
                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Daily goals
                  </p>

                  <h2 className="text-xl font-bold text-slate-900">
                    Your Progress
                  </h2>

                </div>

              </div>


              <div className="mt-6 space-y-5">

                <GoalRow
                  label="Nutrition"
                  value={
                    loadingWellness
                      ? "--"
                      : `${nutritionGoal}%`
                  }
                  percentage={nutritionGoal}
                />


                <GoalRow
                  label="Hydration"
                  value={
                    loadingWellness
                      ? "--"
                      : `${hydrationGoal}%`
                  }
                  percentage={hydrationGoal}
                />


                <GoalRow
                  label="Activity"
                  value={
                    loadingWellness
                      ? "--"
                      : `${activityGoal}%`
                  }
                  percentage={activityGoal}
                />


                <GoalRow
                  label="Sleep"
                  value={
                    loadingWellness
                      ? "--"
                      : `${sleepGoal}%`
                  }
                  percentage={sleepGoal}
                />

              </div>


              <button
                onClick={openProfile}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Update Wellness Profile
                <ArrowRight size={16} />
              </button>

            </div>

          </section>


          {/* =================================================
              PERSONALIZED RECOMMENDATIONS
          ================================================= */}

          <section id="recommendations" className="mt-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Sparkles size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      AI Wellness Intelligence
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      Personalized Recommendations
                    </h2>
                  </div>

                </div>

                <span className="w-fit rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                  Based on today's data
                </span>

              </div>

              {loadingRecommendations ? (
                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                  Analyzing your nutrition and lifestyle data...
                </div>
              ) : recommendations.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
                  No recommendations are available yet. Add today's nutrition or lifestyle data to generate personalized insights.
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {recommendations.map((recommendation, index) => {
                    const classes = getRecommendationClasses(
                      recommendation.priority
                    );

                    return (
                      <RecommendationCard
                        key={`${recommendation.type}-${index}`}
                        icon={getRecommendationIcon(recommendation.priority)}
                        title={recommendation.title}
                        message={recommendation.message}
                        priority={recommendation.priority}
                        className={classes.wrapper}
                        iconClass={classes.icon}
                        badgeClass={classes.badge}
                      />
                    );
                  })}
                </div>
              )}

            </div>
          </section>


          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="mt-6">

            <div className="mb-4">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Quick Actions
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Continue your wellness journey
              </h2>

            </div>


            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

              <QuickAction
                icon={<UserRound size={21} />}
                title="3D Digital Twin"
                description="Simulate biometrics & AI twin"
                className="bg-teal-50 text-teal-600"
                onClick={() => navigate("/digital-twin")}
              />

              <QuickAction
                icon={<Camera size={21} />}
                title="Scan a Meal"
                description="Analyze your food with AI"
                className="bg-emerald-50 text-emerald-600"
                onClick={() => navigate("/food-scanner")}
              />

              <QuickAction
                icon={<Droplets size={21} />}
                title="Log Water"
                description="Track today's hydration"
                className="bg-blue-50 text-blue-600"
                onClick={() => navigate("/lifestyle")}
              />

              <QuickAction
                icon={<Activity size={21} />}
                title="Log Activity"
                description="Record your movement"
                className="bg-orange-50 text-orange-600"
                onClick={() => navigate("/lifestyle")}
              />

              <QuickAction
                icon={<HeartPulse size={21} />}
                title="AI Insights"
                description="Understand your wellness"
                className="bg-violet-50 text-violet-600"
                onClick={() => navigate("/recommendations")}
              />

            </div>

          </section>

          {/* =================================================
              7-DAY WELLNESS & HABIT TRAJECTORY
          ================================================= */}

          {wellnessHistory.length > 0 && (
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      7-Day Wellness Trajectory
                    </h3>
                    <p className="text-xs text-slate-400">
                      Weekly physiological momentum across nutrition & habits
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                  Past 7 Days
                </span>
              </div>

              <div className="mt-6 grid grid-cols-7 gap-2 sm:gap-4">
                {wellnessHistory.map((day, idx) => {
                  const score = day.wellness_index || 0;
                  const isToday = idx === wellnessHistory.length - 1;
                  return (
                    <div
                      key={day.date}
                      className={`flex flex-col items-center rounded-2xl p-3 text-center transition ${
                        isToday
                          ? "border border-emerald-300 bg-emerald-50/60 font-semibold"
                          : "border border-slate-100 bg-slate-50/60"
                      }`}
                    >
                      <span className="text-[11px] font-bold uppercase text-slate-400">
                        {day.day}
                      </span>
                      <div className="my-3 flex h-24 w-4 items-end rounded-full bg-slate-200">
                        <div
                          className="w-full rounded-full bg-gradient-to-t from-emerald-500 to-teal-400 transition-all duration-500"
                          style={{ height: `${Math.max(10, Math.min(score, 100))}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-800">
                        {score > 0 ? `${Math.round(score)}%` : "--"}
                      </span>
                      <span className="mt-1 text-[9px] text-slate-400">
                        {day.steps > 0 ? `${(day.steps / 1000).toFixed(1)}k` : "0"} st
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}


          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="mt-10 border-t border-slate-200 pt-6 text-center">

            <p className="text-xs text-slate-400">
              NutriMind AI • Personalized Nutrition & Wellness Intelligence
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}


/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3
        text-sm font-semibold transition
        ${
          active
            ? "bg-emerald-50 text-emerald-700"
            : "text-slate-500 hover:bg-slate-50 hover:text-emerald-600"
        }
      `}
    >
      {icon}

      <span>{label}</span>

      {active && (
        <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
      )}
    </button>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  title,
  value,
  unit,
  progress,
  note,
  iconClass,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div className={`rounded-xl p-2.5 ${iconClass}`}>
          {icon}
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Today
        </span>

      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <div className="mt-1 flex items-baseline gap-1">

        <span className="text-2xl font-black text-slate-900">
          {value}
        </span>

        <span className="text-xs font-medium text-slate-400">
          {unit}
        </span>

      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{
            width: progress,
          }}
        />

      </div>

      <p className="mt-2 text-[10px] text-slate-400">
        {note}
      </p>

    </div>
  );
}


/* =========================================================
   NUTRITION BAR
========================================================= */

function NutritionBar({
  label,
  value,
  target,
  percentage,
}) {
  return (
    <div>

      <div className="flex items-center justify-between">

        <span className="text-sm font-semibold text-slate-700">
          {label}
        </span>

        <span className="text-xs text-slate-400">
          {value} / {target}
        </span>

      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />

      </div>

      <p className="mt-2 text-[10px] text-slate-400">
        {percentage.toFixed(0)}% of target
      </p>

    </div>
  );
}


/* =========================================================
   GOAL ROW
========================================================= */

function GoalRow({
  label,
  value,
  percentage,
}) {
  return (
    <div>

      <div className="flex items-center justify-between">

        <span className="text-sm font-semibold text-slate-700">
          {label}
        </span>

        <span className="text-xs font-semibold text-slate-400">
          {value}
        </span>

      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />

      </div>

    </div>
  );
}


/* =========================================================
   RECOMMENDATION CARD
========================================================= */

function RecommendationCard({
  icon,
  title,
  message,
  priority,
  className,
  iconClass,
  badgeClass,
}) {
  const priorityLabel =
    priority === "high"
      ? "Needs attention"
      : priority === "good"
        ? "On track"
        : "Keep improving";

  return (
    <div className={`rounded-2xl border p-4 ${className}`}>
      <div className="flex items-start gap-3">

        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${iconClass}`}>
          {icon}
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="text-sm font-bold text-slate-900">
              {title}
            </h3>

            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${badgeClass}`}>
              {priorityLabel}
            </span>

          </div>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            {message}
          </p>

        </div>

      </div>
    </div>
  );
}


/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon,
  title,
  description,
  className,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
    >

      <div className={`rounded-xl p-3 ${className}`}>
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-sm font-bold text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>

      </div>

      <ChevronRight
        size={17}
        className="ml-auto shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-500"
      />

    </button>
  );
}


export default Dashboard;