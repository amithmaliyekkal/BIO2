import React from 'react';
import { Cpu, FlaskConical, Monitor } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const parts = [
    {
      index: '01.',
      name: 'Bioreceptor',
      subtitle: 'Glucose Oxidase (GOx)',
      description:
        'An immobilized enzyme layer (glucose oxidase) selectively binds and oxidizes glucose molecules in the sample. Because the enzyme recognizes glucose specifically, other dissolved molecules are largely ignored.',
      icon: <FlaskConical className="w-5 h-5 text-teal-600" aria-hidden="true" />,
    },
    {
      index: '02.',
      name: 'Transducer',
      subtitle: 'Electrochemical Electrode',
      description:
        'Converts the biological oxidation reaction into a measurable electrical current. Higher enzyme activity transfers more electrons at the electrode surface, increasing the simulated current in microamperes (µA).',
      icon: <Cpu className="w-5 h-5 text-sky-600" aria-hidden="true" />,
    },
    {
      index: '03.',
      name: 'Display',
      subtitle: 'Readout Interface',
      description:
        'Amplifies, filters, and displays the electrical signal so an engineer or student can observe the response curve, identify the linear operating region, and detect sensor saturation.',
      icon: <Monitor className="w-5 h-5 text-teal-600" aria-hidden="true" />,
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-8">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
          How It Works
        </h2>
        <p className="text-slate-600 mt-1 max-w-2xl">
          An enzymatic glucose biosensor connects biological recognition to electronic measurement through three core components.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {parts.map((part) => (
          <article
            key={part.name}
            className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="font-mono text-xs font-medium text-slate-500">
                  {part.index}
                </span>
                {part.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                {part.name}
              </h3>
              <p className="text-sm font-medium text-sky-700 mt-0.5">
                {part.subtitle}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mt-3">
                {part.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
