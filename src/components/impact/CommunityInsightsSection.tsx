import { Users } from 'lucide-react';

const SAMPLE_COMMUNITY_CHALLENGES = [
  {
    id: 'no-idle-school',
    title: 'School Zone No-Idling Pledge',
    description:
      'Turn off engines while waiting in school pickup lines to reduce concentrated NO₂ near children.',
    badge: 'Sample Challenge',
  },
  {
    id: 'carpool-week',
    title: '2-Day Neighborhood Carpool',
    description: 'Coordinate with one neighbor or coworker to share commutes twice this week.',
    badge: 'Sample Challenge',
  },
  {
    id: 'clean-air-check',
    title: 'Winter Smog Buddy Check-In',
    description:
      'Check in on elderly neighbors during severe AQI days and share verified indoor filtration tips.',
    badge: 'Sample Tip',
  },
];

export function CommunityInsightsSection() {
  return (
    <section
      aria-labelledby="community-heading"
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-forest-700" aria-hidden="true" />
          <h2 id="community-heading" className="text-base font-bold text-slate-900">
            Community Pollution Awareness & Challenges
          </h2>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          Sample Local-Only Content (No Personal Data Shared)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        {SAMPLE_COMMUNITY_CHALLENGES.map((item) => (
          <article key={item.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-forest-800 bg-forest-50 px-2 py-0.5 rounded">
              {item.badge}
            </span>
            <h3 className="text-sm font-semibold text-slate-900 mt-2">{item.title}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
