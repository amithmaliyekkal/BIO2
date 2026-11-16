import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, RotateCcw, Share2 } from 'lucide-react';
import { CalibrationChart } from './components/CalibrationChart';
import { HowItWorksSection } from './components/HowItWorksSection';
import { ModelAssumptionsSection } from './components/ModelAssumptionsSection';
import { SignalFlowDiagram } from './components/SignalFlowDiagram';
import {
  DEFAULT_CONCENTRATION,
  DEFAULT_MAX_RANGE,
  DEFAULT_SENSITIVITY,
  MAX_CONCENTRATION,
  MAX_MAX_RANGE,
  MAX_RANGE_STEP,
  MAX_SENSITIVITY,
  MIN_CONCENTRATION,
  MIN_MAX_RANGE,
  MIN_SENSITIVITY,
  SAMPLE_PRESETS,
  SENSITIVITY_STEP,
  calculateSimulatedSignal,
  clamp,
  getOperatingRegime,
} from './simulation/biosensorModel';

function getInitialParamsFromUrl() {
  if (typeof window === 'undefined') {
    return {
      concentration: DEFAULT_CONCENTRATION,
      sensitivity: DEFAULT_SENSITIVITY,
      maxRange: DEFAULT_MAX_RANGE,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const rawC = params.get('c');
  const rawS = params.get('s');
  const rawR = params.get('r');

  const parsedC = rawC !== null ? Number(rawC) : NaN;
  const parsedS = rawS !== null ? Number(rawS) : NaN;
  const parsedR = rawR !== null ? Number(rawR) : NaN;

  return {
    concentration: !Number.isNaN(parsedC)
      ? Math.round(clamp(parsedC, MIN_CONCENTRATION, MAX_CONCENTRATION))
      : DEFAULT_CONCENTRATION,
    sensitivity: !Number.isNaN(parsedS)
      ? Math.round(clamp(parsedS, MIN_SENSITIVITY, MAX_SENSITIVITY) * 100) / 100
      : DEFAULT_SENSITIVITY,
    maxRange: !Number.isNaN(parsedR)
      ? Math.round(clamp(parsedR, MIN_MAX_RANGE, MAX_MAX_RANGE))
      : DEFAULT_MAX_RANGE,
  };
}

export default function App() {
  const [initialParams] = useState(getInitialParamsFromUrl);
  const [copied, setCopied] = useState(false);

  const [concentration, setConcentration] = useState<number>(
    initialParams.concentration
  );
  const [concentrationText, setConcentrationText] = useState<string>(
    String(initialParams.concentration)
  );

  const [sensitivity, setSensitivity] = useState<number>(
    initialParams.sensitivity
  );
  const [sensitivityText, setSensitivityText] = useState<string>(
    initialParams.sensitivity.toFixed(2)
  );

  const [maxRange, setMaxRange] = useState<number>(initialParams.maxRange);
  const [maxRangeText, setMaxRangeText] = useState<string>(
    String(initialParams.maxRange)
  );

  const simulatedSignal = calculateSimulatedSignal(
    concentration,
    sensitivity,
    maxRange
  );
  const plateauSignal = calculateSimulatedSignal(maxRange, sensitivity, maxRange);
  const regime = getOperatingRegime(concentration, maxRange);

  const isAtDefaults =
    concentration === DEFAULT_CONCENTRATION &&
    Math.abs(sensitivity - DEFAULT_SENSITIVITY) < 0.001 &&
    maxRange === DEFAULT_MAX_RANGE;

  useEffect(() => {
    const url = new URL(window.location.href);
    if (isAtDefaults) {
      url.searchParams.delete('c');
      url.searchParams.delete('s');
      url.searchParams.delete('r');
    } else {
      url.searchParams.set('c', String(concentration));
      url.searchParams.set('s', sensitivity.toFixed(2));
      url.searchParams.set('r', String(maxRange));
    }
    window.history.replaceState(null, '', url.toString());
  }, [concentration, sensitivity, maxRange, isAtDefaults]);

  const handleShareLink = async () => {
    const url = new URL(window.location.href);
    if (!isAtDefaults) {
      url.searchParams.set('c', String(concentration));
      url.searchParams.set('s', sensitivity.toFixed(2));
      url.searchParams.set('r', String(maxRange));
    }
    const shareUrl = url.toString();

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const updateConcentration = (value: number) => {
    const next = Math.round(clamp(value, MIN_CONCENTRATION, MAX_CONCENTRATION));
    setConcentration(next);
    setConcentrationText(String(next));
  };

  const handleConcentrationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = e.target.value;
    setConcentrationText(raw);
    if (raw.trim() === '') return;
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      setConcentration(Math.round(clamp(parsed, MIN_CONCENTRATION, MAX_CONCENTRATION)));
    }
  };

  const handleConcentrationInputBlur = () => {
    const parsed = Number(concentrationText);
    if (concentrationText.trim() === '' || Number.isNaN(parsed)) {
      setConcentrationText(String(concentration));
    } else {
      updateConcentration(parsed);
    }
  };

  const updateSensitivity = (value: number) => {
    const clamped = clamp(value, MIN_SENSITIVITY, MAX_SENSITIVITY);
    const rounded = Math.round(clamped * 100) / 100;
    setSensitivity(rounded);
    setSensitivityText(rounded.toFixed(2));
  };

  const handleSensitivityInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = e.target.value;
    setSensitivityText(raw);
    if (raw.trim() === '') return;
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      const clamped = clamp(parsed, MIN_SENSITIVITY, MAX_SENSITIVITY);
      setSensitivity(Math.round(clamped * 100) / 100);
    }
  };

  const handleSensitivityInputBlur = () => {
    const parsed = Number(sensitivityText);
    if (sensitivityText.trim() === '' || Number.isNaN(parsed)) {
      setSensitivityText(sensitivity.toFixed(2));
    } else {
      updateSensitivity(parsed);
    }
  };

  const updateMaxRange = (value: number) => {
    const clamped = clamp(value, MIN_MAX_RANGE, MAX_MAX_RANGE);
    const rounded = Math.round(clamped);
    setMaxRange(rounded);
    setMaxRangeText(String(rounded));
  };

  const handleMaxRangeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = e.target.value;
    setMaxRangeText(raw);
    if (raw.trim() === '') return;
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      setMaxRange(Math.round(clamp(parsed, MIN_MAX_RANGE, MAX_MAX_RANGE)));
    }
  };

  const handleMaxRangeInputBlur = () => {
    const parsed = Number(maxRangeText);
    if (maxRangeText.trim() === '' || Number.isNaN(parsed)) {
      setMaxRangeText(String(maxRange));
    } else {
      updateMaxRange(parsed);
    }
  };

  const handleReset = () => {
    updateConcentration(DEFAULT_CONCENTRATION);
    updateSensitivity(DEFAULT_SENSITIVITY);
    updateMaxRange(DEFAULT_MAX_RANGE);
  };

  const regimeBadge =
    regime === 'baseline'
      ? {
          symbol: '○',
          label: 'Baseline (No Simulated Glucose)',
          colorClass: 'text-slate-700',
        }
      : regime === 'linear'
        ? {
            symbol: '●',
            label: 'Linear Operating Region',
            colorClass: 'text-teal-700',
          }
        : {
            symbol: '▲',
            label: 'Saturation Plateau (Signal Capped)',
            colorClass: 'text-amber-700',
          };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar: 3-zone contract */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-8">
          <a
            href="#simulation"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 rounded-sm"
          >
            Virtual Biosensor Lab
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#simulation"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 rounded-sm"
            >
              Simulation
            </a>
            <a
              href="#signal-flow"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 rounded-sm"
            >
              Signal Flow
            </a>
            <a
              href="#how-it-works"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 rounded-sm"
            >
              How It Works
            </a>
            <a
              href="#assumptions"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 rounded-sm"
            >
              Assumptions
            </a>
          </nav>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareLink}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg border border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-teal-700" aria-hidden="true" />
                  Link Copied
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-sky-600" aria-hidden="true" />
                  Share Link
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isAtDefaults}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              <RotateCcw className="w-4 h-4 text-sky-600" aria-hidden="true" />
              Reset Defaults
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Intro & Mandatory Educational Notice */}
        <section id="simulation" className="scroll-mt-8 space-y-5">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 mb-2">
              <span>Biology for Engineers</span>
              <span aria-hidden="true">·</span>
              <span>Glucose Oxidase Biosensor</span>
              <span aria-hidden="true">·</span>
              <span>Interactive Simulation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
              Explore How a Glucose Biosensor Converts Concentration Into Electrical Signal
            </h1>
            <p className="text-base text-slate-600 mt-2.5 leading-relaxed">
              Adjust the simulated glucose concentration, sensor sensitivity, and maximum linear range to observe how an enzymatic electrochemical sensor responds and saturates.
            </p>
          </div>

          {/* Visible Educational Notice */}
          <div
            role="note"
            aria-label="Educational simulation disclaimer"
            className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/80 border border-amber-300 text-amber-950"
          >
            <AlertTriangle
              className="w-5 h-5 text-amber-700 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-sm font-medium leading-relaxed">
              Educational simulation only. This is not a medical device and must not be used for diagnosis or treatment. All readings displayed below are simulated values.
            </p>
          </div>

          {/* Primary Simulation Split: Controls & Live Readout + Calibration Graph */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Readout & Controls */}
            <div className="lg:col-span-5 space-y-5">
              {/* Live Simulated Output Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-slate-600">
                    Simulated Electrical Signal
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    Output Display
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    aria-live="polite"
                    className="text-4xl font-bold font-mono tabular-nums tracking-tight text-slate-900"
                  >
                    {simulatedSignal.toFixed(2)}
                  </span>
                  <span className="text-base font-mono font-medium text-teal-700">
                    µA (simulated)
                  </span>
                </div>

                <div
                  className={`mt-3 text-sm font-medium flex items-center gap-2 ${regimeBadge.colorClass}`}
                >
                  <span aria-hidden="true">{regimeBadge.symbol}</span>
                  <span>{regimeBadge.label}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-slate-500">Simulated Input</div>
                    <div className="font-mono tabular-nums font-semibold text-slate-900 text-sm mt-0.5">
                      {concentration} mg/dL
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Simulated Plateau Limit</div>
                    <div className="font-mono tabular-nums font-semibold text-slate-900 text-sm mt-0.5">
                      {plateauSignal.toFixed(2)} µA
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
                {/* 1. Glucose Concentration Control */}
                <div>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <label
                      htmlFor="concentration-number"
                      className="text-sm font-semibold text-slate-900"
                    >
                      Simulated Glucose Concentration
                    </label>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        id="concentration-number"
                        type="number"
                        min={MIN_CONCENTRATION}
                        max={MAX_CONCENTRATION}
                        step={1}
                        value={concentrationText}
                        onChange={handleConcentrationInputChange}
                        onBlur={handleConcentrationInputBlur}
                        aria-describedby="concentration-help"
                        className="w-20 px-2.5 py-1.5 text-right font-mono tabular-nums text-sm font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-600"
                      />
                      <span className="text-xs font-mono text-slate-500">
                        mg/dL
                      </span>
                    </div>
                  </div>

                  <div className="py-2">
                    <input
                      id="concentration-slider"
                      type="range"
                      min={MIN_CONCENTRATION}
                      max={MAX_CONCENTRATION}
                      step={1}
                      value={concentration}
                      onChange={(e) =>
                        updateConcentration(Number(e.target.value))
                      }
                      aria-label="Simulated glucose concentration slider in milligrams per deciliter"
                      className="lab-slider"
                    />
                  </div>

                  <div className="flex justify-between text-xs font-mono text-slate-500">
                    <span>0 mg/dL</span>
                    <span>150 mg/dL</span>
                    <span>300 mg/dL</span>
                  </div>
                  <p id="concentration-help" className="text-xs text-slate-500 mt-1.5">
                    Adjusts the simulated glucose sample delivered to the bioreceptor.
                  </p>

                  {/* Quick Sample Presets */}
                  <div className="mt-3">
                    <div className="text-xs font-medium text-slate-600 mb-2">
                      Simulated Sample Presets
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {SAMPLE_PRESETS.map((preset) => {
                        const isActive = concentration === preset.concentration;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() =>
                              updateConcentration(preset.concentration)
                            }
                            aria-pressed={isActive}
                            className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors cursor-pointer whitespace-nowrap truncate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                              isActive
                                ? 'bg-sky-50 border-sky-500 text-sky-900'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <hr className="border-slate-200" />

                {/* 2. Sensor Sensitivity Control */}
                <div>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <label
                      htmlFor="sensitivity-number"
                      className="text-sm font-semibold text-slate-900"
                    >
                      Simulated Sensitivity (Slope)
                    </label>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        id="sensitivity-number"
                        type="number"
                        min={MIN_SENSITIVITY}
                        max={MAX_SENSITIVITY}
                        step={SENSITIVITY_STEP}
                        value={sensitivityText}
                        onChange={handleSensitivityInputChange}
                        onBlur={handleSensitivityInputBlur}
                        aria-describedby="sensitivity-help"
                        className="w-20 px-2.5 py-1.5 text-right font-mono tabular-nums text-sm font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-600"
                      />
                      <span className="text-xs font-mono text-slate-500">
                        µA/(mg/dL)
                      </span>
                    </div>
                  </div>

                  <div className="py-2">
                    <input
                      id="sensitivity-slider"
                      type="range"
                      min={MIN_SENSITIVITY}
                      max={MAX_SENSITIVITY}
                      step={SENSITIVITY_STEP}
                      value={sensitivity}
                      onChange={(e) => updateSensitivity(Number(e.target.value))}
                      aria-label="Simulated sensor sensitivity slider in microamperes per milligram per deciliter"
                      className="lab-slider teal-slider"
                    />
                  </div>

                  <div className="flex justify-between text-xs font-mono text-slate-500">
                    <span>0.05</span>
                    <span>0.18</span>
                    <span>0.30 µA/(mg/dL)</span>
                  </div>
                  <p id="sensitivity-help" className="text-xs text-slate-500 mt-1.5">
                    Higher sensitivity increases the electrical current produced per unit of glucose.
                  </p>
                </div>

                {/* 3. Maximum Linear Range Control */}
                <div>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <label
                      htmlFor="max-range-number"
                      className="text-sm font-semibold text-slate-900"
                    >
                      Maximum Linear Range
                    </label>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        id="max-range-number"
                        type="number"
                        min={MIN_MAX_RANGE}
                        max={MAX_MAX_RANGE}
                        step={MAX_RANGE_STEP}
                        value={maxRangeText}
                        onChange={handleMaxRangeInputChange}
                        onBlur={handleMaxRangeInputBlur}
                        aria-describedby="max-range-help"
                        className="w-20 px-2.5 py-1.5 text-right font-mono tabular-nums text-sm font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-600"
                      />
                      <span className="text-xs font-mono text-slate-500">
                        mg/dL
                      </span>
                    </div>
                  </div>

                  <div className="py-2">
                    <input
                      id="max-range-slider"
                      type="range"
                      min={MIN_MAX_RANGE}
                      max={MAX_MAX_RANGE}
                      step={MAX_RANGE_STEP}
                      value={maxRange}
                      onChange={(e) => updateMaxRange(Number(e.target.value))}
                      aria-label="Simulated maximum linear range slider in milligrams per deciliter"
                      className="lab-slider"
                    />
                  </div>

                  <div className="flex justify-between text-xs font-mono text-slate-500">
                    <span>80 mg/dL</span>
                    <span>190 mg/dL</span>
                    <span>300 mg/dL</span>
                  </div>
                  <p id="max-range-help" className="text-xs text-slate-500 mt-1.5">
                    Concentration threshold where enzyme binding saturates and the signal levels off.
                  </p>
                </div>

                {/* Reset All Controls Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isAtDefaults}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    Reset All Controls to Defaults
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Pure SVG Calibration Graph + Dynamic Interpretation */}
            <div className="lg:col-span-7 space-y-5">
              <CalibrationChart
                concentration={concentration}
                sensitivity={sensitivity}
                maxRange={maxRange}
                onSelectConcentration={updateConcentration}
              />

              <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-slate-900">
                  Live Simulation Interpretation
                </h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {concentration === 0 ? (
                    <>
                      At <span className="font-mono font-medium text-slate-900">0 mg/dL</span>, no simulated glucose is present at the glucose oxidase layer, so the baseline electrical signal is{' '}
                      <span className="font-mono font-medium text-slate-900">0.00 µA</span>.
                    </>
                  ) : concentration <= maxRange ? (
                    <>
                      At <span className="font-mono font-medium text-slate-900">{concentration} mg/dL</span>, the sensor is{' '}
                      <span className="font-mono font-medium text-teal-700">{maxRange - concentration} mg/dL</span> below its saturation threshold. In this linear region, every{' '}
                      <span className="font-mono font-medium text-slate-900">10 mg/dL</span> increase in glucose adds{' '}
                      <span className="font-mono font-medium text-sky-700">{(sensitivity * 10).toFixed(2)} µA</span> to the simulated output.
                    </>
                  ) : (
                    <>
                      At <span className="font-mono font-medium text-slate-900">{concentration} mg/dL</span>, the simulated glucose level exceeds the{' '}
                      <span className="font-mono font-medium text-slate-900">{maxRange} mg/dL</span> maximum linear range by{' '}
                      <span className="font-mono font-medium text-amber-700">{concentration - maxRange} mg/dL</span>. Enzyme binding is saturated, so the simulated signal stays leveled at{' '}
                      <span className="font-mono font-medium text-slate-900">{plateauSignal.toFixed(2)} µA</span>.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Signal-Flow Diagram Section */}
        <section id="signal-flow" className="scroll-mt-8">
          <SignalFlowDiagram
            concentration={concentration}
            sensitivity={sensitivity}
            maxRange={maxRange}
            signal={simulatedSignal}
            regime={regime}
          />
        </section>

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Model Assumptions Section */}
        <ModelAssumptionsSection
          concentration={concentration}
          sensitivity={sensitivity}
          maxRange={maxRange}
          signal={simulatedSignal}
        />
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Virtual Biosensor Lab · Biology for Engineers Educational Project
          </div>
          <div>
            Educational simulation only. Not a medical device; do not use for diagnosis or treatment.
          </div>
        </div>
      </footer>
    </div>
  );
}
