import React from 'react';

interface ModelAssumptionsSectionProps {
  concentration: number;
  sensitivity: number;
  maxRange: number;
  signal: number;
}

export const ModelAssumptionsSection: React.FC<ModelAssumptionsSectionProps> = ({
  concentration,
  sensitivity,
  maxRange,
  signal,
}) => {
  const effectiveConcentration = Math.min(concentration, maxRange);

  return (
    <section id="assumptions" className="scroll-mt-8">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Mathematical Equation Summary */}
          <div className="lg:col-span-5">
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
              Model Assumptions
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              This educational simulation uses a simplified piecewise linear-to-plateau calibration model so students can clearly see how sensitivity and saturation range shape a sensor response.
            </p>

            <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs font-medium text-slate-500 mb-2">
                Simulated Governing Equation
              </div>
              <div className="font-mono text-sm sm:text-base font-medium text-slate-900">
                I<sub>sim</sub> = S × min(C, R<sub>max</sub>)
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 font-mono tabular-nums text-xs text-slate-700 space-y-1">
                <div>
                  I<sub>sim</sub> = {sensitivity.toFixed(2)} × min({concentration}, {maxRange})
                </div>
                <div className="font-semibold text-sky-700">
                  I<sub>sim</sub> = {sensitivity.toFixed(2)} × {effectiveConcentration} ={' '}
                  {signal.toFixed(2)} µA (simulated)
                </div>
              </div>
            </div>
          </div>

          {/* Documented Assumptions List */}
          <div className="lg:col-span-7">
            <h3 className="text-base font-semibold text-slate-900 mb-3">
              Key Educational Simplifications
            </h3>
            <ul className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="font-mono text-xs font-semibold text-sky-700 mt-1 shrink-0">
                  01
                </span>
                <span>
                  <strong className="font-medium text-slate-900">Linear response below saturation:</strong>{' '}
                  For concentrations from 0 up to the maximum linear range (R<sub>max</sub>), the simulated electrical signal rises strictly linearly with slope equal to sensor sensitivity (S).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-mono text-xs font-semibold text-sky-700 mt-1 shrink-0">
                  02
                </span>
                <span>
                  <strong className="font-medium text-slate-900">Sharp plateau at maximum range:</strong>{' '}
                  Above R<sub>max</sub>, all active glucose oxidase sites are modeled as saturated, leveling the simulated signal off cleanly instead of showing gradual Michaelis–Menten curvature.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-mono text-xs font-semibold text-sky-700 mt-1 shrink-0">
                  03
                </span>
                <span>
                  <strong className="font-medium text-slate-900">Zero baseline &amp; ideal selectivity:</strong>{' '}
                  Background charging current, electrode drift, temperature shifts, pH changes, and interfering compounds (such as ascorbic acid) are omitted to keep the core relationship clear.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-mono text-xs font-semibold text-sky-700 mt-1 shrink-0">
                  04
                </span>
                <span>
                  <strong className="font-medium text-slate-900">Instantaneous steady-state reading:</strong>{' '}
                  Diffusion delay and response time transients are neglected; the simulated signal updates immediately when parameters change.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
