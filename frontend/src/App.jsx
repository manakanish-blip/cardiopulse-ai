import React, { useState, useEffect } from "react";
import {
  HeartPulse,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  Sparkles,
  UserCheck,
  UserX,
  RotateCcw,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

const PRESETS = {
  healthy: {
    label: "Optimal Athlete",
    badge: "Low Risk",
    data: {
      age: 36,
      sex: 0,
      cp: 2,
      trestbps: 112,
      chol: 178,
      fbs: 0,
      restecg: 1,
      thalach: 182,
      exang: 0,
      oldpeak: 0.0,
      slope: 2,
      ca: 0,
      thal: 2,
    },
  },
  moderate: {
    label: "Borderline Profile",
    badge: "Moderate",
    data: {
      age: 54,
      sex: 1,
      cp: 1,
      trestbps: 138,
      chol: 242,
      fbs: 0,
      restecg: 0,
      thalach: 146,
      exang: 0,
      oldpeak: 1.4,
      slope: 1,
      ca: 1,
      thal: 2,
    },
  },
  highRisk: {
    label: "Critical Cardiac Case",
    badge: "High Risk",
    data: {
      age: 64,
      sex: 1,
      cp: 0,
      trestbps: 162,
      chol: 295,
      fbs: 1,
      restecg: 0,
      thalach: 114,
      exang: 1,
      oldpeak: 3.2,
      slope: 0,
      ca: 3,
      thal: 3,
    },
  },
};

export default function App() {
  const [formData, setFormData] = useState(PRESETS.healthy.data);
  const [activePreset, setActivePreset] = useState("healthy");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:8000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error("Backend offline:", err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleChange = (key, value) => {
    setActivePreset("custom");
    setFormData((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const applyPreset = (key) => {
    setActivePreset(key);
    setFormData(PRESETS[key].data);
  };

  const risk = result?.risk_probability ?? 0;
  const strokeDashoffset = 440 - (440 * risk) / 100;

  // Dynamic theme colors based on predicted risk
  const theme =
    risk < 30
      ? {
          color: "#10b981",
          glow: "shadow-emerald-500/20",
          border: "border-emerald-500/30",
          bgGlow: "from-emerald-500/10 via-transparent to-transparent",
          pill: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        }
      : risk < 65
      ? {
          color: "#f59e0b",
          glow: "shadow-amber-500/20",
          border: "border-amber-500/30",
          bgGlow: "from-amber-500/10 via-transparent to-transparent",
          pill: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        }
      : {
          color: "#f43f5e",
          glow: "shadow-rose-500/25",
          border: "border-rose-500/40",
          bgGlow: "from-rose-500/15 via-transparent to-transparent",
          pill: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Ambient Radial Spotlight */}
      <div
        className={`pointer-events-none fixed inset-0 bg-gradient-to-br ${theme.bgGlow} transition-all duration-700`}
      />

      {/* Top Glass Header */}
      <header className="relative max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pb-6 border-b border-slate-800/80 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative p-3.5 bg-gradient-to-br from-rose-500/20 to-indigo-500/10 border border-rose-500/30 rounded-2xl shadow-lg shadow-rose-500/10">
            <HeartPulse className="w-8 h-8 text-rose-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                CardioPulse AI
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Clinical Studio v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive Cardiovascular Risk Telemetry • XGBoost Pipeline
            </p>
          </div>
        </div>

        {/* One-Click Patient Scenario Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Scenarios:
          </span>
          {Object.entries(PRESETS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activePreset === key
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Panel: Interactive Vitals & Biomarkers (7 cols) */}
        <section className="lg:col-span-7 bg-slate-900/50 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h2 className="text-base font-semibold flex items-center gap-2 text-slate-100">
              <Stethoscope className="w-5 h-5 text-rose-400" /> Patient Telemetry & Biomarkers
            </h2>
            <button
              onClick={() => applyPreset("healthy")}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Baseline
            </button>
          </div>

          {/* Continuous Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Age */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/70 hover:border-slate-700 transition">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400 font-medium">Patient Age</span>
                <span className="font-mono font-bold text-slate-100 bg-slate-800 px-2 py-0.5 rounded">
                  {formData.age} yrs
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="85"
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Resting BP */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/70 hover:border-slate-700 transition">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400 font-medium">Resting Blood Pressure</span>
                <span className="font-mono font-bold text-slate-100 bg-slate-800 px-2 py-0.5 rounded">
                  {formData.trestbps} mmHg
                </span>
              </div>
              <input
                type="range"
                min="90"
                max="200"
                value={formData.trestbps}
                onChange={(e) => handleChange("trestbps", e.target.value)}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Cholesterol */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/70 hover:border-slate-700 transition">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400 font-medium">Serum Cholesterol</span>
                <span className="font-mono font-bold text-slate-100 bg-slate-800 px-2 py-0.5 rounded">
                  {formData.chol} mg/dL
                </span>
              </div>
              <input
                type="range"
                min="120"
                max="450"
                value={formData.chol}
                onChange={(e) => handleChange("chol", e.target.value)}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Max Heart Rate */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/70 hover:border-slate-700 transition">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400 font-medium">Max Heart Rate (Thalach)</span>
                <span className="font-mono font-bold text-slate-100 bg-slate-800 px-2 py-0.5 rounded">
                  {formData.thalach} bpm
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="210"
                value={formData.thalach}
                onChange={(e) => handleChange("thalach", e.target.value)}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* ST Depression */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/70 hover:border-slate-700 transition">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400 font-medium">ST Depression (Oldpeak)</span>
                <span className="font-mono font-bold text-slate-100 bg-slate-800 px-2 py-0.5 rounded">
                  {formData.oldpeak} mm
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="0.1"
                value={formData.oldpeak}
                onChange={(e) => handleChange("oldpeak", e.target.value)}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Biological Sex Toggle */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/70 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium mb-2">Biological Sex</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Female", val: 0 },
                  { label: "Male", val: 1 },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => handleChange("sex", opt.val)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                      formData.sex === opt.val
                        ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Categorical Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                Chest Pain Type
              </label>
              <select
                value={formData.cp}
                onChange={(e) => handleChange("cp", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-rose-500 outline-none"
              >
                <option value={0}>0 — Asymptomatic</option>
                <option value={1}>1 — Atypical Angina</option>
                <option value={2}>2 — Non-Anginal Pain</option>
                <option value={3}>3 — Typical Angina</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                Major Vessels (0–3)
              </label>
              <select
                value={formData.ca}
                onChange={(e) => handleChange("ca", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-rose-500 outline-none"
              >
                <option value={0}>0 Vessels Colored</option>
                <option value={1}>1 Vessel Colored</option>
                <option value={2}>2 Vessels Colored</option>
                <option value={3}>3 Vessels Colored</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                Exercise Angina
              </label>
              <select
                value={formData.exang}
                onChange={(e) => handleChange("exang", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-rose-500 outline-none"
              >
                <option value={0}>No Angina</option>
                <option value={1}>Yes (Induced)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                Thalassemia (Thal)
              </label>
              <select
                value={formData.thal}
                onChange={(e) => handleChange("thal", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-rose-500 outline-none"
              >
                <option value={1}>1 — Fixed Defect</option>
                <option value={2}>2 — Normal Flow</option>
                <option value={3}>3 — Reversible Defect</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                ST Slope
              </label>
              <select
                value={formData.slope}
                onChange={(e) => handleChange("slope", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-rose-500 outline-none"
              >
                <option value={0}>0 — Downsloping</option>
                <option value={1}>1 — Flat</option>
                <option value={2}>2 — Upsloping</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                Fasting Blood Sugar
              </label>
              <select
                value={formData.fbs}
                onChange={(e) => handleChange("fbs", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-rose-500 outline-none"
              >
                <option value={0}>Normal (≤ 120 mg/dL)</option>
                <option value={1}>Elevated (above 120 mg/dL)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Right Panel: Live Diagnostic Telemetry & Risk Gauge (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* Diagnostic Gauge Card */}
          <div
            className={`bg-slate-900/60 backdrop-blur-xl border ${theme.border} rounded-3xl p-6 flex flex-col items-center justify-between relative shadow-2xl ${theme.glow} transition-all duration-500`}
          >
            {/* Live ECG Pulse Wave SVG */}
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full animate-ping"
                  style={{ backgroundColor: theme.color }}
                />
                Live Inference Engine
              </span>
              <span className="text-xs font-mono text-slate-400">
                ROC-AUC: <strong className="text-slate-200">{result?.model_confidence ?? "0.89"}</strong>
              </span>
            </div>

            {/* Animated Radial Gauge */}
            <div className="relative w-52 h-52 my-3 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 drop-shadow-lg" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#0f172a"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={theme.color}
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="440"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-5xl font-black font-mono tracking-tight text-white">
                  {risk}%
                </span>
                <span
                  className={`mt-2 text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border ${theme.pill}`}
                >
                  {result?.risk_tier ?? "Analyzing..."}
                </span>
              </div>
            </div>

            {/* Animated ECG Waveform Strip */}
            <div className="w-full h-10 bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden flex items-center px-3 my-2">
              <svg viewBox="0 0 300 40" className="w-full h-7">
                <path
                  d="M0,20 L40,20 L48,12 L56,28 L64,4 L72,36 L80,20 L130,20 L138,12 L146,28 L154,4 L162,36 L170,20 L220,20 L228,12 L236,28 L244,4 L252,36 L260,20 L300,20"
                  fill="none"
                  stroke={theme.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-80"
                />
              </svg>
            </div>

            {/* Medical Disclaimer */}
            <div className="mt-2 w-full flex items-center justify-center gap-2 text-[11px] text-slate-400 bg-slate-950/70 py-2.5 px-4 rounded-xl border border-slate-800/80">
              {risk < 30 ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>Clinical decision-support simulation only; not a medical diagnosis.</span>
            </div>
          </div>

          {/* Explainable AI Risk Drivers Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-semibold flex items-center justify-between mb-4 text-slate-200">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-400" /> Top Model Risk Drivers
              </span>
              <span className="text-[11px] text-slate-500 font-normal">Feature Attribution</span>
            </h3>

            <div className="space-y-3">
              {result?.key_drivers?.map((item, idx) => {
                const isRisk = item.impact.startsWith("+");
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-950/80 border border-slate-800/90 px-4 py-3 rounded-2xl text-sm hover:border-slate-700 transition"
                  >
                    <div>
                      <p className="font-semibold text-slate-200 text-xs">{item.factor}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Observed: <span className="text-slate-300 font-mono">{item.value}</span>
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                        isRisk
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {item.impact}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}