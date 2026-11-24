import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  CalendarDays,
  Check,
  ChevronDown,
  Dumbbell,
  HeartPulse,
  Ruler,
  Save,
  Sparkles,
  Target,
  User,
  Weight,
  Activity,
} from "lucide-react";
import api from "../api/axios";

function Profile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: "",
    gender: "Female",
    height: "",
    weight: "",
    activity_level: "Moderately Active",
    health_goal: "Improve General Wellness",
  });

  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/auth");
      return;
    }

    const loadProfile = async () => {
      try {
        const userResponse = await api.get("/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(userResponse.data);

        try {
          const profileResponse = await api.get("/profile/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = profileResponse.data;

          if (data && data.age !== undefined) {
            setForm({
              age: data.age ?? "",
              gender: data.gender ?? "Female",
              height: data.height ?? "",
              weight: data.weight ?? "",
              activity_level:
                data.activity_level ?? "Moderately Active",
              health_goal:
                data.health_goal ?? "Improve General Wellness",
            });
          }
        } catch {
          // Profile may not exist yet.
        }
      } catch {
        localStorage.removeItem("access_token");
        navigate("/auth");
      }
    };

    loadProfile();
  }, [navigate]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
    setError("");
  };

  const bmi = useMemo(() => {
    const height = Number(form.height);
    const weight = Number(form.weight);

    if (!height || !weight || height <= 0 || weight <= 0) {
      return null;
    }

    const value = weight / Math.pow(height / 100, 2);

    return value.toFixed(1);
  }, [form.height, form.weight]);

  const bmiStatus = useMemo(() => {
    if (!bmi) return "Waiting for your measurements";

    const value = Number(bmi);

    if (value < 18.5) return "Below reference range";
    if (value < 25) return "Within reference range";
    if (value < 30) return "Above reference range";

    return "Higher reference range";
  }, [bmi]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/auth");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      await api.post(
        "/profile/",
        {
          age: form.age ? Number(form.age) : null,
          gender: form.gender,
          height: form.height ? Number(form.height) : null,
          weight: form.weight ? Number(form.weight) : null,
          activity_level: form.activity_level,
          health_goal: form.health_goal,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f6faf8] text-slate-900">

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute right-[-120px] top-40 h-96 w-96 rounded-full bg-teal-200/25 blur-3xl" />
        <div className="absolute bottom-[-180px] left-1/3 h-96 w-96 rounded-full bg-cyan-100/30 blur-3xl" />
      </div>

      {/* Header */}
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
                Personal Wellness
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">

        {/* Page intro */}
        <div className="mb-10 max-w-3xl">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700 shadow-sm backdrop-blur">
            <Sparkles size={14} />
            Personal Wellness Profile
          </div>

          <h1 className="text-4xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">
            Build your
            <span className="block bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              wellness identity.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 md:text-lg">
            Tell NutriMind about yourself so your nutrition,
            lifestyle insights and recommendations can become
            more personalized.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-[1.45fr_0.75fr]">

          {/* Profile form */}
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-[2rem] border border-white bg-white/90 shadow-[0_25px_70px_-30px_rgba(15,23,42,0.25)] backdrop-blur-xl"
          >

            {/* Form header */}
            <div className="border-b border-slate-100 px-6 py-7 md:px-8">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <User size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-slate-950">
                    About you
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Your basic information helps NutriMind personalize
                    your wellness experience.
                  </p>
                </div>

              </div>
            </div>

            {/* Fields */}
            <div className="grid gap-6 px-6 py-7 md:grid-cols-2 md:px-8">

              {/* Age */}
              <InputField
                label="Age"
                icon={<CalendarDays size={17} />}
              >
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={form.age}
                  onChange={(e) =>
                    updateField("age", e.target.value)
                  }
                  placeholder="Enter your age"
                  className="input-style"
                  required
                />
              </InputField>

              {/* Gender */}
              <InputField
                label="Gender"
                icon={<User size={17} />}
              >
                <SelectField
                  value={form.gender}
                  onChange={(e) =>
                    updateField("gender", e.target.value)
                  }
                  options={[
                    "Female",
                    "Male",
                    "Non-binary",
                    "Prefer not to say",
                  ]}
                />
              </InputField>

              {/* Height */}
              <InputField
                label="Height"
                icon={<Ruler size={17} />}
                suffix="cm"
              >
                <input
                  type="number"
                  min="50"
                  max="250"
                  step="0.1"
                  value={form.height}
                  onChange={(e) =>
                    updateField("height", e.target.value)
                  }
                  placeholder="e.g. 165"
                  className="input-style pr-14"
                  required
                />
              </InputField>

              {/* Weight */}
              <InputField
                label="Weight"
                icon={<Weight size={17} />}
                suffix="kg"
              >
                <input
                  type="number"
                  min="20"
                  max="300"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) =>
                    updateField("weight", e.target.value)
                  }
                  placeholder="e.g. 60"
                  className="input-style pr-14"
                  required
                />
              </InputField>

              {/* Activity */}
              <InputField
                label="Activity Level"
                icon={<Activity size={17} />}
                full
              >
                <SelectField
                  value={form.activity_level}
                  onChange={(e) =>
                    updateField(
                      "activity_level",
                      e.target.value
                    )
                  }
                  options={[
                    "Sedentary",
                    "Lightly Active",
                    "Moderately Active",
                    "Very Active",
                    "Extremely Active",
                  ]}
                />
              </InputField>

              {/* Goal */}
              <InputField
                label="Health Goal"
                icon={<Target size={17} />}
                full
              >
                <SelectField
                  value={form.health_goal}
                  onChange={(e) =>
                    updateField(
                      "health_goal",
                      e.target.value
                    )
                  }
                  options={[
                    "Improve General Wellness",
                    "Maintain Weight",
                    "Weight Loss",
                    "Weight Gain",
                    "Muscle Gain",
                  ]}
                />
              </InputField>

            </div>

            {/* Save area */}
            <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-6 md:px-8">

              {error && (
                <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              {saved && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  <Check size={17} />
                  Your wellness profile has been saved successfully.
                </div>
              )}

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Ready to personalize NutriMind?
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    You can update these details anytime.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Profile
                    </>
                  )}
                </button>

              </div>
            </div>

          </form>

          {/* Wellness snapshot */}
          <div className="space-y-6">

            {/* User card */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_25px_70px_-30px_rgba(15,23,42,0.45)]">

              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-2xl" />
              <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-teal-500/10 blur-2xl" />

              <div className="relative">

                <div className="flex items-center justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-xl font-black shadow-lg shadow-emerald-900/40">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    AI Profile
                  </div>

                </div>

                <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Welcome back
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {user?.name || "Your Profile"}
                </h2>

                <p className="mt-1 truncate text-sm text-slate-400">
                  {user?.email || "Personal wellness space"}
                </p>

              </div>
            </div>

            {/* BMI card */}
            <div className="rounded-[2rem] border border-white bg-white/90 p-7 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.22)] backdrop-blur-xl">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Body metric
                  </p>

                  <h3 className="mt-1 text-lg font-extrabold text-slate-950">
                    BMI Snapshot
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <HeartPulse size={20} />
                </div>

              </div>

              <div className="mt-7 flex items-end gap-3">

                <span className="text-5xl font-black tracking-tight text-slate-950">
                  {bmi || "--"}
                </span>

                <span className="pb-1 text-sm font-semibold text-slate-400">
                  BMI
                </span>

              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700"
                  style={{
                    width: bmi
                      ? `${Math.min(
                          Math.max((Number(bmi) / 40) * 100, 5),
                          100
                        )}%`
                      : "5%",
                  }}
                />

              </div>

              <p className="mt-3 text-xs font-medium text-slate-500">
                {bmiStatus}
              </p>

              <p className="mt-3 text-[11px] leading-5 text-slate-400">
                BMI is shown as a simple reference metric based on
                the height and weight entered above.
              </p>

            </div>

            {/* Goal card */}
            <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-7">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                  <Target size={20} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                    Current focus
                  </p>

                  <h3 className="mt-1 text-lg font-extrabold text-slate-950">
                    {form.health_goal}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    NutriMind will use your goal together with
                    nutrition and lifestyle data to personalize
                    future insights.
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Bottom feature strip */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">

          <MiniFeature
            icon={<Brain size={18} />}
            title="AI Personalization"
            text="Your profile becomes the foundation for personalized insights."
          />

          <MiniFeature
            icon={<Dumbbell size={18} />}
            title="Lifestyle Intelligence"
            text="Activity and wellness data can be connected to your profile."
          />

          <MiniFeature
            icon={<Sparkles size={18} />}
            title="Adaptive Insights"
            text="Your wellness experience can evolve as your data changes."
          />

        </div>

        <p className="mt-8 text-center text-xs font-medium text-slate-400">
          Your profile information powers your personalized NutriMind AI experience.
        </p>

      </main>
    </div>
  );
}


/* ================= COMPONENTS ================= */

function InputField({
  label,
  icon,
  suffix,
  full = false,
  children,
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>

      <label className="mb-2.5 flex items-center gap-2 text-sm font-bold text-slate-700">

        <span className="text-emerald-500">
          {icon}
        </span>

        {label}

      </label>

      <div className="relative">

        {children}

        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {suffix}
          </span>
        )}

      </div>
    </div>
  );
}


function SelectField({ value, onChange, options }) {
  return (
    <div className="relative">

      <select
        value={value}
        onChange={onChange}
        className="input-style appearance-none pr-11"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={17}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
      />

    </div>
  );
}


function MiniFeature({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white bg-white/75 p-5 shadow-sm backdrop-blur">

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {text}
          </p>
        </div>

      </div>
    </div>
  );
}

export default Profile;