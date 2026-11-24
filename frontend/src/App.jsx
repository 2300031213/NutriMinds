import {
  ArrowRight,
  Brain,
  Camera,
  Check,
  ChevronRight,
  Droplets,
  HeartPulse,
  Moon,
  Play,
  Sparkles,
  Target,
  UserRound,
  Utensils,
  Zap,
} from "lucide-react";

import { lazy, Suspense } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile";
import Nutrition from "./pages/Nutrition";
import FoodScanner from "./pages/FoodScanner";
import Lifestyle from "./pages/Lifestyle";
import Recommendations from "./pages/Recommendations";

const DigitalTwin = lazy(() => import("./pages/DigitalTwin.jsx"));

/* =========================================================
   LANDING PAGE
========================================================= */

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-[#f8faf9] text-slate-900">

      {/* ================= NAVBAR ================= */}

      <header className="fixed left-0 right-0 top-0 z-50">
        <nav className="mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-5 py-3 shadow-lg shadow-slate-200/30 backdrop-blur-xl md:px-6">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-200">
              <Brain size={21} />
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-tight">
                NutriMind
              </h1>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                AI Wellness
              </p>
            </div>
          </div>


          <div className="hidden items-center gap-8 md:flex">

            <a
              href="#features"
              className="text-sm font-medium text-slate-500 transition hover:text-emerald-600"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-500 transition hover:text-emerald-600"
            >
              How it works
            </a>

            <a
              href="#ai"
              className="text-sm font-medium text-slate-500 transition hover:text-emerald-600"
            >
              AI Intelligence
            </a>

            <button
              onClick={() => navigate("/digital-twin")}
              className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              3D Digital Twin
            </button>

          </div>


          <button
            onClick={() => navigate("/auth")}
            className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600"
          >
            Get Started
          </button>

        </nav>
      </header>


      {/* ================= HERO ================= */}

      <main>

        <section className="relative min-h-screen pt-32">

          <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-200/30 blur-[120px]" />

          <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-teal-100/50 blur-[100px]" />


          <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 lg:pb-28">

            <div className="grid items-center gap-16 lg:grid-cols-[1fr_0.95fr]">


              {/* HERO COPY */}

              <div>

                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm">
                  <Sparkles size={14} />
                  INTELLIGENT WELLNESS • POWERED BY AI
                </div>


                <h2 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.04em] text-slate-950 md:text-6xl lg:text-7xl">

                  Your health,
                  <br />

                  <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                    understood by AI.
                  </span>

                </h2>


                <p className="mt-7 max-w-xl text-lg leading-8 text-slate-500">
                  NutriMind transforms your meals, lifestyle, and daily habits
                  into personalized wellness intelligence you can actually
                  understand and use.
                </p>


                <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                  <button
                    onClick={() => navigate("/auth")}
                    className="group flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-emerald-600"
                  >
                    Start your journey

                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-1"
                    />
                  </button>


                  <button className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600">
                    <Play size={15} fill="currentColor" />
                    See how it works
                  </button>

                </div>


                {/* Trust points */}

                <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-500">

                  <span className="flex items-center gap-2">
                    <Check size={15} className="text-emerald-500" />
                    Personalized insights
                  </span>

                  <span className="flex items-center gap-2">
                    <Check size={15} className="text-emerald-500" />
                    Explainable AI
                  </span>

                  <span className="flex items-center gap-2">
                    <Check size={15} className="text-emerald-500" />
                    Wellness tracking
                  </span>

                </div>

              </div>


              {/* DASHBOARD PREVIEW */}

              <div className="relative">

                <div className="absolute -left-7 top-12 z-10 hidden rounded-2xl border border-white bg-white/90 p-3 shadow-xl backdrop-blur-md sm:block">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                      <Camera size={18} />
                    </div>

                    <div>
                      <p className="text-[10px] font-medium text-slate-400">
                        AI FOOD SCANNER
                      </p>

                      <p className="text-xs font-bold text-slate-800">
                        Meal analyzed
                      </p>
                    </div>

                  </div>

                </div>


                {/* Main dashboard */}

                <div className="relative rounded-[2rem] border border-white bg-white/90 p-4 shadow-[0_30px_80px_-25px_rgba(15,23,42,0.25)] backdrop-blur-xl sm:p-5">


                  {/* Dashboard header */}

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">

                    <div className="flex items-center gap-3">

                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600" />

                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          NutriMind Dashboard
                        </p>

                        <p className="text-[10px] text-slate-400">
                          Sunday, September 20
                        </p>
                      </div>

                    </div>


                    <div className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-700">
                      TODAY
                    </div>

                  </div>


                  {/* Wellness card */}

                  <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-5 text-white">

                    <div className="flex items-start justify-between">

                      <div>

                        <div className="flex items-center gap-2">

                          <Sparkles
                            size={15}
                            className="text-emerald-400"
                          />

                          <p className="text-xs font-semibold text-slate-400">
                            ADAPTIVE WELLNESS INDEX
                          </p>

                        </div>


                        <div className="mt-3 flex items-end gap-2">

                          <span className="text-5xl font-black">
                            82
                          </span>

                          <span className="mb-2 text-sm text-slate-500">
                            /100
                          </span>

                        </div>


                        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">

                          <Zap size={13} />

                          +6% from last week

                        </div>

                      </div>


                      {/* Score ring */}

                      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-[7px] border-emerald-500/20">

                        <div className="absolute inset-1 rotate-[-25deg] rounded-full border-[5px] border-emerald-400 border-b-transparent border-r-transparent" />

                        <div className="text-center">

                          <p className="text-lg font-black">
                            82%
                          </p>

                          <p className="text-[8px] text-slate-500">
                            WELLNESS
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* Progress */}

                    <div className="mt-5">

                      <div className="mb-2 flex justify-between text-[10px] text-slate-500">

                        <span>Weekly progress</span>
                        <span>Excellent</span>

                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">

                        <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-300" />

                      </div>

                    </div>

                  </div>


                  {/* Stats */}

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <MiniStat
                      icon={<Utensils size={17} />}
                      label="Calories"
                      value="1,420"
                      suffix="kcal"
                      bg="bg-orange-50"
                      iconBg="bg-orange-100"
                      iconColor="text-orange-500"
                    />

                    <MiniStat
                      icon={<Droplets size={17} />}
                      label="Hydration"
                      value="1.8"
                      suffix="L"
                      bg="bg-blue-50"
                      iconBg="bg-blue-100"
                      iconColor="text-blue-500"
                    />

                    <MiniStat
                      icon={<Moon size={17} />}
                      label="Sleep"
                      value="7.2"
                      suffix="hrs"
                      bg="bg-violet-50"
                      iconBg="bg-violet-100"
                      iconColor="text-violet-500"
                    />

                    <MiniStat
                      icon={<HeartPulse size={17} />}
                      label="Activity"
                      value="6.4k"
                      suffix="steps"
                      bg="bg-emerald-50"
                      iconBg="bg-emerald-100"
                      iconColor="text-emerald-500"
                    />

                  </div>


                  {/* AI insight */}

                  <div className="mt-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-4">

                    <div className="flex gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                        <Brain size={17} />
                      </div>

                      <div>

                        <div className="flex items-center gap-2">

                          <p className="text-xs font-bold text-slate-900">
                            AI Insight
                          </p>

                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-bold text-emerald-700">
                            PERSONALIZED
                          </span>

                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Your protein intake is slightly below today's target.
                          Consider a protein-rich snack with your next meal.
                        </p>

                      </div>

                    </div>

                  </div>

                </div>


                {/* Floating goal card */}

                <div className="absolute -bottom-7 -right-6 hidden rounded-2xl border border-white bg-white p-3 shadow-2xl sm:block">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Target size={18} />
                    </div>

                    <div>

                      <p className="text-[9px] font-medium text-slate-400">
                        DAILY GOAL
                      </p>

                      <p className="text-xs font-bold text-slate-900">
                        4 of 6 completed
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ================= SOCIAL PROOF ================= */}

        <section className="border-y border-slate-200/70 bg-white">

          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-5 px-6 py-7 text-xs font-semibold uppercase tracking-widest text-slate-400">

            <span>Nutrition Intelligence</span>
            <span>•</span>
            <span>Explainable AI</span>
            <span>•</span>
            <span>Personal Wellness</span>
            <span>•</span>
            <span>Smart Recommendations</span>

          </div>

        </section>


        {/* ================= FEATURES ================= */}

        <section id="features" className="bg-white py-28">

          <div className="mx-auto max-w-7xl px-6">

            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">

              <div>

                <div className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  One intelligent ecosystem
                </div>

                <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">

                  Everything your

                  <span className="block text-emerald-600">
                    wellness needs.
                  </span>

                </h2>

                <p className="mt-5 max-w-md leading-7 text-slate-500">
                  From recognizing what's on your plate to understanding your
                  daily lifestyle patterns, NutriMind brings your wellness
                  data together.
                </p>

                <button className="mt-7 flex items-center gap-2 text-sm font-bold text-emerald-600">
                  Explore the platform
                  <ChevronRight size={17} />
                </button>

              </div>


              <div className="grid gap-4 sm:grid-cols-2">

                <FeatureCard
                  icon={<Camera />}
                  title="AI Food Recognition"
                  description="Capture a meal and let AI identify food items and estimate nutritional values."
                  number="01"
                />

                <FeatureCard
                  icon={<Utensils />}
                  title="Nutrition Intelligence"
                  description="Understand calories, protein, carbohydrates, fats, fiber, vitamins and minerals."
                  number="02"
                />

                <FeatureCard
                  icon={<HeartPulse />}
                  title="Wellness Intelligence"
                  description="Connect nutrition, hydration, activity, sleep and stress into one picture."
                  number="03"
                />

                <FeatureCard
                  icon={<Brain />}
                  title="Explainable AI"
                  description="See the reasoning behind your personalized recommendations and insights."
                  number="04"
                />

                <FeatureCard
                  icon={<UserRound />}
                  title="3D Digital Twin"
                  description="Interactive physiological avatar modeling biological age shift, cellular recovery, and what-if lifestyle habits."
                  number="05"
                />

              </div>

            </div>

          </div>

        </section>


        {/* ================= AI SECTION ================= */}

        <section
          id="ai"
          className="relative overflow-hidden bg-slate-950 py-28 text-white"
        >

          <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

          <div className="relative mx-auto max-w-7xl px-6">

            <div className="mx-auto max-w-2xl text-center">

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400">

                <Sparkles size={14} />

                INTELLIGENCE THAT EXPLAINS ITSELF

              </div>


              <h2 className="mt-6 text-4xl font-black tracking-tight md:text-5xl">

                Your data becomes

                <span className="text-emerald-400">
                  meaningful.
                </span>

              </h2>


              <p className="mt-5 leading-7 text-slate-400">
                NutriMind doesn't just give you numbers. It connects the dots
                between your nutrition, lifestyle and wellness patterns.
              </p>

            </div>


            <div className="mt-16 grid gap-5 md:grid-cols-3">

              <DarkCard
                number="01"
                title="Understand"
                description="See the nutritional and lifestyle patterns behind your daily wellness."
              />

              <DarkCard
                number="02"
                title="Explain"
                description="Understand which factors influenced your wellness score and recommendations."
              />

              <DarkCard
                number="03"
                title="Improve"
                description="Turn AI-generated insights into realistic actions and healthier habits."
              />

            </div>

          </div>

        </section>


        {/* ================= HOW IT WORKS ================= */}

        <section
          id="how-it-works"
          className="bg-[#f8faf9] py-28"
        >

          <div className="mx-auto max-w-7xl px-6">

            <div className="text-center">

              <div className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700 shadow-sm">
                Simple by design
              </div>

              <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
                From meal to insight.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-500">
                Four simple steps turn your everyday wellness data into
                personalized intelligence.
              </p>

            </div>


            <div className="mt-16 grid gap-5 md:grid-cols-4">

              <ProcessCard
                number="01"
                icon={<Camera />}
                title="Capture"
                description="Upload or capture your meal with your phone or camera."
              />

              <ProcessCard
                number="02"
                icon={<Brain />}
                title="Analyze"
                description="AI recognizes your food and estimates nutritional information."
              />

              <ProcessCard
                number="03"
                icon={<HeartPulse />}
                title="Understand"
                description="NutriMind combines nutrition and lifestyle signals."
              />

              <ProcessCard
                number="04"
                icon={<Sparkles />}
                title="Improve"
                description="Receive personalized, explainable wellness recommendations."
              />

            </div>

          </div>

        </section>


        {/* ================= CTA ================= */}

        <section className="bg-white px-6 py-24">

          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 px-8 py-20 text-center text-white shadow-2xl shadow-emerald-200 md:px-16">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />


            <div className="relative">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
                <Sparkles size={25} />
              </div>


              <h2 className="mx-auto mt-7 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
                Your wellness journey starts with understanding.
              </h2>


              <p className="mx-auto mt-5 max-w-2xl leading-7 text-emerald-50">
                Discover what your food and lifestyle are telling you with
                personalized AI-powered wellness intelligence.
              </p>


              <button
                onClick={() => navigate("/auth")}
                className="mt-8 rounded-2xl bg-white px-7 py-4 text-sm font-bold text-emerald-700 shadow-xl transition hover:-translate-y-0.5"
              >
                Start with NutriMind AI
              </button>

            </div>

          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="bg-slate-950 px-6 py-10 text-slate-400">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row md:items-center">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <Brain size={18} />
            </div>

            <div>

              <p className="text-sm font-bold text-white">
                NutriMind AI
              </p>

              <p className="text-[10px] text-slate-500">
                Personalized Nutrition & Wellness Intelligence
              </p>

            </div>

          </div>


          <p className="text-xs">
            © 2026 NutriMind AI. Built with intelligence and care.
          </p>

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   SMALL STAT CARD
========================================================= */

function MiniStat({
  icon,
  label,
  value,
  suffix,
  bg,
  iconBg,
  iconColor,
}) {

  return (
    <div className={`rounded-2xl ${bg} p-4`}>

      <div className="flex items-center justify-between">

        <div className={`rounded-xl ${iconBg} p-2 ${iconColor}`}>
          {icon}
        </div>

        <span className="text-[10px] font-semibold uppercase text-slate-400">
          Today
        </span>

      </div>


      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>


      <div className="mt-1 flex items-baseline gap-1">

        <span className="text-xl font-black text-slate-900">
          {value}
        </span>

        <span className="text-[10px] font-medium text-slate-400">
          {suffix}
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon,
  title,
  description,
  number,
}) {

  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/40">

      <div className="flex items-start justify-between">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
          {icon}
        </div>

        <span className="text-xs font-black text-slate-200">
          {number}
        </span>

      </div>


      <h3 className="mt-6 text-lg font-bold text-slate-900">
        {title}
      </h3>


      <p className="mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>


      <div className="mt-5 h-px w-8 bg-emerald-400 transition-all group-hover:w-16" />

    </div>
  );
}


/* =========================================================
   DARK CARD
========================================================= */

function DarkCard({
  number,
  title,
  description,
}) {

  return (
    <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.07]">

      <span className="text-xs font-black text-emerald-400">
        {number}
      </span>


      <h3 className="mt-7 text-xl font-bold text-white">
        {title}
      </h3>


      <p className="mt-3 text-sm leading-6 text-slate-400">
        {description}
      </p>


      <div className="mt-8 h-px w-10 bg-emerald-500 transition-all group-hover:w-full" />

    </div>
  );
}


/* =========================================================
   PROCESS CARD
========================================================= */

function ProcessCard({
  number,
  icon,
  title,
  description,
}) {

  return (
    <div className="relative rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

      <div className="flex items-center justify-between">

        <span className="text-xs font-black text-emerald-600">
          {number}
        </span>


        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          {icon}
        </div>

      </div>


      <h3 className="mt-7 text-xl font-bold text-slate-900">
        {title}
      </h3>


      <p className="mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* =========================================================
   APP ROUTES
========================================================= */

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/auth"
        element={<Auth />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route path="/profile" element={<Profile />} />
      <Route path="/nutrition" element={<Nutrition />} />
      <Route path="/food-scanner" element={<FoodScanner />} />
      <Route path="/lifestyle" element={<Lifestyle />} />
      <Route
  path="/recommendations"
  element={<Recommendations />}
/>
      <Route
        path="/digital-twin"
        element={
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                  <p className="text-xs font-semibold tracking-wider text-emerald-400">
                    Loading 3D Digital Twin Physiological Avatar...
                  </p>
                </div>
              </div>
            }
          >
            <DigitalTwin />
          </Suspense>
        }
      />

    </Routes>
  );
}


export default App;
