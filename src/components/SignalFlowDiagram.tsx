import React, { useState } from 'react';
import { ArrowRight, Cpu, Droplets, FlaskConical, Monitor } from 'lucide-react';
import { OperatingRegime } from '../simulation/biosensorModel';

interface SignalFlowDiagramProps {
  concentration: number;
  sensitivity: number;
  maxRange: number;
  signal: number;
  regime: OperatingRegime;
}

type StageId = 'sample' | 'bioreceptor' | 'transducer' | 'display';

export const SignalFlowDiagram: React.FC<SignalFlowDiagramProps> = ({
  concentration,
  sensitivity,
  maxRange,
  signal,
  regime,
}) => {
  const [selectedStage, setSelectedStage] = useState<StageId>('bioreceptor');

  const isActive = concentration > 0;
  const isSaturated = regime === 'saturated';

  const stages: {
    id: StageId;
    step: string;
    title: string;
    subtitle: string;
    liveMetric: string;
    detail: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'sample',
      step: 'Stage 1',
      title: 'Sample',
      subtitle: 'Glucose analyte input',
      liveMetric: `${concentration} mg/dL (sim.)`,
      detail:
        concentration === 0
          ? 'With 0 mg/dL glucose in the simulated sample, no analyte molecules reach the enzyme layer.'
          : `The simulated sample delivers ${concentration} mg/dL of glucose molecules diffusing toward the sensor surface.`,
      icon: <Droplets className="w-5 h-5 text-sky-600" aria-hidden="true" />,
    },
    {
      id: 'bioreceptor',
      step: 'Stage 2',
      title: 'Bioreceptor',
      subtitle: 'Glucose oxidase (GOx)',
      liveMetric: isSaturated
        ? `Capped at ${maxRange} mg/dL`
        : isActive
          ? 'Binding & oxidizing'
          : 'Idle (0 reaction)',
      detail: isSaturated
        ? `Above ${maxRange} mg/dL, available glucose oxidase enzyme sites are saturated, so the reaction rate reaches its ceiling.`
        : 'Immobilized glucose oxidase (GOx) selectively recognizes glucose and catalyzes its oxidation, generating hydrogen peroxide (H₂O₂).',
      icon: <FlaskConical className="w-5 h-5 text-teal-600" aria-hidden="true" />,
    },
    {
      id: 'transducer',
      step: 'Stage 3',
      title: 'Transducer',
      subtitle: 'Electrochemical electrode',
      liveMetric: `${sensitivity.toFixed(2)} µA per mg/dL`,
      detail: `The electrode oxidizes reaction byproducts and converts the chemical reaction rate into a proportional electrical current at a simulated sensitivity of ${sensitivity.toFixed(2)} µA/(mg/dL).`,
      icon: <Cpu className="w-5 h-5 text-sky-600" aria-hidden="true" />,
    },
    {
      id: 'display',
      step: 'Stage 4',
      title: 'Display',
      subtitle: 'Simulated meter readout',
      liveMetric: `${signal.toFixed(2)} µA (sim.)`,
      detail: `Signal-conditioning electronics amplify and convert the current into the final simulated readout of ${signal.toFixed(2)} µA.`,
      icon: <Monitor className="w-5 h-5 text-teal-600" aria-hidden="true" />,
    },
  ];

  const activeDetail = stages.find((s) => s.id === selectedStage) ?? stages[1];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Biosensor Signal-Flow Diagram
          </h3>
          <p className="text-sm text-slate-600 mt-0.5">
            Sample → Bioreceptor → Transducer → Display. Select any block to inspect its role at the current simulated level.
          </p>
        </div>
      </div>

      {/* 4-stage responsive flow chain */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-stretch gap-3 md:gap-2">
        {stages.map((stage, idx) => {
          const isSelected = stage.id === selectedStage;
          return (
            <React.Fragment key={stage.id}>
              <button
                type="button"
                onClick={() => setSelectedStage(stage.id)}
                aria-pressed={isSelected}
                className={`text-left p-4 rounded-lg border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                  isSelected
                    ? 'bg-sky-50/70 border-sky-500 ring-1 ring-sky-500/30'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-medium text-slate-500">
                    {stage.step}
                  </span>
                  {stage.icon}
                </div>
                <div className="text-base font-semibold text-slate-900">
                  {stage.title}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {stage.subtitle}
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 font-mono tabular-nums text-xs font-medium text-slate-800">
                  {stage.liveMetric}
                </div>
              </button>

              {idx < stages.length - 1 && (
                <div
                  className="flex items-center justify-center py-1 md:py-0 md:px-1"
                  aria-hidden="true"
                >
                  <div
                    className={`flex items-center justify-center rotate-90 md:rotate-0 ${
                      isActive ? 'text-teal-600 signal-flow-pulse' : 'text-slate-300'
                    }`}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Selected stage contextual note */}
      <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
        <span className="font-semibold text-slate-900">{activeDetail.title}: </span>
        {activeDetail.detail}
      </div>
    </div>
  );
};
