import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  ChevronRight,
  Droplets,
  Flame,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Wheat,
  Beef,
  Salad,
  Utensils,
} from "lucide-react";

import api from "../api/axios";


function Nutrition() {
  const navigate = useNavigate();

  // ============================================================
  // HYDRATION & TARGETS
  // ============================================================

  const [water, setWater] = useState(1.8);
  const [waterTarget, setWaterTarget] = useState(2.5);
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [proteinTarget, setProteinTarget] = useState(65);
  const [carbsTarget, setCarbsTarget] = useState(240);
  const [fatsTarget, setFatsTarget] = useState(65);

  const waterProgress = Math.min(
    (water / waterTarget) * 100,
    100
  );


  // ============================================================
  // DAILY NUTRITION
  // ============================================================

  const [dailyNutrition, setDailyNutrition] = useState({
    total: {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fats: 0,
      fibre: 0,
      sodium: 0,
    },
    entries: [],
  });

  const [nutritionLoading, setNutritionLoading] = useState(true);

  const [nutritionError, setNutritionError] = useState("");


  // ============================================================
  // LOAD TODAY'S NUTRITION & PERSONALIZED TARGETS
  // ============================================================

  useEffect(() => {
    const loadTodayNutrition = async () => {
      try {
        setNutritionLoading(true);
        setNutritionError("");

        const [nutrRes, wellRes] = await Promise.allSettled([
          api.get("/nutrition/today"),
          api.get("/wellness/today"),
        ]);

        if (nutrRes.status === "fulfilled") {
          setDailyNutrition(nutrRes.value.data);
        }

        if (wellRes.status === "fulfilled") {
          const wData = wellRes.value.data;
          if (wData.lifestyle?.water_liters !== undefined) {
            setWater(Number(wData.lifestyle.water_liters));
          }
          if (wData.targets) {
            if (wData.targets.calories) setCalorieTarget(wData.targets.calories);
            if (wData.targets.protein) setProteinTarget(wData.targets.protein);
            if (wData.targets.carbohydrates) setCarbsTarget(wData.targets.carbohydrates);
            if (wData.targets.fats) setFatsTarget(wData.targets.fats);
            if (wData.targets.water_liters) setWaterTarget(wData.targets.water_liters);
          }
        }

      } catch (error) {

        console.error(
          "Failed to load today's nutrition:",
          error
        );

        setNutritionError(
          error?.response?.data?.detail ||
          "Unable to load today's nutrition."
        );

      } finally {
        setNutritionLoading(false);
      }
    };

    loadTodayNutrition();

  }, []);


  // ============================================================
  // REAL NUTRITION VALUES
  // ============================================================

  const caloriesConsumed =
    dailyNutrition.total?.calories || 0;

  const protein = {
    consumed: dailyNutrition.total?.protein || 0,
    target: proteinTarget,
  };

  const carbs = {
    consumed: dailyNutrition.total?.carbohydrates || 0,
    target: carbsTarget,
  };

  const fats = {
    consumed: dailyNutrition.total?.fats || 0,
    target: fatsTarget,
  };

  const fiber = {
    consumed: dailyNutrition.total?.fibre || 0,
    target: 30,
  };


  // ============================================================
  // PROGRESS
  // ============================================================

  const calorieProgress = useMemo(
    () =>
      Math.min(
        (caloriesConsumed / calorieTarget) * 100,
        100
      ),
    [caloriesConsumed, calorieTarget]
  );


  // ============================================================
  // WATER
  // ============================================================

  const addWater = async (amount) => {
    const newAmount = Math.min(
      Number((water + amount).toFixed(1)),
      waterTarget + 1.0
    );
    setWater(newAmount);
    try {
      await api.post("/lifestyle/log", {
        water_liters: newAmount,
      });
    } catch (err) {
      console.warn("Could not sync water:", err);
    }
  };


  // ============================================================
  // MEAL DISPLAY
  // ============================================================

  const mealEntries = dailyNutrition.entries || [];


  return (
    <div className="min-h-screen overflow-hidden bg-[#f6faf8] text-slate-900">

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />

        <div className="absolute right-[-120px] top-40 h-96 w-96 rounded-full bg-teal-200/25 blur-3xl" />

        <div className="absolute bottom-[-180px] left-1/3 h-96 w-96 rounded-full bg-cyan-100/30 blur-3xl" />

      </div>


      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="relative z-10 border-b border-white/80 bg-white/70 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">

          <button
            onClick={() => navigate("/dashboard")}
            className="group flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
          >

            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition group-hover:border-emerald-200 group-hover:bg-emerald-50">

              <ArrowLeft size={17} />

            </span>

            <span className="hidden sm:block">
              Back to Dashboard
            </span>

          </button>


          <div className="flex items-center gap-3">

            <img
              src="/nutrimind-logo.png"
              alt="NutriMind AI"
              className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-emerald-200"
            />


            <div className="hidden sm:block">

              <p className="text-sm font-extrabold tracking-tight text-slate-900">
                NutriMind AI
              </p>


              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                Nutrition Intelligence
              </p>

            </div>

          </div>

        </div>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">


        {/* ====================================================
            PAGE INTRO
        ==================================================== */}

        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

          <div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700 shadow-sm backdrop-blur">

              <Sparkles size={14} />

              Nutrition Intelligence

            </div>


            <h1 className="text-4xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">

              Understand what

              <span className="block bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">

                fuels you.

              </span>

            </h1>


            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 md:text-lg">

              Track your daily nutrition, understand your progress,
              and turn your meals into meaningful wellness insights.

            </p>

          </div>


          <button
            onClick={() => navigate("/food-scanner")}
            className="group flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-emerald-600"
          >

            <Plus size={18} />

            Add Food

            <ChevronRight
              size={16}
              className="transition group-hover:translate-x-1"
            />

          </button>

        </div>


        {/* ====================================================
            ERROR MESSAGE
        ==================================================== */}

        {nutritionError && (

          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">

            {nutritionError}

          </div>

        )}


        {/* ====================================================
            LOADING MESSAGE
        ==================================================== */}

        {nutritionLoading && (

          <div className="mb-6 rounded-2xl border border-emerald-100 bg-white px-5 py-4 text-sm font-semibold text-emerald-600 shadow-sm">

            Loading today's nutrition...

          </div>

        )}


        {/* ====================================================
            TOP STATS
        ==================================================== */}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">


          <StatCard
            icon={<Flame size={20} />}
            label="Calories"
            value={caloriesConsumed}
            target={calorieTarget}
            unit="kcal"
            percentage={calorieProgress}
            iconBg="bg-orange-50"
            iconColor="text-orange-500"
            bar="bg-orange-400"
          />


          <StatCard
            icon={<Beef size={20} />}
            label="Protein"
            value={protein.consumed}
            target={protein.target}
            unit="g"
            percentage={(protein.consumed / protein.target) * 100}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            bar="bg-emerald-500"
          />


          <StatCard
            icon={<Wheat size={20} />}
            label="Carbohydrates"
            value={carbs.consumed}
            target={carbs.target}
            unit="g"
            percentage={(carbs.consumed / carbs.target) * 100}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            bar="bg-amber-400"
          />


          <StatCard
            icon={<Salad size={20} />}
            label="Fiber"
            value={fiber.consumed}
            target={fiber.target}
            unit="g"
            percentage={(fiber.consumed / fiber.target) * 100}
            iconBg="bg-teal-50"
            iconColor="text-teal-600"
            bar="bg-teal-500"
          />

        </div>


        {/* ====================================================
            MAIN CONTENT
        ==================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">


          {/* ==================================================
              LEFT COLUMN
          ================================================== */}

          <div className="space-y-6">


            {/* =================================================
                CALORIE OVERVIEW
            ================================================= */}

            <section className="overflow-hidden rounded-[2rem] border border-white bg-white/90 p-7 shadow-[0_25px_70px_-30px_rgba(15,23,42,0.22)] backdrop-blur-xl md:p-8">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>

                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Today's nutrition
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-slate-950">
                    Daily calorie balance
                  </h2>

                </div>


                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">

                  <TrendingUp size={15} />

                  {caloriesConsumed > 0
                    ? "Tracking"
                    : "No food logged"}

                </div>

              </div>


              <div className="mt-8 grid items-center gap-8 md:grid-cols-[190px_1fr]">


                {/* CIRCULAR PROGRESS */}

                <div className="mx-auto">

                  <CircularProgress
                    percentage={calorieProgress}
                    value={caloriesConsumed}
                    target={calorieTarget}
                  />

                </div>


                {/* MACRO BREAKDOWN */}

                <div className="space-y-5">


                  <MacroRow
                    label="Protein"
                    value={`${protein.consumed} g`}
                    target={`${protein.target} g`}
                    percentage={
                      (protein.consumed / protein.target) * 100
                    }
                    bar="bg-emerald-500"
                  />


                  <MacroRow
                    label="Carbohydrates"
                    value={`${carbs.consumed} g`}
                    target={`${carbs.target} g`}
                    percentage={
                      (carbs.consumed / carbs.target) * 100
                    }
                    bar="bg-amber-400"
                  />


                  <MacroRow
                    label="Fats"
                    value={`${fats.consumed} g`}
                    target={`${fats.target} g`}
                    percentage={
                      (fats.consumed / fats.target) * 100
                    }
                    bar="bg-orange-400"
                  />


                  <MacroRow
                    label="Fiber"
                    value={`${fiber.consumed} g`}
                    target={`${fiber.target} g`}
                    percentage={
                      (fiber.consumed / fiber.target) * 100
                    }
                    bar="bg-teal-500"
                  />

                </div>

              </div>

            </section>


            {/* =================================================
                MEALS
            ================================================= */}

            <section className="rounded-[2rem] border border-white bg-white/90 p-7 shadow-[0_25px_70px_-30px_rgba(15,23,42,0.22)] backdrop-blur-xl md:p-8">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Food journal
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-slate-950">
                    Today's meals
                  </h2>

                </div>

                <span className="text-xs font-bold text-emerald-600">
                  {mealEntries.length}{" "}
                  {mealEntries.length === 1
                    ? "entry"
                    : "entries"}
                </span>

              </div>


              <div className="mt-6 space-y-3">

                {mealEntries.length > 0 ? (

                  mealEntries.map((entry) => (

                    <MealCard
                      key={entry.id}
                      emoji="🍛"
                      meal={entry.food_name}
                      servingSize={entry.serving_size}
                      dataSource={entry.data_source}
                      foods={`${entry.protein}g protein · ${entry.carbohydrates}g carbs · ${entry.fats}g fat`}
                      calories={entry.calories}
                      color="bg-orange-50"
                    />

                  ))

                ) : (

                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-5 py-8 text-center">

                    <Utensils
                      size={26}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-bold text-slate-500">
                      No meals logged today
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Scan a food to start your nutrition journal.
                    </p>

                  </div>

                )}


                <button
                  onClick={() => navigate("/food-scanner")}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 py-4 text-sm font-bold text-slate-400 transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-600"
                >

                  <Plus size={17} />

                  Add another meal

                </button>

              </div>

            </section>

          </div>


          {/* ==================================================
              RIGHT COLUMN
          ================================================== */}

          <div className="space-y-6">


            {/* =================================================
                WATER
            ================================================= */}

            <section className="rounded-[2rem] border border-white bg-white/90 p-7 shadow-[0_25px_70px_-30px_rgba(15,23,42,0.22)] backdrop-blur-xl">

              <div className="flex items-start justify-between">

                <div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">

                    <Droplets size={20} />

                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-widest text-slate-400">
                    Hydration
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-slate-950">
                    Stay hydrated
                  </h2>

                </div>


                <span className="text-2xl font-black text-cyan-600">
                  {water}L
                </span>

              </div>


              <div className="mt-6">

                <div className="flex justify-between text-xs font-bold">

                  <span className="text-slate-500">
                    Daily progress
                  </span>

                  <span className="text-slate-700">
                    {water} / {waterTarget} L
                  </span>

                </div>


                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-500 transition-all duration-500"
                    style={{
                      width: `${waterProgress}%`,
                    }}
                  />

                </div>

              </div>


              <div className="mt-6 grid grid-cols-3 gap-2">

                {[0.25, 0.5, 0.75].map((amount) => (

                  <button
                    key={amount}
                    onClick={() => addWater(amount)}
                    className="rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-600"
                  >

                    +{amount}L

                  </button>

                ))}

              </div>

            </section>


            {/* =================================================
                AI INSIGHT
            ================================================= */}

            <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_25px_70px_-30px_rgba(15,23,42,0.45)]">

              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-2xl" />


              <div className="relative">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">

                    <Brain size={21} />

                  </div>


                  <div>

                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                      AI Insight
                    </p>

                    <p className="text-sm font-bold text-white">
                      Personalized nutrition
                    </p>

                  </div>

                </div>


                <p className="mt-6 text-lg font-bold leading-7">

                  {protein.consumed > 0
                    ? "Your nutrition data is being tracked."
                    : "Start logging meals to receive nutrition insights."}

                </p>


                <p className="mt-3 text-sm leading-6 text-slate-400">

                  {protein.consumed > 0
                    ? `You've consumed approximately ${protein.consumed}g of protein today.`
                    : "Scan your food and NutriMind AI will add the nutrition information to your daily journal."}

                </p>


                <div className="mt-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-slate-300">

                  <Sparkles size={14} className="text-emerald-400" />

                  Insight generated from your nutrition data

                </div>

              </div>

            </section>


            {/* =================================================
                GOAL CARD
            ================================================= */}

            <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-7">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">

                  <Target size={20} />

                </div>


                <div>

                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                    Daily target
                  </p>


                  <h3 className="mt-1 text-lg font-extrabold text-slate-950">
                    {calorieTarget} kcal
                  </h3>


                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Your nutrition targets will eventually be
                    personalized using your profile and wellness data.
                  </p>

                </div>

              </div>

            </section>

          </div>

        </div>

      </main>

    </div>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon,
  label,
  value,
  target,
  unit,
  percentage,
  iconBg,
  iconColor,
  bar,
}) {

  return (

    <div className="rounded-[1.7rem] border border-white bg-white/90 p-5 shadow-[0_20px_55px_-30px_rgba(15,23,42,0.2)] backdrop-blur-xl">

      <div className="flex items-center justify-between">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >

          {icon}

        </div>


        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Daily
        </span>

      </div>


      <p className="mt-5 text-sm font-semibold text-slate-500">
        {label}
      </p>


      <div className="mt-1 flex items-end gap-1">

        <span className="text-2xl font-black text-slate-950">
          {value}
        </span>

        <span className="pb-0.5 text-xs font-bold text-slate-400">
          / {target} {unit}
        </span>

      </div>


      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`h-full rounded-full ${bar} transition-all duration-700`}
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />

      </div>

    </div>

  );
}


/* ============================================================
   CIRCULAR PROGRESS
============================================================ */

function CircularProgress({
  percentage,
  value,
  target,
}) {

  const radius = 68;

  const circumference =
    2 * Math.PI * radius;

  const offset =
    circumference -
    (Math.min(percentage, 100) / 100) *
      circumference;


  return (

    <div className="relative h-44 w-44">

      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 160 160"
      >

        <circle
          cx="80"
          cy="80"
          r={radius}
          strokeWidth="12"
          fill="none"
          className="stroke-slate-100"
        />


        <circle
          cx="80"
          cy="80"
          r={radius}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          className="stroke-emerald-500 transition-all duration-700"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />

      </svg>


      <div className="absolute inset-0 flex flex-col items-center justify-center">

        <Flame
          size={17}
          className="mb-1 text-orange-500"
        />


        <span className="text-3xl font-black text-slate-950">
          {value}
        </span>


        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          of {target} kcal
        </span>

      </div>

    </div>

  );
}


/* ============================================================
   MACRO ROW
============================================================ */

function MacroRow({
  label,
  value,
  target,
  percentage,
  bar,
}) {

  return (

    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm font-bold text-slate-700">
          {label}
        </span>


        <span className="text-xs font-semibold text-slate-400">

          <span className="text-slate-700">
            {value}
          </span>{" "}

          / {target}

        </span>

      </div>


      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`h-full rounded-full ${bar} transition-all duration-700`}
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />

      </div>

    </div>

  );
}


/* ============================================================
   MEAL CARD
============================================================ */

function MealCard({
  emoji,
  meal,
  servingSize,
  dataSource,
  foods,
  calories,
  color,
}) {

  return (

    <div className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-md">

      <div className="flex items-center gap-4">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} text-xl`}
        >

          {emoji}

        </div>


        <div>

          <div className="flex flex-wrap items-center gap-2">

            <p className="text-sm font-extrabold text-slate-900">
              {meal}
            </p>

            {servingSize && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {servingSize}
              </span>
            )}

            {dataSource && (
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                {dataSource.includes("IFCT") ? "IFCT" : dataSource.includes("USDA") ? "USDA" : "OFF"}
              </span>
            )}

          </div>


          <p className="mt-1 text-xs text-slate-400">
            {foods}
          </p>

        </div>

      </div>


      <div className="text-right">

        <p className="text-sm font-black text-slate-900">
          {calories}
        </p>

        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          kcal
        </p>

      </div>

    </div>

  );

}


export default Nutrition;