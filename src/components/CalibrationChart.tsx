import React, { useMemo, useRef, useState } from 'react';
import {
  FIXED_CHART_MAX_Y,
  MAX_CONCENTRATION,
  MIN_CONCENTRATION,
  calculateSimulatedSignal,
  clamp,
} from '../simulation/biosensorModel';

interface CalibrationChartProps {
  concentration: number;
  sensitivity: number;
  maxRange: number;
  onSelectConcentration?: (concentration: number) => void;
}

const SVG_WIDTH = 660;
const SVG_HEIGHT = 400;
const MARGIN = { top: 30, right: 28, bottom: 56, left: 66 };
const PLOT_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

const X_TICKS = [0, 50, 100, 150, 200, 250, 300];

export const CalibrationChart: React.FC<CalibrationChartProps> = ({
  concentration,
  sensitivity,
  maxRange,
  onSelectConcentration,
}) => {
  const [scaleMode, setScaleMode] = useState<'fixed' | 'auto'>('fixed');
  const [hoverConcentration, setHoverConcentration] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const currentSignal = calculateSimulatedSignal(concentration, sensitivity, maxRange);
  const plateauSignal = calculateSimulatedSignal(maxRange, sensitivity, maxRange);
  const isSaturated = concentration > maxRange;

  const yMax = useMemo(() => {
    if (scaleMode === 'fixed') {
      return FIXED_CHART_MAX_Y;
    }
    const rawPeak = Math.max(plateauSignal * 1.25, 15);
    return Math.ceil(rawPeak / 15) * 15;
  }, [scaleMode, plateauSignal]);

  const yTicks = useMemo(() => {
    const step = yMax / 6;
    return Array.from({ length: 7 }, (_, i) => Math.round(i * step * 10) / 10);
  }, [yMax]);

  const xScale = (c: number) =>
    MARGIN.left + ((c - MIN_CONCENTRATION) / (MAX_CONCENTRATION - MIN_CONCENTRATION)) * PLOT_WIDTH;

  const yScale = (sig: number) =>
    MARGIN.top + PLOT_HEIGHT - (clamp(sig, 0, yMax) / yMax) * PLOT_HEIGHT;

  const kneeX = xScale(maxRange);
  const kneeY = yScale(plateauSignal);
  const startX = xScale(0);
  const startY = yScale(0);
  const endX = xScale(MAX_CONCENTRATION);
  const endY = kneeY;

  const currentX = xScale(concentration);
  const currentY = yScale(currentSignal);

  const hoverSignal =
    hoverConcentration !== null
      ? calculateSimulatedSignal(hoverConcentration, sensitivity, maxRange)
      : null;

  const getConcentrationFromClientX = (clientX: number): number | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return null;
    const svgX = ((clientX - rect.left) / rect.width) * SVG_WIDTH;
    const relX = svgX - MARGIN.left;
    if (relX < 0 || relX > PLOT_WIDTH) return null;
    const rawC =
      MIN_CONCENTRATION + (relX / PLOT_WIDTH) * (MAX_CONCENTRATION - MIN_CONCENTRATION);
    return Math.round(clamp(rawC, MIN_CONCENTRATION, MAX_CONCENTRATION));
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const c = getConcentrationFromClientX(e.clientX);
    setHoverConcentration(c);
  };

  const handlePointerLeave = () => {
    setHoverConcentration(null);
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onSelectConcentration) return;
    const c = getConcentrationFromClientX(e.clientX);
    if (c !== null) {
      onSelectConcentration(c);
    }
  };

  // Smart positioning for the live callout tag inside SVG so it never clips
  const calloutWidth = 158;
  const calloutHeight = 28;
  const placeLeft = currentX + calloutWidth + 18 > MARGIN.left + PLOT_WIDTH;
  const placeBelow = currentY - calloutHeight - 14 < MARGIN.top;
  const calloutX = placeLeft ? currentX - calloutWidth - 12 : currentX + 12;
  const calloutY = placeBelow ? currentY + 12 : currentY - calloutHeight - 10;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Simulated Calibration Curve
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Signal rises linearly up to {maxRange} mg/dL, then plateaus. Click anywhere on the graph to test a concentration.
          </p>
        </div>

        <div
          className="inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-lg shrink-0"
          role="group"
          aria-label="Calibration graph Y-axis scale mode"
        >
          <button
            type="button"
            onClick={() => setScaleMode('fixed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
              scaleMode === 'fixed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fixed (0–{FIXED_CHART_MAX_Y} µA)
          </button>
          <button
            type="button"
            onClick={() => setScaleMode('auto')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
              scaleMode === 'auto'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Auto-Fit Axis
          </button>
        </div>
      </div>

      {/* Legend row */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600 mb-3">
        <span className="inline-flex items-center gap-2">
          <span className="w-4 h-0.5 bg-sky-600 inline-block" aria-hidden="true" />
          Linear Response (0–{maxRange} mg/dL)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-4 h-0.5 bg-teal-600 inline-block" aria-hidden="true" />
          Saturation Plateau (&gt;{maxRange} mg/dL)
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full inline-block ${
              isSaturated ? 'bg-amber-600' : 'bg-sky-600'
            }`}
            aria-hidden="true"
          />
          Current Simulated Point
        </span>
      </div>

      <div className="w-full overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          role="img"
          aria-label={`Simulated glucose calibration graph. Current simulated concentration is ${concentration} milligrams per deciliter with a simulated signal of ${currentSignal.toFixed(
            2
          )} microamperes.`}
          className="w-full h-auto select-none cursor-crosshair touch-pan-y"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onClick={handleClick}
        >
          <defs>
            <linearGradient id="curveAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Plot frame background */}
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={PLOT_WIDTH}
            height={PLOT_HEIGHT}
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Saturation region shading when maxRange < 300 */}
          {maxRange < MAX_CONCENTRATION && (
            <rect
              x={kneeX}
              y={MARGIN.top}
              width={endX - kneeX}
              height={PLOT_HEIGHT}
              fill="#fef3c7"
              fillOpacity="0.35"
            />
          )}

          {/* Horizontal grid lines & Y-axis ticks */}
          {yTicks.map((tick) => {
            const y = yScale(tick);
            return (
              <g key={`y-${tick}`}>
                <line
                  x1={MARGIN.left}
                  y1={y}
                  x2={MARGIN.left + PLOT_WIDTH}
                  y2={y}
                  stroke={tick === 0 ? '#94a3b8' : '#e2e8f0'}
                  strokeWidth="1"
                />
                <text
                  x={MARGIN.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-600 text-[11px]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {Number.isInteger(tick) ? tick : tick.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Vertical grid lines & X-axis ticks */}
          {X_TICKS.map((tick) => {
            const x = xScale(tick);
            return (
              <g key={`x-${tick}`}>
                <line
                  x1={x}
                  y1={MARGIN.top}
                  x2={x}
                  y2={MARGIN.top + PLOT_HEIGHT}
                  stroke={tick === 0 ? '#94a3b8' : '#e2e8f0'}
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={MARGIN.top + PLOT_HEIGHT + 20}
                  textAnchor="middle"
                  className="fill-slate-600 text-[11px]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Max linear range vertical threshold */}
          {maxRange < MAX_CONCENTRATION && (
            <g>
              <line
                x1={kneeX}
                y1={MARGIN.top}
                x2={kneeX}
                y2={MARGIN.top + PLOT_HEIGHT}
                stroke="#d97706"
                strokeWidth="1.25"
                strokeDasharray="4 4"
              />
              <text
                x={Math.min(kneeX + 6, MARGIN.left + PLOT_WIDTH - 120)}
                y={MARGIN.top + 16}
                className="fill-amber-800 text-[11px] font-medium"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Max Range ({maxRange} mg/dL)
              </text>
            </g>
          )}

          {/* Area under the calibration curve */}
          <polygon
            points={`${startX},${startY} ${kneeX},${kneeY} ${endX},${endY} ${endX},${startY}`}
            fill="url(#curveAreaGrad)"
          />

          {/* Linear segment of curve */}
          <line
            x1={startX}
            y1={startY}
            x2={kneeX}
            y2={kneeY}
            stroke="#0284c7"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Plateau segment of curve */}
          {maxRange < MAX_CONCENTRATION && (
            <line
              x1={kneeX}
              y1={kneeY}
              x2={endX}
              y2={endY}
              stroke="#0d9488"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {/* Knee point ring at saturation transition */}
          {maxRange < MAX_CONCENTRATION && (
            <circle
              cx={kneeX}
              cy={kneeY}
              r="4.5"
              fill="#ffffff"
              stroke="#0d9488"
              strokeWidth="2"
            />
          )}

          {/* Hover preview probe */}
          {hoverConcentration !== null && hoverSignal !== null && (
            <g pointerEvents="none">
              <line
                x1={xScale(hoverConcentration)}
                y1={MARGIN.top}
                x2={xScale(hoverConcentration)}
                y2={MARGIN.top + PLOT_HEIGHT}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <circle
                cx={xScale(hoverConcentration)}
                cy={yScale(hoverSignal)}
                r="4"
                fill="#ffffff"
                stroke="#475569"
                strokeWidth="2"
              />
              <rect
                x={
                  xScale(hoverConcentration) + 128 > MARGIN.left + PLOT_WIDTH
                    ? xScale(hoverConcentration) - 134
                    : xScale(hoverConcentration) + 8
                }
                y={MARGIN.top + 8}
                width="126"
                height="24"
                rx="4"
                fill="#0f172a"
                fillOpacity="0.88"
              />
              <text
                x={
                  (xScale(hoverConcentration) + 128 > MARGIN.left + PLOT_WIDTH
                    ? xScale(hoverConcentration) - 134
                    : xScale(hoverConcentration) + 8) + 8
                }
                y={MARGIN.top + 24}
                className="fill-white text-[11px]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {hoverConcentration} · {hoverSignal.toFixed(2)} µA
              </text>
            </g>
          )}

          {/* Dashed crosshairs for active simulated point */}
          <line
            x1={currentX}
            y1={currentY}
            x2={currentX}
            y2={MARGIN.top + PLOT_HEIGHT}
            stroke={isSaturated ? '#d97706' : '#0284c7'}
            strokeWidth="1.25"
            strokeDasharray="4 4"
          />
          <line
            x1={MARGIN.left}
            y1={currentY}
            x2={currentX}
            y2={currentY}
            stroke={isSaturated ? '#d97706' : '#0284c7'}
            strokeWidth="1.25"
            strokeDasharray="4 4"
          />

          {/* Active simulated operating point marker */}
          <circle
            cx={currentX}
            cy={currentY}
            r="9"
            fill={isSaturated ? '#d97706' : '#0284c7'}
            fillOpacity="0.18"
          />
          <circle
            cx={currentX}
            cy={currentY}
            r="5.5"
            fill={isSaturated ? '#d97706' : '#0284c7'}
            stroke="#ffffff"
            strokeWidth="2.5"
          />

          {/* Callout tag for active simulated point */}
          <g pointerEvents="none">
            <rect
              x={calloutX}
              y={calloutY}
              width={calloutWidth}
              height={calloutHeight}
              rx="6"
              fill="#ffffff"
              stroke={isSaturated ? '#f59e0b' : '#0284c7'}
              strokeWidth="1.25"
            />
            <text
              x={calloutX + calloutWidth / 2}
              y={calloutY + 18}
              textAnchor="middle"
              className="fill-slate-900 text-[11px] font-medium"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {concentration} mg/dL · {currentSignal.toFixed(2)} µA
            </text>
          </g>

          {/* X-axis title */}
          <text
            x={MARGIN.left + PLOT_WIDTH / 2}
            y={SVG_HEIGHT - 12}
            textAnchor="middle"
            className="fill-slate-700 text-[12px] font-semibold"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Simulated Glucose Concentration (mg/dL)
          </text>

          {/* Y-axis title */}
          <text
            x={18}
            y={MARGIN.top + PLOT_HEIGHT / 2}
            textAnchor="middle"
            transform={`rotate(-90, 18, ${MARGIN.top + PLOT_HEIGHT / 2})`}
            className="fill-slate-700 text-[12px] font-semibold"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Simulated Electrical Signal (µA)
          </text>
        </svg>
      </div>
    </div>
  );
};
