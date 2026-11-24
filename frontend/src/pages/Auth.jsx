import { useState } from "react";
import { Brain, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      if (!isLogin) {
        // REGISTER
        const response = await api.post("/auth/register", {
          name: cleanName,
          email: cleanEmail,
          password,
        });

        console.log("Registration successful:", response.data);

        setSuccess("Account created successfully! Please sign in.");

        setName("");
        setPassword("");

        setIsLogin(true);
      } else {
        // LOGIN
        const formData = new URLSearchParams();

        formData.append("username", cleanEmail);
        formData.append("password", password);

        const response = await api.post(
          "/auth/login",
          formData,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        const token = response.data.access_token;

        // Save JWT token
        localStorage.setItem("access_token", token);

        console.log("Login successful");

        setSuccess("Login successful!");

        // Go to dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      }
    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center px-6 py-10">

      <div className="w-full max-w-5xl grid md:grid-cols-2 overflow-hidden rounded-[32px] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.12)]">

        {/* LEFT SIDE */}

        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#07111f] via-[#0b1d2d] to-[#064e3b] p-10 text-white">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400">

                <Brain
                  size={24}
                  className="text-[#07111f]"
                />

              </div>

              <div>

                <h1 className="text-xl font-bold">
                  NutriMind
                </h1>

                <p className="text-[10px] tracking-[0.25em] text-emerald-300">
                  AI WELLNESS
                </p>

              </div>

            </div>


            <div className="mt-20">

              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-300">
                Intelligent Wellness
              </p>

              <h2 className="text-4xl font-bold leading-tight">
                Understand your health.
                <br />
                Improve your life.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
                NutriMind combines nutrition, lifestyle and AI-powered
                intelligence to give you personalized wellness insights.
              </p>

            </div>

          </div>


          <div className="text-sm text-slate-400">
            Personalized nutrition • Explainable AI • Wellness intelligence
          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="p-8 sm:p-12">

          <div className="mb-8">

            <h2 className="text-3xl font-bold text-slate-900">
              {isLogin
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {isLogin
                ? "Sign in to continue your wellness journey."
                : "Start your personalized wellness journey with NutriMind."}
            </p>

          </div>


          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}


          {/* SUCCESS */}

          {success && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {success}
            </div>
          )}


          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* NAME */}

            {!isLogin && (
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />

              </div>
            )}


            {/* EMAIL */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />

            </div>


            {/* PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>


            {/* FORGOT PASSWORD */}

            {isLogin && (
              <div className="flex justify-end">

                <button
                  type="button"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Forgot password?
                </button>

              </div>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Please wait...
                </>
              ) : (
                <>
                  {isLogin
                    ? "Sign in"
                    : "Create account"}

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}

            </button>

          </form>


          {/* SWITCH LOGIN / REGISTER */}

          <div className="mt-8 text-center text-sm text-slate-500">

            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
              }}
              className="ml-2 font-semibold text-emerald-600 hover:text-emerald-700"
            >
              {isLogin
                ? "Create account"
                : "Sign in"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Auth;
